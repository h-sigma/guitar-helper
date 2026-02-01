// Basic Open Chords
export const CHORD_LIBRARY = [
	{
		name: 'E Major',
		symbol: 'E',
		notes: ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'], // Standard E Major
		display: {
			fingerings: [0, 2, 2, 1, 0, 0], // 0 is open, 1-4 are fingers (simplified here to just fret positions usually, but let's stick to notes for checking)
			frets: [0, 2, 2, 1, 0, 0] // strings 6 to 1
		}
	},
	{
		name: 'A Major',
		symbol: 'A',
		notes: ['A2', 'E3', 'A3', 'C#4', 'E4'], // Mute E2 usually, but for detection we list valid notes.
		display: {
			frets: [-1, 0, 2, 2, 2, 0] // -1 = mute
		}
	},
	{
		name: 'D Major',
		symbol: 'D',
		notes: ['D3', 'A3', 'D4', 'F#4'],
		display: {
			frets: [-1, -1, 0, 2, 3, 2]
		}
	},
	{
		name: 'G Major',
		symbol: 'G',
		notes: ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'], // or open G
		display: {
			frets: [3, 2, 0, 0, 0, 3]
		}
	},
	{
		name: 'C Major',
		symbol: 'C',
		notes: ['C3', 'E3', 'G3', 'C4', 'E4'],
		display: {
			frets: [-1, 3, 2, 0, 1, 0]
		}
	}
]
