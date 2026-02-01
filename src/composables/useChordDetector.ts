import { ref, computed, unref, type Ref, type ComputedRef, type MaybeRef } from 'vue'
import type { ChordDetectionMode } from '../types'

interface ChordDetectorOptions {
  mode?: ChordDetectionMode
  simultaneousWindow?: number
}

interface NoteDetectionResult {
  matched: boolean
  isComplete: boolean
}

interface ChordDetectorReturn {
  mode: Ref<ChordDetectionMode>
  targetNotes: Ref<string[]>
  playedNotes: Ref<Set<string>>
  remainingNotes: ComputedRef<string[]>
  isComplete: ComputedRef<boolean>
  progress: ComputedRef<number>
  setTarget: (notes: MaybeRef<string>[]) => void
  resetPlayed: () => void
  onNoteDetected: (noteName: string | null) => NoteDetectionResult
  reset: () => void
}

interface RecentDetection {
  note: string
  time: number
}

/**
 * Chord detection - tracks which notes of a chord have been played.
 */
export function useChordDetector(options: ChordDetectorOptions = {}): ChordDetectorReturn {
  const mode = ref<ChordDetectionMode>(options.mode ?? 'sequential')
  const simultaneousWindow = options.simultaneousWindow ?? 300

  // Target chord notes (pitch classes)
  const targetNotes = ref<string[]>([])

  // Which notes have been played
  const playedNotes = ref<Set<string>>(new Set())

  // For simultaneous mode: recent detections with timestamps
  let recentDetections: RecentDetection[] = []

  const remainingNotes = computed(() => {
    return targetNotes.value.filter(note => !playedNotes.value.has(note))
  })

  const isComplete = computed(() => {
    return targetNotes.value.length > 0 && remainingNotes.value.length === 0
  })

  const progress = computed(() => {
    if (targetNotes.value.length === 0) return 0
    return playedNotes.value.size / targetNotes.value.length
  })

  // Set the target chord
  const setTarget = (notes: MaybeRef<string>[]): void => {
    targetNotes.value = notes.map(n => unref(n))
    resetPlayed()
  }

  // Reset played notes
  const resetPlayed = (): void => {
    playedNotes.value = new Set()
    recentDetections = []
  }

  // Process a note detection
  const onNoteDetected = (noteName: string | null): NoteDetectionResult => {
    if (!noteName || isComplete.value) return { matched: false, isComplete: false }

    // Check if this note is in our target
    const isTarget = targetNotes.value.includes(noteName)

    if (!isTarget) {
      return { matched: false, isComplete: false }
    }

    if (mode.value === 'sequential') {
      // Sequential: just mark the note as played
      playedNotes.value.add(noteName)
      return { matched: true, isComplete: isComplete.value }
    } else {
      // Simultaneous: track recent detections within window
      const now = Date.now()

      // Add this detection
      recentDetections.push({ note: noteName, time: now })

      // Remove old detections outside window
      recentDetections = recentDetections.filter(d => now - d.time < simultaneousWindow)

      // Check if we have all target notes in the window
      const notesInWindow = new Set(recentDetections.map(d => d.note))
      const allPresent = targetNotes.value.every(n => notesInWindow.has(n))

      if (allPresent) {
        // All notes detected within window - mark all as played
        targetNotes.value.forEach(n => playedNotes.value.add(n))
        return { matched: true, isComplete: true }
      }

      return { matched: true, isComplete: false }
    }
  }

  // Full reset
  const reset = (): void => {
    targetNotes.value = []
    resetPlayed()
  }

  return {
    mode,
    targetNotes,
    playedNotes,
    remainingNotes,
    isComplete,
    progress,
    setTarget,
    resetPlayed,
    onNoteDetected,
    reset
  }
}
