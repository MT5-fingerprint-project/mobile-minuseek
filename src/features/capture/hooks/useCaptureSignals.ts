import { useState } from 'react'
import { OpenCV } from 'react-native-fast-opencv'
import { type ReadonlyFrameProcessor, runAtTargetFps, useFrameProcessor } from 'react-native-vision-camera'
import { useRunOnJS, useSharedValue } from 'react-native-worklets-core'
import { useResizePlugin } from 'vision-camera-resize-plugin'

import {
  ANALYSIS_SIDE_PX,
  cropRectFor,
  isSharp,
  laplacianVariance,
  toGrayMat,
} from '@/features/capture/lib/sharpnessDetection'

const ANALYSIS_FPS = 3

export type CaptureSignals = {
  /** Netteté de la dernière image analysée ; `null` avant la première. */
  isSharp: boolean | null
  /** À passer au `<Camera>` ; la caméra ouvre le flux d'analyse dès qu'il est posé. */
  frameProcessor: ReadonlyFrameProcessor
}

export function useCaptureSignals(): CaptureSignals {
  const { resize } = useResizePlugin()

  const wasSharp = useSharedValue(false)
  const [isSharpState, setIsSharpState] = useState<boolean | null>(null)

  const publish = useRunOnJS((sharp: boolean) => {
    setIsSharpState((previous) => (previous === sharp ? previous : sharp))
  }, [])

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet'
      runAtTargetFps(ANALYSIS_FPS, () => {
        'worklet'
        const resized = resize(frame, {
          crop: cropRectFor(frame.width, frame.height),
          scale: { width: ANALYSIS_SIDE_PX, height: ANALYSIS_SIDE_PX },
          rotation: '90deg',
          pixelFormat: 'bgr',
          dataType: 'uint8',
        })

        const gray = toGrayMat(resized, ANALYSIS_SIDE_PX)
        const score = laplacianVariance(gray, ANALYSIS_SIDE_PX)

        OpenCV.clearBuffers()

        const sharp = isSharp(score, wasSharp.value)
        wasSharp.value = sharp
        publish(sharp)
      })
    },
    [resize, publish, wasSharp]
  )

  return { isSharp: isSharpState, frameProcessor }
}
