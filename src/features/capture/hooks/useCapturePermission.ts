import { useEffect, useState } from 'react'
import { AppState } from 'react-native'
import { Camera, type CameraPermissionStatus } from 'react-native-vision-camera'

export type CapturePermissionStatus = 'granted' | 'undetermined' | 'denied' | 'blocked'

export type CapturePermission = {
  status: CapturePermissionStatus
  request: () => Promise<boolean>
}

function mapPermissionStatus(status: CameraPermissionStatus, wasRequested: boolean): CapturePermissionStatus {
  if (status === 'granted') return 'granted'
  if (status === 'denied' || status === 'restricted') return 'blocked'
  return wasRequested ? 'denied' : 'undetermined'
}

export function useCapturePermission(): CapturePermission {
  // function given so it's called only one time, and not every render
  const [status, setStatus] = useState<CameraPermissionStatus>(() => Camera.getCameraPermissionStatus())
  const [wasRequested, setWasRequested] = useState(false)

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      // if app first plan, ask permission status
      if (state === 'active') {
        setStatus(Camera.getCameraPermissionStatus())
      }
    })
    // unsub on close capture
    return () => subscription.remove()
  }, [])

  const request = async () => {
    setWasRequested(true)
    const result = await Camera.requestCameraPermission()
    setStatus(result)
    return result === 'granted'
  }

  return { status: mapPermissionStatus(status, wasRequested), request }
}
