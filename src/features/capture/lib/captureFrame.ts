/** Ratio largeur / hauteur du viseur, égal à celui du capteur en portrait (3:4). */
export const CAPTURE_ASPECT_RATIO = 3 / 4

/** Rectangle normalisé (0–1), valable dans le repère du viseur ET de la photo. */
export type NormalizedRect = { x: number; y: number; width: number; height: number }

/** Rectangle en pixels, dans le repère de la surface de rendu ou de la photo. */
export type PixelRect = { x: number; y: number; width: number; height: number }

export const COMPOSITION_FRAME: NormalizedRect = { x: 0.1, y: 0.1, width: 0.8, height: 0.6 }

export const SAFE_AREA_INSET_RATIO = 0.08

/** Bande où poser la règle millimétrée, sous la trace. */
export const SCALE_GUIDE: NormalizedRect = { x: 0.1, y: 0.72, width: 0.8, height: 0.1 }

/** Nombre de graduations dessinées sur le repère d'échelle (bornes incluses). */
export const SCALE_GUIDE_TICKS = 21

export function safeAreaOf(frame: NormalizedRect = COMPOSITION_FRAME): NormalizedRect {
  'worklet'
  const insetX = frame.width * SAFE_AREA_INSET_RATIO
  const insetY = frame.height * SAFE_AREA_INSET_RATIO
  return {
    x: frame.x + insetX,
    y: frame.y + insetY,
    width: frame.width - insetX * 2,
    height: frame.height - insetY * 2,
  }
}

export function toPixels(rect: NormalizedRect, width: number, height: number): PixelRect {
  'worklet'
  return {
    x: rect.x * width,
    y: rect.y * height,
    width: rect.width * width,
    height: rect.height * height,
  }
}
