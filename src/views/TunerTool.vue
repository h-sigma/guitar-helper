<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePitchDetector } from '../composables/usePitchDetector'
import { getNoteFromFrequency, getClosestString, STANDARD_TUNING } from '../utils/musicParams'
import { animate } from 'animejs'
import { ArrowLeft, Mic } from 'lucide-vue-next'

const router = useRouter()
const { pitch, isReady, modelLoading, start, stop } = usePitchDetector()

const currentNote = ref('--')
const centsOff = ref(0)
const isPerfect = ref(false)
const closestStringNode = ref(null)

// For needle animation
const needleRef = ref(null)

onMounted(() => {
  start()
})

onUnmounted(() => {
  stop()
})

watch(pitch, (newFreq) => {
  if (newFreq) {
    const data = getNoteFromFrequency(newFreq)
    currentNote.value = data.name.replace(/[0-9]/g, '') // Remove octave for display if desired, or keep it.
    // Actually, keeping octave is good for guitar.
    // Let's keep it but formatted.
    currentNote.value = data.name
    
    centsOff.value = data.diff // -50 to +50 usually

    // Check if "Perfect" (within +/- 5 cents)
    isPerfect.value = Math.abs(data.diff) < 5

    // Find closest string to highlight
    closestStringNode.value = getClosestString(newFreq)?.note

    // Animate Needle
    // Map cents -50..50 to rotation -45deg..45deg
    const rotation = Math.max(-45, Math.min(45, data.diff))
    
    animate(needleRef.value, {
      rotate: rotation,
      duration: 100,
      easing: 'easeOutElastic(1, .8)'
    })

  } else {
    // No pitch detected
    // Maybe fade out or relax needle
  }
})

</script>

<template>
  <div class="tool-page tuner-page">
    <header>
      <button @click="router.push('/')" class="icon-btn">
        <ArrowLeft />
      </button>
      <h1 class="neon-text">Pro Tuner</h1>
      <div class="placeholder"></div>
    </header>

    <main class="tuner-container">
      
      <!-- Loading State -->
      <div v-if="modelLoading" class="loading-overlay">
        <div class="spinner"></div>
        <p>Listening to the universe...</p>
      </div>

      <!-- Main Tuner Display -->
      <div v-else class="tuner-display">
        
        <!-- Note Indicator -->
        <div class="note-circle" :class="{ 'in-tune': isPerfect }">
          <span class="note-name">{{ currentNote }}</span>
          <span class="freq-text" v-if="pitch">{{ Math.round(pitch) }} Hz</span>
        </div>

        <!-- Gauge / Needle -->
        <div class="gauge-container">
          <div class="gauge-tick center"></div>
          <div class="gauge-tick left-20"></div>
          <div class="gauge-tick right-20"></div>
          
          <div class="needle" ref="needleRef"></div>
          <div class="needle-base"></div>
        </div>

        <!-- Cents Text -->
        <div class="cents-readout" :class="{ 'plus': centsOff > 0, 'minus': centsOff < 0 }">
          <span v-if="pitch">
            {{ centsOff > 0 ? '+' : '' }}{{ Math.round(centsOff) }} ¢
          </span>
          <span v-else>Thinking...</span>
        </div>

        <!-- String Indicators -->
        <div class="strings-row">
          <div 
            v-for="str in STANDARD_TUNING" 
            :key="str.note"
            class="string-orb"
            :class="{ active: closestStringNode === str.note }"
          >
            {{ str.note.replace(/[0-9]/, '') }}
          </div>
        </div>

      </div>

    </main>

    <!-- Visual Flair -->
    <div class="visual-waves"></div>
  </div>
</template>

<style scoped>
.tool-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at center, #1f1f1f 0%, #000000 100%);
}

header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon-btn {
  background: rgba(255,255,255,0.1);
  color: white;
  padding: 10px;
  border-radius: 50%;
  display: flex;
  border: 1px solid rgba(255,255,255,0.2);
  transition: all 0.2s;
}
.icon-btn:active {
  transform: scale(0.95);
  background: rgba(255,255,255,0.2);
}

.tuner-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

/* Note Circle */
.note-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 4px solid var(--text-dim);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  transition: all 0.3s;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
  background: rgba(0,0,0,0.3);
}

.note-circle.in-tune {
  border-color: var(--primary-color);
  box-shadow: var(--primary-glow);
  background: rgba(0, 255, 157, 0.05);
}

.note-name {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1;
}

.freq-text {
  font-size: 0.9rem;
  color: var(--text-dim);
  margin-top: 5px;
}

/* Gauge */
.gauge-container {
  width: 300px;
  height: 150px; /* Half circle */
  border-top-left-radius: 150px;
  border-top-right-radius: 150px;
  border: 2px solid rgba(255,255,255,0.1);
  border-bottom: none;
  position: relative;
  overflow: hidden;
  margin-bottom: 2rem;
  background: linear-gradient(to top, rgba(255,255,255,0.02), rgba(255,255,255,0));
}

.gauge-tick {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 2px;
  background: #555;
  transform-origin: bottom center;
}
.gauge-tick.center { height: 20px; background: var(--primary-color); transform: translateX(-50%); box-shadow: 0 0 10px var(--primary-color); }
.gauge-tick.left-20 { height: 15px; transform: translateX(-50%) rotate(-20deg); bottom: 10px; }
.gauge-tick.right-20 { height: 15px; transform: translateX(-50%) rotate(20deg); bottom: 10px; }

.needle {
  width: 4px;
  height: 130px;
  background: var(--accent-color);
  position: absolute;
  bottom: 0;
  left: 50%;
  margin-left: -2px; /* Center */
  transform-origin: bottom center;
  border-radius: 2px;
  box-shadow: var(--accent-glow);
  z-index: 10;
}

.needle-base {
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  bottom: -10px;
  left: 50%;
  margin-left: -10px;
  z-index: 11;
}

/* Cents */
.cents-readout {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-dim);
  min-height: 2rem;
  margin-bottom: 2rem;
}
.cents-readout.plus { color: #ffca28; }
.cents-readout.minus { color: #ffca28; }

/* Strings */
.strings-row {
  display: flex;
  gap: 15px;
}

.string-orb {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  color: #666;
  border: 1px solid transparent;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.string-orb.active {
  background: var(--primary-color);
  color: #000;
  transform: scale(1.2);
  box-shadow: var(--primary-glow);
}

/* Loading */
.loading-overlay {
  display: flex;
  flex-direction: column;
  items-center: center;
  justify-content: center;
  height: 100%;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255,255,255,0.1);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}
@keyframes spin { 100% { transform: rotate(360deg); } }

/* Visual Waves Background */
.visual-waves {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: 
    repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent 40px,
      rgba(255,255,255,0.02) 40px,
      rgba(255,255,255,0.02) 41px
    );
  pointer-events: none;
  z-index: 1;
}
</style>
