import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTakePhotoToGallery } from '@/features/photo/hooks/useTakePhotoToGallery';
import { Button } from '@/features/shared/ui/button';
import { Text } from '@/features/shared/ui/text';

export default function CaseScreen() {
  const { takePhoto, isSaving } = useTakePhotoToGallery();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom', 'left', 'right']}>
      <View className="flex-1 items-center justify-center px-5">
        <Button onPress={takePhoto} loading={isSaving} disabled={isSaving}>
          <Text>Prendre une photo</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
