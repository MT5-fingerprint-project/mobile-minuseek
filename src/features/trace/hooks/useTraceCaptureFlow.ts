import { useState } from 'react'

import type { CapturedPhoto } from '@/features/shared/types/photo'
import { buildCapturedTrace, buildLocationPhoto } from '@/features/trace/lib/buildCapturedTrace'
import type { SelectedTrace } from '@/features/trace/types/trace'

export type TraceCaptureStep = 'trace-framing' | 'trace-preview' | 'location-form' | 'location-framing'

export type TraceCaptureFlow = {
  step: TraceCaptureStep
  trace: SelectedTrace | null
  warning: string | null
  keepTracePhoto: (photo: CapturedPhoto, resolutionWarning: string | null) => void
  retakeTracePhoto: () => void
  startLocationStep: () => void
  leaveLocationStep: () => void
  stateLocation: (location: string) => void
  startLocationPhoto: () => void
  keepLocationPhoto: (photo: CapturedPhoto) => void
  discardLocationPhoto: () => void
  reset: () => void
}

export function useTraceCaptureFlow(caseId: string): TraceCaptureFlow {
  // flow's state
  const [step, setStep] = useState<TraceCaptureStep>('trace-framing')
  const [trace, setTrace] = useState<SelectedTrace | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  const keepTracePhoto = (photo: CapturedPhoto, resolutionWarning: string | null) => {
    setTrace(buildCapturedTrace(photo, caseId))
    setWarning(resolutionWarning)
    setStep('trace-preview')
  }

  const retakeTracePhoto = () => {
    setTrace(null)
    setWarning(null)
    setStep('trace-framing')
  }

  const startLocationStep = () => setStep('location-form')

  const leaveLocationStep = () => setStep('trace-preview')

  const stateLocation = (location: string) => {
    setTrace((current) => (current === null ? null : { ...current, location }))
  }

  const startLocationPhoto = () => setStep('location-framing')

  const keepLocationPhoto = (photo: CapturedPhoto) => {
    setTrace((current) => (current === null ? null : { ...current, locationPhoto: buildLocationPhoto(photo) }))
    setStep('location-form')
  }

  const discardLocationPhoto = () => {
    setTrace((current) => (current === null ? null : { ...current, locationPhoto: undefined }))
  }

  const reset = () => {
    setTrace(null)
    setWarning(null)
    setStep('trace-framing')
  }

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
