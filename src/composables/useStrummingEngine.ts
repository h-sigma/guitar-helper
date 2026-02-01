import { ref, type Ref } from 'vue'

interface StrummingEngineOptions {
  bpm?: number
  pattern?: boolean[]
}

interface StrummingEngineReturn {
  bpm: Ref<number>
  currentBeat: Ref<number>
  isPlaying: Ref<boolean>
  pattern: Ref<boolean[]>
  start: () => void
  stop: () => void
  setBpm: (newBpm: number) => void
  setPattern: (newPattern: boolean[]) => void
}

/**
 * Strumming engine for metronome and pattern practice.
 */
export function useStrummingEngine(options: StrummingEngineOptions = {}): StrummingEngineReturn {
  const bpm = ref(options.bpm ?? 80)
  const pattern = ref<boolean[]>(options.pattern ?? [true, true, true, true])
  const currentBeat = ref(0)
  const isPlaying = ref(false)

  let intervalId: ReturnType<typeof setInterval> | null = null

  const start = (): void => {
    if (isPlaying.value) return

    isPlaying.value = true
    currentBeat.value = 0

    const beatDuration = (60 / bpm.value) * 1000

    intervalId = setInterval(() => {
      currentBeat.value = (currentBeat.value + 1) % pattern.value.length
    }, beatDuration)
  }

  const stop = (): void => {
    isPlaying.value = false
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    currentBeat.value = 0
  }

  const setBpm = (newBpm: number): void => {
    bpm.value = Math.max(40, Math.min(200, newBpm))
    if (isPlaying.value) {
      stop()
      start()
    }
  }

  const setPattern = (newPattern: boolean[]): void => {
    pattern.value = newPattern
    currentBeat.value = 0
  }

  return {
    bpm,
    currentBeat,
    isPlaying,
    pattern,
    start,
    stop,
    setBpm,
    setPattern
  }
}
