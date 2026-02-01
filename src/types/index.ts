// Types for guitar practice app

export interface ChordDisplay {
  fingerings?: number[]
  frets: number[]
}

export interface Chord {
  name: string
  symbol: string
  notes: string[]
  display: ChordDisplay
}

export interface StringTuning {
  note: string
  freq: number
}

export interface NoteInfo {
  name: string
  midi: number
  freq: number
  diff: number
}

export interface TuningPreset {
  name: string
  strings: StringTuning[]
}

export interface PatternStroke {
  type: 'D' | 'U'
  active: boolean
}

export interface PatternPreset {
  name: string
  pattern: PatternStroke[]
}

// Timer types
export type TimerMode = 'countdown' | 'countup' | 'disabled'

export interface TimerOptions {
  mode?: TimerMode
  limit?: number
}

// Detection types
export type DetectionMode = 'note' | 'chord'
export type ChordDetectionMode = 'sequential' | 'simultaneous'

export interface SustainedNoteOptions {
  confirmDuration?: number
  maxGap?: number
  cooldownMs?: number
}

export interface PitchDetectorOptions {
  clarityThreshold?: number
  minFreq?: number
  maxFreq?: number
}
