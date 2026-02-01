<template>
  <div
    class="flex flex-col items-center gap-2"
    :class="{ 'text-accent': isComplete }"
  >
    <div class="flex items-baseline gap-1">
      <span class="text-4xl font-semibold tabular-nums text-text">{{ formattedTime }}</span>
      <span
        v-if="mode === 'countdown' && limit > 0"
        class="text-base text-text-dim"
      >/ {{ formatTime(limit) }}</span>
    </div>
    
    <!-- Progress bar for countdown -->
    <div
      v-if="mode === 'countdown' && limit > 0"
      class="w-full max-w-[200px] h-1 bg-border rounded-full overflow-hidden"
    >
      <div
        class="h-full bg-accent transition-all duration-1000 ease-linear"
        :style="{ width: (1 - progress) * 100 + '%' }"
      />
    </div>
    
    <!-- Controls -->
    <div
      v-if="showControls"
      class="flex gap-2"
    >
      <button
        v-if="!isRunning"
        class="w-9 h-9 rounded-full bg-surface text-text flex items-center justify-center hover:bg-accent-light transition-colors"
        @click="$emit('start')"
      >
        <Play :size="16" />
      </button>
      <button
        v-else
        class="w-9 h-9 rounded-full bg-surface text-text flex items-center justify-center hover:bg-accent-light transition-colors"
        @click="$emit('pause')"
      >
        <Pause :size="16" />
      </button>
      <button
        class="w-9 h-9 rounded-full bg-surface text-text flex items-center justify-center hover:bg-accent-light transition-colors opacity-60 hover:opacity-100"
        @click="$emit('reset')"
      >
        <RotateCcw :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { Play, Pause, RotateCcw } from 'lucide-vue-next'

defineProps({
  mode: {
    type: String,
    default: 'countup'
  },
  limit: {
    type: Number,
    default: 0
  },
  formattedTime: {
    type: String,
    default: '00:00'
  },
  progress: {
    type: Number,
    default: 0
  },
  isRunning: {
    type: Boolean,
    default: false
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  showControls: {
    type: Boolean,
    default: true
  }
})

defineEmits(['start', 'pause', 'reset'])

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
/* No custom styles needed */
</style>
