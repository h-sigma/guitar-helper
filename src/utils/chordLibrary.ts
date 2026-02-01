import type { Chord } from '../types'

// Guitar Chord Library - Major and Minor Open Chords
export const CHORD_LIBRARY: Chord[] = [
  // Major Chords
  {
    name: 'C Major',
    symbol: 'C',
    notes: ['C3', 'E3', 'G3', 'C4', 'E4'],
    display: {
      frets: [-1, 3, 2, 0, 1, 0]
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
    name: 'E Major',
    symbol: 'E',
    notes: ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'],
    display: {
      frets: [0, 2, 2, 1, 0, 0]
    }
  },
  {
    name: 'F Major',
    symbol: 'F',
    notes: ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'],
    display: {
      frets: [1, 3, 3, 2, 1, 1]
    }
  },
  {
    name: 'G Major',
    symbol: 'G',
    notes: ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'],
    display: {
      frets: [3, 2, 0, 0, 0, 3]
    }
  },
  {
    name: 'A Major',
    symbol: 'A',
    notes: ['A2', 'E3', 'A3', 'C#4', 'E4'],
    display: {
      frets: [-1, 0, 2, 2, 2, 0]
    }
  },
  
  // Minor Chords
  {
    name: 'A minor',
    symbol: 'Am',
    notes: ['A2', 'E3', 'A3', 'C4', 'E4'],
    display: {
      frets: [-1, 0, 2, 2, 1, 0]
    }
  },
  {
    name: 'D minor',
    symbol: 'Dm',
    notes: ['D3', 'A3', 'D4', 'F4'],
    display: {
      frets: [-1, -1, 0, 2, 3, 1]
    }
  },
  {
    name: 'E minor',
    symbol: 'Em',
    notes: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
    display: {
      frets: [0, 2, 2, 0, 0, 0]
    }
  },
  {
    name: 'C minor',
    symbol: 'Cm',
    notes: ['C3', 'G3', 'C4', 'Eb4', 'G4'],
    display: {
      frets: [-1, 3, 5, 5, 4, 3]
    }
  }
]
