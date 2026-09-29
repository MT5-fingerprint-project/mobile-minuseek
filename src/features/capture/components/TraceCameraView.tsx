import type { ReactNode } from 'react'
import { type GestureResponderEvent, Pressable, StyleSheet, View } from 'react-native'
import { Camera, type ReadonlyFrameProcessor } from 'react-native-vision-camera'

import type { TraceCamera } from '@/features/capture/hooks/useTraceCamera'
import { CAPTURE_ASPECT_RATIO } from '@/features/capture/lib/captureFrame'

type TraceCameraViewProps = {
  camera: TraceCamera
  /** Coupe le capteur hors focus et pendant l'aperçu (batterie, caméra fantôme). */
  isActive: boolean
  /** Analyse des images du viseur (`useCaptureSignals`). */
  frameProcessor: ReadonlyFrameProcessor
  children?: ReactNode
}

const FOCUS_INDICATOR_SIZE = 64

export default function TraceCameraView({ camera, isActive, frameProcessor, children }: TraceCameraViewProps) {
  const { device, focusPoint } = camera

  const handleTap = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent
    void camera.focusTo({ x: locationX, y: locationY })
  }

  return (
    <View className="w-full bg-black" style={{ aspectRatio: CAPTURE_ASPECT_RATIO }}>
      {device != null && (
        <Pressable style={StyleSheet.absoluteFill} onPress={handleTap} accessibilityLabel="Faire la mise au point">
          <Camera
            ref={camera.cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            format={camera.format}
            isActive={isActive}
            photo={true}
            video={false}
            audio={false}
            frameProcessor={frameProcessor}
            resizeMode="cover"
            photoQualityBalance="quality"
            torch={isActive && camera.isTorchOn ? 'on' : 'off'}
            enableZoomGesture={false}
            onInitialized={camera.handleInitialized}
            onError={camera.handleError}
          />
        </Pressable>
      )}

      {focusPoint != null && (
        <View
          pointerEvents="none"
          className="absolute rounded-full border-2 border-white/90"
          style={{
            width: FOCUS_INDICATOR_SIZE,
            height: FOCUS_INDICATOR_SIZE,
            left: focusPoint.x - FOCUS_INDICATOR_SIZE / 2,
            top: focusPoint.y - FOCUS_INDICATOR_SIZE / 2,
          }}
        />
      )}

      {children}
    </View>
  )
}
