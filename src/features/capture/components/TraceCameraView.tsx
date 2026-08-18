import type { ReactNode } from 'react'
import { type GestureResponderEvent, Pressable, StyleSheet, View } from 'react-native'
import { Camera } from 'react-native-vision-camera'

import type { TraceCamera } from '@/features/capture/hooks/useTraceCamera'
import { CAPTURE_ASPECT_RATIO } from '@/features/capture/lib/captureFrame'

/**
 * ⚠️ Second (et dernier) fichier dépendant de la bibliothèque caméra.
 *
 * **Calage overlay ↔ photo** — le point structurel du ticket : le conteneur est contraint au
 * ratio du capteur (`CAPTURE_ASPECT_RATIO`, portrait 3:4), le format retenu est 4:3 pour la
 * photo *et* pour la preview (`useTraceCamera`), et `resizeMode="cover"` n'a donc rien à
 * rogner. Le passage viseur → photo est une homothétie pure, et les rectangles normalisés de
 * `captureFrame.ts` sont directement exploitables en coordonnées photo. Le piège inverse —
 * un preview en *fill* sur un conteneur plein écran — donnerait un cadre dessiné qui ne
 * correspond à rien dans le JPEG.
 *
 * L'overlay (`children`) est monté **dans ce même conteneur**, en `absolute inset-0`.
 */
type TraceCameraViewProps = {
  camera: TraceCamera
  /** Coupe le capteur hors focus et pendant l'aperçu (batterie, caméra fantôme). */
  isActive: boolean
  children?: ReactNode
}

/** Taille de l'indicateur de mise au point, en points. */
const FOCUS_INDICATOR_SIZE = 64

export default function TraceCameraView({ camera, isActive, children }: TraceCameraViewProps) {
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
            resizeMode="cover"
            photoQualityBalance="quality"
            torch={isActive && camera.isTorchOn ? 'on' : 'off'}
            // Zoom volontairement absent : le zoom numérique ne change pas `width`/`height`
            // mais détruit du détail réel — il permettrait de tromper le contrôle de résolution.
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
