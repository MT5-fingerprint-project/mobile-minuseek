import '@/global.css'

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import React from 'react'
import { useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { AnimatedSplashOverlay } from '@/components/animated-icon'
import { EnvironmentError } from '@/components/environment-error'
import { AuthProvider, useAuth } from '@/features/shared/auth/auth-context'
import { ENVIRONMENT_ERROR } from '@/features/shared/constants/global.constants'

const queryClient = new QueryClient()

/**
 * Auth gate : `Stack.Protected` (expo-router v6) n'expose `(tabs)` que si la session
 * est authentifiée, et l'écran `login` sinon. Basculement déclaratif — pas de
 * `router.replace` manuel. Pendant la restauration (`loading`), l'overlay de splash
 * couvre l'écran, donc `login` ne « flashe » pas pour un utilisateur déjà connecté.
 */
function RootNavigator() {
  const { status } = useAuth()
  const isAuthenticated = status === 'authenticated'

  return (
    <Stack>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="case/[id]" options={{ title: 'Affaire' }} />
        {/* Capture guidée : plein écran, sans en-tête, verrouillée en portrait comme l'overlay. */}
        <Stack.Screen
          name="capture/[caseId]"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
            orientation: 'portrait',
          }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  )
}

export default function RootLayout() {
  const colorScheme = useColorScheme()

  // Environnement absent ou invalide : on n'entre pas dans l'app. Sans back ni Keycloak
  // joignables, tout écran affiché serait un écran en panne, et la cause resterait
  // invisible sur un téléphone où il n'y a ni Metro ni console.
  if (ENVIRONMENT_ERROR) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <EnvironmentError message={ENVIRONMENT_ERROR} />
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AuthProvider>
              <AnimatedSplashOverlay />
              <RootNavigator />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
