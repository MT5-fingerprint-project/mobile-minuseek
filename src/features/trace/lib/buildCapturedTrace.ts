import type { SelectedTrace } from '@/features/trace/types/trace'

/**
 * Photo issue de la **capture custom** (`@/features/capture`), volontairement décrite ici
 * sans type de la bibliothèque caméra : `features/trace` ne doit pas en dépendre.
 */
export type CapturedPhoto = {
  /** Chemin renvoyé par la caméra — filesystem nu (`/data/…`) ou URI `file://`. */
  path: string
  width: number
  height: number
  /** Type MIME du conteneur produit. La capture guidée shoote en JPEG. */
  mimeType?: string
}

/** `FormData` a besoin d'une URI ; la caméra renvoie un chemin filesystem nu. */
function toFileUri(path: string): string {
  return path.startsWith('file://') ? path : `file://${path}`
}

function extensionOf(mimeType: string): string {
  return mimeType === 'image/jpeg' ? 'jpg' : mimeType.split('/')[1]
}

/**
 * Construit un `SelectedTrace` à partir d'une photo capturée.
 *
 * `buildSelectedTrace` n'est pas réutilisable ici : il part d'un `ImagePickerAsset`, dont
 * ni `fileName` ni `mimeType` n'existent sur l'objet rendu par la caméra.
 */
export function buildCapturedTrace(photo: CapturedPhoto, caseId: string): SelectedTrace {
  const mimeType = photo.mimeType ?? 'image/jpeg'
  return {
    uri: toFileUri(photo.path),
    caseId,
    mimeType,
    fileName: `trace-${Date.now()}.${extensionOf(mimeType)}`,
    source: 'camera',
    width: photo.width,
    height: photo.height,
  }
}
