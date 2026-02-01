<template>
  <div class="min-h-screen p-6 max-w-xl mx-auto">
    <header class="mb-8">
      <button
        class="flex items-center gap-2 text-text-dim hover:text-text transition-colors"
        @click="router.push('/')"
      >
        <ArrowLeft :size="20" /> Back
      </button>
    </header>

    <main>
      <!-- CONFIG VIEW -->
      <div
        v-if="!isPracticing"
        class="space-y-8"
      >
        <div class="text-center">
          <h1 class="text-3xl font-bold mb-2">Perfect Chord Practice</h1>
          <p class="text-text-dim">Master your chord transitions with precision.</p>
        </div>

        <!-- Chord Selection -->
        <section>
          <h2 class="text-lg font-semibold mb-4">Select Chords</h2>
          <div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
            <ChordCard
              v-for="(chord, idx) in CHORD_LIBRARY"
              :key="idx"
              :chord="chord"
              :is-selected="session.selectedIndices.value.includes(idx)"
              @click="session.toggleChord(idx)"
            />
          </div>
        </section>

        <!-- Timer Settings -->
        <section>
          <h2 class="text-lg font-semibold mb-4">Timer</h2>
          <div class="flex justify-between items-center py-3 border-b border-border">
            <label>Enable Timer</label>
            <button 
              class="px-4 py-2 rounded-full border transition-all"
              :class="timerEnabled 
                ? 'bg-accent text-white border-accent' 
                : 'bg-surface border-border'"
              @click="timerEnabled = !timerEnabled"
            >
              {{ timerEnabled ? 'On' : 'Off' }}
            </button>
          </div>
          <div
            v-if="timerEnabled"
            class="mt-4 p-4 bg-surface rounded-lg space-y-4"
          >
            <div class="flex justify-between items-center">
              <label>Mode</label>
              <select 
                v-model="timerMode"
                class="px-3 py-2 border border-border rounded-lg bg-bg"
              >
                <option value="countdown">Countdown</option>
                <option value="countup">Count Up</option>
              </select>
            </div>
            <div class="flex justify-between items-center">
              <label>Duration (minutes)</label>
              <input
                v-model.number="timerMinutes"
                type="number"
                min="1"
                max="60"
                class="w-20 px-3 py-2 border border-border rounded-lg bg-bg text-center"
              >
            </div>
          </div>
        </section>

        <div class="flex justify-center pt-4">
          <button 
            class="btn-accent text-lg py-4 px-8 rounded-xl" 
            :disabled="session.selectedIndices.value.length === 0" 
            :class="{ 'opacity-50 cursor-not-allowed': session.selectedIndices.value.length === 0 }"
            @click="startPractice"
          >
            <Play :size="20" /> Start Practice
          </button>
        </div>
      </div>

      <!-- PRACTICE VIEW -->
      <div
        v-else
        class="flex flex-col items-center gap-6"
      >
        <!-- Timer -->
        <PracticeTimer
          v-if="timerEnabled"
          :mode="timerMode"
          :limit="timerMinutes * 60"
          :formatted-time="timer.formattedTime.value"
          :progress="timer.progress.value"
          :is-running="timer.isRunning.value"
          :is-complete="timer.isComplete.value"
          :show-controls="false"
        />

        <!-- Chord Carousel -->
        <ChordCarousel
          :chords="CHORD_LIBRARY"
          :chord-indices="session.selectedIndices.value"
          :active-index="session.queueIndex.value"
          :get-completion-count="session.getCompletionCount"
        />

        <!-- Active Chord Display -->
        <div class="text-center w-full">
          <h2 class="text-3xl font-bold mb-4">{{ session.activeChord.value?.name }}</h2>
          
          <FretboardVisualizer
            :frets="session.activeChord.value?.display?.frets || []"
            :notes="session.activeChord.value?.notes || []"
            :active-string-index="activeStringIndex"
            :detected-string-index="detectedStringIndex"
          />

          <!-- Note Progress -->
          <div
            class="flex justify-center gap-2 mt-4"
          >
            <div 
              v-for="(note, i) in session.activeChord.value?.notes" 
              :key="i"
              class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all"
              :class="{ 
                'border-accent bg-accent-light scale-110': i === session.noteIndex.value,
                'bg-accent text-white border-accent': i < session.noteIndex.value,
                'bg-surface border-border': i > session.noteIndex.value
              }"
            >
              {{ Note.pitchClass(note) }}
            </div>
          </div>
        </div>

        <!-- Detection Display -->
        <NoteDetectionDisplay
          :detected-note="detectedNoteName"
          :target-note="targetPitchClass"
          :frequency="detectedFreq"
          :progress="leaderProgress"
        />

        <!-- Stop Button -->
        <button
          class="flex items-center gap-2 px-6 py-3 rounded-lg bg-surface border border-border hover:border-accent transition-colors mt-4"
          @click="stopPractice"
        >
          <Pause :size="16" /> End Session
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Play, Pause } from 'lucide-vue-next'
import { Note } from '@tonaljs/tonal'

// Composables
import { usePitchDetector } from '../composables/usePitchDetector'
import { useSustainedNote } from '../composables/useSustainedNote'
import { usePracticeSession } from '../composables/usePracticeSession'
import { usePracticeTimer } from '../composables/usePracticeTimer'

// Components
import ChordCard from '../components/ChordCard.vue'
import ChordCarousel from '../components/ChordCarousel.vue'
import PracticeTimer from '../components/PracticeTimer.vue'
import NoteDetectionDisplay from '../components/NoteDetectionDisplay.vue'
import FretboardVisualizer from '../components/FretboardVisualizer.vue'

// Utils
import { CHORD_LIBRARY } from '../utils/chordLibrary'
import { getNoteFromFrequency } from '../utils/musicParams'

const router = useRouter()

// Configuration
const timerEnabled = ref(false)
const timerMode = ref('countdown')
const timerMinutes = ref(5)
const isPracticing = ref(false)

// Session Management
const session = usePracticeSession({ chords: CHORD_LIBRARY })

// Timer
const timer = usePracticeTimer()

// Pitch Detection
const { pitch, start, stop } = usePitchDetector()
const detectedNoteName = ref(null)
const detectedFreq = ref(null)

// Note-by-Note Detection
const { 
  confirmedNote, 
  currentLeader, 
  leaderProgress, 
  onDetection: onNoteDetection, 
  reset: resetSustained, 
  stop: stopSustained 
} = useSustainedNote({
  confirmDuration: 250,
  maxGap: 200,
  cooldownMs: 300
})

// Computed
const targetPitchClass = computed(() => {
  if (!session.targetNote.value) return null
  return Note.pitchClass(session.targetNote.value)
})

const activeStringIndex = computed(() => {
  if (!session.activeChord.value) return -1
  const frets = session.activeChord.value.display?.frets || []
  
  let noteIdx = 0
  for (let s = 0; s < 6; s++) {
    if (frets[s] !== -1) {
      if (noteIdx === session.noteIndex.value) return s
      noteIdx++
    }
  }
  return -1
})

const detectedStringIndex = computed(() => {
  if (!session.activeChord.value || !currentLeader.value) return -1
  const frets = session.activeChord.value.display?.frets || []
  const notes = session.activeChord.value.notes || []
  
  let noteIdx = 0
  for (let s = 0; s < 6; s++) {
    if (frets[s] !== -1) {
      const notePitchClass = Note.pitchClass(notes[noteIdx])
      if (notePitchClass === currentLeader.value) return s
      noteIdx++
    }
  }
  return -1
})

// Start Practice
const startPractice = async () => {
  isPracticing.value = true
  session.resetProgress()
  await start()
  
  if (timerEnabled.value) {
    timer.configure({ 
      mode: timerMode.value, 
      limit: timerMinutes.value * 60 
    })
    timer.start()
  }
}

// Stop Practice
const stopPractice = () => {
  isPracticing.value = false
  stop()
  timer.pause()
  resetSustained()
}

// Watch pitch and feed to detector
watch(pitch, (newFreq) => {
  if (!isPracticing.value) return
  
  detectedFreq.value = newFreq ? Math.round(newFreq) : null

  if (newFreq) {
    const detected = getNoteFromFrequency(newFreq)
    if (detected && detected.name) {
      const noteName = Note.pitchClass(detected.name)
      detectedNoteName.value = noteName
      
      // Note-by-note mode
      onNoteDetection(noteName, targetPitchClass.value)
    } else {
      detectedNoteName.value = null
      onNoteDetection(null, targetPitchClass.value)
    }
  } else {
    detectedNoteName.value = null
    onNoteDetection(null, targetPitchClass.value)
  }
})

// Watch for confirmed notes
watch(confirmedNote, (note) => {
  if (!note || !targetPitchClass.value) return

  if (note === targetPitchClass.value) {
    // Note matched!
    session.completeNote()
    resetSustained()
  }
})

// Watch for timer completion
watch(() => timer.isComplete.value, (complete) => {
  if (complete) {
    stopPractice()
  }
})

onUnmounted(() => {
  stopSustained()
  stop()
})
</script>

<style scoped>
/* Keep minimal custom CSS for things Tailwind can't easily handle */
</style>
