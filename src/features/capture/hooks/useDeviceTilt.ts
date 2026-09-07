import { DeviceMotion } from 'expo-sensors'
import { useEffect, useState } from 'react'

/**
 * Aplomb de l'appareil pendant la visée (L3-3).
 *
 * Ce hook vit **à côté** de `useTraceCamera`, qui reste l'un des deux seuls fichiers à
 * dépendre de la bibliothèque caméra : un capteur de mouvement n'a rien à y faire.
 *
 * ## Ce qu'on mesure, et ce que ça ne dit pas
 *
 * L'angle entre l'**axe optique** (la direction dans laquelle l'objectif regarde) et la
 * verticale du lieu. Les capteurs le donnent sans calcul de pose : c'est l'angle entre le
 * vecteur de gravité et l'axe de l'objectif.
 *
 * Deux poses sont « d'aplomb », et l'application reconnaît seule laquelle s'applique :
 * - **0°** — objectif droit vers le bas, capteur parallèle à une surface **horizontale** ;
 * - **90°** — objectif à l'horizontale, capteur parallèle à une surface **verticale**
 *   (poignée de porte, vitre, portière).
 *
 * Cet angle ne dit **pas** de quel côté on regarde : face à un mur, il établit que le
 * téléphone n'est ni plongeant ni en contre-plongée, pas qu'on est bien de face plutôt que
 * de trois quarts — il faudrait connaître l'orientation du mur. La rotation autour de l'axe
 * optique, elle, fait tourner l'image sans la déformer : on l'ignore.
 */

/** En deçà de cet écart (en degrés), l'appareil est déclaré d'aplomb. */
export const ALIGNED_BELOW_DEG = 5

/**
 * Au-delà de cet écart, il ne l'est plus. L'écart avec le seuil d'entrée est l'hystérésis :
 * sans elle le verdict clignote dès qu'on tient l'appareil pile sur la limite.
 */
export const MISALIGNED_ABOVE_DEG = 6

/**
 * Période d'échantillonnage, en ms. Le capteur sait émettre à 100 Hz ; à cette cadence le
 * viseur se redessinerait en continu et l'appareil chaufferait pour un affichage que l'œil
 * ne suit pas.
 */
const SAMPLE_INTERVAL_MS = 100

/**
 * Lissage exponentiel du vecteur de gravité. `accelerationIncludingGravity` mélange la
 * gravité et l'accélération du geste : à bout de bras, la valeur brute saute de plusieurs
 * degrés d'une mesure à l'autre. Plus la valeur est basse, plus c'est lisse et lent.
 *
 * ⚠️ Piste de repli si ça reste trop nerveux en main : `DeviceMotion.rotation`
 * (alpha/beta/gamma) est déjà filtrée côté système. À arbitrer sur appareil réel.
 */
const SMOOTHING = 0.2

export type DeviceTilt = {
  /** Écart à la pose d'aplomb la plus proche, en degrés ; `null` avant la 1ʳᵉ mesure. */
  deviationDeg: number | null
  /** `true` quand l'appareil est d'aplomb. Faux tant qu'on n'a pas mesuré. */
  isAligned: boolean
}

type Vector = { x: number; y: number; z: number }

/**
 * Écart à la pose d'aplomb la plus proche, à partir du vecteur de gravité mesuré dans le
 * repère de l'appareil.
 *
 * L'application est verrouillée en portrait : X va de gauche à droite, Y de bas en haut, Z
 * perpendiculaire à l'écran vers l'avant — l'axe optique de la caméra arrière est donc −Z.
 * L'angle entre l'axe Z et la gravité vaut 0° à plat et 90° à la verticale : c'est exactement
 * la graduation qu'on cherche.
 *
 * On prend la **valeur absolue** de la composante Z, ce qui rend le calcul indépendant du
 * signe que la plateforme donne à `accelerationIncludingGravity` — la convention diffère
 * selon les systèmes, et s'en remettre à elle imposerait de vérifier sur chaque appareil.
 * Effet de bord assumé : écran vers le sol, objectif vers le plafond, on lit aussi 0°. C'est
 * une pose où l'on ne voit pas son écran, donc où l'on ne photographie pas.
 */
export function deviationFromPlumb(gravity: Vector): number {
  const magnitude = Math.hypot(gravity.x, gravity.y, gravity.z)
  if (magnitude === 0) return 90

  // Bornage : l'arrondi flottant peut sortir très légèrement de [-1, 1] et rendre `NaN`.
  const cosine = Math.min(1, Math.abs(gravity.z) / magnitude)
  const angleFromFlat = (Math.acos(cosine) * 180) / Math.PI

  // Les deux références d'aplomb sont à 0° et 90° : on retient la plus proche.
  return Math.min(angleFromFlat, Math.abs(90 - angleFromFlat))
}

export function useDeviceTilt(isActive: boolean): DeviceTilt {
  const [tilt, setTilt] = useState<DeviceTilt>({ deviationDeg: null, isAligned: false })

  useEffect(() => {
    if (!isActive) {
      // Hors visée, on coupe le capteur et on oublie la dernière mesure : à la réouverture,
      // l'écran ne doit pas afficher un aplomb d'il y a dix minutes.
      setTilt({ deviationDeg: null, isAligned: false })
      return
    }

    let subscription: { remove: () => void } | null = null
    let cancelled = false
    let smoothed: Vector | null = null
    // Dernier état publié, pour ne toucher à React que quand l'affichage change vraiment.
    let lastDegrees: number | null = null
    let lastAligned = false

    const start = async () => {
      // Un appareil sans centrale inertielle (rare, mais un émulateur en est un cas courant)
      // ne doit pas faire échouer l'écran : on reste simplement sans verdict.
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
        // Hystérésis : on n'entre dans l'aplomb qu'au seuil bas, on n'en sort qu'au seuil
        // haut ; entre les deux, le verdict précédent tient.
        const aligned = deviation < ALIGNED_BELOW_DEG ? true : deviation > MISALIGNED_ABOVE_DEG ? false : lastAligned

        // L'angle est affiché au degré près : inutile de redessiner pour une décimale.
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
