import { ColorConversionCodes, DataTypes, type Mat, ObjectType, OpenCV } from 'react-native-fast-opencv'

import { COMPOSITION_FRAME, safeAreaOf } from '@/features/capture/lib/captureFrame'

export const ANALYSIS_SIDE_PX = 640

export const SHARP_ABOVE = 100

const HYSTERESIS_RATIO = 0.8

export function cropRectFor(frameWidth: number, frameHeight: number) {
  'worklet'
  const zone = safeAreaOf(COMPOSITION_FRAME)
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
  'worklet'
  const laplacian = OpenCV.createObject(ObjectType.Mat, side, side, DataTypes.CV_64F)
  OpenCV.invoke('Laplacian', gray, laplacian, DataTypes.CV_64F, 1, 1, 0, 4)

  const mean = OpenCV.createObject(ObjectType.Mat, 1, 1, DataTypes.CV_64F)
  const stdDev = OpenCV.createObject(ObjectType.Mat, 1, 1, DataTypes.CV_64F)
  OpenCV.invoke('meanStdDev', laplacian, mean, stdDev)

  const deviation = OpenCV.matToBuffer(stdDev, 'float64').buffer[0] ?? 0
  return deviation * deviation
}

export function isSharp(score: number, previous: boolean): boolean {
  'worklet'
  if (score >= SHARP_ABOVE) return true
  if (score < SHARP_ABOVE * HYSTERESIS_RATIO) return false
  return previous
}
