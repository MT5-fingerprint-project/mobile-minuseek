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
  isSharp: boolean | null
  frameProcessor: ReadonlyFrameProcessor
}

export function useCaptureSignals(): CaptureSignals {
  const { resize } = useResizePlugin()

  // we use a shared value to use it in the camera thread
  const wasSharp = useSharedValue(false)
  // a state to display on screen
  const [isSharpState, setIsSharpState] = useState<boolean | null>(null)

  // bridge between 2 thread. executed in react's thread, used in camera's thread
  const publish = useRunOnJS((sharp: boolean) => {
    setIsSharpState((previous) => (previous === sharp ? previous : sharp))
  }, [])

  // prepare analysis to be used in camera's thread
  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet'
      // if less than analysis_fps since last frame treated, ignore the frame
      runAtTargetFps(ANALYSIS_FPS, () => {
        // tells babel to prepare this function to run in the camera's thread js engine
        'worklet'
        // prepare small images to analyze, return byte array
        const resized = resize(frame, {
          crop: cropRectFor(frame.width, frame.height),
          scale: { width: ANALYSIS_SIDE_PX, height: ANALYSIS_SIDE_PX },
          pixelFormat: 'bgr',
          dataType: 'uint8',
        })

        const gray = toGrayMat(resized, ANALYSIS_SIDE_PX)
        const score = laplacianVariance(gray, ANALYSIS_SIDE_PX)

        // clear buffer used by grayMat and laplacianVariance since react doesn't clear C++
        OpenCV.clearBuffers()

        const sharp = isSharp(score, wasSharp.value)
        wasSharp.value = sharp
        // send result to react's thread
        publish(sharp)
      })
    },
    [resize, publish, wasSharp]
  )

  return { isSharp: isSharpState, frameProcessor }
}
