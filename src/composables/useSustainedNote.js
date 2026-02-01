import { ref, unref } from 'vue'

/**
 * Target-aware sustained note detection using callback.
 * 
 * Only tracks progress for the TARGET note. Other notes are shown
 * but don't accumulate progress.
 * 
 * @param {Object} options - Configuration
 * @param {number} options.confirmDuration - Ms the note must be held (default: 500)
 * @param {number} options.maxGap - Max gap in ms before resetting (default: 200)
 * @param {number} options.cooldownMs - Cooldown after confirmation (default: 300)
 */
export function useSustainedNote(options = {}) {
	const confirmDuration = options.confirmDuration || 500
	const maxGap = options.maxGap || 200
	const cooldownMs = options.cooldownMs || 300

	const confirmedNote = ref(null)
	const currentLeader = ref(null)
	const leaderProgress = ref(0)

	// Time tracking - only for target note
	let startTime = null
	let lastSeenTime = null
	let lastConfirmTime = 0

	const reset = () => {
		confirmedNote.value = null
		currentLeader.value = null
		leaderProgress.value = 0
		startTime = null
		lastSeenTime = null
		console.log('[SustainedNote] Reset')
	}

	/**
	 * Called on each pitch detection
	 * @param {string|null} noteName - Detected note pitch class
	 * @param {string|null} targetNote - The target note we're looking for (can be ref or value)
	 */
	const onDetection = (noteName, targetNote) => {
		const now = Date.now()
		const target = unref(targetNote)  // Handle both refs and plain values

		// Check if we're in cooldown after confirming
		if (now - lastConfirmTime < cooldownMs) {
			return
		}

		// Always update what note is currently detected
		currentLeader.value = noteName

		if (!target) {
			// No target set, nothing to track
			leaderProgress.value = 0
			return
		}

		if (noteName === target) {
			// Detected the TARGET note!
			if (startTime === null) {
				// First detection of target
				console.log(`[SustainedNote] Started tracking target: ${target}`)
				startTime = now
			}

			lastSeenTime = now
			const elapsed = now - startTime
			leaderProgress.value = Math.min(1, elapsed / confirmDuration)

			console.log(`[SustainedNote] Target ${target}: ${Math.round(leaderProgress.value * 100)}% (${elapsed}ms / ${confirmDuration}ms)`)

			// Check if we've held long enough
			if (elapsed >= confirmDuration) {
				console.log(`[SustainedNote] CONFIRMED: ${target}`)
				confirmedNote.value = target
				lastConfirmTime = now
				startTime = null
				lastSeenTime = null
				leaderProgress.value = 0
			}
		} else if (noteName && noteName !== target) {
			// Wrong note detected - reset progress
			if (startTime !== null) {
				console.log(`[SustainedNote] Wrong note (${noteName}), resetting target tracking`)
				startTime = null
				lastSeenTime = null
				leaderProgress.value = 0
			}
		} else {
			// Null detection - check if gap is too long
			if (startTime !== null && lastSeenTime) {
				const gap = now - lastSeenTime
				if (gap > maxGap) {
					console.log(`[SustainedNote] Gap too long (${gap}ms), resetting`)
					startTime = null
					lastSeenTime = null
					leaderProgress.value = 0
				}
			}
		}
	}

	const stop = () => {
		reset()
	}

	return {
		confirmedNote,
		currentLeader,
		leaderProgress,
		onDetection,  // Call this on each pitch detection: onDetection(noteName, targetNote)
		reset,
		stop
	}
}
