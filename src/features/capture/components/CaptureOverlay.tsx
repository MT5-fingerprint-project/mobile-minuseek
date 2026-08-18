import { StyleSheet, View } from 'react-native'

import {
  COMPOSITION_FRAME,
  SAFE_AREA_INSET_RATIO,
  SCALE_GUIDE,
  SCALE_GUIDE_TICKS,
} from '@/features/capture/lib/captureFrame'
import { Text } from '@/features/shared/ui/text'

/**
 * Guides de cadrage dessinés au-dessus du viseur, en pourcentages issus de `captureFrame.ts`
 * — les mêmes coordonnées normalisées que celles exploitées côté photo.
 *
 * Tout est en `View` + bordures : pas de `react-native-svg` en B1. Attention, `borderStyle:
 * 'dashed'` est buggé sur Android dès que `borderRadius > 0` — d'où `borderRadius: 0` partout
 * où il y a des pointillés.
 *
 * B1 ne fait **aucune** analyse d'image : ce guide est statique, le contrôle du cadrage se
 * fait a posteriori via le seuil de résolution. La mesure temps réel est le ticket B2.
 */

const MASK = 'rgba(0,0,0,0.45)'
const SCALE_GUIDE_COLOR = '#FACC15'

const percent = (value: number) => `${value * 100}%` as const

export default function CaptureOverlay() {
  const insetX = percent(COMPOSITION_FRAME.width * SAFE_AREA_INSET_RATIO)
  const insetY = percent(COMPOSITION_FRAME.height * SAFE_AREA_INSET_RATIO)

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Masque en 3 rangées plutôt qu'un masque unique : plus fiable en RN. */}
      <View style={{ height: percent(COMPOSITION_FRAME.y), backgroundColor: MASK }} />
      <View className="flex-row" style={{ height: percent(COMPOSITION_FRAME.height) }}>
        <View style={{ width: percent(COMPOSITION_FRAME.x), backgroundColor: MASK }} />
        <View className="border-2 border-white/90" style={{ width: percent(COMPOSITION_FRAME.width) }}>
          <FrameCorners />
          {/* Zone utile : marge absorbant le redressement de D1. */}
          <View
            className="border border-dashed border-white/40"
            style={{ position: 'absolute', top: insetY, bottom: insetY, left: insetX, right: insetX, borderRadius: 0 }}
          />
        </View>
        <View className="flex-1" style={{ backgroundColor: MASK }} />
      </View>
      <View className="flex-1" style={{ backgroundColor: MASK }} />

      <View className="absolute inset-x-0 top-0 px-6 pt-4">
        <Text className="text-center text-sm font-medium text-white">
          La trace doit remplir le cadre. Tenez l&apos;appareil parallèle à la surface.
        </Text>
      </View>

      <ScaleGuide />
    </View>
  )
}

/** Coins renforcés : lisibles aussi bien sur fond clair que sombre. */
function FrameCorners() {
  const size = 28
  return (
    <>
      <View
        className="absolute left-0 top-0 border-l-[3px] border-t-[3px] border-white"
        style={{ width: size, height: size }}
      />
      <View
        className="absolute right-0 top-0 border-r-[3px] border-t-[3px] border-white"
        style={{ width: size, height: size }}
      />
      <View
        className="absolute bottom-0 left-0 border-b-[3px] border-l-[3px] border-white"
        style={{ width: size, height: size }}
      />
      <View
        className="absolute bottom-0 right-0 border-b-[3px] border-r-[3px] border-white"
        style={{ width: size, height: size }}
      />
    </>
  )
}

/** Bande où poser la règle millimétrée, sous la trace. */
function ScaleGuide() {
  return (
    <View
      style={{
        position: 'absolute',
        left: percent(SCALE_GUIDE.x),
        top: percent(SCALE_GUIDE.y),
        width: percent(SCALE_GUIDE.width),
        height: percent(SCALE_GUIDE.height),
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: SCALE_GUIDE_COLOR,
        borderRadius: 0,
        justifyContent: 'space-between',
        paddingVertical: 4,
      }}
    >
      {/* Graduations mimées : une rangée de fines `View`, pas de SVG. */}
      <View className="flex-row justify-between px-1">
        {Array.from({ length: SCALE_GUIDE_TICKS }).map((_, index) => (
          <View key={index} className="h-3 w-px bg-white/70" />
        ))}
      </View>
      <Text className="text-center text-[11px]" style={{ color: SCALE_GUIDE_COLOR }}>
        Posez la règle ici — graduations vers la trace
      </Text>
    </View>
  )
}
