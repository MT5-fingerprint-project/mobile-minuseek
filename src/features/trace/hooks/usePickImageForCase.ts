import * as ImagePicker from 'expo-image-picker';

import { resolvePickerResult } from '@/features/trace/lib/resolvePickerResult';
import type { SelectedTrace } from '@/features/trace/types/trace';

export function usePickImageForCase(caseId: string) {
  const pickImage = async (): Promise<SelectedTrace | null> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    return resolvePickerResult(result, caseId);
  };

  return { pickImage };
}