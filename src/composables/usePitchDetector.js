import { ref } from 'vue'
import { useAudioContext } from './useAudioContext'
import { PitchDetector } from 'pitchy'

export function usePitchDetector() {
	const { audioContext, micStream, startAudio, analyser } = useAudioContext()

	const pitch = ref(null)
	const clarity = ref(0)
	const isReady = ref(false)
	const modelLoading = ref(false)

	let detector = null
	let analyserNode = null
	let dataArray = null
	let animationId = null

	const initializePitchDetector = async () => {
		modelLoading.value = true

		try {
			if (!audioContext.value || !micStream.value) {
				await startAudio()
			}

			if (!audioContext.value || !micStream.value) {
				console.error("Cannot start pitch detector: AudioContext or Stream missing.")
				modelLoading.value = false
				return
			}

			// Create analyser if not provided by useAudioContext
			analyserNode = analyser?.value || audioContext.value.createAnalyser()
			analyserNode.fftSize = 2048

			// Connect microphone to analyser
			const source = audioContext.value.createMediaStreamSource(micStream.value)
			source.connect(analyserNode)

			// Create Pitchy detector
			detector = PitchDetector.forFloat32Array(analyserNode.fftSize)
			dataArray = new Float32Array(detector.inputLength)

			isReady.value = true
			modelLoading.value = false

			console.log('Pitchy Pitch Detector Ready')

			// Start detection loop
			detectPitch()

		} catch (e) {
			console.error("Failed to initialize pitch detector", e)
			modelLoading.value = false
		}
	}

	const detectPitch = () => {
		if (!isReady.value || !analyserNode || !detector) return

		// Get time domain data
		analyserNode.getFloatTimeDomainData(dataArray)

		// Run pitch detection
		const [frequency, clarityValue] = detector.findPitch(dataArray, audioContext.value.sampleRate)

		// Only report if clarity is good enough (threshold: 0.8)
		if (clarityValue > 0.8 && frequency > 50 && frequency < 1000) {
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

	const stopDetection = () => {
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
