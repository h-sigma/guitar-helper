<template>
  <div class="flex flex-col items-center gap-3 p-4 bg-surface rounded-xl">
    <div class="text-center">
      <div
        class="text-5xl font-bold text-text-dim transition-all duration-200"
        :class="{ 
          'text-accent scale-110': isMatch, 
          'text-text': detectedNote && !isMatch 
        }"
      >
        {{ detectedNote || '—' }}
      </div>
      <div
        v-if="frequency"
        class="text-xs text-text-dim tabular-nums"
      >
        {{ frequency }}Hz
      </div>
    </div>
    
    <div
      v-if="targetNote"
      class="flex items-center gap-2 text-sm"
    >
      <span class="text-text-dim">Target:</span>
      <span
        class="font-semibold text-text transition-colors duration-200"
        :class="{ 'text-accent': isMatch }"
      >{{ targetNote }}</span>
    </div>
    
    <!-- Progress bar -->
    <div class="w-full max-w-[200px]">
      <div class="h-1.5 bg-border rounded-full overflow-hidden">
        <div 
          class="h-full bg-text-dim transition-[width] duration-75 ease-linear rounded-full"
          :class="{ '!bg-accent': isMatch }"
          :style="{ width: progress * 100 + '%' }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  detectedNote: {
    type: String,
    default: null
  },
  targetNote: {
    type: String,
    default: null
  },
  frequency: {
    type: Number,
    default: null
  },
  progress: {
    type: Number,
    default: 0
  }
})

const isMatch = computed(() => {
  return props.detectedNote && props.targetNote && props.detectedNote === props.targetNote
})
</script>

<style scoped>
/* No custom styles needed */
</style>
