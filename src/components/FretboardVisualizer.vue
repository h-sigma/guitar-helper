<script setup>
defineProps({
  frets: { type: Array, required: true }, // [-1, 3, 2, 0, 1, 0] for C Major (Strings 6->1)
  activeStringIndex: { type: Number, default: -1 }, // 0-5 (Low E to High E). -1 means none.
  detectedStringIndex: { type: Number, default: -1 } // String where detected note is playing
})

// Fretboard Geometry
const STRINGS = 6
const FRETS_TO_SHOW = 4
const WIDTH = 300
const HEIGHT = 320
const PADDING_X = 40
const PADDING_Y = 50

const stringSpacing = (WIDTH - 2 * PADDING_X) / (STRINGS - 1)
const fretSpacing = (HEIGHT - 2 * PADDING_Y) / FRETS_TO_SHOW

const getStringX = (i) => PADDING_X + i * stringSpacing
const getFretY = (i) => PADDING_Y + i * fretSpacing

</script>

<template>
  <div class="w-full flex justify-center">
    <svg
      :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
      class="w-full max-w-[300px] h-auto"
    >
      
      <!-- Nut (Thick Line at top) -->
      <line 
        :x1="PADDING_X"
        :y1="PADDING_Y" 
        :x2="WIDTH - PADDING_X"
        :y2="PADDING_Y" 
        stroke="var(--color-text)"
        stroke-width="6" 
      />

      <!-- Frets (Horizontal Lines) -->
      <line
        v-for="i in FRETS_TO_SHOW"
        :key="`fret-${i}`"
        :x1="PADDING_X"
        :y1="getFretY(i)"
        :x2="WIDTH - PADDING_X"
        :y2="getFretY(i)"
        stroke="var(--color-border)"
        stroke-width="2"
      />

      <!-- Strings (Vertical Lines) -->
      <line
        v-for="(s, i) in STRINGS"
        :key="`string-${i}`"
        :x1="getStringX(i)"
        :y1="PADDING_Y"
        :x2="getStringX(i)"
        :y2="HEIGHT - PADDING_Y/2"
        stroke="var(--color-text-dim)" 
        :stroke-width="1 + (STRINGS - i - 1) * 0.4" 
      />

      <!-- Finger Positions -->
      <g
        v-for="(fret, stringIdx) in frets"
        :key="`pos-${stringIdx}`"
      >
        
        <!-- Muted (X shape) -->
        <g
          v-if="fret === -1"
          :transform="`translate(${getStringX(stringIdx)}, ${PADDING_Y - 20})`"
        >
          <line
            x1="-5"
            y1="-5"
            x2="5"
            y2="5"
            stroke="#ef4444"
            stroke-width="2"
            stroke-linecap="round"
          />
          <line
            x1="5"
            y1="-5"
            x2="-5"
            y2="5"
            stroke="#ef4444"
            stroke-width="2"
            stroke-linecap="round"
          />
        </g>

        <!-- Open String (Small circle outline) -->
        <circle
          v-else-if="fret === 0"
          :cx="getStringX(stringIdx)" 
          :cy="PADDING_Y - 20"
          r="6"
          fill="none" 
          :stroke="stringIdx === activeStringIndex ? 'var(--color-accent)' : 'var(--color-text)'" 
          stroke-width="2"
        />

        <!-- Fretted Note (Filled circle) -->
        <circle
          v-if="fret > 0"
          :cx="getStringX(stringIdx)" 
          :cy="getFretY(fret) - fretSpacing / 2" 
          r="14"
          :fill="stringIdx === activeStringIndex ? 'var(--color-accent)' : 'var(--color-text)'"
        />
        
        <!-- Target Highlight Ring (pulsing) for Active Target -->
        <circle
          v-if="stringIdx === activeStringIndex && fret > -1"
          :cx="getStringX(stringIdx)" 
          :cy="fret === 0 ? PADDING_Y - 20 : (getFretY(fret) - fretSpacing / 2)" 
          :r="fret === 0 ? 12 : 22"
          fill="none"
          stroke="var(--color-accent)"
          stroke-width="2"
          opacity="0.6"
        >
          <animate
            attributeName="r"
            :values="fret === 0 ? '10;14;10' : '20;26;20'"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.6;0.2;0.6"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>

        <!-- Detected Note Indicator (subtle, only if different from target) -->
        <circle
          v-if="stringIdx === detectedStringIndex && stringIdx !== activeStringIndex && fret > -1"
          :cx="getStringX(stringIdx)" 
          :cy="fret === 0 ? PADDING_Y - 20 : (getFretY(fret) - fretSpacing / 2)" 
          :r="fret === 0 ? 10 : 18"
          fill="none"
          stroke="var(--color-primary)"
          stroke-width="1.5"
          stroke-dasharray="3 3"
          opacity="0.5"
        />

      </g>
    </svg>
  </div>
</template>

<style scoped>
/* No custom styles needed */
</style>
