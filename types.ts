export type Language = 'TH' | 'EN';

export interface GuessResult {
  word: string;
  score: number; // 0 to 100
  isValid: boolean;
  emoji?: string;
  feedback?: string;
}

export interface GameState {
  targetWord: string;
  isPlaying: boolean;
  hasWon: boolean;
  hintsUsed: number;
}
