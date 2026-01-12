export type AppState = 'MENU' | 'TRANSITIONING' | 'GAME';

export type EmotionState = 
  | 'Comfort' 
  | 'Tranquil' 
  | 'Anxiety' 
  | 'Fear' 
  | 'Panic';

export interface ParticleConfig {
  count: number;
  speed: number;
  connectionDistance: number;
  particleSize: number;
  baseOpacity: number;
  lineThickness: number;
  interactive: boolean;
}

export interface PointStats {
  status: EmotionState;
  energy: number;
  score: number;
}

export interface Choice {
  label: string;
  reaction: string;
}

export interface DialogueEntry {
  text: string;
  choices: Choice[];
}