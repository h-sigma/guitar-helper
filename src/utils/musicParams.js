import { Note } from '@tonaljs/tonal'

// Standard Guitar Tuning (Low to High)
export const STANDARD_TUNING = [
	{ note: 'E2', freq: 82.41 },
	{ note: 'A2', freq: 110.00 },
	{ note: 'D3', freq: 146.83 },
	{ note: 'G3', freq: 196.00 },
	{ note: 'B3', freq: 246.94 },
	{ note: 'E4', freq: 329.63 }
]

/**
 * Gets the nearest musical note for a given frequency.
 * @param {number} frequency - Output from pitch detector
 */
export function getNoteFromFrequency(frequency) {
	if (!frequency) return null

	// Tonal.Note.fromFreq(frequency) returns the note name (e.g., "A4")
	// Note: Tonal might return "A4" for 440.
	const noteName = Note.fromFreq(frequency)
	const midi = Note.midi(noteName)
	const idealFreq = Note.freq(noteName)

	// Calculate cents off
	// Formula: 1200 * log2(f1 / f0)
	const cents = 1200 * Math.log2(frequency / idealFreq)

	return {
		name: noteName, // 'A4'
		midi: midi,
		freq: idealFreq,
		diff: cents // Difference in cents
	}
}

/**
 * Finds the closest string in the current tuning to the detected note.
 * Use this to guide the UI (e.g. highlight the E string if we are close to E).
 * This usually matches based on frequency proximity.
 */
export function getClosestString(frequency, tuning = STANDARD_TUNING) {
	if (!frequency) return null

	let closest = tuning[0]
	let minDiff = Infinity

	for (const string of tuning) {
		const diff = Math.abs(frequency - string.freq)
		if (diff < minDiff) {
			minDiff = diff
			closest = string
		}
	}

	return closest
}
