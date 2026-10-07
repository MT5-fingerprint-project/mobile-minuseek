import { View } from 'react-native'

import { Text } from '@/features/shared/ui/text'

type CaptureSignalsBannerProps = {
  tiltDeviationDeg: number | null
  isSharp: boolean | null
}

const SHARP_COLOR = '#4ADE80'
const BLURRY_COLOR = '#F87171'

export default function CaptureSignalsBanner({ tiltDeviationDeg, isSharp }: CaptureSignalsBannerProps) {
  return (
    <View className="absolute inset-x-0 top-0 px-6 pt-4" pointerEvents="none">
      <Text className="text-center text-sm font-medium text-white">La trace doit remplir le cadre.</Text>

      <View className="mt-1 flex-row items-center justify-center gap-3">
        {tiltDeviationDeg !== null && <Text className="text-[11px] text-white/70">{tiltDeviationDeg}°</Text>}

        {isSharp !== null && (
          <View className="flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: isSharp ? SHARP_COLOR : BLURRY_COLOR }} />
            <Text className="text-[11px] font-medium text-white">{isSharp ? 'Net' : 'Flou'}</Text>
          </View>
        )}
      </View>
    </View>
  )
}
