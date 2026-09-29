import { DeviceMotion } from 'expo-sensors'
import { useEffect, useState } from 'react'

/** En deçà de cet écart (en degrés), l'appareil est déclaré d'aplomb. */
export const ALIGNED_BELOW_DEG = 5

export const MISALIGNED_ABOVE_DEG = 6

const SAMPLE_INTERVAL_MS = 100

const SMOOTHING = 0.2

export type DeviceTilt = {
  /** Écart à la pose d'aplomb la plus proche, en degrés ; `null` avant la 1ʳᵉ mesure. */
  deviationDeg: number | null
  /** `true` quand l'appareil est d'aplomb. Faux tant qu'on n'a pas mesuré. */
  isAligned: boolean
}

type Vector = { x: number; y: number; z: number }

export function deviationFromPlumb(gravity: Vector): number {
  const magnitude = Math.hypot(gravity.x, gravity.y, gravity.z)
  if (magnitude === 0) return 90

  const cosine = Math.min(1, Math.abs(gravity.z) / magnitude)
  const angleFromFlat = (Math.acos(cosine) * 180) / Math.PI

  return Math.min(angleFromFlat, Math.abs(90 - angleFromFlat))
}

export function useDeviceTilt(isActive: boolean): DeviceTilt {
  const [tilt, setTilt] = useState<DeviceTilt>({ deviationDeg: null, isAligned: false })

  useEffect(() => {
    if (!isActive) {
      setTilt({ deviationDeg: null, isAligned: false })
      return
    }

    let subscription: { remove: () => void } | null = null
    let cancelled = false
    let smoothed: Vector | null = null
    let lastDegrees: number | null = null
    let lastAligned = false

    const start = async () => {
      const available = await DeviceMotion.isAvailableAsync()
      if (!available || cancelled) return

      DeviceMotion.setUpdateInterval(SAMPLE_INTERVAL_MS)
      subscription = DeviceMotion.addListener(({ accelerationIncludingGravity }) => {
        if (accelerationIncludingGravity == null) return

        smoothed =
          smoothed === null
            ? accelerationIncludingGravity
            : {
                x: smoothed.x + SMOOTHING * (accelerationIncludingGravity.x - smoothed.x),
                y: smoothed.y + SMOOTHING * (accelerationIncludingGravity.y - smoothed.y),
                z: smoothed.z + SMOOTHING * (accelerationIncludingGravity.z - smoothed.z),
              }

        const deviation = deviationFromPlumb(smoothed)
        const aligned = deviation < ALIGNED_BELOW_DEG ? true : deviation > MISALIGNED_ABOVE_DEG ? false : lastAligned

        const degrees = Math.round(deviation)
        if (degrees === lastDegrees && aligned === lastAligned) return

        lastDegrees = degrees
        lastAligned = aligned
        setTilt({ deviationDeg: degrees, isAligned: aligned })
      })
    }

    void start()

    return () => {
      cancelled = true
      subscription?.remove()
    }
  }, [isActive])

  return tilt
}
