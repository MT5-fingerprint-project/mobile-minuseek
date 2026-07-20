import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

import {
  buildSelectedTrace,
  type SelectedTrace,
} from '@/features/trace/types/trace';

export function usePickImageForCase(caseId: string) {
  const pickImage = async (): Promise<SelectedTrace | null> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
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

  return { pickImage };
}
