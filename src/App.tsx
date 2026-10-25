/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { FlashcardViewer } from './components/FlashcardViewer';
import { StudyControls } from './components/StudyControls';
import { NotesInputModal } from './components/NotesInputModal';
import { DeckSummary } from './components/DeckSummary';
import { Flashcard, Theme, CardStatus } from './types';
import {
  calculateDeckProgress,
  getNextCardIndex,
  extractLocalFlashcards,
  filterStudyCards,
} from './utils/flashcards';
import { SAMPLE_STUDY_NOTES } from './utils/sampleData';
import { Trophy, BookOpen, PlusCircle, Filter } from 'lucide-react';

const STORAGE_KEY_CARDS = 'flashcards_app_cards_v1';
const STORAGE_KEY_THEME = 'flashcards_app_theme_v1';

export default function App() {
  // Theme state: dark / light
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  // Flashcards state
  const [cards, setCards] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CARDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback to initial deck
    }
    // Default initial seed deck based on Biology sample
    return extractLocalFlashcards(SAMPLE_STUDY_NOTES[0].text);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyFilter, setStudyFilter] = useState<'all' | 'review' | 'mastered' | 'unviewed'>('all');
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Sync theme to HTML document root class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  // Persist cards in localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cards));
  }, [cards]);

  // Toggle Light / Dark theme
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Filtered study cards based on active studyFilter
  const activeStudyCards = useMemo(() => {
    return filterStudyCards(cards, studyFilter);
  }, [cards, studyFilter]);

  // Ensure currentIndex stays within bounds when list shrinks
  useEffect(() => {
    if (currentIndex >= activeStudyCards.length && activeStudyCards.length > 0) {
      setCurrentIndex(activeStudyCards.length - 1);
    }
  }, [activeStudyCards.length, currentIndex]);

  // Flip card
  const handleFlipCard = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Navigation
  const handleNextCard = useCallback(() => {
    if (activeStudyCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => getNextCardIndex(prev, activeStudyCards.length, 'next'));
  }, [activeStudyCards.length]);

  const handlePrevCard = useCallback(() => {
    if (activeStudyCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => getNextCardIndex(prev, activeStudyCards.length, 'prev'));
  }, [activeStudyCards.length]);

  // Mark status: 'review' or 'mastered'
  const handleMarkStatus = useCallback(
    (newStatus: 'review' | 'mastered') => {
      if (activeStudyCards.length === 0) return;
      const targetCard = activeStudyCards[currentIndex];
      if (!targetCard) return;

      const nextStatus: CardStatus =
        targetCard.status === newStatus ? 'unviewed' : newStatus;

      setCards((prev) =>
        prev.map((c) => (c.id === targetCard.id ? { ...c, status: nextStatus } : c))
      );

      // Auto-advance to next card for fluid studying
      setTimeout(() => {
        handleNextCard();
      }, 200);
    },
    [activeStudyCards, currentIndex, handleNextCard]
  );

  // Keyboard navigation & spacebar listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keyboard shortcuts if inside an input or textarea or modal is open
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        isNotesModalOpen ||
        isOverviewOpen
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlipCard();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      } else if (e.key === 'r' || e.key === 'R' || e.key === '1') {
        e.preventDefault();
        handleMarkStatus('review');
      } else if (
        e.key === 'm' ||
        e.key === 'M' ||
        e.key === 'd' ||
        e.key === 'D' ||
        e.key === '2'
      ) {
        e.preventDefault();
        handleMarkStatus('mastered');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleFlipCard,
    handleNextCard,
    handlePrevCard,
    handleMarkStatus,
    isNotesModalOpen,
    isOverviewOpen,
  ]);

  // Generate flashcards from text via Gemini API endpoint
  const handleGenerateFlashcards = async (text: string, count: number) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetCount: count }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Erro do servidor ao gerar flashcards (${response.status})`
        );
      }

      const data = await response.json();
      if (!data.cards || !Array.isArray(data.cards) || data.cards.length === 0) {
        throw new Error('Nenhum flashcard pôde ser gerado a partir do texto.');
      }

      setCards(data.cards);
      setStudyFilter('all');
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsNotesModalOpen(false);
    } catch (err: any) {
      console.error('Falha ao gerar flashcards:', err);
      // Fallback: extract locally so the user always succeeds
      const localCards = extractLocalFlashcards(text);
      if (localCards.length > 0) {
        setCards(localCards);
        setStudyFilter('all');
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsNotesModalOpen(false);
      } else {
        setApiError(
          err.message ||
            'Não foi possível gerar flashcards. Tente introduzir mais detalhes nos seus apontamentos.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Shuffle deck
  const handleShuffleDeck = () => {
    if (cards.length <= 1) return;
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Reset progress stats
  const handleResetProgress = () => {
    setCards((prev) => prev.map((c) => ({ ...c, status: 'unviewed' })));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Card list management
  const handleUpdateCardStatus = (id: string, status: CardStatus) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const handleDeleteCard = (id: string) => {
    setCards((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      return filtered;
    });
  };

  const handleAddCustomCard = (
    term: string,
    definition: string,
    category?: string
  ) => {
    const newCard: Flashcard = {
      id: `custom-card-${Date.now()}`,
      term,
      definition,
      category: category || 'Personalizado',
      status: 'unviewed',
    };
    setCards((prev) => [newCard, ...prev]);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleEditCard = (
    id: string,
    term: string,
    definition: string,
    category?: string
  ) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, term, definition, category: category || c.category } : c
      )
    );
  };

  const handleImportDeck = (newCards: Flashcard[]) => {
    setCards(newCards);
    setStudyFilter('all');
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Progress metrics
  const progress = useMemo(() => calculateDeckProgress(cards), [cards]);
  const currentCard = activeStudyCards[currentIndex];
  const isDeckComplete =
    progress.total > 0 && progress.mastered === progress.total;

  const counts = useMemo(
    () => ({
      all: cards.length,
      review: cards.filter((c) => c.status === 'review').length,
      mastered: cards.filter((c) => c.status === 'mastered').length,
      unviewed: cards.filter((c) => c.status === 'unviewed').length,
    }),
    [cards]
  );

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Top Header */}
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        progress={progress}
        cards={cards}
        onOpenNotes={() => setIsNotesModalOpen(true)}
        onToggleOverview={() => setIsOverviewOpen((prev) => !prev)}
        isOverviewOpen={isOverviewOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-4xl w-full mx-auto">
        {cards.length === 0 ? (
          /* Empty State */
          <div className="w-full max-w-md text-center py-12 px-6 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
            <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              Nenhum flashcard no baralho
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5 leading-relaxed">
              Cole os seus apontamentos de aula, resumos ou use um dos nossos
              exemplos para começar a memorização ativa.
            </p>
            <button
              onClick={() => setIsNotesModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Inserir Apontamentos</span>
            </button>
          </div>
        ) : activeStudyCards.length === 0 ? (
          /* Empty Filter State */
          <div className="w-full max-w-md text-center py-10 px-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <Filter className="w-8 h-8 mx-auto text-zinc-400 dark:text-zinc-500 mb-3" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              Nenhum cartão com o filtro selecionado
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              {studyFilter === 'review'
                ? 'Excelente! Não há nenhum cartão marcado para rever no momento.'
                : studyFilter === 'mastered'
                ? 'Ainda não dominou nenhum cartão. Continue a praticar!'
                : 'Todos os cartões já foram estudados ou classificados.'}
            </p>
            <button
              onClick={() => setStudyFilter('all')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-colors cursor-pointer"
            >
              Ver Todos os Cartões ({cards.length})
            </button>
          </div>
        ) : (
          /* Active Flashcard Study View */
          <div className="w-full flex flex-col items-center">
            {/* Completion Banner if all mastered */}
            {isDeckComplete && (
              <div
                className="w-full max-w-xl mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 shadow-xs"
                role="status"
              >
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-medium">
                    Excelente! Todos os {cards.length} cartões foram dominados!
                  </span>
                </div>
                <button
                  onClick={handleResetProgress}
                  className="underline hover:text-emerald-700 dark:hover:text-emerald-100 cursor-pointer font-medium"
                >
                  Reiniciar
                </button>
              </div>
            )}

            {/* Flashcard Component */}
            {currentCard && (
              <FlashcardViewer
                card={currentCard}
                isFlipped={isFlipped}
                onFlip={handleFlipCard}
                currentIndex={currentIndex}
                totalCards={activeStudyCards.length}
              />
            )}

            {/* Bottom Study Controls */}
            {currentCard && (
              <StudyControls
                currentStatus={currentCard.status}
                onMarkStatus={handleMarkStatus}
                onNext={handleNextCard}
                onPrev={handlePrevCard}
                onShuffle={handleShuffleDeck}
                onResetProgress={handleResetProgress}
                hasCards={activeStudyCards.length > 0}
                studyFilter={studyFilter}
                onSetStudyFilter={(f) => {
                  setStudyFilter(f);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                counts={counts}
              />
            )}
          </div>
        )}
      </main>

      {/* Notes & Generation Modal */}
      <NotesInputModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        onGenerate={handleGenerateFlashcards}
        isLoading={isLoading}
        error={apiError}
      />

      {/* Deck Overview & Manager Modal */}
      {isOverviewOpen && (
        <DeckSummary
          cards={cards}
          activeCardIndex={currentIndex}
          onSelectCard={(idx) => {
            setStudyFilter('all');
            setCurrentIndex(idx);
            setIsFlipped(false);
          }}
          onClose={() => setIsOverviewOpen(false)}
          onUpdateCardStatus={handleUpdateCardStatus}
          onDeleteCard={handleDeleteCard}
          onAddCard={handleAddCustomCard}
          onEditCard={handleEditCard}
          onImportDeck={handleImportDeck}
        />
      )}
    </div>
  );
}
