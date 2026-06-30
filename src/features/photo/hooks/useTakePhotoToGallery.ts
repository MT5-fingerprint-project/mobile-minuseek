import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useState } from 'react';
import { Alert } from 'react-native';

/**
 * Prise de photo simple via la caméra native, puis enregistrement dans la
 * galerie du téléphone. La photo n'est ni liée à une affaire ni envoyée au back.
 */
export function useTakePhotoToGallery() {
  const [isSaving, setIsSaving] = useState(false);

  const takePhoto = async () => {
    const camera = await ImagePicker.requestCameraPermissionsAsync();
    if (!camera.granted) {
      Alert.alert("Permission refusée", "L'accès à la caméra est nécessaire pour prendre une photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (result.canceled) return;

    const uri = result.assets[0]?.uri;
    if (!uri) return;

    setIsSaving(true);
    try {
      const library = await MediaLibrary.requestPermissionsAsync(true);
      if (!library.granted) {
        Alert.alert(
          'Permission refusée',
          "L'accès à la galerie est nécessaire pour enregistrer la photo.",
        );
        return;
      }

      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Photo enregistrée', 'La photo a été ajoutée à la galerie de votre téléphone.');
    } catch {
      Alert.alert('Erreur', "La photo n'a pas pu être enregistrée.");
    } finally {
      setIsSaving(false);
    }
  };

  return { takePhoto, isSaving };
}
