<script setup>
import { useRouter } from 'vue-router'
import { Music, Zap, BarChart } from 'lucide-vue-next'

const router = useRouter()

const tools = [
  { 
    id: 'tuner', 
    name: 'Tuner', 
    desc: 'Simple, accurate tuning.', 
    path: '/tuner', 
    icon: Music 
  },
  { 
    id: 'chords', 
    name: 'Chords', 
    desc: 'Interactive fretboard diagrams.', 
    path: '/chords', 
    icon: Zap 
  },
  { 
    id: 'strum', 
    name: 'Rhythm', 
    desc: 'Metronome & patterns.', 
    path: '/strum', 
    icon: BarChart 
  }
]
</script>

<template>
  <main class="home-container">
    <header class="home-header">
      <h1>Guitar Helper</h1>
      <p>Mindful practice tools.</p>
    </header>
    
    <div class="card-grid">
      <div 
        v-for="tool in tools" 
        :key="tool.id"
        class="tool-card card"
        @click="router.push(tool.path)"
      >
        <div class="icon-circle">
          <component :is="tool.icon" size="24" stroke-width="2" />
        </div>
        <div>
          <h2>{{ tool.name }}</h2>
          <p>{{ tool.desc }}</p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  padding: 2rem;
  max-width: var(--max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.home-header {
  text-align: center;
  margin-bottom: 3rem;
}
.home-header h1 {
  font-size: 2.5rem;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}
.home-header p {
  color: var(--text-dim);
}

.card-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  cursor: pointer;
}
.tool-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f1f3f5;
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

h2 { font-size: 1.25rem; margin-bottom: 0.25rem; }
p { margin: 0; color: var(--text-dim); font-size: 0.95rem; }
</style>
