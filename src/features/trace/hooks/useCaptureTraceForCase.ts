import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

import { resolvePickerResult } from '@/features/trace/lib/resolvePickerResult';
import type { SelectedTrace } from '@/features/trace/types/trace';

export function useCaptureTraceForCase(caseId: string) {
  const takePhoto = async (): Promise<SelectedTrace | null> => {
    const camera = await ImagePicker.requestCameraPermissionsAsync();
    if (!camera.granted) {
      Alert.alert(
        'Permission refusée',
        "L'accès à la caméra est nécessaire pour prendre une photo.",
      );
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    return resolvePickerResult(result, caseId);
  };

  return { takePhoto };
}