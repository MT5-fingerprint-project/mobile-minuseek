import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

import {
  buildSelectedTrace,
  type SelectedTrace,
} from '@/features/trace/types/trace';

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
    if (result.canceled) return null;

    const asset = result.assets[0];
    if (!asset) return null;

    const selected = buildSelectedTrace(asset, caseId);
    if (!selected) {
      Alert.alert(
        'Format non supporté',
        'Seules les images JPEG, PNG ou TIFF sont acceptées.',
      );
      return null;
    }
    return selected;
  };

  return { takePhoto };
}
