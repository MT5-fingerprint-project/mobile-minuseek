import { Image } from 'expo-image';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/features/shared/ui/button';
import { Text } from '@/features/shared/ui/text';
import type { SelectedTrace } from '@/features/trace/types/trace';

type TracePreviewSheetProps = {
  selected: SelectedTrace | null;
  isUploading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function TracePreviewSheet({
  selected,
  isUploading,
  onConfirm,
  onCancel,
}: TracePreviewSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={selected !== null}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-end bg-black/40">
        {/* Tap outside to dismiss (bloqué pendant l'envoi) */}
        <Pressable
          className="flex-1"
          onPress={isUploading ? undefined : onCancel}
          accessibilityLabel="Fermer"
        />
        <View
          className="rounded-t-3xl bg-background px-5 pt-5"
          style={{ paddingBottom: Math.max(insets.bottom, 24) + 16 }}
        >
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-muted-foreground/40" />
          <Text className="mb-4 text-center text-base font-medium text-foreground">
            Envoyer cette image à l&apos;affaire ?
          </Text>
          {selected && (
            <Image
              source={{ uri: selected.uri }}
              contentFit="contain"
              style={{ width: '100%', height: 260, borderRadius: 12 }}
            />
          )}
          <View className="mt-5 gap-3">
            <Button onPress={onConfirm} loading={isUploading} disabled={isUploading}>
              <Text>Envoyer</Text>
            </Button>
            <Button variant="outline" onPress={onCancel} disabled={isUploading}>
              <Text>Annuler</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
