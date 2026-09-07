import { View } from 'react-native'

import { Text } from '@/features/shared/ui/text'

/**
 * Bandeau du haut du viseur : l'instruction de cadrage, l'angle d'aplomb (L3-3) et le voyant
 * de netteté (L3-4).
 *
 * C'est le seul endroit disponible : sous le cadre, le cadre de composition s'arrête à 0,70
 * de la hauteur et la bande du test millimétré commence à 0,72 — les deux pour cent qui
 * restent sont occupés par sa bordure et son libellé.
 *
 * L3-5 y ajoutera un second voyant, à côté de celui-ci : les deux doivent tenir côte à côte
 * et pouvoir être rouges en même temps.
 */
type CaptureSignalsBannerProps = {
  /** Écart à l'aplomb en degrés ; `null` avant la première mesure du capteur. */
  tiltDeviationDeg: number | null
  /** Netteté de la dernière image analysée ; `null` avant la première. */
  isSharp: boolean | null
  /** Score brut de netteté, affiché en développement pour calibrer le seuil. */
  sharpnessScore: number | null
}

const SHARP_COLOR = '#4ADE80'
const BLURRY_COLOR = '#F87171'

export default function CaptureSignalsBanner({ tiltDeviationDeg, isSharp, sharpnessScore }: CaptureSignalsBannerProps) {
  return (
    <View className="absolute inset-x-0 top-0 px-6 pt-4" pointerEvents="none">
      {/* La seconde phrase d'origine — « Tenez l'appareil parallèle à la surface » — a été
          retirée : c'est exactement ce que le cadre coloré de L3-3 vient dire, en mieux. */}
      <Text className="text-center text-sm font-medium text-white">La trace doit remplir le cadre.</Text>

      <View className="mt-1 flex-row items-center justify-center gap-3">
        {tiltDeviationDeg !== null && <Text className="text-[11px] text-white/70">{tiltDeviationDeg}°</Text>}

        {isSharp !== null && (
          <View className="flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: isSharp ? SHARP_COLOR : BLURRY_COLOR }} />
            <Text className="text-[11px] font-medium text-white">{isSharp ? 'Net' : 'Flou'}</Text>
            {__DEV__ && sharpnessScore !== null && <Text className="text-[10px] text-white/50">{sharpnessScore}</Text>}
          </View>
        )}
      </View>
    </View>
  )
}
