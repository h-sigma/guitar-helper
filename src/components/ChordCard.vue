<template>
  <div 
    class="flex flex-col items-center p-4 bg-surface rounded-xl border-2 border-transparent cursor-pointer transition-all duration-200 relative min-w-[80px]"
    :class="{ 
      '!border-accent scale-105 shadow-md': isActive, 
      'opacity-60': isCompleted,
      '!border-accent bg-accent-light': isSelected,
      'hover:-translate-y-0.5 hover:shadow-sm': !isActive
    }"
    @click="$emit('click')"
  >
    <div class="text-2xl font-bold text-text">
      {{ chord.symbol }}
    </div>
    <div class="text-xs text-text-dim mt-1">
      {{ chord.name }}
    </div>
    
    <!-- Mini fretboard preview -->
    <div
      v-if="chord.display?.frets"
      class="flex gap-0.5 mt-2 mx-1"
    >
      <div 
        v-for="(fret, i) in chord.display.frets" 
        :key="i"
        class="w-3 h-3 flex items-center justify-center text-[0.5rem] font-semibold rounded-full"
        :class="{ 
          'text-text-dim': fret === -1, 
          'text-accent': fret === 0,
          'bg-accent text-white': fret > 0
        }"
      >
        <span v-if="fret === -1">×</span>
        <span v-else-if="fret === 0">○</span>
        <span v-else>{{ fret }}</span>
      </div>
    </div>
    
    <!-- Completion count badge -->
    <div
      v-if="completionCount > 0"
      class="absolute -top-2 -right-2 bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shadow-sm"
    >
      {{ completionCount }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  chord: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  completionCount: {
    type: Number,
    default: 0
  }
})

defineEmits(['click'])
</script>

<style scoped>
/* No custom styles needed */
</style>
