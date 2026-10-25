export type CardStatus = 'unviewed' | 'review' | 'mastered';

export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  status: CardStatus;
  category?: string;
}

export interface DeckProgress {
  total: number;
  mastered: number;
  review: number;
  unviewed: number;
  progressPercent: number;
  summaryText: string;
}

/**
 * Parses study notes into flashcards using delimiter and heuristic rules.
 * Used for instant offline card generation or as client-side fallback.
 */
export function extractLocalFlashcards(rawText: string): Flashcard[] {
  if (!rawText || !rawText.trim()) {
    return [];
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const cards: Flashcard[] = [];
  let idCounter = 1;

  for (const line of lines) {
    // Strip leading list bullet symbols like -, *, •, 1., etc.
    const cleaned = line.replace(/^([*•\-–—]|\d+[\.)])\s*/, '').trim();
    if (!cleaned) continue;

    // Check common delimiters: ":", " - ", " – ", " — ", " = ", " -> "
    let delimiterIndex = -1;
    let delimiterLength = 0;

    const delimiters = [' -> ', ' - ', ' – ', ' — ', ' = ', ': '];
    for (const d of delimiters) {
      const idx = cleaned.indexOf(d);
      if (idx > 0 && (delimiterIndex === -1 || idx < delimiterIndex)) {
        delimiterIndex = idx;
        delimiterLength = d.length;
      }
    }

    // Also check single colon if not preceded by http/https
    if (delimiterIndex === -1 && cleaned.includes(':') && !cleaned.includes('://')) {
      const colonIdx = cleaned.indexOf(':');
      if (colonIdx > 0 && colonIdx < cleaned.length - 2) {
        delimiterIndex = colonIdx;
        delimiterLength = 1;
      }
    }

    if (delimiterIndex > 0) {
      const term = cleaned.slice(0, delimiterIndex).trim();
      const definition = cleaned.slice(delimiterIndex + delimiterLength).trim();
      if (term.length > 0 && definition.length > 0) {
        cards.push({
          id: `card-${Date.now()}-${idCounter++}`,
          term,
          definition,
          status: 'unviewed',
        });
        continue;
      }
    }

    // If a sentence has a parenthetical clarification or question mark
    if (cleaned.endsWith('?') && cleaned.length > 5) {
      cards.push({
        id: `card-${Date.now()}-${idCounter++}`,
        term: cleaned,
        definition: 'Reflita sobre esta pergunta nos seus apontamentos.',
        status: 'unviewed',
      });
      continue;
    }

    // If line has format "Word (meaning)", split by first parenthesis
    const parenMatch = cleaned.match(/^([^(]+)\s*\(([^)]+)\)$/);
    if (parenMatch && parenMatch[1].trim() && parenMatch[2].trim()) {
      cards.push({
        id: `card-${Date.now()}-${idCounter++}`,
        term: parenMatch[1].trim(),
        definition: parenMatch[2].trim(),
        status: 'unviewed',
      });
      continue;
    }

    // If line is substantial (e.g. key insight)
    if (cleaned.length > 15 && cleaned.length < 160) {
      // Split into subject (first few words) and remainder
      const words = cleaned.split(/\s+/);
      if (words.length >= 4) {
        const splitPoint = Math.min(3, Math.floor(words.length / 2));
        const term = words.slice(0, splitPoint).join(' ');
        const definition = words.slice(splitPoint).join(' ');
        cards.push({
          id: `card-${Date.now()}-${idCounter++}`,
          term,
          definition,
          status: 'unviewed',
        });
      }
    }
  }

  return cards;
}

/**
 * Calculates current study progress across the deck.
 */
export function calculateDeckProgress(cards: Flashcard[]): DeckProgress {
  const total = cards.length;
  if (total === 0) {
    return {
      total: 0,
      mastered: 0,
      review: 0,
      unviewed: 0,
      progressPercent: 0,
      summaryText: '0/0 dominados',
    };
  }

  const mastered = cards.filter((c) => c.status === 'mastered').length;
  const review = cards.filter((c) => c.status === 'review').length;
  const unviewed = cards.filter((c) => c.status === 'unviewed').length;
  const progressPercent = Math.round((mastered / total) * 100);

  return {
    total,
    mastered,
    review,
    unviewed,
    progressPercent,
    summaryText: `${mastered}/${total} dominados`,
  };
}

/**
 * Returns safe navigation index.
 */
export function getNextCardIndex(
  currentIndex: number,
  total: number,
  direction: 'next' | 'prev'
): number {
  if (total <= 0) return 0;
  if (direction === 'next') {
    return (currentIndex + 1) % total;
  }
  return (currentIndex - 1 + total) % total;
}

/**
 * Filter deck cards according to study focus filter.
 */
export function filterStudyCards(
  cards: Flashcard[],
  filter: 'all' | 'review' | 'mastered' | 'unviewed'
): Flashcard[] {
  if (filter === 'all') return cards;
  return cards.filter((c) => c.status === filter);
}

/**
 * Exports cards as formatted JSON string.
 */
export function exportDeckToJson(cards: Flashcard[]): string {
  return JSON.stringify(cards, null, 2);
}

/**
 * Validates and imports cards from JSON string.
 */
export function importDeckFromJson(jsonString: string): {
  success: boolean;
  cards?: Flashcard[];
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return { success: false, error: 'O ficheiro não contém uma lista válida de cartões.' };
    }

    const validCards: Flashcard[] = [];
    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      if (!item || typeof item.term !== 'string' || !item.term.trim()) {
        continue;
      }
      validCards.push({
        id: item.id && typeof item.id === 'string' ? item.id : `imported-${Date.now()}-${i}`,
        term: item.term.trim(),
        definition: typeof item.definition === 'string' ? item.definition.trim() : '',
        status: item.status === 'mastered' || item.status === 'review' ? item.status : 'unviewed',
        category: typeof item.category === 'string' ? item.category.trim() : 'Importado',
      });
    }

    if (validCards.length === 0) {
      return { success: false, error: 'Nenhum flashcard válido com termo encontrado no ficheiro.' };
    }

    return { success: true, cards: validCards };
  } catch (err: any) {
    return { success: false, error: 'JSON inválido ou corrompido: ' + (err?.message || '') };
  }
}

