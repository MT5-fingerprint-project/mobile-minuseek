import { useCallback, useState } from 'react'

import { buildCapturedTrace, buildLocationPhoto, type CapturedPhoto } from '@/features/trace/lib/buildCapturedTrace'
import type { SelectedTrace } from '@/features/trace/types/trace'

/**
 * Le parcours de capture, de la visée à l'objet prêt à partir.
 *
 * Il vit dans `features/trace` et non dans `features/capture` parce qu'il assemble le
 * `SelectedTrace` qu'on envoie ; la caméra, elle, reste dans `features/capture`.
 *
 * ⚠️ Ces étapes ne sont **pas** des routes : il n'existe aucun mécanisme de retour de données
 * entre écrans dans ce repo, et l'écran de capture n'en ouvre aucune. Tout est de l'état local
 * d'un seul écran (cf. l'en-tête de `src/app/capture/[caseId].tsx`).
 */
export type TraceCaptureStep =
  /** Viseur guidé, cadre et règle dessinés : le gros plan de la trace. */
  | 'trace-framing'
  /** Feuille d'aperçu de la trace : envoyer seule, ou passer à la localisation. */
  | 'trace-preview'
  /** Phrase de localisation et vignette du plan large, par-dessus le viseur éteint. */
  | 'location-form'
  /** Viseur nu — ni cadre ni règle — pour le plan large de l'endroit. */
  | 'location-framing'

export type TraceCaptureFlow = {
  step: TraceCaptureStep
  /** L'objet en construction, complété étape par étape ; `null` tant que rien n'est pris. */
  trace: SelectedTrace | null
  /** Avertissement de résolution de la trace (non bloquant), à afficher dans l'aperçu. */
  warning: string | null
  keepTracePhoto: (photo: CapturedPhoto, resolutionWarning: string | null) => void
  retakeTracePhoto: () => void
  startLocationStep: () => void
  /** Retour à l'aperçu de la trace (geste « retour » d'Android) : rien n'est envoyé. */
  leaveLocationStep: () => void
  stateLocation: (location: string) => void
  startLocationPhoto: () => void
  keepLocationPhoto: (photo: CapturedPhoto) => void
  discardLocationPhoto: () => void
  /** Après un envoi réussi : l'écran se referme sur un parcours vierge. */
  reset: () => void
}

export function useTraceCaptureFlow(caseId: string): TraceCaptureFlow {
  const [step, setStep] = useState<TraceCaptureStep>('trace-framing')
  const [trace, setTrace] = useState<SelectedTrace | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  const keepTracePhoto = useCallback(
    (photo: CapturedPhoto, resolutionWarning: string | null) => {
      setTrace(buildCapturedTrace(photo, caseId))
      setWarning(resolutionWarning)
      setStep('trace-preview')
    },
    [caseId]
  )

  const retakeTracePhoto = useCallback(() => {
    // On repart de zéro : la phrase et le plan large décrivaient la trace qu'on abandonne.
    setTrace(null)
    setWarning(null)
    setStep('trace-framing')
  }, [])

  // Sert aussi de retour depuis le viseur du plan large : dans les deux cas, on revient au
  // formulaire sans rien perdre de ce qui y a déjà été saisi.
  const startLocationStep = useCallback(() => setStep('location-form'), [])

  // La phrase et le plan large déjà saisis sont conservés : on quitte l'étape, on ne l'annule
  // pas. « Envoyer sans localisation » depuis l'aperçu, lui, part sans les emporter.
  const leaveLocationStep = useCallback(() => setStep('trace-preview'), [])

  const stateLocation = useCallback((location: string) => {
    setTrace((current) => (current === null ? null : { ...current, location }))
  }, [])

  const startLocationPhoto = useCallback(() => setStep('location-framing'), [])

  const keepLocationPhoto = useCallback((photo: CapturedPhoto) => {
    setTrace((current) => (current === null ? null : { ...current, locationPhoto: buildLocationPhoto(photo) }))
    setStep('location-form')
  }, [])

  const discardLocationPhoto = useCallback(() => {
    setTrace((current) => (current === null ? null : { ...current, locationPhoto: undefined }))
  }, [])

  const reset = useCallback(() => {
    setTrace(null)
    setWarning(null)
    setStep('trace-framing')
  }, [])

  return {
    step,
    trace,
    warning,
    keepTracePhoto,
    retakeTracePhoto,
    startLocationStep,
    leaveLocationStep,
    stateLocation,
    startLocationPhoto,
    keepLocationPhoto,
    discardLocationPhoto,
    reset,
  }
}
