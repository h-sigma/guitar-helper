<template>
  <div class="tool-page">
    <header>
      <button
        class="back-link"
        @click="router.push('/')"
      >
        <ArrowLeft size="20" /> Back
      </button>
    </header>

    <main>
      <!-- CONFIG VIEW -->
      <div
        v-if="!isPracticing"
        class="config-view"
      >
        <div class="intro">
          <h1>Strumming Practice</h1>
          <p>Master rhythm patterns with visual guidance.</p>
        </div>

        <!-- Pattern Preset -->
        <section class="config-section">
          <h2>Pattern</h2>
          <div class="preset-grid">
            <button 
              v-for="(preset, key) in PATTERN_PRESETS" 
              :key="key"
              class="preset-card"
              :class="{ active: selectedPreset === key }"
              @click="selectPreset(key)"
            >
              <span class="preset-name">{{ preset.name }}</span>
              <span class="preset-pattern">{{ formatPattern(preset.pattern) }}</span>
            </button>
          </div>
        </section>

        <!-- Custom Pattern Editor -->
        <section class="config-section">
          <h2>Customize Pattern</h2>
          <div class="stroke-editor">
            <div 
              v-for="(stroke, i) in pattern" 
              :key="i"
              class="stroke-slot"
              @click="toggleStroke(i)"
            >
              <div 
                class="stroke-indicator"
                :class="{ 
                  active: stroke.active,
                  down: stroke.type === 'D',
                  up: stroke.type === 'U'
                }"
              >
                <ArrowDown
                  v-if="stroke.type === 'D'"
                  size="20"
                />
                <ArrowUp
                  v-if="stroke.type === 'U'"
                  size="20"
                />
              </div>
              <span class="beat-number">{{ i + 1 }}</span>
            </div>
          </div>
          <p class="pattern-hint">
            Tap to toggle strokes on/off
          </p>
        </section>

        <!-- BPM -->
        <section class="config-section">
          <h2>Tempo</h2>
          <div class="bpm-control">
            <button
              class="bpm-btn"
              @click="bpm = Math.max(40, bpm - 5)"
            >
              -
            </button>
            <div class="bpm-display">
              <span class="bpm-value">{{ bpm }}</span>
              <span class="bpm-label">BPM</span>
            </div>
            <button
              class="bpm-btn"
              @click="bpm = Math.min(200, bpm + 5)"
            >
              +
            </button>
          </div>
        </section>

        <!-- Timer Settings -->
        <section class="config-section">
          <h2>Timer</h2>
          <div class="toggle-row">
            <label>Enable Timer</label>
            <button 
              class="toggle-btn" 
              :class="{ active: timerEnabled }"
              @click="timerEnabled = !timerEnabled"
            >
              {{ timerEnabled ? 'On' : 'Off' }}
            </button>
          </div>
          <div
            v-if="timerEnabled"
            class="timer-config"
          >
            <div class="toggle-row">
              <label>Duration (minutes)</label>
              <input
                v-model.number="timerMinutes"
                type="number"
                min="1"
                max="60"
              >
            </div>
          </div>
        </section>

        <div class="actions">
          <button
            class="btn-main"
            @click="startPractice"
          >
            <Play size="20" /> Start Practice
          </button>
        </div>
      </div>

      <!-- PRACTICE VIEW -->
      <div
        v-else
        class="practice-view"
      >
        <!-- Timer -->
        <PracticeTimer
          v-if="timerEnabled"
          mode="countdown"
          :limit="timerMinutes * 60"
          :formatted-time="timer.formattedTime.value"
          :progress="timer.progress.value"
          :is-running="timer.isRunning.value"
          :is-complete="timer.isComplete.value"
          :show-controls="false"
        />

        <!-- BPM Display -->
        <div class="bpm-badge">
          {{ bpm }} BPM
        </div>

        <!-- Pattern Display -->
        <div class="pattern-display">
          <div 
            v-for="(stroke, i) in pattern" 
            :key="i"
            class="stroke-display"
            :class="{ 
              active: currentBeat === i && stroke.active,
              inactive: !stroke.active,
              current: currentBeat === i
            }"
          >
            <div
              class="stroke-arrow"
              :class="{ down: stroke.type === 'D', up: stroke.type === 'U' }"
            >
              <ArrowDown
                v-if="stroke.type === 'D'"
                :size="32"
              />
              <ArrowUp
                v-if="stroke.type === 'U'"
                :size="32"
              />
            </div>
            <span class="beat-label">{{ i + 1 }}</span>
          </div>
        </div>

        <!-- Visual Metronome -->
        <div class="metronome-visual">
          <div 
            class="metronome-dot"
            :class="{ pulse: isPulsing }"
          />
        </div>

        <!-- Stats -->
        <div class="stats">
          <div class="stat">
            <span class="stat-value">{{ barCount }}</span>
            <span class="stat-label">Bars</span>
          </div>
        </div>

        <!-- Stop Button -->
        <button
          class="btn-stop"
          @click="stopPractice"
        >
          <Pause size="16" /> End Session
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowDown, ArrowUp, Play, Pause } from 'lucide-vue-next'
import { usePracticeTimer } from '../composables/usePracticeTimer'
import PracticeTimer from '../components/PracticeTimer.vue'

const router = useRouter()

// Pattern Presets
const PATTERN_PRESETS = {
  oneBar: {
    name: 'Basic',
    pattern: [
      { type: 'D', active: true },
      { type: 'U', active: true },
      { type: 'D', active: true },
      { type: 'U', active: true },
      { type: 'D', active: true },
      { type: 'U', active: true },
      { type: 'D', active: true },
      { type: 'U', active: true }
    ]
  },
  folkPattern: {
    name: 'Folk',
    pattern: [
      { type: 'D', active: true },
      { type: 'U', active: false },
      { type: 'D', active: true },
      { type: 'U', active: true },
      { type: 'D', active: false },
      { type: 'U', active: true },
      { type: 'D', active: true },
      { type: 'U', active: false }
    ]
  },
  popRock: {
    name: 'Pop Rock',
    pattern: [
      { type: 'D', active: true },
      { type: 'U', active: false },
      { type: 'D', active: false },
      { type: 'U', active: true },
      { type: 'D', active: false },
      { type: 'U', active: true },
      { type: 'D', active: false },
      { type: 'U', active: false }
    ]
  },
  reggae: {
    name: 'Reggae',
    pattern: [
      { type: 'D', active: false },
      { type: 'U', active: false },
      { type: 'D', active: true },
      { type: 'U', active: false },
      { type: 'D', active: false },
      { type: 'U', active: false },
      { type: 'D', active: true },
      { type: 'U', active: false }
    ]
  }
}

// State
const selectedPreset = ref('oneBar')
const pattern = ref([...PATTERN_PRESETS.oneBar.pattern.map(p => ({ ...p }))])
const bpm = ref(80)
const timerEnabled = ref(false)
const timerMinutes = ref(5)
const isPracticing = ref(false)
const currentBeat = ref(0)
const barCount = ref(0)
const isPulsing = ref(false)

// Timer
const timer = usePracticeTimer()

let beatInterval = null

// Helpers
const formatPattern = (p) => {
  return p.map(s => s.active ? s.type : '-').join(' ')
}

const selectPreset = (key) => {
  selectedPreset.value = key
  pattern.value = [...PATTERN_PRESETS[key].pattern.map(p => ({ ...p }))]
}

const toggleStroke = (index) => {
  pattern.value[index].active = !pattern.value[index].active
}

// Practice controls
const startPractice = () => {
  isPracticing.value = true
  currentBeat.value = 0
  barCount.value = 0
  
  if (timerEnabled.value) {
    timer.configure({ mode: 'countdown', limit: timerMinutes.value * 60 })
    timer.start()
  }
  
  startMetronome()
}

const stopPractice = () => {
  isPracticing.value = false
  timer.pause()
  stopMetronome()
}

const startMetronome = () => {
  const beatDuration = (60 / bpm.value) * 1000 / 2 // 8th notes
  
  beatInterval = setInterval(() => {
    // Pulse effect
    if (pattern.value[currentBeat.value].active) {
      isPulsing.value = true
      setTimeout(() => { isPulsing.value = false }, 100)
    }
    
    // Advance beat
    currentBeat.value++
    if (currentBeat.value >= pattern.value.length) {
      currentBeat.value = 0
      barCount.value++
    }
  }, beatDuration)
}

const stopMetronome = () => {
  if (beatInterval) {
    clearInterval(beatInterval)
    beatInterval = null
  }
}

// Watch timer completion
watch(() => timer.isComplete.value, (complete) => {
  if (complete) stopPractice()
})

onUnmounted(() => {
  stopMetronome()
})
</script>

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
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 0.9rem;
}

.intro {
  text-align: center;
  margin-bottom: 2rem;
}

.intro h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.intro p {
  color: var(--text-dim);
}

.config-section {
  margin-bottom: 2rem;
}

.config-section h2 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.preset-card {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: var(--card-bg);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.preset-card.active {
  border-color: var(--accent-color);
  background: var(--accent-light);
}

.preset-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.preset-pattern {
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--text-dim);
}

.stroke-editor {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.stroke-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
}

.stroke-indicator {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  color: var(--text-dim);
  opacity: 0.4;
  transition: all 0.2s ease;
}

.stroke-indicator.active {
  opacity: 1;
}

.stroke-indicator.active.down {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
}

.stroke-indicator.active.up {
  background: #22c55e;
  border-color: #22c55e;
  color: white;
}

.beat-number {
  font-size: 0.7rem;
  color: var(--text-dim);
}

.pattern-hint {
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-dim);
  margin-top: 0.5rem;
}

.bpm-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.bpm-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: var(--card-bg);
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bpm-btn:hover {
  border-color: var(--accent-color);
}

.bpm-display {
  text-align: center;
}

.bpm-value {
  font-size: 2.5rem;
  font-weight: 700;
}

.bpm-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-dim);
}

.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
}

.toggle-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: var(--card-bg);
  cursor: pointer;
}

.toggle-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.timer-config {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--card-bg);
  border-radius: 8px;
}

.timer-config input {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-main);
  color: var(--text-main);
  width: 80px;
}

.actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.btn-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  background: var(--accent-color);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

/* Practice View */
.practice-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.bpm-badge {
  background: var(--card-bg);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
}

.pattern-display {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
}

.stroke-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.1s ease;
  opacity: 0.3;
}

.stroke-display.active {
  opacity: 1;
  transform: scale(1.2);
}

.stroke-display.current {
  opacity: 0.6;
}

.stroke-display.inactive {
  opacity: 0.2;
}

.stroke-arrow {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stroke-arrow.down {
  background: var(--accent-color);
  color: white;
}

.stroke-arrow.up {
  background: #22c55e;
  color: white;
}

.beat-label {
  font-size: 0.7rem;
  color: var(--text-dim);
}

.metronome-visual {
  display: flex;
  justify-content: center;
}

.metronome-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--text-dim);
  transition: all 0.1s ease;
}

.metronome-dot.pulse {
  background: var(--accent-color);
  transform: scale(1.5);
}

.stats {
  display: flex;
  gap: 2rem;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-dim);
}

.btn-stop {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-main);
  cursor: pointer;
  margin-top: 1rem;
}
</style>
