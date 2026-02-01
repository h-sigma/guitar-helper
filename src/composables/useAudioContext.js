import { ref, onUnmounted } from 'vue'

const audioContext = ref(null)
const micStream = ref(null)
const analyser = ref(null)
const sourceNode = ref(null)
const isAudioStarted = ref(false)

export function useAudioContext() {
	const error = ref(null)

	const startAudio = async () => {
		if (isAudioStarted.value) return

		try {
			// Create AudioContext
			audioContext.value = new (window.AudioContext || window.webkitAudioContext)()

			// Request Mic Access
			micStream.value = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: false,
					autoGainControl: false,
					noiseSuppression: false
				}
			})

			// Setup Analyser
			analyser.value = audioContext.value.createAnalyser()
			analyser.value.fftSize = 2048

			sourceNode.value = audioContext.value.createMediaStreamSource(micStream.value)
			sourceNode.value.connect(analyser.value)

			isAudioStarted.value = true
		} catch (err) {
			console.error('Error starting audio:', err)
			error.value = 'Microphone access denied or not available.'
		}
	}

	const stopAudio = () => {
		if (micStream.value) {
			micStream.value.getTracks().forEach(track => track.stop())
			micStream.value = null
		}
		if (sourceNode.value) {
			sourceNode.value.disconnect()
			sourceNode.value = null
		}
		if (audioContext.value) {
			audioContext.value.close()
			audioContext.value = null
		}
		analyser.value = null
		isAudioStarted.value = false
	}

	return {
		audioContext,
		micStream,
		analyser,
		isAudioStarted,
		startAudio,
		stopAudio,
		error
	}
}
