import type { ImagePickerResult } from 'expo-image-picker';
import { Alert } from 'react-native';

import {
  buildSelectedTrace,
  type SelectedTrace,
} from '@/features/trace/types/trace';

export function resolvePickerResult(
  result: ImagePickerResult,
  caseId: string,
): SelectedTrace | null {
  if (result.canceled) return null;

  const asset = result.assets[0];
  if (!asset) return null;

  const selected = buildSelectedTrace(asset, caseId);
  if (!selected) {
    Alert.alert(
      'Format non supporté',
      'Seules les images JPEG, PNG, TIFF ou HEIC sont acceptées.',
    );
    return null;
  }
  return selected;
}