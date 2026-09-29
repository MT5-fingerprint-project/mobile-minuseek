import { useCallback, useState } from 'react'

import { buildCapturedTrace, buildLocationPhoto, type CapturedPhoto } from '@/features/trace/lib/buildCapturedTrace'
import type { SelectedTrace } from '@/features/trace/types/trace'

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
    setTrace(null)
    setWarning(null)
    setStep('trace-framing')
  }, [])

  const startLocationStep = useCallback(() => setStep('location-form'), [])

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
