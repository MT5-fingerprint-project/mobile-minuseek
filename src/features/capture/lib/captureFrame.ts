/**
 * Géométrie du viseur guidé, en coordonnées **normalisées** (0–1).
 *
 * Le viseur est contraint au ratio du capteur (portrait 3:4) plutôt que l'inverse :
 * le conteneur de la caméra impose `aspectRatio: CAPTURE_ASPECT_RATIO` et le format de
 * capture est choisi en 4:3. Le mapping viseur → photo est donc une homothétie pure, et
 * ces rectangles sont directement exploitables en coordonnées photo (B2, D1/D2).
 *
 * Aucune dépendance React Native ici : c'est le contrat partagé avec les tickets suivants.
 */

/** Ratio largeur / hauteur du viseur, égal à celui du capteur en portrait (3:4). */
export const CAPTURE_ASPECT_RATIO = 3 / 4

/** Rectangle normalisé (0–1), valable dans le repère du viseur ET de la photo. */
export type NormalizedRect = { x: number; y: number; width: number; height: number }

/** Rectangle en pixels, dans le repère de la surface de rendu ou de la photo. */
export type PixelRect = { x: number; y: number; width: number; height: number }

/**
 * Cadre de composition : la trace doit le remplir.
 * 0.8 × 0.6 sur un 3:4 ⇒ carré exact (0.6 × 4/3 = 0.8).
 */
export const COMPOSITION_FRAME: NormalizedRect = { x: 0.1, y: 0.1, width: 0.8, height: 0.6 }

/**
 * Marge de sécurité intérieure au cadre : absorbe le redressement (D1), qui rogne les bords.
 * Exprimée en fraction du côté du cadre.
 */
export const SAFE_AREA_INSET_RATIO = 0.08

/** Bande où poser la règle millimétrée, sous la trace. */
export const SCALE_GUIDE: NormalizedRect = { x: 0.1, y: 0.72, width: 0.8, height: 0.1 }

/** Nombre de graduations dessinées sur le repère d'échelle (bornes incluses). */
export const SCALE_GUIDE_TICKS = 21

/** Rectangle utile : `COMPOSITION_FRAME` rogné de `SAFE_AREA_INSET_RATIO` sur chaque bord. */
export function safeAreaOf(frame: NormalizedRect = COMPOSITION_FRAME): NormalizedRect {
  const insetX = frame.width * SAFE_AREA_INSET_RATIO
  const insetY = frame.height * SAFE_AREA_INSET_RATIO
  return {
    x: frame.x + insetX,
    y: frame.y + insetY,
    width: frame.width - insetX * 2,
    height: frame.height - insetY * 2,
  }
}

/** Projette un rectangle normalisé sur une surface de `width` × `height` pixels. */
export function toPixels(rect: NormalizedRect, width: number, height: number): PixelRect {
  return {
    x: rect.x * width,
    y: rect.y * height,
    width: rect.width * width,
    height: rect.height * height,
  }
}
