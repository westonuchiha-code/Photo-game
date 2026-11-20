"""Textures for queue item 54 (photos/vending/cleaning-robot.jpg; stored sideways, turned upright first).
  cb_face.png  the scrubber robot's white front with its cartoon eyes and the beginner-driver sticker; the
               maker's logo painted out
"""
import os, numpy as np, cv2
from PIL import Image
im = np.asarray(Image.open("photos/vending/cleaning-robot.jpg").convert("RGB").transpose(Image.ROTATE_270))
h, w = im.shape[:2]
c = cv2.cvtColor(im[int(0.31 * h):int(0.6 * h), int(0.27 * w):int(0.62 * w)], cv2.COLOR_RGB2BGR)
c = cv2.resize(c, (640, 660), interpolation=cv2.INTER_AREA)
m = np.zeros(c.shape[:2], np.uint8); cv2.rectangle(m, (212, 393), (348, 428), 255, -1)
c = cv2.inpaint(c, m, 9, cv2.INPAINT_TELEA)
cv2.imwrite("assets/textures/cb_face.png", c[215:455, 45:590]); print("wrote cb_face")
