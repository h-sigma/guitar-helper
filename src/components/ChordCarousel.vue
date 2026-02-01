<template>
  <div
    ref="carouselRef"
    class="w-full overflow-hidden py-4"
  >
    <div
      class="flex gap-4 transition-transform duration-300 ease-out"
      :style="trackStyle"
    >
      <div 
        v-for="(chordIdx, i) in chordIndices" 
        :key="i"
        class="flex-shrink-0 transition-all duration-300 opacity-50 scale-[0.85]"
        :class="{ '!opacity-100 !scale-100': i === activeIndex }"
      >
        <ChordCard
          :chord="chords[chordIdx]"
          :is-active="i === activeIndex"
          :completion-count="getCompletionCount(chordIdx)"
          @click="$emit('select', i)"
        />
      </div>
    </div>
    
    <!-- Navigation dots -->
    <div
      v-if="chordIndices.length > 1"
      class="flex justify-center gap-2 mt-4"
    >
      <span 
        v-for="(_, i) in chordIndices" 
        :key="i"
        class="w-2 h-2 rounded-full bg-text-dim opacity-30 cursor-pointer transition-all hover:opacity-70"
        :class="{ '!opacity-100 bg-accent': i === activeIndex }"
        @click="$emit('select', i)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import ChordCard from './ChordCard.vue'

const props = defineProps({
  chords: {
    type: Array,
    required: true
  },
  chordIndices: {
    type: Array,
    required: true
  },
  activeIndex: {
    type: Number,
    default: 0
  },
  getCompletionCount: {
    type: Function,
    default: () => 0
  }
})

defineEmits(['select'])

const carouselRef = ref(null)

// Calculate track offset to center active item
const trackStyle = computed(() => {
  const itemWidth = 100 // px approximate
  const offset = props.activeIndex * itemWidth
  return {
    transform: `translateX(calc(50% - ${offset}px - ${itemWidth / 2}px))`
  }
})

// Auto-scroll to active on change
watch(() => props.activeIndex, () => {
  // CSS transition handles animation
})
</script>

<style scoped>
/* No custom styles needed */
</style>
