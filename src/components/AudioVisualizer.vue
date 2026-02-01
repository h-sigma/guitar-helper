<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAudioContext } from '../composables/useAudioContext'

const props = defineProps({
  mode: { type: String, default: 'frequency' } // 'frequency' or 'wave'
})

const canvasRef = ref(null)
const { analyser } = useAudioContext()
let animationFrameId = null

const draw = () => {
  if (!canvasRef.value || !analyser.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  const bufferLength = analyser.value.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  analyser.value.getByteFrequencyData(dataArray)

  const width = canvas.width
  const height = canvas.height

  ctx.clearRect(0, 0, width, height)

  // Glow effect
  ctx.shadowBlur = 10
  ctx.shadowColor = '#00f3ff'

  if (props.mode === 'frequency') {
    const barWidth = (width / bufferLength) * 2.5
    let barHeight
    let x = 0

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 2

      // Sci-Fi gradient
      const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height)
      gradient.addColorStop(0, '#00f3ff') // Neon Cyan
      gradient.addColorStop(1, '#050a14') // Dark Blue

      ctx.fillStyle = gradient
      ctx.fillRect(x, height - barHeight, barWidth, barHeight)
      
      // Top cap for HUD feel
      ctx.fillStyle = '#ffffff'
      if (barHeight > 5) {
        ctx.fillRect(x, height - barHeight - 2, barWidth, 2)
      }

      x += barWidth + 1
    }
  }
  
  animationFrameId = requestAnimationFrame(draw)
}

onMounted(() => {
  draw()
})

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
})

watch(analyser, (newVal) => {
  if (newVal) draw()
})

// Resize observer could include here for responsiveness
</script>

<template>
  <div class="visualizer-wrapper">
    <canvas ref="canvasRef" width="800" height="200"></canvas>
  </div>
</template>

<style scoped>
.visualizer-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  opacity: 0.6;
}

canvas {
  width: 100%;
  height: 100%;
}
</style>
