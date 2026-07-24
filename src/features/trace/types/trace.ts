import type { ImagePickerAsset } from 'expo-image-picker';

export type SelectedTrace = {
  uri: string;
  caseId: string;
  mimeType: string;
  fileName: string;
};

export const ACCEPTED_TRACE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/tiff',
  'image/heic',
  'image/heif',
] as const;

const EXTENSION_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  heic: 'image/heic',
  heif: 'image/heif',
};

function isAccepted(mimeType: string): boolean {
  return (ACCEPTED_TRACE_MIME_TYPES as readonly string[]).includes(mimeType);
}

function extensionOf(value: string): string {
  const clean = value.split('?')[0];
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : '';
}

function resolveMimeType(asset: ImagePickerAsset): string | null {
  if (asset.mimeType && isAccepted(asset.mimeType)) {
    return asset.mimeType;
  }
  const ext = extensionOf(asset.fileName ?? asset.uri);
  const mapped = EXTENSION_TO_MIME[ext];
  return mapped && isAccepted(mapped) ? mapped : null;
}

function resolveFileName(asset: ImagePickerAsset, mimeType: string): string {
  if (asset.fileName) return asset.fileName;
  const ext = extensionOf(asset.uri) || mimeType.split('/')[1];
  return `trace-${Date.now()}.${ext}`;
}

export function buildSelectedTrace(
  asset: ImagePickerAsset,
  caseId: string,
): SelectedTrace | null {
  const mimeType = resolveMimeType(asset);
  if (!mimeType) return null;
  return {
    uri: asset.uri,
    caseId,
    mimeType,
    fileName: resolveFileName(asset, mimeType),
  };
}
