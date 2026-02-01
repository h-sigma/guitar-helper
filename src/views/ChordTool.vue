<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Play, Square, Check, X } from 'lucide-vue-next'
import { usePitchDetector } from '../composables/usePitchDetector'
import { CHORD_LIBRARY } from '../utils/chordLibrary'
import { getNoteFromFrequency } from '../utils/musicParams'
import { animate } from 'animejs'
import { Note } from '@tonaljs/tonal'
import AudioVisualizer from '../components/AudioVisualizer.vue'

const router = useRouter()
const { pitch, start, stop } = usePitchDetector()

// State
const isPracticing = ref(false)
const selectedChords = ref([])
const currentPracticeIndex = ref(0)
const chordStats = ref({}) // { 'E Major': 5 }
const currentNoteIndex = ref(0)

const activeChordIndex = computed(() => {
  if (selectedChords.value.length === 0) return 0
  return selectedChords.value[currentPracticeIndex.value]
})

const activeChord = computed(() => CHORD_LIBRARY[activeChordIndex.value])

const targetNoteName = computed(() => {
  if (!activeChord.value) return null
  return activeChord.value.notes[currentNoteIndex.value]
})

const toggleChord = (idx) => {
  const position = selectedChords.value.indexOf(idx)
  if (position === -1) {
    selectedChords.value.push(idx)
    // Click feedback
    animate(`#chord-btn-${idx}`, { scale: [0.9, 1], duration: 200 })
  } else {
    selectedChords.value.splice(position, 1)
  }
}

const startPractice = async () => {
  if (selectedChords.value.length === 0) {
    alert('SELECT TARGET PARAMETERS')
    return
  }
  await start()
  isPracticing.value = true
  currentPracticeIndex.value = 0
  currentNoteIndex.value = 0
}

const stopPractice = () => {
  stop()
  isPracticing.value = false
}

const nextChord = () => {
  const name = activeChord.value.name
  chordStats.value[name] = (chordStats.value[name] || 0) + 1
  
  // SUCCESS IMPACT
  animate('.chord-hologram', {
    scale: [1, 1.2, 1],
    filter: ['brightness(1)', 'brightness(2)', 'brightness(1)'],
    duration: 400,
    easing: 'easeOutExpo'
  })
  
  animate('.main-hud', {
    borderColor: ['#00f3ff', '#fff', '#00f3ff'],
    duration: 300
  })

  // Next Index in Queue
  currentPracticeIndex.value = (currentPracticeIndex.value + 1) % selectedChords.value.length
  currentNoteIndex.value = 0
}

watch(pitch, (newFreq) => {
  if (!isPracticing.value || !newFreq) return

  const detected = getNoteFromFrequency(newFreq)
  
  if (detected && targetNoteName.value) {
    const targetMidi = Note.midi(targetNoteName.value)
    if (detected.midi === targetMidi) {
        // HIT IMPACT
        animate(`#note-target-${currentNoteIndex.value}`, {
            scale: [1, 1.5, 1],
            color: ['#5a7b8c', '#00f3ff'],
            boxShadow: ['0 0 0', '0 0 20px #00f3ff'],
            duration: 300
        })

        currentNoteIndex.value++
    
        if (currentNoteIndex.value >= activeChord.value.notes.length) {
          nextChord()
        }
    }
  }
})

</script>

<template>
  <div class="tool-page">
    <!-- BACKGROUND VISUALIZER -->
    <div class="bg-visualizer">
        <AudioVisualizer mode="frequency" />
    </div>

    <header>
      <button @click="router.push('/')" class="icon-btn back-btn">
        <ArrowLeft /> ABORT
      </button>
      <h1 class="neon-text">TARGET_PRACTICE // CHORD_SIM</h1>
      <button v-if="isPracticing" @click="stopPractice" class="icon-btn stop-btn">
        <Square fill="currentColor" size="16"/> TERMINATE
      </button>
    </header>

    <main class="chord-container">
      
      <!-- CONFIG MODE: INVENTORY STYLE -->
      <div v-if="!isPracticing" class="config-panel glass-panel">
        <h2 class="tech-header">SELECT LOADOUT</h2>
        
        <div class="chord-grid">
          <div v-for="(chord, idx) in CHORD_LIBRARY" :key="chord.name" 
            :id="`chord-btn-${idx}`"
            class="chord-item"
            :class="{ selected: selectedChords.includes(idx) }"
            @click="toggleChord(idx)"
          >
            <div class="chord-symbol">{{ chord.symbol }}</div>
            <div class="selection-marker" v-if="selectedChords.includes(idx)">
               {{ selectedChords.indexOf(idx) + 1 }}
            </div>
            <div class="corner-accents"></div>
          </div>
        </div>
        
        <div class="action-bar">
             <button @click="startPractice" class="cyber-btn" :disabled="selectedChords.length === 0">
                INITIATE SEQUENCE <Play size="16" />
            </button>
        </div>
      </div>

      <!-- PRACTICE MODE: HUD STYLE -->
      <div v-else class="practice-display">
        
        <div class="main-hud glass-panel">
            <div class="hud-header">
                <span>TARGET: {{ activeChord.name.toUpperCase() }}</span>
                <span>COMPLETED: {{ (chordStats[activeChord.name] || 0).toString().padStart(3, '0') }}</span>
            </div>
            
            <div class="chord-hologram">
               {{ activeChord.symbol }}
            </div>

            <div class="target-notes">
                 <div 
                    v-for="(n, idx) in activeChord.notes" 
                    :key="idx"
                    :id="`note-target-${idx}`"
                    class="note-target"
                    :class="{ 
                        completed: idx < currentNoteIndex,
                        active: idx === currentNoteIndex
                    }"
                >
                    <span class="note-name">{{ n }}</span>
                    <div class="target-reticle" v-if="idx === currentNoteIndex"></div>
                </div>
            </div>
        </div>

        <div class="queue-strip">
            NEXT: <span class="highlight">{{ CHORD_LIBRARY[selectedChords[(currentPracticeIndex + 1) % selectedChords.length]].symbol }}</span>
        </div>

      </div>

    </main>
  </div>
</template>

<style scoped>
.tool-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.bg-visualizer {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 50%;
    z-index: 0;
    pointer-events: none;
    mask-image: linear-gradient(to top, rgba(0,0,0,1), transparent);
}

header {
  position: relative;
  z-index: 10;
  padding: 1.5rem 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0,243,255,0.1);
  background: rgba(5,10,20,0.8);
  backdrop-filter: blur(5px);
}

.icon-btn {
    background: transparent;
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
    padding: 0.5rem 1rem;
    font-family: var(--font-header);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s;
}
.icon-btn:hover {
    background: var(--primary-color);
    color: #000;
    box-shadow: 0 0 15px var(--primary-color);
}

.stop-btn {
    color: var(--accent-color);
    border-color: var(--accent-color);
}
.stop-btn:hover {
    background: var(--accent-color);
    color: #000;
    box-shadow: 0 0 15px var(--accent-color);
}

.chord-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  z-index: 10;
}

/* CONFIG PANEL */
.config-panel {
    padding: 3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
}

.tech-header {
    font-family: var(--font-header);
    letter-spacing: 2px;
    color: var(--text-dim);
    border-bottom: 2px solid var(--primary-color);
    padding-bottom: 0.5rem;
}

.chord-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1.5rem;
}

.chord-item {
    width: 80px;
    height: 80px;
    background: rgba(0,243,255,0.05);
    border: 1px solid rgba(0,243,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
    position: relative;
    transition: all 0.2s;
}

.chord-item:hover {
    border-color: var(--primary-color);
    box-shadow: 0 0 10px rgba(0,243,255,0.2);
}

.chord-item.selected {
    background: rgba(0,243,255,0.2);
    color: var(--primary-color);
    border-color: var(--primary-color);
    box-shadow: 0 0 15px rgba(0,243,255,0.4);
}

.selection-marker {
    position: absolute;
    top: -5px;
    right: -5px;
    background: var(--primary-color);
    color: #000;
    font-size: 0.8rem;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-header);
}

.cyber-btn {
    background: var(--primary-color);
    color: #000;
    font-family: var(--font-header);
    font-size: 1.2rem;
    padding: 1rem 3rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
    transition: all 0.3s;
}
.cyber-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 20px var(--primary-color);
}
.cyber-btn:disabled {
    background: #333;
    color: #555;
    box-shadow: none;
    cursor: not-allowed;
}

/* PRACTICE HUD */
.main-hud {
    padding: 3rem 5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    min-width: 500px;
}

.hud-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    font-family: var(--font-header);
    color: var(--text-dim);
    font-size: 0.9rem;
    border-bottom: 1px dashed rgba(0,243,255,0.3);
    padding-bottom: 0.5rem;
}

.chord-hologram {
    font-size: 8rem;
    font-weight: 900;
    color: #fff;
    text-shadow: 0 0 20px var(--primary-color), 0 0 40px var(--primary-color);
    font-family: var(--font-body);
}

.target-notes {
    display: flex;
    gap: 2rem;
}

.note-target {
    width: 60px;
    height: 80px;
    border: 2px solid #333;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #555;
    font-size: 1.2rem;
    font-weight: bold;
    position: relative;
    transition: all 0.2s;
}

.note-target.active {
    border-color: var(--accent-color);
    color: var(--accent-color);
    box-shadow: 0 0 10px var(--accent-glow);
}

.note-target.completed {
    border-color: var(--primary-color);
    background: rgba(0,243,255,0.1);
    color: var(--primary-color);
}

.target-reticle {
    position: absolute;
    width: 120%;
    height: 120%;
    border: 1px dashed var(--accent-color);
    border-radius: 50%;
    animation: spin 4s linear infinite;
}

@keyframes spin { 100% { transform: rotate(360deg); } }

.queue-strip {
    margin-top: 2rem;
    font-family: var(--font-header);
    color: var(--text-dim);
    background: rgba(0,0,0,0.5);
    padding: 0.5rem 2rem;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.1);
}
.highlight {
    color: var(--primary-color);
    font-weight: bold;
}
</style>
