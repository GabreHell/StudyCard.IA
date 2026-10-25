import React from 'react';
import { Sun, Moon, PlusCircle, Layers, Sparkles } from 'lucide-react';
import { DeckProgress, Theme, Flashcard } from '../types';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  progress: DeckProgress;
  cards: Flashcard[];
  onOpenNotes: () => void;
  onToggleOverview: () => void;
  isOverviewOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  progress,
  cards,
  onOpenNotes,
  onToggleOverview,
  isOverviewOpen,
}) => {
  return (
    <header className="border-b transition-colors duration-200 border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-semibold text-sm shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">
                Flashcards
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Memorização Ativa & IA
              </p>
            </div>
          </div>

          {/* Mobile Theme Toggle Button */}
          <div className="sm:hidden flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
              title={theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Center: Progress Indicator as requested ("2/8 mastered") with Segmented Bar */}
        <div className="flex flex-col items-center justify-center w-full sm:w-auto">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide font-mono"
              aria-live="polite"
              data-testid="deck-progress-text"
            >
              {progress.summaryText}
            </span>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
              ({progress.progressPercent}%)
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div
            className="w-48 sm:w-64 flex items-center gap-1 h-2 px-0.5"
            role="progressbar"
            aria-valuenow={progress.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso de estudo segmentado do baralho"
          >
            {cards.length > 0 ? (
              cards.map((c, i) => (
                <div
                  key={c.id || i}
                  title={`${c.term}: ${
                    c.status === 'mastered'
                      ? 'Dominado'
                      : c.status === 'review'
                      ? 'Rever'
                      : 'Por estudar'
                  }`}
                  className={`flex-1 h-full rounded-full transition-all duration-300 ${
                    c.status === 'mastered'
                      ? 'bg-emerald-500 dark:bg-emerald-400'
                      : c.status === 'review'
                      ? 'bg-amber-400 dark:bg-amber-500'
                      : 'bg-zinc-200 dark:bg-zinc-800'
                  }`}
                />
              ))
            ) : (
              <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            )}
          </div>
        </div>

        {/* Right Actions: Notes, Overview, Theme */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onOpenNotes}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            aria-label="Inserir texto ou gerar novos flashcards"
          >
            <PlusCircle className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Apontamentos</span>
          </button>

          <button
            onClick={onToggleOverview}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              isOverviewOpen
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            aria-label="Alternar gestão e lista dos cartões"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Gestor</span>
          </button>

          {/* Desktop Theme Toggle */}
          <div className="hidden sm:block pl-1 border-l border-zinc-200 dark:border-zinc-800">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              aria-label={theme === 'light' ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro'}
              title={theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
