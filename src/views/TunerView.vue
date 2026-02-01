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
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold mb-2">Tuner</h1>
        <p class="text-text-dim">Select a tuning preset and play each string.</p>
      </div>

      <!-- Tuning Presets -->
      <div class="flex flex-wrap gap-2 justify-center mb-8">
        <button 
          v-for="(preset, key) in TUNING_PRESETS" 
          :key="key"
          class="px-4 py-2 border rounded-full text-sm transition-all"
          :class="selectedPreset === key 
            ? 'bg-accent text-white border-accent' 
            : 'bg-surface border-border text-text hover:border-gray-400'"
          @click="selectedPreset = key"
        >
          {{ preset.name }}
        </button>
      </div>

      <!-- String Selector -->
      <div class="flex justify-center gap-2 mb-8">
        <button
          v-for="(string, i) in currentTuning"
          :key="i"
          class="flex flex-col items-center p-3 min-w-[48px] border-2 rounded-lg transition-all"
          :class="[
            selectedString === i ? 'border-accent bg-accent-light' : 'bg-surface border-border',
            stringStates[i] === 'in-tune' ? '!border-green-500 !bg-green-50' : '',
            stringStates[i] === 'close' ? '!border-yellow-500' : ''
          ]"
          @click="selectedString = i"
        >
          <span class="font-semibold text-lg">{{ string.note }}</span>
          <span class="text-xs text-text-dim">{{ 6 - i }}</span>
        </button>
      </div>

      <!-- Tuning Meter -->
      <div class="bg-surface rounded-xl p-6 mb-6 relative overflow-hidden shadow-sm">
        <div class="flex justify-between mb-4">
          <span class="text-lg text-text-dim">♭</span>
          <span class="text-lg text-accent">●</span>
          <span class="text-lg text-text-dim">♯</span>
        </div>
        
        <!-- Center line indicator -->
        <div
          class="w-1 h-10 bg-accent rounded-full absolute left-1/2 top-1/2 -mt-5 transition-transform duration-100 ease-out"
          :style="indicatorStyle"
        />
        
        <div class="text-center mt-4 text-lg font-medium">
          <span :class="centsColorClass">{{ centsDisplay }}</span>
        </div>
      </div>

      <!-- Detection Display -->
      <NoteDetectionDisplay
        :detected-note="detectedNoteName"
        :target-note="targetNote"
        :frequency="detectedFreq"
        :progress="0"
      />

      <!-- Start/Stop -->
      <div class="flex justify-center mt-8 gap-4">
        <button 
          v-if="!isListening" 
          class="btn-accent text-lg py-3 px-8 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5" 
          @click="startTuning"
        >
          <Mic :size="20" /> Start Tuning
        </button>
        <button 
          v-else 
          class="flex items-center gap-2 bg-red-500 text-white py-3 px-8 rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-sm" 
          @click="stopTuning"
        >
          <MicOff :size="20" /> Stop
        </button>
      </div>
    </main>
  </div>
</template>


<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Mic, MicOff } from 'lucide-vue-next'
import { usePitchDetector } from '../composables/usePitchDetector'
import { getNoteFromFrequency } from '../utils/musicParams'
import { Note } from '@tonaljs/tonal'
import NoteDetectionDisplay from '../components/NoteDetectionDisplay.vue'

const router = useRouter()

// Tuning Presets
const TUNING_PRESETS = {
  standard: {
    name: 'Standard',
    strings: [
      { note: 'E2', freq: 82.41 },
      { note: 'A2', freq: 110.00 },
      { note: 'D3', freq: 146.83 },
      { note: 'G3', freq: 196.00 },
      { note: 'B3', freq: 246.94 },
      { note: 'E4', freq: 329.63 }
    ]
  },
  dropD: {
    name: 'Drop D',
    strings: [
      { note: 'D2', freq: 73.42 },
      { note: 'A2', freq: 110.00 },
      { note: 'D3', freq: 146.83 },
      { note: 'G3', freq: 196.00 },
      { note: 'B3', freq: 246.94 },
      { note: 'E4', freq: 329.63 }
    ]
  },
  halfStepDown: {
    name: 'Half Step Down',
    strings: [
      { note: 'Eb2', freq: 77.78 },
      { note: 'Ab2', freq: 103.83 },
      { note: 'Db3', freq: 138.59 },
      { note: 'Gb3', freq: 185.00 },
      { note: 'Bb3', freq: 233.08 },
      { note: 'Eb4', freq: 311.13 }
    ]
  },
  openG: {
    name: 'Open G',
    strings: [
      { note: 'D2', freq: 73.42 },
      { note: 'G2', freq: 98.00 },
      { note: 'D3', freq: 146.83 },
      { note: 'G3', freq: 196.00 },
      { note: 'B3', freq: 246.94 },
      { note: 'D4', freq: 293.66 }
    ]
  }
}

const selectedPreset = ref('standard')
const selectedString = ref(0)
const isListening = ref(false)
const stringStates = ref({}) // 'in-tune', 'close', 'off'

const currentTuning = computed(() => TUNING_PRESETS[selectedPreset.value].strings)
const targetNote = computed(() => Note.pitchClass(currentTuning.value[selectedString.value].note))
const targetFreq = computed(() => currentTuning.value[selectedString.value].freq)

// Pitch Detection
const { pitch, start, stop, isReady: _isReady } = usePitchDetector()
const detectedNoteName = ref(null)
const detectedFreq = ref(null)
const centsOff = ref(0)

const centsDisplay = computed(() => {
  if (centsOff.value === 0) return 'In Tune'
  const sign = centsOff.value > 0 ? '+' : ''
  return `${sign}${Math.round(centsOff.value)} cents`
})

const centsColorClass = computed(() => {
  const c = Math.abs(centsOff.value)
  if (c <= 5) return 'text-green-500'
  if (c <= 15) return 'text-yellow-500'
  return 'text-text-dim'
})

const indicatorStyle = computed(() => {
  // Map cents to position (-50 to +50 cents = -100% to +100%)
  const clamped = Math.max(-50, Math.min(50, centsOff.value))
  const percent = (clamped / 50) * 50 // -50% to +50%
  return { transform: `translateX(${percent}%)` }
})

// Update detection
watch(pitch, (freq) => {
  if (!freq) {
    detectedNoteName.value = null
    detectedFreq.value = null
    return
  }

  detectedFreq.value = Math.round(freq)
  const noteInfo = getNoteFromFrequency(freq)
  
  if (noteInfo) {
    detectedNoteName.value = Note.pitchClass(noteInfo.name)
    
    // Calculate cents from target
    const cents = 1200 * Math.log2(freq / targetFreq.value)
    centsOff.value = cents
    
    // Update string state
    const absCents = Math.abs(cents)
    if (absCents <= 5) {
      stringStates.value[selectedString.value] = 'in-tune'
    } else if (absCents <= 15) {
      stringStates.value[selectedString.value] = 'close'
    }
  }
})

const startTuning = async () => {
  await start()
  isListening.value = true
}

const stopTuning = () => {
  stop()
  isListening.value = false
}

onUnmounted(() => {
  stop()
})
</script>

<style scoped>
/* No custom styles needed */
</style>
