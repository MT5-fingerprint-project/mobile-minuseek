import { apiClient } from '@/features/shared/lib/apiClient'
import type { SelectedTrace, Trace } from '@/features/trace/types/trace'

export type UploadedTrace = { id: string; path: string; url: string }

export const TraceAPI = {
  /**
   * Les champs sont ajoutés un par un, jamais par diffusion de l'objet : `SelectedTrace` porte
   * des données purement locales (`uri`, `source`…) que le back rejetterait.
   *
   * ⚠️ Le back valide avec `forbidNonWhitelisted: true` (`app/src/main.ts`) : **tout champ
   * absent d'`UploadTraceDto` fait échouer l'upload entier en 400**, pas seulement le champ.
   * N'ajouter ici que ce que le DTO accepte déjà.
   *
   * La qualité mesurée dans le viseur ne part **pas** : ce qu'on mesure là-bas est la netteté
   * d'une image du flux, pas celle du JPEG versé au dossier (décision de L3-4).
   */
  upload: ({ caseId, uri, mimeType, fileName, width, height, capturedAt, deviceModel }: SelectedTrace) => {
    const form = new FormData()
    form.append('caseId', caseId)
    form.append('file', {
      uri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob)

    // Métadonnées de capture : renseignées par la capture custom, absentes du chemin galerie.
    // `width` et `height` ne valent rien l'un sans l'autre — le back rejette une paire
    // incomplète, on ne les envoie donc que tous les deux.
    if (width !== undefined && height !== undefined) {
      form.append('width', String(width))
      form.append('height', String(height))
    }
    if (capturedAt !== undefined) form.append('capturedAt', capturedAt)
    if (deviceModel !== undefined) form.append('deviceModel', deviceModel)

    return apiClient
      .post<UploadedTrace>('/traces', form, {
        headers: { 'Content-Type': undefined },
      })
      .then((res) => res.data)
  },

  // `caseId` est obligatoire côté back (validé UUID) : 400 sinon.
  list: (caseId: string) =>
    apiClient.get<{ data: Trace[] }>('/traces', { params: { caseId } }).then((res) => res.data.data),

  // 204 No Content : pas de corps à lire.
  remove: (traceId: string) => apiClient.delete<void>(`/traces/${traceId}`).then(() => undefined),
}
