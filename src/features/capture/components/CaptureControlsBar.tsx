import { Pressable, View } from 'react-native'

import { Text } from '@/features/shared/ui/text'

/** Fermer / déclencheur / torche. Barre posée sous le viseur, sur fond noir. */
type CaptureControlsBarProps = {
  onClose: () => void
  onCapture: () => void
  onToggleTorch: () => void
  hasTorch: boolean
  isTorchOn: boolean
  /** Déclencheur inactif tant que la session n'est pas prête, ou pendant la prise de vue. */
  isCaptureDisabled: boolean
  isCapturing: boolean
}

export default function CaptureControlsBar({
  onClose,
  onCapture,
  onToggleTorch,
  hasTorch,
  isTorchOn,
  isCaptureDisabled,
  isCapturing,
}: CaptureControlsBarProps) {
  return (
    <View className="flex-row items-center justify-between px-8 py-6">
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Fermer la capture"
        className="h-14 w-14 items-center justify-center rounded-full active:opacity-60"
      >
        <Text className="text-sm text-white">Fermer</Text>
      </Pressable>

      <Pressable
        onPress={onCapture}
        disabled={isCaptureDisabled}
        accessibilityRole="button"
        accessibilityLabel="Prendre la photo"
        accessibilityState={{ disabled: isCaptureDisabled, busy: isCapturing }}
        className={`h-20 w-20 items-center justify-center rounded-full border-4 border-white active:opacity-70 ${
          isCaptureDisabled ? 'opacity-40' : ''
        }`}
      >
        <View className="h-16 w-16 rounded-full bg-white" />
      </Pressable>

      <Pressable
        onPress={onToggleTorch}
        disabled={!hasTorch}
        accessibilityRole="button"
        accessibilityLabel={isTorchOn ? 'Éteindre la torche' : 'Allumer la torche'}
        accessibilityState={{ disabled: !hasTorch, selected: isTorchOn }}
        className={`h-14 w-14 items-center justify-center rounded-full active:opacity-60 ${
          hasTorch ? '' : 'opacity-30'
        } ${isTorchOn ? 'bg-white/20' : ''}`}
      >
        <Text className="text-sm text-white">{isTorchOn ? 'Torche\u00a0ON' : 'Torche'}</Text>
      </Pressable>
    </View>
  )
}
