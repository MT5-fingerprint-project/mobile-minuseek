import { Image, type ImageContentFit } from 'expo-image'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'

import { Text } from '@/features/shared/ui/text'
import type { Trace } from '@/features/trace/types/trace'

type TraceThumbnailProps = {
  trace: Trace
  contentFit?: ImageContentFit
  className?: string
}

/**
 * **Seul** endroit de l'app qui transforme une `Trace` en source d'image.
 * C'est le point d'extension du chiffrement (A3) : y déchiffrer l'image ne
 * demandera de toucher à aucun autre composant.
 *
 * Le back renvoie une URL GCS signée absolue. L'adapter `in-memory` renvoie
 * un chemin relatif `/media/…` que rien ne sert : on affiche alors le
 * placeholder plutôt qu'une image cassée.
 */
function toImageSource(trace: Trace): string | null {
  return /^https?:\/\//.test(trace.url) ? trace.url : null
}

export default function TraceThumbnail({ trace, contentFit = 'cover', className }: TraceThumbnailProps) {
  const uri = toImageSource(trace)
  const [isLoading, setIsLoading] = useState(uri !== null)
  const [hasFailed, setHasFailed] = useState(false)

  // L'URL signée est resignée à chaque refetch : on repart d'un état propre.
  useEffect(() => {
    setIsLoading(uri !== null)
    setHasFailed(false)
  }, [uri])

  if (uri === null || hasFailed) {
    return (
      <View className={className}>
        <View className="size-full items-center justify-center rounded-md bg-muted p-2">
          <Text className="text-center text-xs text-muted-foreground">Image indisponible</Text>
        </View>
      </View>
    )
  }

  return (
    <View className={className}>
      <Image
        source={{ uri }}
        contentFit={contentFit}
        style={{ width: '100%', height: '100%' }}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasFailed(true)
        }}
        accessibilityLabel={`Trace du ${new Date(trace.createdAt).toLocaleDateString('fr-FR')}`}
      />
      {isLoading && (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator size="small" color="#091029" />
        </View>
      )}
    </View>
  )
}
