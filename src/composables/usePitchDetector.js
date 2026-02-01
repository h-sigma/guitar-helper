import { ref } from 'vue'
import { useAudioContext } from './useAudioContext'
import ml5 from 'ml5'

export function usePitchDetector() {
	const { audioContext, micStream, startAudio } = useAudioContext()

	const pitch = ref(null) // Detected frequency in Hz
	const confidence = ref(0)
	const isReady = ref(false)
	const modelLoading = ref(false)

	let pitchDetector = null

	const initializePitchDetector = async () => {
		if (!audioContext.value || !micStream.value) {
			await startAudio()
		}

		if (!audioContext.value || !micStream.value) {
			console.error("Cannot start pitch detector: AudioContext or Stream missing.")
			return
		}

		modelLoading.value = true

		// MODEL_URL is optional, defaults to a hosted model. 
		// We can specify a local path if we downloaded the model, but using default for now.
		const MODEL_URL = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';

		try {
			pitchDetector = await ml5.pitchDetection(MODEL_URL, audioContext.value, micStream.value, modelLoaded)
		} catch (e) {
			console.error("Failed to load ml5", e)
			modelLoading.value = false
		}
	}

	const modelLoaded = () => {
		console.log('Pitch Model Loaded')
		isReady.value = true
		modelLoading.value = false
		getPitch()
	}

	const getPitch = () => {
		if (!pitchDetector) return

		pitchDetector.getPitch((err, frequency) => {
			if (err) {
				console.error(err)
			}

			if (frequency) {
				pitch.value = frequency
				// Assuming high confidence if frequency is detected, standard ml5 behavior
				confidence.value = 1
			} else {
				pitch.value = null
				confidence.value = 0
			}

			// Recursively call for real-time detection
			if (isReady.value) {
				requestAnimationFrame(getPitch) // Or use pitchDetector.getPitch again directly? 
				// ML5 documentation says getPitch is continuous if we call it again in the callback.
				// Actually, for ML5 0.x, it's often a recursive call. 
				// For 'pitchDetection', the example usually calls it recursively.
				getPitch()
			}
		})
	}

	const stopDetection = () => {
		isReady.value = false
		// ML5 doesn't have a clear "stop" method for some extractors, 
		// but stopping the recursion handles it.
	}

	return {
		pitch,
		confidence,
		isReady,
		modelLoading,
		start: initializePitchDetector,
		stop: stopDetection
	}
}
