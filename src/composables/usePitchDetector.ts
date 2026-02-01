import { ref, type Ref } from 'vue'
import { useAudioContext } from './useAudioContext'
import { PitchDetector } from 'pitchy'
import type { PitchDetectorOptions } from '../types'

interface PitchDetectorReturn {
  pitch: Ref<number | null>
  clarity: Ref<number>
  isReady: Ref<boolean>
  modelLoading: Ref<boolean>
  start: () => Promise<void>
  stop: () => void
}

/**
 * Real-time pitch detection using Pitchy (McLeod Pitch Method).
 */
export function usePitchDetector(options: PitchDetectorOptions = {}): PitchDetectorReturn {
  const clarityThreshold = options.clarityThreshold ?? 0.8
  const minFreq = options.minFreq ?? 50
  const maxFreq = options.maxFreq ?? 1000

  const { audioContext, micStream, startAudio, analyser } = useAudioContext()

  const pitch = ref<number | null>(null)
  const clarity = ref(0)
  const isReady = ref(false)
  const modelLoading = ref(false)

  let detector: ReturnType<typeof PitchDetector.forFloat32Array> | null = null
  let analyserNode: AnalyserNode | null = null
  let dataArray: Float32Array | null = null
  let animationId: number | null = null

  const initializePitchDetector = async (): Promise<void> => {
    modelLoading.value = true

    try {
      if (!audioContext.value || !micStream.value) {
        await startAudio()
      }

      if (!audioContext.value || !micStream.value) {
        modelLoading.value = false
        return
      }

      // Create analyser if not provided by useAudioContext
      analyserNode = analyser?.value ?? audioContext.value.createAnalyser()
      analyserNode.fftSize = 2048

      // Connect microphone to analyser
      const source = audioContext.value.createMediaStreamSource(micStream.value)
      source.connect(analyserNode)

      // Create Pitchy detector
      detector = PitchDetector.forFloat32Array(analyserNode.fftSize)
      dataArray = new Float32Array(detector.inputLength)

      isReady.value = true
      modelLoading.value = false

      // Start detection loop
      detectPitch()
    } catch {
      modelLoading.value = false
    }
  }

  const detectPitch = (): void => {
    if (!isReady.value || !analyserNode || !detector || !dataArray) return

    // Get time domain data
    analyserNode.getFloatTimeDomainData(dataArray)

    // Run pitch detection
    const [frequency, clarityValue] = detector.findPitch(dataArray, audioContext.value!.sampleRate)

    // Only report if clarity is good enough
    if (clarityValue > clarityThreshold && frequency > minFreq && frequency < maxFreq) {
      pitch.value = frequency
      clarity.value = clarityValue
    } else {
      pitch.value = null
      clarity.value = clarityValue
    }

    // Continue loop
    if (isReady.value) {
      animationId = requestAnimationFrame(detectPitch)
    }
  }

  const stopDetection = (): void => {
    isReady.value = false
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }

  return {
    pitch,
    clarity,
    isReady,
    modelLoading,
    start: initializePitchDetector,
    stop: stopDetection
  }
}
