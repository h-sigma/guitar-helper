<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { animate, stagger } from 'animejs'
import { Music, Zap, BarChart } from 'lucide-vue-next'

const router = useRouter()

const tools = [
  { 
    id: 'tuner', 
    name: 'Tuner Module', 
    desc: 'Calibrate Instrument Frequency', 
    path: '/tuner', 
    icon: Music,
    color: 'var(--primary-color)'
  },
  { 
    id: 'chords', 
    name: 'Chord Simulation', 
    desc: 'Polyphonic Target Practice', 
    path: '/chords', 
    icon: Zap,
    color: 'var(--accent-color)'
  },
  { 
    id: 'strum', 
    name: 'Rhythm Engine', 
    desc: 'Temporal Pattern Calibration', 
    path: '/strum', 
    icon: BarChart,
    color: '#bd00ff'
  }
]

onMounted(() => {
  // Title Animation
  animate('.title-glitch', {
    translateX: [-5, 5, -2, 2, 0],
    opacity: [0.5, 1],
    duration: 800,
    easing: 'easeOutElastic(1, .8)'
  })

  // Stagger animation for cards
  animate('.mission-card', {
    translateX: [-50, 0],
    opacity: [0, 1],
    delay: stagger(150),
    easing: 'easeOutExpo',
    duration: 1200
  })
})
</script>

<template>
  <main class="home-container">
    
    <header class="hero-section">
      <h1 class="title-glitch" data-text="GUITAR_HELPER_OS">GUITAR_HELPER_OS</h1>
      <p class="subtitle">SYSTEM READY. SELECT MODULE.</p>
    </header>

    <div class="mission-grid">
      <div 
        v-for="tool in tools" 
        :key="tool.id"
        class="mission-card glass-panel"
        @click="router.push(tool.path)"
        :style="{ '--card-color': tool.color }"
      >
        <div class="card-icon">
          <component :is="tool.icon" />
        </div>
        <div class="card-content">
          <h2 class="neon-text">{{ tool.name }}</h2>
          <p>{{ tool.desc }}</p>
        </div>
        <div class="scan-line"></div>
      </div>
    </div>
    
    <div class="system-status">
      <span>V.1.0.4 ONLINE</span>
      <span>AUDIO_CORE: STANDBY</span>
    </div>
  </main>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.hero-section {
  text-align: center;
  margin-bottom: 4rem;
  z-index: 2;
}

h1 {
  font-family: var(--font-header);
  font-size: 4rem;
  letter-spacing: 5px;
  color: #fff;
  text-shadow: 0 0 20px var(--primary-color);
  margin: 0;
}

.subtitle {
  font-family: var(--font-header);
  color: var(--primary-color);
  letter-spacing: 3px;
  margin-top: 10px;
  opacity: 0.8;
}

.mission-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  z-index: 2;
}

.mission-card {
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  overflow: hidden;
  border-left: 2px solid transparent;
}

.mission-card:hover {
  transform: translateX(10px) scale(1.02);
  background: rgba(13, 22, 38, 0.9);
  border-color: var(--card-color);
  box-shadow: 0 0 30px rgba(0,0,0,0.5);
  border-left: 5px solid var(--card-color);
}

.card-icon {
  font-size: 2rem;
  color: var(--card-color);
  background: rgba(255,255,255,0.05);
  padding: 1rem;
  border-radius: 50%;
  box-shadow: 0 0 10px var(--card-color);
  border: 1px solid rgba(255,255,255,0.1);
}

.card-content h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #fff;
  text-shadow: none;
}
.card-content h2.neon-text {
    /* override generic H2 if needed, but neon-text class handles it */
}

.card-content p {
  margin: 5px 0 0 0;
  color: var(--text-dim);
  font-size: 0.9rem;
  font-family: var(--font-body);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Scan line effect */
.scan-line {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: 0.5s;
}

.mission-card:hover .scan-line {
  animation: scan 1s linear infinite;
}

@keyframes scan {
  0% { left: -100%; }
  100% { left: 200%; }
}

.system-status {
  position: absolute;
  bottom: 2rem;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 3rem;
  font-family: var(--font-header);
  color: var(--text-dim);
  font-size: 0.8rem;
  pointer-events: none;
}
</style>
