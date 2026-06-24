import { View } from 'react-native';
import { Button } from '@/features/shared/ui/button';
import { Field, FieldError, FieldLabel } from '@/features/shared/ui/field';
import { Input } from '@/features/shared/ui/input';
import { Text } from '@/features/shared/ui/text';
import { Textarea } from '@/features/shared/ui/textarea';
import { useCreateInvestigationCaseForm } from '@/features/investigation-case/hooks/useCreateInvestigationCaseForm';
import type { InvestigationCaseCreateInput } from '@/features/investigation-case/types/investigationCase';

type InvestigationCaseCreateFormProps = {
  onClose: () => void;
  onSubmit: (values: InvestigationCaseCreateInput) => Promise<unknown> | unknown;
};

export default function InvestigationCaseCreateForm({ onClose, onSubmit }: InvestigationCaseCreateFormProps) {
  const { form, submitError } = useCreateInvestigationCaseForm({
    onSubmit,
    onSuccess: onClose,
  });

  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-xl font-semibold">Créer une affaire</Text>
        <Text className="text-sm text-muted-foreground">
          Renseignez les informations de la nouvelle affaire.
        </Text>
      </View>

      <View className="gap-4">
        <form.Field
          name="caseNumber"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field>
                <FieldLabel nativeID={field.name}>Numéro d'affaire</FieldLabel>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChangeText={field.handleChange}
                  placeholder="ex: 2026-004"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  className={isInvalid ? 'border-destructive' : undefined}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="pvNumber"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field>
                <FieldLabel nativeID={field.name}>Numéro du PV</FieldLabel>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChangeText={field.handleChange}
                  placeholder="ex: PV-2026-004"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  className={isInvalid ? 'border-destructive' : undefined}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="description"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field>
                <FieldLabel nativeID={field.name}>Description</FieldLabel>
                <Textarea
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChangeText={field.handleChange}
                  placeholder="Décrivez l'affaire..."
                  className={isInvalid ? 'border-destructive' : undefined}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        {submitError && <Text className="text-sm text-destructive">{submitError}</Text>}
      </View>

      <View className="flex-row justify-end gap-3">
        <Button variant="outline" onPress={onClose}>
          <Text>Annuler</Text>
        </Button>
        <form.Subscribe
          selector={(state) => state.isSubmitting}
          children={(isSubmitting) => (
            <Button loading={isSubmitting} onPress={() => form.handleSubmit()}>
              <Text>{isSubmitting ? 'Création…' : "Créer l'affaire"}</Text>
            </Button>
          )}
        />
      </View>
    </View>
  );
}
