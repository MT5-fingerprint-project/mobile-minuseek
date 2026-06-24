import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import InvestigationCaseCreateForm from '@/features/investigation-case/components/InvestigationCaseCreateForm';
import { useCreateInvestigationCase } from '@/features/investigation-case/hooks/useInvestigationCases';
import type { InvestigationCaseCreateInput } from '@/features/investigation-case/types/investigationCase';

type InvestigationCaseCreateModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function InvestigationCaseCreateModal({ visible, onClose }: InvestigationCaseCreateModalProps) {
  const insets = useSafeAreaInsets();
  const createCase = useCreateInvestigationCase();

  const handleSubmit = async (values: InvestigationCaseCreateInput) => {
    // Errors bubble up to the form (mutationFn rethrows a readable message).
    await createCase.mutateAsync(values);
    Alert.alert('Affaire créée avec succès');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        {/* Tap outside to dismiss */}
        <Pressable className="flex-1" onPress={onClose} accessibilityLabel="Fermer" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View
            className="rounded-t-3xl bg-background px-5 pt-5"
            // Min clearance so the footer never sits under the iOS home indicator,
            // even if insets read 0 across the Modal boundary.
            style={{ paddingBottom: Math.max(insets.bottom, 24) + 16 }}
          >
            <View className="mb-4 h-1 w-10 self-center rounded-full bg-muted-foreground/40" />
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <InvestigationCaseCreateForm onClose={onClose} onSubmit={handleSubmit} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
