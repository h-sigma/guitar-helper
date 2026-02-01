<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Pause, Play, Mic, MicOff } from 'lucide-vue-next'
import { usePitchDetector } from '../composables/usePitchDetector'
import { useSustainedNote } from '../composables/useSustainedNote'
import { CHORD_LIBRARY } from '../utils/chordLibrary'
import { getNoteFromFrequency } from '../utils/musicParams'
import { Note } from '@tonaljs/tonal'
import FretboardVisualizer from '../components/FretboardVisualizer.vue'

const router = useRouter()
const { pitch, start, stop, isReady } = usePitchDetector()

// State
const isPracticing = ref(false)
const selectedChords = ref([])
const currentQueueIndex = ref(0)
const currentNoteIndex = ref(0)

// Detection state
const detectedNoteName = ref(null) // Just the pitch class (e.g., "E")
const detectedFreq = ref(null)

// Sustained note detection (callback-based)
const { confirmedNote, currentLeader, leaderProgress, onDetection, reset: resetSustained, stop: stopSustained } = useSustainedNote({
  confirmDuration: 500, // Must hear note for 250ms
  maxGap: 200,          // Allow 200ms gaps between detections
  cooldownMs: 300       // Wait 300ms after confirm before next
})

const activeChordIndex = computed(() => {
  if (selectedChords.value.length === 0) return 0
  return selectedChords.value[currentQueueIndex.value]
})

const activeChord = computed(() => CHORD_LIBRARY[activeChordIndex.value])

const targetNoteFull = computed(() => {
  if (!activeChord.value) return null
  return activeChord.value.notes[currentNoteIndex.value]
})

const targetPitchClass = computed(() => {
  if (!targetNoteFull.value) return null
  return Note.pitchClass(targetNoteFull.value)
})

// Map note index to string index
const activeStringIndex = computed(() => {
  if (!isPracticing.value || !activeChord.value) return -1
  
  let noteCounter = 0
  for (let s = 0; s < 6; s++) {
    if (activeChord.value.display.frets[s] !== -1) {
      if (noteCounter === currentNoteIndex.value) {
        return s
      }
      noteCounter++
    }
  }
  return -1
})

// Find which string the currently detected note corresponds to
const detectedStringIndex = computed(() => {
  if (!isPracticing.value || !activeChord.value || !currentLeader.value) return -1
  
  // Find which string in this chord produces a note with this pitch class
  const frets = activeChord.value.display.frets
  const notes = activeChord.value.notes
  
  let noteIdx = 0
  for (let s = 0; s < 6; s++) {
    if (frets[s] !== -1) {
      const notePitchClass = Note.pitchClass(notes[noteIdx])
      if (notePitchClass === currentLeader.value) {
        return s
      }
      noteIdx++
    }
  }
  return -1
})

const toggleChord = (idx) => {
  const position = selectedChords.value.indexOf(idx)
  if (position === -1) {
    selectedChords.value.push(idx)
  } else {
    selectedChords.value.splice(position, 1)
  }
}

const startPractice = async () => {
  if (selectedChords.value.length === 0) return
  await start()
  isPracticing.value = true
  currentQueueIndex.value = 0
  currentNoteIndex.value = 0
  resetSustained()
}

const stopPractice = () => {
  stop()
  stopSustained()
  isPracticing.value = false
  detectedNoteName.value = null
  detectedFreq.value = null
}

const nextChord = () => {
  currentQueueIndex.value = (currentQueueIndex.value + 1) % selectedChords.value.length
  currentNoteIndex.value = 0
  resetSustained()
}

// Update detected note from pitch and feed to sustained detection
watch(pitch, (newFreq) => {
  if (!isPracticing.value) return
  
  // Always update frequency display
  detectedFreq.value = newFreq ? Math.round(newFreq) : null

  // Convert to note name and call onDetection with target
  if (newFreq) {
    const detected = getNoteFromFrequency(newFreq)
    if (detected && detected.name) {
      const noteName = Note.pitchClass(detected.name)
      console.log(`[ChordTool] Pitch: ${Math.round(newFreq)}Hz -> Note: ${noteName} (target: ${targetPitchClass.value})`)
      detectedNoteName.value = noteName
      onDetection(noteName, targetPitchClass.value)  // Pass target note!
    } else {
      detectedNoteName.value = null
      onDetection(null, targetPitchClass.value)
    }
  } else {
    detectedNoteName.value = null
    onDetection(null, targetPitchClass.value)
  }
})

// Watch for confirmed notes (sustained detection)
watch(confirmedNote, (note) => {
  if (!note || !targetPitchClass.value) return

  if (note === targetPitchClass.value) {
    // Correct note held long enough!
    currentNoteIndex.value++
    resetSustained()

    if (currentNoteIndex.value >= activeChord.value.notes.length) {
      setTimeout(nextChord, 300)
    }
  }
})

onUnmounted(() => {
  stopSustained()
})
</script>

<template>
  <div class="tool-page">
    <header>
      <button @click="router.push('/')" class="back-link">
        <ArrowLeft size="20" /> Back
      </button>
    </header>

    <main>
      
      <!-- CONFIG -->
      <div v-if="!isPracticing" class="config-view">
        <div class="intro">
          <h1>Chord Selection</h1>
          <p>Tap chords to build your practice session.</p>
        </div>

        <div class="chord-grid">
          <button 
            v-for="(chord, idx) in CHORD_LIBRARY" 
            :key="chord.name"
            class="chord-chip"
            :class="{ active: selectedChords.includes(idx) }"
            @click="toggleChord(idx)"
          >
            {{ chord.symbol }}
            <div class="badge" v-if="selectedChords.includes(idx)">
              {{ selectedChords.indexOf(idx) + 1 }}
            </div>
          </button>
        </div>
        
        <div class="actions">
          <button class="btn-main" @click="startPractice" :disabled="selectedChords.length === 0">
            <Play size="20" /> Start Practice
          </button>
        </div>
      </div>

      <!-- PRACTICE -->
      <div v-else class="practice-view">
        <div class="status-bar">
          <h2>{{ activeChord.name }}</h2>
          <p>Queue: {{ currentQueueIndex + 1 }} / {{ selectedChords.length }}</p>
        </div>

        <div class="visualizer-card card">
          <FretboardVisualizer 
            :frets="activeChord.display.frets"
            :active-string-index="activeStringIndex"
            :detected-string-index="detectedStringIndex"
          />
        </div>

        <!-- Live Pitch Display -->
        <div class="pitch-display card">
          <div class="pitch-row">
            <div class="pitch-label">
              <Mic v-if="isReady" size="16" class="mic-icon active" />
              <MicOff v-else size="16" class="mic-icon" />
              <span>Listening</span>
            </div>
            <div class="pitch-value" :class="{ match: currentLeader === targetPitchClass }">
              {{ currentLeader || '—' }}
              <span class="freq" v-if="detectedFreq">({{ detectedFreq }} Hz)</span>
            </div>
          </div>
          
          <!-- Progress bar for sustained detection -->
          <div class="sustain-bar">
            <div class="sustain-fill" :style="{ width: (leaderProgress * 100) + '%' }"></div>
          </div>

          <div class="target-row">
            <span class="target-label">Target:</span>
            <span class="target-value">{{ targetPitchClass }}</span>
          </div>
        </div>

        <div class="progress-indicator">
          <div 
             v-for="(n, i) in activeChord.notes" 
             :key="i" 
             class="dot"
             :class="{ 
               current: i === currentNoteIndex, 
               done: i < currentNoteIndex 
             }"
          ></div>
        </div>
        
        <p class="instruction">
           Hold the <span class="highlight">highlighted</span> string
        </p>

        <button class="btn-stop" @click="stopPractice">
          <Pause size="16" /> End Session
        </button>
      </div>

    </main>
  </div>
</template>

<style scoped>
.tool-page {
  min-height: 100vh;
  padding: 1.5rem;
  max-width: var(--max-width);
  margin: 0 auto;
}

header {
  margin-bottom: 2rem;
}
.back-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-dim);
  font-weight: 500;
}
.back-link:hover { color: var(--text-color); }

/* Config */
.intro { margin-bottom: 2rem; text-align: center; }
.intro h1 { font-size: 2rem; color: var(--text-color); }
.intro p { color: var(--text-dim); }

.chord-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.chord-chip {
  aspect-ratio: 1;
  background: white;
  border-radius: var(--border-radius);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: var(--shadow-sm);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
  position: relative;
  transition: all 0.2s;
}
.chord-chip.active {
  background: var(--surface-color);
  border-color: var(--primary-color);
  color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color);
}
.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--primary-color);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Practice */
.practice-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.status-bar { text-align: center; }
.status-bar h2 { font-size: 2.5rem; }
.status-bar p { color: var(--text-dim); font-size: 0.9rem; margin: 0; }

.visualizer-card {
  width: 100%;
  border: 1px solid rgba(0,0,0,0.03);
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
}

/* Pitch Display */
.pitch-display {
  width: 100%;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pitch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pitch-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-dim);
  font-size: 0.85rem;
}

.mic-icon { color: var(--text-dim); }
.mic-icon.active { color: var(--primary-color); }

.pitch-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  transition: color 0.2s;
}

.pitch-value.match { color: var(--primary-color); }

.pitch-value .freq {
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--text-dim);
  margin-left: 0.5rem;
}

/* Sustain progress bar */
.sustain-bar {
  height: 4px;
  background: #eee;
  border-radius: 2px;
  overflow: hidden;
}

.sustain-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.05s linear;
  border-radius: 2px;
}

.target-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.target-label { color: var(--text-dim); }
.target-value { font-weight: 600; color: var(--accent-color); }

.progress-indicator {
  display: flex;
  gap: 12px;
}
.dot {
  width: 10px; 
  height: 10px;
  border-radius: 50%;
  background: #dfe6e9;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.dot.current {
  background: var(--accent-color);
  transform: scale(1.4);
}
.dot.done {
  background: var(--primary-color);
}

.instruction {
  color: var(--text-dim);
  font-size: 0.95rem;
}
.highlight {
  color: var(--accent-color);
  font-weight: 600;
}

.btn-stop {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-dim);
  font-weight: 500;
}
.btn-stop:hover { color: var(--text-color); }
</style>
