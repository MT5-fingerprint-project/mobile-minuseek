import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/features/shared/ui/button';
import { Text } from '@/features/shared/ui/text';
import {
  TracePreviewSheet,
  useCaptureTraceForCase,
  usePickImageForCase,
  useUploadTrace,
  type SelectedTrace,
} from '@/features/trace';

export default function CaseScreen() {
  const { id: caseId } = useLocalSearchParams<{ id: string }>();
  const [selected, setSelected] = useState<SelectedTrace | null>(null);

  const { takePhoto } = useCaptureTraceForCase(caseId);
  const { pickImage } = usePickImageForCase(caseId);
  const upload = useUploadTrace();

  const handleConfirm = async () => {
    if (!selected) return;
    try {
      await upload.mutateAsync(selected);
      setSelected(null);
      Alert.alert('Image envoyée', "L'image a été rattachée à l'affaire.");
    } catch (error) {
      Alert.alert(
        'Envoi impossible',
        error instanceof Error ? error.message : 'Une erreur est survenue',
      );
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={['bottom', 'left', 'right']}
    >
      <View className="flex-1 items-center justify-center gap-3 px-5">
        <Button onPress={async () => setSelected(await takePhoto())}>
          <Text>Prendre une photo</Text>
        </Button>
        <Button
          variant="outline"
          onPress={async () => setSelected(await pickImage())}
        >
          <Text>Importer depuis la galerie</Text>
        </Button>
      </View>

      <TracePreviewSheet
        selected={selected}
        isUploading={upload.isPending}
        onConfirm={handleConfirm}
        onCancel={() => setSelected(null)}
      />
    </SafeAreaView>
  );
}
