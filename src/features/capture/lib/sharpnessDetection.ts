import { ColorConversionCodes, DataTypes, type Mat, ObjectType, OpenCV } from 'react-native-fast-opencv'

import { COMPOSITION_FRAME, safeAreaOf } from '@/features/capture/lib/captureFrame'

export const ANALYSIS_SIDE_PX = 640
export const SHARP_ABOVE = 100
const HYSTERESIS_RATIO = 0.8

export function cropRectFor(frameWidth: number, frameHeight: number) {
  // tells babel to prepare this function to run in the camera's thread js engine
  'worklet'
  const zone = safeAreaOf(COMPOSITION_FRAME)
  // convert safe area to pixels of the sensor image, axes are swapped
  return {
    x: Math.round(zone.y * frameWidth),
    y: Math.round(zone.x * frameHeight),
    width: Math.round(zone.height * frameWidth),
    height: Math.round(zone.width * frameHeight),
  }
}

export function toGrayMat(bgr: Uint8Array, side: number): Mat {
  'worklet'
  const source = OpenCV.bufferToMat('uint8', side, side, 3, bgr)
  const gray = OpenCV.createObject(ObjectType.Mat, side, side, DataTypes.CV_8U)
  OpenCV.invoke('cvtColor', source, gray, ColorConversionCodes.COLOR_BGR2GRAY)
  return gray
}

export function laplacianVariance(gray: Mat, side: number): number {
  // tells babel to prepare this function to run in the camera's thread js engine
  'worklet'
  // create empty images to receive laplacian result, CV_64f : 64 bits, float, can be negative
  const laplacian = OpenCV.createObject(ObjectType.Mat, side, side, DataTypes.CV_64F)
  // calcul laplacian
  OpenCV.invoke('Laplacian', gray, laplacian, DataTypes.CV_64F, 1, 1, 0, 4)

  // boxes of 1 number each, filled by opencv
  const mean = OpenCV.createObject(ObjectType.Mat, 1, 1, DataTypes.CV_64F)
  const stdDev = OpenCV.createObject(ObjectType.Mat, 1, 1, DataTypes.CV_64F)
  // how much the edge values spread, big if many sharp edges, small if blurry
  OpenCV.invoke('meanStdDev', laplacian, mean, stdDev)

  // copy the opencv box to a js array
  const deviation = OpenCV.matToBuffer(stdDev, 'float64').buffer[0] ?? 0
  // variance
  return deviation * deviation
}

export function isSharp(score: number, previous: boolean): boolean {
  // tells babel to prepare this function to run in the camera's thread js engine
  'worklet'
  if (score >= SHARP_ABOVE) {
    return true
  }

  if (score < SHARP_ABOVE * HYSTERESIS_RATIO) {
    return false
  }

  // if between sharp_above and (sharp_above * hysteresis_ration)
  return previous
}
