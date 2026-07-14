import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/features/shared/auth/auth-context';
import { AuthFailedError } from '@/features/shared/auth/oidc';
import { Button } from '@/features/shared/ui/button';
import { Field, FieldLabel } from '@/features/shared/ui/field';
import { Input } from '@/features/shared/ui/input';
import { Text } from '@/features/shared/ui/text';

// Même contrainte que le back (TENANT_SLUG_PATTERN) : minuscules, chiffres, tirets.
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [slug, setSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedSlug = slug.trim().toLowerCase();
  const canSubmit = SLUG_PATTERN.test(normalizedSlug) && !isSubmitting;

  async function handleSubmit(): Promise<void> {
    if (!canSubmit) {
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn(normalizedSlug);
      // Succès : l'auth gate bascule automatiquement vers (tabs).
    } catch (caught) {
      // Annulation volontaire (fermeture du navigateur) : pas de message d'erreur.
      const isCancelled =
        caught instanceof AuthFailedError &&
        (caught.reason === 'cancel' || caught.reason === 'dismiss');
      if (!isCancelled) {
        // Diagnostic : la vraie erreur est loggée (Metro) et affichée à l'écran.
        console.error('[auth] échec signIn:', caught);
        const detail = caught instanceof Error ? caught.message : String(caught);
        setError(`Connexion impossible : ${detail}`);
      }
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center gap-6 px-6">
        <View className="gap-2">
          <Text className="text-2xl font-bold">Connexion</Text>
          <Text className="text-muted-foreground">
            Renseigne l&apos;identifiant de ton organisation pour continuer.
          </Text>
        </View>

        <Field>
          <FieldLabel>Organisation</FieldLabel>
          <Input
            value={slug}
            onChangeText={setSlug}
            placeholder="ex. tenant-demo"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            editable={!isSubmitting}
            returnKeyType="go"
            onSubmitEditing={() => void handleSubmit()}
          />
          {error ? (
            <Text className="text-sm text-destructive">{error}</Text>
          ) : null}
        </Field>

        <Button
          onPress={() => void handleSubmit()}
          disabled={!canSubmit}
          loading={isSubmitting}
        >
          <Text>Se connecter</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
