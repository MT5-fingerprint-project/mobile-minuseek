/**
 * Seuils de résolution de la capture guidée.
 *
 * Cible : 500 dpi sur la scène utile, soit 500 / 25,4 ≈ 19,69 px/mm. Une scène de ~60 mm
 * de large (trace + règle millimétrée) occupant 80 % du petit côté demande donc
 * 60 × 19,69 ≈ 1 181 px utiles, soit un petit côté ≈ 1 181 / 0,8 ≈ 1 476 px → arrondi à 1536.
 *
 * Le seuil recommandé (2448 px, ≈ 8 Mpx en 4:3) laisse la marge nécessaire au crop et au
 * redressement de D1 (~830 dpi).
 *
 * Ces seuils ne s'appliquent **qu'à la capture custom** : le chemin galerie reste inchangé.
 */

export const MIN_SHORT_SIDE_PX = 1536
export const RECOMMENDED_SHORT_SIDE_PX = 2448
export const MIN_TOTAL_PIXELS = 3_000_000

export type ResolutionVerdict = 'ok' | 'below-recommended' | 'rejected'

export type ResolutionCheck = {
  verdict: ResolutionVerdict
  shortSide: number
  megapixels: number
  /** Message prêt à afficher (alerte de refus ou bandeau d'avertissement), `null` si `ok`. */
  message: string | null
}

function formatMegapixels(megapixels: number): string {
  return megapixels.toFixed(1).replace('.', ',')
}

export function evaluateCaptureResolution(width: number, height: number): ResolutionCheck {
  const shortSide = Math.min(width, height)
  const totalPixels = width * height
  const megapixels = totalPixels / 1_000_000

  if (shortSide < MIN_SHORT_SIDE_PX || totalPixels < MIN_TOTAL_PIXELS) {
    return {
      verdict: 'rejected',
      shortSide,
      megapixels,
      message:
        `La photo fait ${width} × ${height} px (${formatMegapixels(megapixels)} Mpx). ` +
        `Il en faut au moins ${MIN_SHORT_SIDE_PX} px sur le petit côté pour une comparaison ` +
        `au niveau de détail requis. Rapprochez-vous de la trace et reprenez la photo.`,
    }
  }

  if (shortSide < RECOMMENDED_SHORT_SIDE_PX) {
    return {
      verdict: 'below-recommended',
      shortSide,
      megapixels,
      message:
        `Résolution en dessous de la valeur recommandée (${formatMegapixels(megapixels)} Mpx). ` +
        `La comparaison sera possible mais moins fiable.`,
    }
  }

  return { verdict: 'ok', shortSide, megapixels, message: null }
}
