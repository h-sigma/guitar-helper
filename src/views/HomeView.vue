<script setup>
import { useRouter } from 'vue-router'
import { Music, Zap, BarChart } from 'lucide-vue-next'

const router = useRouter()

const tools = [
  { 
    id: 'tuner', 
    name: 'Tuner', 
    desc: 'Tune to standard, drop D, and more.', 
    path: '/tuner', 
    icon: Music 
  },
  { 
    id: 'chords', 
    name: 'Perfect Chord Practice', 
    desc: 'Master chord transitions with precision.', 
    path: '/chords', 
    icon: Zap 
  },
  { 
    id: 'strum', 
    name: 'Strumming Practice', 
    desc: 'Learn rhythm patterns with visual guides.', 
    path: '/strum', 
    icon: BarChart 
  }
]
</script>

<template>
  <main class="min-h-screen p-8 max-w-xl mx-auto flex flex-col justify-center">
    <header class="text-center mb-12">
      <h1 class="text-4xl text-text mb-2">Guitar Helper</h1>
      <p class="text-text-dim">Mindful practice tools for guitarists.</p>
    </header>
    
    <div class="flex flex-col gap-6">
      <div 
        v-for="tool in tools" 
        :key="tool.id"
        class="card flex items-center gap-6 cursor-pointer hover:-translate-y-1 hover:shadow-md"
        @click="router.push(tool.path)"
      >
        <div class="w-14 h-14 rounded-full bg-accent-light text-accent flex items-center justify-center shrink-0">
          <component
            :is="tool.icon"
            :size="24"
            :stroke-width="2"
          />
        </div>
        <div>
          <h2 class="text-xl mb-1">{{ tool.name }}</h2>
          <p class="text-text-dim text-sm">{{ tool.desc }}</p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* No custom styles needed */
</style>
