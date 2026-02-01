import { ref, computed } from 'vue'
import { useIntervalFn } from '@vueuse/core'

export function useStrummingEngine() {
	const bpm = ref(80)
	const isPlaying = ref(false)
	const beatsPerBar = ref(4) // Standard 4/4
	const currentBeat = ref(0) // 1, 2, 3, 4
	const currentSubBeat = ref(0) // 0 or 1 (Down or Up)

	// Strumming Pattern: D=Down, U=Up, -=Miss/Rest
	// Default: D U D U D U D U (8th notes)
	// User can toggle these.
	const pattern = ref([
		{ type: 'D', active: true }, { type: 'U', active: false },
		{ type: 'D', active: true }, { type: 'U', active: true },
		{ type: 'D', active: true }, { type: 'U', active: false },
		{ type: 'D', active: true }, { type: 'U', active: true }
	])

	// Timer calculation
	const intervalMs = computed(() => {
		// 8th notes. BPM is quarter notes.
		// 60000 / BPM = ms per quarter note.
		// We want 8th notes, so divide by 2.
		return (60000 / bpm.value) / 2
	})

	const { pause, resume, isActive } = useIntervalFn(() => {
		tick()
	}, intervalMs, { immediate: false })

	const tick = () => {
		// Advance index
		let nextIndex = (currentBeat.value * 2) + currentSubBeat.value + 1
		if (nextIndex >= 8) nextIndex = 0

		// Convert back to Beat (0-3) and SubBeat (0-1)
		currentBeat.value = Math.floor(nextIndex / 2)
		currentSubBeat.value = nextIndex % 2
	}

	const toggleRun = () => {
		if (isPlaying.value) {
			pause()
		} else {
			currentBeat.value = 0
			currentSubBeat.value = 0
			resume()
		}
		isPlaying.value = !isPlaying.value
	}

	return {
		bpm,
		isPlaying,
		pattern,
		currentBeat,
		currentSubBeat,
		toggleRun
	}
}
