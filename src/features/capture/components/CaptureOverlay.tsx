import { StyleSheet, View } from 'react-native'

import CaptureSignalsBanner from '@/features/capture/components/CaptureSignalsBanner'
import {
  COMPOSITION_FRAME,
  SAFE_AREA_INSET_RATIO,
  SCALE_GUIDE,
  SCALE_GUIDE_TICKS,
} from '@/features/capture/lib/captureFrame'
import { Text } from '@/features/shared/ui/text'

type CaptureOverlayProps = {
  isAligned: boolean
  tiltDeviationDeg: number | null
  isSharp: boolean | null
}

const ALIGNED_COLOR = '#4ADE80'
const MISALIGNED_COLOR = '#F87171'

const MASK = 'rgba(0,0,0,0.45)'
const SCALE_GUIDE_COLOR = '#FACC15'

const percent = (value: number) => `${value * 100}%` as const

export default function CaptureOverlay({ isAligned, tiltDeviationDeg, isSharp }: CaptureOverlayProps) {
  const insetX = percent(COMPOSITION_FRAME.width * SAFE_AREA_INSET_RATIO)
  const insetY = percent(COMPOSITION_FRAME.height * SAFE_AREA_INSET_RATIO)
  const frameColor = isAligned ? ALIGNED_COLOR : MISALIGNED_COLOR

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ height: percent(COMPOSITION_FRAME.y), backgroundColor: MASK }} />
      <View className="flex-row" style={{ height: percent(COMPOSITION_FRAME.height) }}>
        <View style={{ width: percent(COMPOSITION_FRAME.x), backgroundColor: MASK }} />
        <View className="border-2" style={{ width: percent(COMPOSITION_FRAME.width), borderColor: frameColor }}>
          <FrameCorners color={frameColor} />
          <View
            className="border border-dashed border-white/40"
            style={{ position: 'absolute', top: insetY, bottom: insetY, left: insetX, right: insetX, borderRadius: 0 }}
          />
        </View>
        <View className="flex-1" style={{ backgroundColor: MASK }} />
      </View>
      <View className="flex-1" style={{ backgroundColor: MASK }} />

      <CaptureSignalsBanner tiltDeviationDeg={tiltDeviationDeg} isSharp={isSharp} />

      <ScaleGuide />
    </View>
  )
}

function FrameCorners({ color }: { color: string }) {
  const size = 28
  return (
    <>
      <View
        className="absolute left-0 top-0 border-l-[3px] border-t-[3px]"
        style={{ width: size, height: size, borderColor: color }}
      />
      <View
        className="absolute right-0 top-0 border-r-[3px] border-t-[3px]"
        style={{ width: size, height: size, borderColor: color }}
      />
      <View
        className="absolute bottom-0 left-0 border-b-[3px] border-l-[3px]"
        style={{ width: size, height: size, borderColor: color }}
      />
      <View
        className="absolute bottom-0 right-0 border-b-[3px] border-r-[3px]"
        style={{ width: size, height: size, borderColor: color }}
      />
    </>
  )
}

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
