import type { ImagePickerAsset } from 'expo-image-picker'

/**
 * Statuts réels du back (`prisma/models/trace.prisma`). Le type du front web est périmé.
 * Le rendu doit rester tolérant à une valeur inconnue (nouveau statut déployé côté back).
 */
export const TRACE_STATUSES = ['RECEIVED', 'EXPLOITABLE', 'NOT_EXPLOITABLE'] as const
export type TraceStatus = (typeof TRACE_STATUSES)[number]

/** Une trace déjà envoyée, telle que `GET /traces?caseId=…` la renvoie. */
export type Trace = {
  id: string
  path: string
  url: string
  status: TraceStatus
  score: number | null
  caseId: string
  createdAt: string
}

/**
 * Longueur maximale de la localisation, copiée de `MAX_TRACE_LOCATION_LENGTH` côté back
 * (`app/src/biometrics/domain/trace/entity/trace.ts`). Au-delà, ce n'est pas le champ qui
 * est tronqué : l'upload entier part en 400. Le champ de saisie s'arrête donc ici.
 */
export const MAX_TRACE_LOCATION_LENGTH = 300

/**
 * Le cliché en plan large qui montre l'endroit d'où la trace a été relevée — et non la trace
 * elle-même. Il ne porte aucune métadonnée de capture : le back n'en attend aucune pour lui.
 */
export type TraceLocationPhoto = {
  uri: string
  mimeType: string
  fileName: string
}

/** Une image choisie sur l'appareil, pas encore envoyée. */
export type SelectedTrace = {
  uri: string
  caseId: string
  mimeType: string
  fileName: string
  /**
   * Renseignés par la capture custom uniquement ; ignorés par le chemin galerie.
   * `TraceAPI.upload` choisit explicitement, champ par champ, ce qui part dans le `FormData`
   * — jamais par diffusion de l'objet — parce que le back rejette tout champ inconnu.
   * `uri` et `source` ne sortent donc jamais d'ici, `exif` n'est pas encore lu, et les champs
   * qui partent sont ceux qu'`UploadTraceDto` déclare : `width`/`height` (par paire),
   * `capturedAt`, `deviceModel`, `location` et le fichier `locationPhoto`.
   */
  source?: 'camera' | 'library'
  width?: number
  height?: number
  exif?: Record<string, unknown>
  /** Modèle de l'appareil, tel qu'attendu par `UploadTraceDto.deviceModel` côté back. */
  deviceModel?: string
  /** Date de prise de vue au format ISO 8601 — à ne pas confondre avec la date de réception. */
  capturedAt?: string
  /**
   * Phrase écrite sur les lieux, juste après la prise de vue. Facultative, et vide = absente :
   * le service ne l'envoie pas si elle est vide après `trim()`.
   */
  location?: string
  /** Facultative elle aussi, et indépendante de la phrase : l'une peut partir sans l'autre. */
  locationPhoto?: TraceLocationPhoto
}

export const ACCEPTED_TRACE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/tiff', 'image/heic', 'image/heif'] as const

const EXTENSION_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  heic: 'image/heic',
  heif: 'image/heif',
}

function isAccepted(mimeType: string): boolean {
  return (ACCEPTED_TRACE_MIME_TYPES as readonly string[]).includes(mimeType)
}

function extensionOf(value: string): string {
  const clean = value.split('?')[0]
  const dot = clean.lastIndexOf('.')
  return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : ''
}

function resolveMimeType(asset: ImagePickerAsset): string | null {
  if (asset.mimeType && isAccepted(asset.mimeType)) {
    return asset.mimeType
  }
  const ext = extensionOf(asset.fileName ?? asset.uri)
  const mapped = EXTENSION_TO_MIME[ext]
  return mapped && isAccepted(mapped) ? mapped : null
}

function resolveFileName(asset: ImagePickerAsset, mimeType: string): string {
  if (asset.fileName) return asset.fileName
  const ext = extensionOf(asset.uri) || mimeType.split('/')[1]
  return `trace-${Date.now()}.${ext}`
}

export function buildSelectedTrace(asset: ImagePickerAsset, caseId: string): SelectedTrace | null {
  const mimeType = resolveMimeType(asset)
  if (!mimeType) return null
  return {
    uri: asset.uri,
    caseId,
    mimeType,
    fileName: resolveFileName(asset, mimeType),
  }
}
