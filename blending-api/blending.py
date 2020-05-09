from PIL import Image
import requests
from io import BytesIO
from torchvision import transforms as T
from classes import VOC_CLASSES
from urllib.request import urlopen
import cv2
from helpers import random_colour_masks
import numpy as np
import scipy
from scipy.sparse.linalg import spsolve

def open_image(image_bytes):
    image = Image.open(BytesIO(image_bytes))
    return image


def get_prediction(img, model, threshold, url=False):
    transform = T.Compose([T.ToTensor()])
    img = transform(img)
    pred = model([img])
#     print(pred)
    pred_score = list(pred[0]['scores'].detach().numpy())
    pred_t = [pred_score.index(x) for x in pred_score if x>threshold][-1]
    masks = (pred[0]['masks']>0.5).squeeze().detach().cpu().numpy()
    pred_class = [VOC_CLASSES[i] for i in list(pred[0]['labels'].numpy())]
    pred_boxes = [[(i[0], i[1]), (i[2], i[3])] for i in list(pred[0]['boxes'].detach().numpy())]
    masks = masks[:pred_t+1]
    pred_boxes = pred_boxes[:pred_t+1]
    pred_class = pred_class[:pred_t+1]
    return masks, pred_boxes, pred_class

################
# Segmentation #
################

def instance_segmentation(image_bytes, model, threshold=0.5, rect_th=1, text_size=1, text_th=1):
    image = open_image(image_bytes)
    masks, boxes, pred_cls = get_prediction(image, model, threshold)
    orimg = np.array(image)[:, :, ::-1].copy() # To BGR for OpenCV
    orimg = cv2.cvtColor(orimg, cv2.COLOR_BGR2RGB) # Converting to RGB
    img = orimg.copy()
    for i in range(len(masks)):
        rgb_mask = random_colour_masks(masks[i])
        img = cv2.addWeighted(img, 1, rgb_mask, 0.5, 0)
        cv2.rectangle(img, boxes[i][0], boxes[i][1],color=(0, 255, 0), thickness=rect_th)
        cv2.putText(img,pred_cls[i], boxes[i][0], cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0),thickness=text_th)
    return img, pred_cls, masks, orimg, np.array(boxes).astype(float)



############
# Blending #
############
def gradient_sum(img, i, j, h, w):
    v_sum = np.array([0.0, 0.0, 0.0])
    v_sum = img[i, j] * 4 \
        - img[i + 1, j] - img[i - 1, j] - img[i, j + 1] - img[i, j - 1]
    return v_sum

def poisson_blend(cropped_object, object_mask, background_img, bc):
    """
    :param cropped_object: numpy.ndarray One you get from align_cropped_object
    :param object_object_mask: numpy.ndarray One you get from align_cropped_object
    :param background_img: numpy.ndarray 
    """
    mask_height, mask_width = object_mask.shape
    region_size = mask_height * mask_width
    getk = lambda i, j: i + j * mask_height
    grad_func = lambda ii, jj: gradient_sum(cropped_object, ii, jj, mask_height, mask_width) # Gradient function
    b = np.zeros((region_size, 3)) # the "b" matrix
    A = scipy.sparse.identity(region_size, format='lil') # the "A" matrix
    for i in range(mask_height):
        for j in range(mask_width):
            k = getk(i, j)
            if object_mask[i, j] == 1: # We only need to do it in the blending region
                b_s = np.array([0.0, 0.0, 0.0])
                if object_mask[i - 1, j] == 1:
                    A[k, k - 1] = -1
                else:
                    b_s += background_img[i - 1, j]
                if object_mask[i + 1, j] == 1:
                    A[k, k + 1] = -1
                else:
                     b_s += background_img[i + 1, j]
                if object_mask[i, j - 1] == 1:
                    A[k, k - mask_height] = -1
                else:
                     b_s += background_img[i, j - 1]
                if object_mask[i, j + 1] == 1:
                    A[k, k + mask_height] = -1
                else:
                    b_s += background_img[i, j + 1] 
                A[k, k] = 4
                b[k] = grad_func(i, j) + b_s
            else:
                b[k] = background_img[i, j]
    A = A.tocsr()
    output = np.empty_like(background_img)
    output[:] = background_img
    for c in range(3):
        x = spsolve(A, b[:, c]) # Solving the equations
        x[x > 1] = 1
        x[x < 0] = 0
        x = x.reshape(mask_height, mask_width, order='F')
        output[:, :, c] = x
    return output # Our blended image