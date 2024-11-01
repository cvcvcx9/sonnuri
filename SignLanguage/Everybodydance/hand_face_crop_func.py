# -*- coding: utf-8 -*-
"""hand_face_crop_func

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1X1vQ8XLfcWllSP03h9ayoFtjUu4-xste
"""

from google.colab import drive
drive.mount('/content/drive')

import cv2 as cv 
import numpy as np
import scipy
import math
import time
import copy
from PIL import Image
from shutil import copyfile
from skimage import img_as_float
from functools import reduce
import os
import json
import matplotlib.pyplot as plt
import numpy as np

cd /content/drive/Shareddrives/투빅스_컨퍼런스_수어/미성

#! git clone 'https://github.com/moono/lpips-tf2.x.git'

# 손 중심찾기

def avehand(posepts):

  hand_center = 9
  # finger1 = 4
  # finger2 = 20

  con0 = posepts[(3*hand_center)+2] > 0

  if con0:
    return posepts[(3*hand_center):(3*hand_center)+2]

# 얼굴중심 찾기
def aveface(posepts):

	nose = 0
	rear = 16
	lear = 17

	if len(posepts) == 69:
		nose = 18
		rear = 20
		lear = 22
	elif len(posepts) == 75:
		nose = 0
		rear = 17
		lear = 18

	con0 = posepts[(3*nose)+2] > 0
	con10 = posepts[(3*rear)+2] > 0
	con13 = posepts[(3*lear)+2] > 0

	if con0:
		return posepts[(3*nose):(3*nose)+2]

	if con10 and con13:
		avex = 0.5*(posepts[(3*rear)] + posepts[(3*lear)])
		avey = 0.5*(posepts[(3*rear)+1] + posepts[(3*lear)+1])
		return [avex, avey]
	elif con10:
		return posepts[(3*rear):(3*rear)+2]
	else:
		return posepts[(3*lear):(3*lear)+2]

# json 파일 읽기
# 얼굴 crop 할때에는 face keypoint 가 아닌 몸 전체 keypoint 사용함.
# 읽어은posepts25를 map 25 23 함수를 통해 23 으로 mapping하여 코 부분과 양쪽 귀를 찾아내는 방식

def readjson(json_path):
  f = open(json_path, 'r')
  data = f.read()
  f.close()

  keypoints_json = json.loads(data)
  left_hand = keypoints_json['people'][0]['hand_left_keypoints_2d']
  right_hand = keypoints_json['people'][0]['hand_right_keypoints_2d']
  face = keypoints_json['people'][0]['face_keypoints_2d']
  posepts25 =  keypoints_json['people'][0]['pose_keypoints_2d']

  # 왼손, 오른속 각각에 대해 x, y의 최대, 최소값 저장
  left_x_min = min(left_hand[0::3])
  left_x_max = max(left_hand[0::3])
  left_y_min = min(left_hand[1::3])
  left_y_max = max(left_hand[1::3])
  right_x_min = min(right_hand[0::3])
  right_x_max = max(right_hand[0::3])
  right_y_min = min(right_hand[1::3])
  right_y_max = max(right_hand[1::3])

  return left_hand, right_hand,face ,posepts25

def map_25_to_23(posepts):
	if len(posepts) != 75:
		return posepts
	posepts = np.array(posepts)
	posepts23 = np.zeros(69)
	mapping = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 22, 23, 12, 13, 14, 19, 20, 0, 15, 17, 16, 18]
	posepts23[0::3] = posepts[0::3][mapping]
	posepts23[1::3] = posepts[1::3][mapping]
	posepts23[2::3] = posepts[2::3][mapping]
	return posepts23

# 왼손과 오른손의 중심이 맞게 찍혔는지 확인하기 위한 함수
def img_show(left_hand, right_hand,img_path):
  plt.figure(figsize=(10, 10))
  plt.imshow(plt.imread(img_path))

  #왼손, 오른손 각각의 키포인트 시각화 (green, pink)
  plt.scatter(left_hand[0::3], left_hand[1::3], color='green', s=2)
  plt.scatter(right_hand[0::3], right_hand[1::3], color='pink', s=2)
  # 손의 범위를 포함하는 네모 박스 시각화 (blue, red)
  # plt.scatter([left_x_min,left_x_min,left_x_max,left_x_max], [left_y_min, left_y_max, left_y_min, left_y_max], color='blue', s=2)
  # plt.scatter([right_x_min,right_x_min,right_x_max,right_x_max],[right_y_min, right_y_max, right_y_min, right_y_max], color='red', s=2)

  # 손 중심 찾기
  plt.scatter(avehand(left_hand)[0], avehand(left_hand)[1], color='yellow', s=5)
  plt.scatter(avehand(right_hand)[0], avehand(right_hand)[1],color='yellow',s=5)
 
  plt.show()

def makebox90(miny, maxy, minx, maxx, dimy=90, dimx=90):
  diffy = maxy - miny
  diffx = maxx - minx
  # print "diffyb", maxy - miny
  # print "diffxb", maxx - minx
  if diffy != dimy:
    howmuch = dimy - diffy

    maxy = maxy + (howmuch //2)
    miny = maxy - dimy

    if maxy > 512:
      maxy = 512
      miny = 512 - dimy
    roomtoedge = miny
    if miny < 0:
      miny = 0
      maxy = dimy
  if diffx != dimx:
    howmuch = dimx - diffx

    maxx = maxx + (howmuch //2)
    minx = maxx - dimx

    if maxx > 1024:
      maxx = 1024
      minx = 1024 - dimx
    roomtoedge = minx
    if minx < 0:
      minx = 0
      maxx = dimx

  # print "diffy", maxy - miny
  # print "diffx", maxx - minx
  return miny, maxy, minx, maxx

def handcrop(img_path,img_name,hand , hand_keypoint):
  ave = avehand(hand_keypoint)

  # 중심 좌표 읽어오기
  avex = ave[0]
  avey = ave[1]

  startx = 300
  endx = 1500
  starty = 20
  endy = 990

  tary = 512
  tarx = 512

  boxbuffer = 70

  scaley = float(tary) / float(endy - starty)
  scalex = float(tarx) / float(endx - startx)


  minx = int((max(avex - boxbuffer, startx) - startx) * scalex)
  miny = int((max(avey - boxbuffer, starty) - starty) * scaley)
  maxx = int((min(avex + boxbuffer, endx) - startx) * scalex)
  maxy = int((min(avey + boxbuffer, endy) - starty) * scaley)

  miny, maxy, minx, maxx = makebox90(miny, maxy, minx, maxx)

  saveim = True

  if saveim:   #
    frame_name = img_path   #여기에 있는 이미지를 읽어서 
    if not os.path.isfile(frame_name):
      print('bad', frame_name)
    else:
      oriImg = cv.imread(frame_name)  # 이미지 읽기
      oriImg = Image.fromarray(oriImg[starty:endy, startx:endx, :])   # 이미지 잘라서 가져오기
      oriImg = oriImg.resize((512,512), Image.ANTIALIAS)   # 이미지 resize + 부드럽게 만들기
      oriImg = np.array(oriImg)
      oriImg = oriImg[miny:maxy, minx:maxx, [2,1,0]]   # 이미지 crop
      oriImg = Image.fromarray(oriImg)    # 새로운 이미지로 저장!
      oriImg.save('./'+hand+'/' + img_name  + '.jpg')  # 새로운 손 저장!

def facecrop(img_path,img_name,face,posepts25):

  posepts = map_25_to_23(posepts25)
  ave = aveface(posepts)

  # 중심 좌표 읽어오기
  avex = ave[0]
  avey = ave[1]

  poselen = 69

  startx = 300
  endx = 1500
  starty = 20
  endy = 990

  tary = 512
  tarx = 512

  boxbuffer = 70

  scaley = float(tary) / float(endy - starty)
  scalex = float(tarx) / float(endx - startx)


  minx = int((max(avex - boxbuffer, startx) - startx) * scalex)
  miny = int((max(avey - boxbuffer, starty) - starty) * scaley)
  maxx = int((min(avex + boxbuffer, endx) - startx) * scalex)
  maxy = int((min(avey + boxbuffer, endy) - starty) * scaley)

  miny, maxy, minx, maxx = makebox90(miny, maxy, minx, maxx,128,128)
  
  saveim = True

  if saveim:   #
    frame_name = img_path   #여기에 있는 이미지를 읽어서 
    if not os.path.isfile(frame_name):
      print('bad', frame_name)
    else:
      oriImg = cv.imread(frame_name)  # 이미지 읽기
      oriImg = Image.fromarray(oriImg[starty:endy, startx:endx, :])   # 이미지 잘라서 가져오기
      oriImg = oriImg.resize((512,512), Image.ANTIALIAS)   # 이미지 resize + 부드럽게 만들기
      oriImg = np.array(oriImg)
      oriImg = oriImg[miny:maxy, minx:maxx, [2,1,0]]   # 이미지 crop
      oriImg = Image.fromarray(oriImg)    # 새로운 이미지로 저장!
      oriImg.save('./'+face+'/' + img_name  + '.jpg')  # 새로운 손 저장!

json_path = './json/NIA_SL_WORD1120_REAL02_F_0078_keypoints.json'
img_path = './img/NIA_SL_WORD1120_REAL02_F.mp4_78.jpg'
left_hand, right_hand, face, posepts25 = readjson(json_path)
img_show(left_hand,right_hand,img_path)

img_name = 'NIA_SL_WORD1120_REAL02_F78'  # 저장하고 싶은 이미지 이름
# hand = 'left_hand'
# handcrop(img_path,img_name,hand,left_hand)
# handcrop(img_path,img_name,hand,right_hand) 
facecrop(img_path,img_name, 'face',posepts25)  # face 하는 폴더 아래에 저장하고 싶다. 라는 뜻

cd lpips-tf2.x

import tensorflow as tf
from models.lpips_tensorflow import learned_perceptual_metric_model

def load_image(fn):
    image = Image.open(fn)
    image = np.asarray(image)
    image = np.expand_dims(image, axis=0)

    image = tf.constant(image, dtype=tf.dtypes.float32)
    return image

def dist(hand_img1, hand_img2):
    image_size = 64
    model_dir = './models'
    vgg_ckpt_fn = os.path.join(model_dir, 'vgg', 'exported')
    lin_ckpt_fn = os.path.join(model_dir, 'lin', 'exported')
    lpips = learned_perceptual_metric_model(image_size, vgg_ckpt_fn, lin_ckpt_fn)

    # official pytorch model value:
    # Distance: ex_ref.png <-> ex_p0.png = 0.569
    # Distance: ex_ref.png <-> ex_p1.png = 0.422
    # image_fn2 = './imgs/ex_p1.png'

    image1 = load_image(hand_img1)
    image2 = load_image(hand_img2)
    dist01 = lpips([image1, image2])
    print('Distance: {:.3f}'.format(dist01))
    return dist01