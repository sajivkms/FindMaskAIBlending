import torch
import torchvision
from mask_rcnn import maskrcnn_resnet50_fpn, MaskRCNNPredictor
import random
import numpy as np
import base64 
import io
from PIL import Image
import cv2

def pil_to_cv2(pil_image):
    open_cv_image = np.array(pil_image) 
    open_cv_image = open_cv_image[:, :, ::-1].copy()
    return open_cv_image

def get_model(num_classes):
    model = maskrcnn_resnet50_fpn()
    in_features = model.roi_heads.box_predictor.cls_score.in_features
    model.roi_heads.box_predictor = torchvision.models.detection.faster_rcnn.FastRCNNPredictor(in_features, num_classes)
    in_features_mask = model.roi_heads.mask_predictor.conv5_mask.in_channels
    hidden_layer = 256
    model.roi_heads.mask_predictor = MaskRCNNPredictor(in_features_mask,
                                                       hidden_layer,
                                                       num_classes)

    return model

def random_colour_masks(image):
    colours = [[0, 255, 0],[0, 0, 255],[255, 0, 0],[0, 255, 255],[255, 255, 0],[255, 0, 255],[80, 70, 180],[250, 80, 190],[245, 145, 50],[70, 150, 250],[50, 190, 190]]
    r = np.zeros_like(image).astype(np.uint8)
    g = np.zeros_like(image).astype(np.uint8)
    b = np.zeros_like(image).astype(np.uint8)
    r[image == 1], g[image == 1], b[image == 1] = colours[random.randrange(0,10)]
    coloured_mask = np.stack([r, g, b], axis=2)
    return coloured_mask

def highlight_objects(img, masks, boxes):
    imgr = img.copy()
    for i in range(len(masks)):
        rgb_mask = random_colour_masks(masks[i])
        imgr = cv2.addWeighted(imgr, 1, rgb_mask, 0.5, 0)
        cv2.rectangle(imgr, boxes[i][0], boxes[i][1],color=(0, 255, 0))
    return imgr

def get_mask(loc, masks, pred_classes):
    items_found = []
    masks_found = []
    for i, mask in enumerate(masks):
        if mask[loc[1], loc[0]]:
            items_found.append(pred_classes[i])
            masks_found.append(mask)
    return items_found, masks_found


def from_base64(base64_data):
    a = Image.open(io.BytesIO(base64.b64decode(base64_data)).read())
    nparr = np.fromstring(bytes(base64_data).decode('base64'), np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_ANYCOLOR)

def align_source(object_img, mask, background_img, bottom_center):
    ys, xs = np.where(mask == 1)
    (h,w,_) = object_img.shape
    y1 = x1 = 0
    y2, x2 = h, w
    object_img2 = np.zeros(background_img.shape)
    yind = np.arange(y1,y2)
    yind2 = yind - int(max(ys)) + bottom_center[1]
    xind = np.arange(x1,x2)
    xind2 = xind - int(round(np.mean(xs))) + bottom_center[0]

    ys = ys - int(max(ys)) + bottom_center[1]
    xs = xs - int(round(np.mean(xs))) + bottom_center[0]
    mask2 = np.zeros(background_img.shape[:2], dtype=bool)
    for i in range(len(xs)):
        mask2[int(ys[i]), int(xs[i])] = True
    for i in range(len(yind)):
        for j in range(len(xind)):
            object_img2[yind2[i], xind2[j], :] = object_img[yind[i], xind[j], :]
    mask3 = np.zeros([mask2.shape[0], mask2.shape[1], 3])
    for i in range(3):
        mask3[:,:, i] = mask2
    background_img  = object_img2 * mask3 + (1-mask3) * background_img
    # plt.figure()
    # plt.imshow(background_img)
    return object_img2, mask2, background_img