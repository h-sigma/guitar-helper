<script setup>
import { useRouter } from 'vue-router'
import { ArrowLeft, Play, Pause, ChevronUp, ChevronDown } from 'lucide-vue-next'
import { useStrummingEngine } from '../composables/useStrummingEngine'
import { watch } from 'vue'
import { animate } from 'animejs'

const router = useRouter()
const { bpm, isPlaying, pattern, currentBeat, currentSubBeat, toggleRun } = useStrummingEngine()

// Visual effects for beats
watch([currentBeat, currentSubBeat], ([newBeat, newSub]) => {
  if (newSub === 0) { // On the beat (Downstroke time usually)
    animate('.metronome-dot', {
      scale: [1.5, 1],
      opacity: [1, 0.5],
      duration: 300,
      easing: 'easeOutQuad'
    })
  }
})

const toggleStep = (index) => {
  pattern.value[index].active = !pattern.value[index].active
}

const adjustBpm = (delta) => {
  bpm.value = Math.max(40, Math.min(240, bpm.value + delta))
}
</script>

<template>
  <div class="tool-page">
    <header>
      <button @click="router.push('/')" class="icon-btn">
        <ArrowLeft />
      </button>
      <h1>Rhythm Trainer</h1>
      <div class="placeholder"></div>
    </header>

    <main class="strum-container">
      
      <!-- Metronome Visual -->
      <div class="metronome-display">
        <div class="metronome-dot"></div>
        <div class="beat-counter basic-font">{{ currentBeat + 1 }}</div>
      </div>

      <!-- Controls -->
      <div class="bpm-controls">
        <button @click="adjustBpm(-5)" class="adjust-btn"><ChevronDown /></button>
        <div class="bpm-display">
          <span class="bpm-val">{{ bpm }}</span>
          <span class="bpm-label">BPM</span>
        </div>
        <button @click="adjustBpm(5)" class="adjust-btn"><ChevronUp /></button>
      </div>

      <!-- Pattern Grid -->
      <div class="pattern-grid">
        <div 
          v-for="(step, idx) in pattern" 
          :key="idx"
          class="pattern-step"
          :class="{ 
            active: step.active, 
            'current-step': isPlaying && Math.floor(idx/2) === currentBeat && (idx%2) === currentSubBeat 
          }"
          @click="toggleStep(idx)"
        >
          <span class="step-type">{{ step.type }}</span>
          <div class="step-bar"></div>
        </div>
      </div>

      <button @click="toggleRun" class="play-btn" :class="{ running: isPlaying }">
        <component :is="isPlaying ? Pause : Play" fill="currentColor" />
      </button>

    </main>
  </div>
</template>

<style scoped>
.tool-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at bottom, #0a1a2a 0%, #000 100%);
}

header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.strum-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  padding: 1rem 0;
}

/* Metronome */
.metronome-display {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metronome-dot {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--primary-color);
  opacity: 0.2;
  transform: scale(1);
}

.beat-counter {
  font-size: 4rem;
  font-weight: 900;
  z-index: 2;
  text-shadow: 0 0 20px rgba(0,0,0,0.5);
}

.basic-font {
    font-variant-numeric: tabular-nums;
}

/* BPM Controls */
.bpm-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.bpm-display {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.bpm-val {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
}
.bpm-label {
  color: var(--text-dim);
  font-size: 0.8rem;
  letter-spacing: 2px;
}

.adjust-btn {
  background: rgba(255,255,255,0.1);
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.adjust-btn:active { background: rgba(255,255,255,0.3); }

/* Pattern */
.pattern-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  width: 90%;
  max-width: 500px;
}

.pattern-step {
  aspect-ratio: 1/1.5;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 10px;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.pattern-step.active {
  background: rgba(255,255,255,0.1);
}
.pattern-step.active .step-bar {
  background: var(--primary-color);
  height: 60%;
  box-shadow: var(--primary-glow);
}

.step-bar {
  width: 6px;
  height: 10%;
  background: #444;
  border-radius: 3px;
  transition: all 0.2s;
}

.pattern-step.current-step {
  border-color: #fff;
  transform: translateY(-5px);
}

.step-type {
  margin-bottom: auto;
  margin-top: 10px;
  font-size: 0.8rem;
  color: #666;
}
.pattern-step.active .step-type { color: #fff; }

/* Control */
.play-btn {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--text-color);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.play-btn.running {
  background: var(--accent-color);
  color: #fff;
  box-shadow: var(--accent-glow);
}
</style>
