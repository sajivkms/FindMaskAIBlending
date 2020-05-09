import torch
import torchvision
from flask import Flask, jsonify, request, send_file
from PIL import Image
import numpy as np
import cv2
import random
import base64 
import io
from flask_cors import CORS
import json

from torchvision.models.utils import load_state_dict_from_url

from helpers import get_model, from_base64, align_source, pil_to_cv2
from classes import VOC_CLASSES
from blending import instance_segmentation, poisson_blend

app = Flask(__name__)
CORS(app)

model = get_model(len(VOC_CLASSES))
model.load_state_dict(load_state_dict_from_url("https://pytorch-pascal-voc-obj-detect-model.s3.us-east-2.amazonaws.com/voc-seg.pt", map_location="cpu"))
model.eval()

def serve_pil_image(pil_img):
    img_io = io.BytesIO()
    pil_img.save(img_io, 'JPEG')
    img_io.seek(0)
    return send_file(img_io, mimetype='image/jpeg')

def open_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    return image

@app.route('/')
def hello():
    return 'Hello World!'

@app.route('/predict', methods=['POST'])
def predict():
    if request.method == 'POST':
        fil = request.files['file']
        img_bytes = fil.read()
        img, pred_classes, masks, original_image, bboxes = instance_segmentation(img_bytes, model)
        img = Image.fromarray(img)
        return serve_pil_image(img)
        
@app.route('/get_masks', methods=['POST'])
def get_other_data():
    if request.method == 'POST':
        fil = request.files['file']
        img_bytes = fil.read()
        img, pred_classes, masks, original_image, bboxes = instance_segmentation(img_bytes, model)
        masks = masks.astype(int)
        return jsonify({
            'masks':masks.tolist(),
            'bounding_boxes': bboxes.astype(float).tolist(),
            'predicted_classes':pred_classes
        })

@app.route('/blend', methods=["POST"])
def blend_images():
    if request.method == 'POST':
        background = pil_to_cv2(open_image(request.files['background'].read())) / 255
        object_img = pil_to_cv2(open_image(request.files['objectImage'].read())) / 255
        mask = np.array(json.loads(request.form['mask']))
        bottom_center = np.array(json.loads(request.form['bottomCenter']))
        bottom_center = ((background.shape[1] / 600) * bottom_center).astype(np.int)
        bottom_center = list(bottom_center)
        object_align, obj_mask, cut_and_paste = align_source(object_img, mask, background, bottom_center)
        blended_image = poisson_blend(object_align, obj_mask, background, bottom_center)
        blended_image = blended_image[...,::-1].copy()
        img = Image.fromarray((blended_image * 255).astype(np.uint8))
        return serve_pil_image(img)
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=80)