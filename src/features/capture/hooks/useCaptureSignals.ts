import { useState } from 'react'
import { OpenCV } from 'react-native-fast-opencv'
import { type ReadonlyFrameProcessor, runAtTargetFps, useFrameProcessor } from 'react-native-vision-camera'
import { useRunOnJS, useSharedValue } from 'react-native-worklets-core'
import { useResizePlugin } from 'vision-camera-resize-plugin'

import {
  ANALYSIS_SIDE_PX,
  cropRectFor,
  isSharp,
  laplacianVariance,
  toGrayMat,
} from '@/features/capture/lib/sharpnessDetection'

/**
 * Lecture des images du viseur (L3-4) : un seul frame processor, un seul passage par image.
 *
 * **C'est le point d'entrée unique de l'analyse d'image du viseur.** L3-5 (détection du test
 * millimétré) ajoutera son calcul dans ce même passage, sur le `Mat` en niveaux de gris déjà
 * produit — ne pas ouvrir un second frame processor, ne pas relire l'image.
 *
 * Le frame processor tourne dans un moteur JavaScript séparé — un *worklet* — où `setState`
 * n'existe pas : `useRunOnJS` rend une fonction appelable depuis le worklet qui repasse côté
 * React.
 */

/**
 * Images analysées par seconde. Le flux en fournit une trentaine ; on n'en regarde que trois.
 * Au-delà, le viseur saccade et l'appareil chauffe pour un affichage que l'œil ne suit pas.
 */
const ANALYSIS_FPS = 3

export type CaptureSignals = {
  /** Netteté de la dernière image analysée ; `null` avant la première. */
  isSharp: boolean | null
  /** Score brut, affiché en développement pour calibrer le seuil. */
  sharpnessScore: number | null
  /** À passer au `<Camera>` ; la caméra ouvre le flux d'analyse dès qu'il est posé. */
  frameProcessor: ReadonlyFrameProcessor
}

export function useCaptureSignals(): CaptureSignals {
  const { resize } = useResizePlugin()

  /**
   * Verdict précédent, gardé **dans le runtime worklet** : c'est lui qui porte l'hystérésis,
   * et le worklet ne peut pas lire l'état React. Une valeur partagée, pas un `useRef` : les
   * deux moteurs JavaScript ne partagent pas leur mémoire.
   */
  const wasSharp = useSharedValue(false)
  const [signals, setSignals] = useState<{ isSharp: boolean | null; score: number | null }>({
    isSharp: null,
    score: null,
  })

  /**
   * Retour du worklet vers React. On ne redessine que si le verdict change, ou si le score
   * arrondi change — ce dernier n'est lu qu'en développement, pour la calibration.
   */
  const publish = useRunOnJS((sharp: boolean, score: number) => {
    setSignals((previous) => {
      const rounded = Math.round(score)
      if (previous.isSharp === sharp && previous.score === rounded) return previous
      return { isSharp: sharp, score: rounded }
    })
  }, [])

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet'
      runAtTargetFps(ANALYSIS_FPS, () => {
        'worklet'
        // Recadrage de la zone utile, redressement, réduction et conversion en un seul appel
        // natif — on ne tourne jamais les pixels à la main.
        //
        // ⚠️ **`rotation` est à confirmer sur appareil, iOS ET Android** (`frame.orientation`
        // à l'appui) : le sens de rotation du flux dépend de la plateforme, et une valeur
        // fausse ferait analyser une zone décalée sans que rien ne plante. Le repère importe
        // peu pour la netteté — le Laplacien est isotrope, une zone tournée donne le même
        // score — mais L3-5 y sera sensible : sa détection de graduations cherche une
        // direction dominante. Trancher ici avant de commencer L3-5.
        //
        // La zone est carrée (`COMPOSITION_FRAME` vaut 0,8 × 0,6 sur un 3:4, soit un carré
        // exact), donc la réduire à un carré ne déforme rien.
        const resized = resize(frame, {
          crop: cropRectFor(frame.width, frame.height),
          scale: { width: ANALYSIS_SIDE_PX, height: ANALYSIS_SIDE_PX },
          rotation: '90deg',
          pixelFormat: 'bgr',
          dataType: 'uint8',
        })

        const gray = toGrayMat(resized, ANALYSIS_SIDE_PX)
        const score = laplacianVariance(gray, ANALYSIS_SIDE_PX)

        // ⚠️ Une seule purge, après tous les calculs de ce passage — L3-5 en ajoutera avant
        // cette ligne. Sans elle, les `Mat` s'empilent côté natif et le viseur ralentit en
        // moins d'une minute.
        OpenCV.clearBuffers()

        const sharp = isSharp(score, wasSharp.value)
        wasSharp.value = sharp
        publish(sharp, score)
      })
    },
    [resize, publish, wasSharp]
  )

  return { isSharp: signals.isSharp, sharpnessScore: signals.score, frameProcessor }
}
