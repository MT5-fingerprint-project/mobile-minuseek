import { DeviceMotion } from 'expo-sensors'
import { useEffect, useState } from 'react'

export const ALIGNED_BELOW_DEG = 5
export const MISALIGNED_ABOVE_DEG = 6
const SAMPLE_INTERVAL_MS = 100
const SMOOTHING = 0.2

export type DeviceTilt = {
  deviationDeg: number | null
  isAligned: boolean
}

type Vector = { x: number; y: number; z: number }

export function deviationFromPlumb(gravity: Vector): number {

  // returns the square root of the sum of the squares of its arguments (should always be equals to 9,81)
  const magnitude = Math.hypot(gravity.x, gravity.y, gravity.z)

  if (magnitude === 0) {
    // 90 is out of range so it will return non-plumb
    return 90
  }

  // Math.abs to remeve negative sign, then cosinus a/h
  const cosine = Math.abs(gravity.z) / magnitude
  // math.acos calculate the cosinus angle in radiant. * 180 / Math.PI convert radiant in degrees
  const angleFromFlat = (Math.acos(cosine) * 180) / Math.PI

  // return the minimum value between angleFromFlat and diff to 90 degrees
  return Math.min(angleFromFlat, Math.abs(90 - angleFromFlat))
}

export function useDeviceTilt(isActive: boolean): DeviceTilt {
  const [tilt, setTilt] = useState<DeviceTilt>({ deviationDeg: null, isAligned: false })

  useEffect(() => {
    // if not camera screen or with modal displayed, return
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
      // check available sensor or cancelled
      if (!available || cancelled) {
        return
      }

      DeviceMotion.setUpdateInterval(SAMPLE_INTERVAL_MS)
      // subscribe to listener on acceleration and gravity, if immobile phone, only gravity remain
      subscription = DeviceMotion.addListener(({ accelerationIncludingGravity }) => {
        if (accelerationIncludingGravity == null) {
          return
        }

        // first value, no smoothed, other value smoothed to canceled hand shaking. side effect is a small delay ~1s
        smoothed = smoothed === null
            ? accelerationIncludingGravity
            : {
                x: smoothed.x + SMOOTHING * (accelerationIncludingGravity.x - smoothed.x),
                y: smoothed.y + SMOOTHING * (accelerationIncludingGravity.y - smoothed.y),
                z: smoothed.z + SMOOTHING * (accelerationIncludingGravity.z - smoothed.z),
              }

        // calculate diff in degrees to the closest plumb
        const deviation = deviationFromPlumb(smoothed)
        // < 5 : plumb, > 6 : unplumb, between 5 and 6 : keep last value
        const aligned = deviation < ALIGNED_BELOW_DEG ? true : deviation > MISALIGNED_ABOVE_DEG ? false : lastAligned

        // round number to display short number
        const degrees = Math.round(deviation)
        // if nothing change, don't display any changes
        if (degrees === lastDegrees && aligned === lastAligned) {
          return
        }

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
