import { ref, type Ref } from 'vue'

interface AudioContextReturn {
  audioContext: Ref<AudioContext | null>
  analyser: Ref<AnalyserNode | null>
  micStream: Ref<MediaStream | null>
  startAudio: () => Promise<void>
  stopAudio: () => void
}

export function useAudioContext(): AudioContextReturn {
  const audioContext = ref<AudioContext | null>(null)
  const analyser = ref<AnalyserNode | null>(null)
  const micStream = ref<MediaStream | null>(null)

  const startAudio = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStream.value = stream

      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      audioContext.value = new AudioContextClass()

      analyser.value = audioContext.value.createAnalyser()
      analyser.value.fftSize = 2048

      const source = audioContext.value.createMediaStreamSource(stream)
      source.connect(analyser.value)
    } catch {
      // User denied permission or error occurred
    }
  }

  const stopAudio = (): void => {
    if (micStream.value) {
      micStream.value.getTracks().forEach(track => track.stop())
      micStream.value = null
    }
    if (audioContext.value) {
      audioContext.value.close()
      audioContext.value = null
    }
    analyser.value = null
  }

  return {
    audioContext,
    analyser,
    micStream,
    startAudio,
    stopAudio
  }
}
