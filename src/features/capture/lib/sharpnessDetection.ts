import { ColorConversionCodes, DataTypes, type Mat, ObjectType, OpenCV } from 'react-native-fast-opencv'

import { COMPOSITION_FRAME, safeAreaOf } from '@/features/capture/lib/captureFrame'

/**
 * Netteté d'une image du viseur (L3-4), par variance du Laplacien.
 *
 * ## Ce que mesure le score
 *
 * La dispersion des variations locales d'intensité. Une image nette a des transitions
 * franches, donc une variance élevée ; une image floue les a toutes lissées. **Le nombre n'a
 * pas d'unité et ne vaut que pour la chaîne qui l'a produit** — recadrage, taille de
 * réduction, conversion. Changer l'un des trois oblige à recalibrer.
 *
 * ⚠️ Ce score décrit une image **du flux**, pas le JPEG versé au dossier : il guide le geste,
 * il ne qualifie pas la pièce. C'est pourquoi rien n'en part en base.
 */

/**
 * Côté de l'image réduite avant analyse, en pixels.
 *
 * **Ne pas descendre en dessous** : L3-5 lit la même image pour y chercher un test
 * millimétré. La zone utile couvre une cinquantaine de millimètres de scène ; à 640 pixels
 * de côté cela fait une douzaine de pixels par millimètre et les graduations restent
 * visibles, à 320 il n'en reste six et le motif disparaît.
 */
export const ANALYSIS_SIDE_PX = 640

/**
 * Seuil de netteté.
 *
 * ⚠️ **VALEUR PROVISOIRE — À CALIBRER SUR APPAREIL RÉEL.** Cinq scènes nettes et cinq scènes
 * floues devant l'objectif, relever les dix scores affichés par le voyant en développement,
 * écrire les valeurs mesurées ci-dessous et poser le seuil au milieu.
 *
 * Mesures : (à relever)
 * - nettes  : …
 * - floues  : …
 */
export const SHARP_ABOVE = 100

/**
 * Hystérésis, en fraction du seuil. Sans elle, une scène immobile pile sur le seuil fait
 * clignoter le voyant d'une image à l'autre : on entre dans « net » à `SHARP_ABOVE`, on n'en
 * sort qu'à 20 % en dessous.
 */
const HYSTERESIS_RATIO = 0.8

/**
 * Recadre la zone utile, redresse, réduit et convertit en niveaux de gris.
 *
 * L'image du flux arrive dans le repère du **capteur**, donc en paysage : c'est
 * `vision-camera-resize-plugin` qui fait le recadrage, la rotation, la réduction et la
 * conversion de format en un seul appel natif — on ne tourne jamais les pixels à la main.
 *
 * ⚠️ `crop` prend les coordonnées dans le repère de l'image **avant** rotation. Le viseur
 * étant contraint au 4:3 du capteur (`useTraceCamera`), les rectangles normalisés de
 * `captureFrame.ts` valent pour les deux repères, à l'échange près de la largeur et de la
 * hauteur qu'impose la rotation de 90°.
 */
export function cropRectFor(frameWidth: number, frameHeight: number) {
  'worklet'
  const zone = safeAreaOf(COMPOSITION_FRAME)
  // Le portrait du viseur correspond au paysage du capteur : x et y s'échangent.
  return {
    x: Math.round(zone.y * frameWidth),
    y: Math.round(zone.x * frameHeight),
    width: Math.round(zone.height * frameWidth),
    height: Math.round(zone.width * frameHeight),
  }
}

/**
 * Convertit l'image réduite en niveaux de gris.
 *
 * Séparé du calcul de netteté à dessein : **L3-5 lit la même image** pour y chercher un test
 * millimétré, et son ticket interdit de la relire une seconde fois. Le `Mat` rendu ici se
 * passe d'un calcul à l'autre dans le même passage.
 */
export function toGrayMat(bgr: Uint8Array, side: number): Mat {
  'worklet'
  const source = OpenCV.bufferToMat('uint8', side, side, 3, bgr)
  const gray = OpenCV.createObject(ObjectType.Mat, side, side, DataTypes.CV_8U)
  OpenCV.invoke('cvtColor', source, gray, ColorConversionCodes.COLOR_BGR2GRAY)
  return gray
}

/**
 * Variance du Laplacien de l'image en niveaux de gris.
 *
 * L'appelant reste responsable de `OpenCV.clearBuffers()` : les `Mat` s'empilent côté natif
 * dans une table que rien ne purge, et le viseur ralentit en une minute sans cet appel. Il
 * est fait une seule fois par image, après **tous** les calculs (L3-5 en ajoutera).
 */
export function laplacianVariance(gray: Mat, side: number): number {
  'worklet'
  const laplacian = OpenCV.createObject(ObjectType.Mat, side, side, DataTypes.CV_64F)
  OpenCV.invoke('Laplacian', gray, laplacian, DataTypes.CV_64F, 1, 1, 0, 4 /* BORDER_DEFAULT */)

  const mean = OpenCV.createObject(ObjectType.Mat, 1, 1, DataTypes.CV_64F)
  const stdDev = OpenCV.createObject(ObjectType.Mat, 1, 1, DataTypes.CV_64F)
  OpenCV.invoke('meanStdDev', laplacian, mean, stdDev)

  // `meanStdDev` rend l'écart-type ; la variance est son carré.
  const deviation = OpenCV.matToBuffer(stdDev, 'float64').buffer[0] ?? 0
  return deviation * deviation
}

/**
 * Verdict de netteté, avec hystérésis.
 *
 * @param previous Verdict précédent, qui tient dans la zone d'hystérésis.
 */
export function isSharp(score: number, previous: boolean): boolean {
  'worklet'
  if (score >= SHARP_ABOVE) return true
  if (score < SHARP_ABOVE * HYSTERESIS_RATIO) return false
  return previous
}
