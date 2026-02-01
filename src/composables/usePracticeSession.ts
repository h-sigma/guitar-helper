import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { Chord } from '../types'

interface PracticeSessionOptions {
  chords?: Chord[]
}

interface CompleteNoteResult {
  chordComplete: boolean
  looped: boolean
}

interface PracticeSessionReturn {
  // State
  chords: Ref<Chord[]>
  selectedIndices: Ref<number[]>
  queueIndex: Ref<number>
  noteIndex: Ref<number>
  completionCounts: Ref<Record<number, number>>
  totalCompletions: ComputedRef<number>

  // Computed
  activeChordIndex: ComputedRef<number>
  activeChord: ComputedRef<Chord | null>
  targetNote: ComputedRef<string | null>
  totalNotes: ComputedRef<number>
  chordProgress: ComputedRef<number>

  // Methods
  toggleChord: (idx: number) => void
  setSelectedChords: (indices: number[]) => void
  completeNote: () => CompleteNoteResult
  completeChord: () => CompleteNoteResult
  advanceChord: () => CompleteNoteResult
  goToChord: (queuePosition: number) => void
  resetProgress: () => void
  reset: () => void
  getCompletionCount: (chordIdx: number) => number
}

/**
 * Manages a practice session with chord queue, progress tracking, and completion counts.
 */
export function usePracticeSession(options: PracticeSessionOptions = {}): PracticeSessionReturn {
  // Available chords (passed in or empty)
  const chords = ref<Chord[]>(options.chords ?? [])

  // Selected chord indices for practice
  const selectedIndices = ref<number[]>([])

  // Current position in the queue
  const queueIndex = ref(0)

  // Current note index within the active chord
  const noteIndex = ref(0)

  // Completion count per chord (indexed by chord index)
  const completionCounts = ref<Record<number, number>>({})

  // Total completions across all chords
  const totalCompletions = computed(() => {
    return Object.values(completionCounts.value).reduce((sum, count) => sum + count, 0)
  })

  // Current chord in queue (by library index)
  const activeChordIndex = computed(() => {
    if (selectedIndices.value.length === 0) return -1
    return selectedIndices.value[queueIndex.value]
  })

  // Current chord object
  const activeChord = computed(() => {
    if (activeChordIndex.value < 0) return null
    return chords.value[activeChordIndex.value]
  })

  // Current target note (full name with octave)
  const targetNote = computed(() => {
    if (!activeChord.value) return null
    return activeChord.value.notes[noteIndex.value] ?? null
  })

  // Number of notes in active chord
  const totalNotes = computed(() => {
    if (!activeChord.value) return 0
    return activeChord.value.notes.length
  })

  // Progress through current chord (0-1)
  const chordProgress = computed(() => {
    if (totalNotes.value === 0) return 0
    return noteIndex.value / totalNotes.value
  })

  // Toggle chord selection
  const toggleChord = (idx: number): void => {
    const pos = selectedIndices.value.indexOf(idx)
    if (pos >= 0) {
      selectedIndices.value.splice(pos, 1)
    } else {
      selectedIndices.value.push(idx)
    }
  }

  // Select specific chords
  const setSelectedChords = (indices: number[]): void => {
    selectedIndices.value = [...indices]
    resetProgress()
  }

  // Mark current note as complete, advance to next
  const completeNote = (): CompleteNoteResult => {
    noteIndex.value++

    if (noteIndex.value >= totalNotes.value) {
      // Chord complete!
      const chordIdx = activeChordIndex.value
      completionCounts.value[chordIdx] = (completionCounts.value[chordIdx] ?? 0) + 1

      // Move to next chord
      return advanceChord()
    }

    return { chordComplete: false, looped: false }
  }

  // Mark entire chord as complete (for strum mode), advance to next
  const completeChord = (): CompleteNoteResult => {
    const chordIdx = activeChordIndex.value
    completionCounts.value[chordIdx] = (completionCounts.value[chordIdx] ?? 0) + 1
    return advanceChord()
  }

  // Advance to next chord in queue
  const advanceChord = (): CompleteNoteResult => {
    noteIndex.value = 0
    queueIndex.value++

    const looped = queueIndex.value >= selectedIndices.value.length
    if (looped) {
      queueIndex.value = 0
    }

    return { chordComplete: true, looped }
  }

  // Skip to specific chord in queue
  const goToChord = (queuePosition: number): void => {
    if (queuePosition >= 0 && queuePosition < selectedIndices.value.length) {
      queueIndex.value = queuePosition
      noteIndex.value = 0
    }
  }

  // Reset progress (but keep selection)
  const resetProgress = (): void => {
    queueIndex.value = 0
    noteIndex.value = 0
    completionCounts.value = {}
  }

  // Full reset
  const reset = (): void => {
    selectedIndices.value = []
    resetProgress()
  }

  // Get completion count for a chord
  const getCompletionCount = (chordIdx: number): number => {
    return completionCounts.value[chordIdx] ?? 0
  }

  return {
    // State
    chords,
    selectedIndices,
    queueIndex,
    noteIndex,
    completionCounts,
    totalCompletions,

    // Computed
    activeChordIndex,
    activeChord,
    targetNote,
    totalNotes,
    chordProgress,

    // Methods
    toggleChord,
    setSelectedChords,
    completeNote,
    completeChord,
    advanceChord,
    goToChord,
    resetProgress,
    reset,
    getCompletionCount
  }
}
