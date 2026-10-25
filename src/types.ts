export type CardStatus = 'unviewed' | 'review' | 'mastered';

export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  status: CardStatus;
  category?: string;
}

export type Theme = 'light' | 'dark';

export interface DeckProgress {
  total: number;
  mastered: number;
  review: number;
  unviewed: number;
  progressPercent: number;
  summaryText: string;
}
