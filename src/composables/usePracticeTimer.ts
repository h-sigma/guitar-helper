import { ref, computed, onUnmounted, type Ref, type ComputedRef } from 'vue'
import type { TimerMode, TimerOptions } from '../types'

interface PracticeTimerReturn {
  mode: Ref<TimerMode>
  limit: Ref<number>
  elapsed: Ref<number>
  displayTime: ComputedRef<number>
  formattedTime: ComputedRef<string>
  progress: ComputedRef<number>
  isRunning: Ref<boolean>
  isComplete: Ref<boolean>
  start: () => void
  pause: () => void
  reset: () => void
  configure: (newOptions: TimerOptions) => void
}

/**
 * Practice timer with multiple modes.
 */
export function usePracticeTimer(options: TimerOptions = {}): PracticeTimerReturn {
  const mode = ref<TimerMode>(options.mode ?? 'disabled')
  const limit = ref(options.limit ?? 0)

  const elapsed = ref(0) // seconds elapsed
  const isRunning = ref(false)
  const isComplete = ref(false)

  let intervalId: ReturnType<typeof setInterval> | null = null

  // Computed time remaining (for countdown) or elapsed (for countup)
  const displayTime = computed(() => {
    if (mode.value === 'countdown') {
      return Math.max(0, limit.value - elapsed.value)
    }
    return elapsed.value
  })

  // Format time as MM:SS
  const formattedTime = computed(() => {
    const time = displayTime.value
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  // Progress (0-1) for visual indicators
  const progress = computed(() => {
    if (!limit.value || mode.value === 'disabled') return 0
    return Math.min(1, elapsed.value / limit.value)
  })

  const start = (): void => {
    if (mode.value === 'disabled' || isRunning.value) return

    isRunning.value = true
    isComplete.value = false

    intervalId = setInterval(() => {
      elapsed.value++

      // Check for completion
      if (limit.value > 0 && elapsed.value >= limit.value) {
        isComplete.value = true
        pause()
      }
    }, 1000)
  }

  const pause = (): void => {
    isRunning.value = false
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  const reset = (): void => {
    pause()
    elapsed.value = 0
    isComplete.value = false
  }

  const configure = (newOptions: TimerOptions): void => {
    reset()
    if (newOptions.mode !== undefined) mode.value = newOptions.mode
    if (newOptions.limit !== undefined) limit.value = newOptions.limit
  }

  onUnmounted(() => {
    pause()
  })

  return {
    mode,
    limit,
    elapsed,
    displayTime,
    formattedTime,
    progress,
    isRunning,
    isComplete,
    start,
    pause,
    reset,
    configure
  }
}
