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

// Note names for manual conversion
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

/**
 * Convert frequency to MIDI note number
 * @param {number} frequency 
 * @returns {number} MIDI note number
 */
function frequencyToMidi(frequency) {
	// MIDI note 69 = A4 = 440Hz
	// n = 12 * log2(f / 440) + 69
	return Math.round(12 * Math.log2(frequency / 440) + 69)
}

/**
 * Convert MIDI note number to note name with octave
 * @param {number} midi 
 * @returns {string} Note name like "A4"
 */
function midiToNoteName(midi) {
	const octave = Math.floor(midi / 12) - 1
	const noteIndex = midi % 12
	return NOTE_NAMES[noteIndex] + octave
}

/**
 * Gets the nearest musical note for a given frequency.
 * Uses manual MIDI calculation as primary method (more reliable than Tonal.fromFreq)
 * @param {number} frequency - Output from pitch detector
 */
export function getNoteFromFrequency(frequency) {
	if (!frequency || frequency < 20 || frequency > 5000) return null

	try {
		// Manual calculation (more reliable)
		const midi = frequencyToMidi(frequency)
		const noteName = midiToNoteName(midi)

		// Calculate ideal frequency for this MIDI note
		const idealFreq = 440 * Math.pow(2, (midi - 69) / 12)

		// Calculate cents off
		const cents = 1200 * Math.log2(frequency / idealFreq)

		return {
			name: noteName,
			midi: midi,
			freq: idealFreq,
			diff: cents
		}
	} catch (e) {
		console.warn('getNoteFromFrequency error:', e)
		return null
	}
}

/**
 * Finds the closest string in the current tuning to the detected note.
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
