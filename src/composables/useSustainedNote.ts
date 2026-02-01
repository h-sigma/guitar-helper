import { ref, unref, type Ref, type MaybeRef } from 'vue'
import type { SustainedNoteOptions } from '../types'

interface SustainedNoteReturn {
  confirmedNote: Ref<string | null>
  currentLeader: Ref<string | null>
  leaderProgress: Ref<number>
  onDetection: (noteName: string | null, targetNote?: MaybeRef<string | null>) => void
  reset: () => void
  stop: () => void
}

/**
 * Target-aware sustained note detection using callback.
 * Tracks progress for a target note. Other notes reset progress.
 * Can also run in "any note" mode for tuner (no target filtering).
 */
export function useSustainedNote(options: SustainedNoteOptions = {}): SustainedNoteReturn {
  const confirmDuration = options.confirmDuration ?? 250
  const maxGap = options.maxGap ?? 200
  const cooldownMs = options.cooldownMs ?? 300

  const confirmedNote = ref<string | null>(null)
  const currentLeader = ref<string | null>(null)
  const leaderProgress = ref(0)

  // Time tracking
  let trackingNote: string | null = null
  let startTime: number | null = null
  let lastSeenTime: number | null = null
  let lastConfirmTime = 0

  const reset = (): void => {
    confirmedNote.value = null
    currentLeader.value = null
    leaderProgress.value = 0
    trackingNote = null
    startTime = null
    lastSeenTime = null
  }

  /**
   * Called on each pitch detection
   */
  const onDetection = (noteName: string | null, targetNote: MaybeRef<string | null> = null): void => {
    const now = Date.now()
    const target = unref(targetNote)

    // Check if we're in cooldown after confirming
    if (now - lastConfirmTime < cooldownMs) {
      return
    }

    // Always update what note is currently detected
    currentLeader.value = noteName

    // If no target, use "any note" mode (for tuner)
    const effectiveTarget = target ?? noteName

    if (!effectiveTarget) {
      leaderProgress.value = 0
      return
    }

    if (noteName === effectiveTarget) {
      // Detected the target note (or any note in tuner mode)
      if (trackingNote !== noteName) {
        // Started tracking a new note
        trackingNote = noteName
        startTime = now
      }

      lastSeenTime = now
      const elapsed = now - startTime!
      leaderProgress.value = Math.min(1, elapsed / confirmDuration)

      // Check if we've held long enough
      if (elapsed >= confirmDuration) {
        confirmedNote.value = noteName
        lastConfirmTime = now
        trackingNote = null
        startTime = null
        lastSeenTime = null
        leaderProgress.value = 0
      }
    } else if (noteName && target && noteName !== target) {
      // Wrong note detected (only in target mode) - reset progress
      if (startTime !== null) {
        trackingNote = null
        startTime = null
        lastSeenTime = null
        leaderProgress.value = 0
      }
    } else {
      // Null detection - check if gap is too long
      if (startTime !== null && lastSeenTime) {
        const gap = now - lastSeenTime
        if (gap > maxGap) {
          trackingNote = null
          startTime = null
          lastSeenTime = null
          leaderProgress.value = 0
        }
      }
    }
  }

  const stop = (): void => {
    reset()
  }

  return {
    confirmedNote,
    currentLeader,
    leaderProgress,
    onDetection,
    reset,
    stop
  }
}
