import { Linking, View } from 'react-native'

import type { CapturePermissionStatus } from '@/features/capture/hooks/useCapturePermission'
import { Button } from '@/features/shared/ui/button'
import { Text } from '@/features/shared/ui/text'

type CameraPermissionGateProps = {
  status: Exclude<CapturePermissionStatus, 'granted'>
  onRequest: () => void
  onClose: () => void
}

const MESSAGES: Record<CameraPermissionGateProps['status'], { title: string; body: string }> = {
  undetermined: {
    title: 'Accès à la caméra',
    body: 'La capture guidée a besoin de la caméra pour photographier la trace et la règle millimétrée.',
  },
  denied: {
    title: 'Caméra non autorisée',
    body: "L'accès a été refusé. Vous pouvez l'autoriser à nouveau pour prendre une photo de la trace.",
  },
  blocked: {
    title: 'Caméra bloquée',
    body: "L'accès à la caméra a été refusé définitivement. Autorisez-le dans les réglages de votre téléphone, puis revenez sur cet écran.",
  },
}

export default function CameraPermissionGate({ status, onRequest, onClose }: CameraPermissionGateProps) {
  const { title, body } = MESSAGES[status]
  const canRequest = status !== 'blocked'

  return (
    <View className="flex-1 items-center justify-center gap-4 px-8">
      <Text className="text-center text-lg font-semibold text-white">{title}</Text>
      <Text className="text-center text-sm text-white/70">{body}</Text>
      <View className="mt-2 w-full gap-3">
        {canRequest ? (
          <Button onPress={onRequest}>
            <Text>Autoriser la caméra</Text>
          </Button>
        ) : (
          <Button onPress={() => void Linking.openSettings()}>
            <Text>Ouvrir les réglages</Text>
          </Button>
        )}
        <Button variant="ghost" onPress={onClose}>
          <Text className="text-white">Retour</Text>
        </Button>
      </View>
    </View>
  )
}
