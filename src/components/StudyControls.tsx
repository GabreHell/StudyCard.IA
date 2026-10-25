import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  RotateCcw,
  Shuffle,
  Filter,
} from 'lucide-react';
import { CardStatus } from '../types';

interface StudyControlsProps {
  currentStatus: CardStatus;
  onMarkStatus: (status: 'review' | 'mastered') => void;
  onNext: () => void;
  onPrev: () => void;
  onShuffle?: () => void;
  onResetProgress?: () => void;
  hasCards: boolean;
  studyFilter: 'all' | 'review' | 'mastered' | 'unviewed';
  onSetStudyFilter: (filter: 'all' | 'review' | 'mastered' | 'unviewed') => void;
  counts: { all: number; review: number; mastered: number; unviewed: number };
}

export const StudyControls: React.FC<StudyControlsProps> = ({
  currentStatus,
  onMarkStatus,
  onNext,
  onPrev,
  onShuffle,
  onResetProgress,
  hasCards,
  studyFilter,
  onSetStudyFilter,
  counts,
}) => {
  return (
    <div className="w-full max-w-xl flex flex-col gap-3 mt-4">
      {/* Primary Actions: Navigation & Status */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* Previous Button */}
        <button
          onClick={onPrev}
          disabled={!hasCards}
          className="flex items-center justify-center gap-1 px-3 sm:px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-xs sm:text-sm font-medium shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Cartão Anterior (tecla ←)"
          title="Anterior (←)"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden xs:inline">Anterior</span>
        </button>

        {/* Status Marking Buttons (Center) */}
        <div className="flex items-center gap-2 flex-1 justify-center max-w-xs">
          {/* Rever Button */}
          <button
            onClick={() => onMarkStatus('review')}
            disabled={!hasCards}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer ${
              currentStatus === 'review'
                ? 'bg-amber-500 text-white ring-2 ring-amber-500/20 dark:bg-amber-600'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-950/70'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label="Marcar cartão como Rever (tecla 1 ou R)"
            title="Marcar como Rever (1 ou R)"
          >
            <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Rever</span>
          </button>

          {/* Dominado Button */}
          <button
            onClick={() => onMarkStatus('mastered')}
            disabled={!hasCards}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer ${
              currentStatus === 'mastered'
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-600/20 dark:bg-emerald-500'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-950/70'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label="Marcar cartão como Dominado (tecla 2, D ou M)"
            title="Marcar como Dominado (2, D ou M)"
          >
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Dominado</span>
          </button>
        </div>

        {/* Next Button */}
        <button
          onClick={onNext}
          disabled={!hasCards}
          className="flex items-center justify-center gap-1 px-3 sm:px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-xs sm:text-sm font-medium shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Próximo Cartão (tecla →)"
          title="Próximo (→)"
        >
          <span className="hidden xs:inline">Próximo</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Focus Study Filters: Todos, A Rever, Dominados, Por Estudar */}
      <div className="flex items-center justify-center gap-1.5 pt-1 text-xs overflow-x-auto">
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Foco:
        </span>
        {(
          [
            { id: 'all', label: 'Todos', count: counts.all },
            { id: 'review', label: 'A Rever', count: counts.review },
            { id: 'mastered', label: 'Dominados', count: counts.mastered },
            { id: 'unviewed', label: 'Por Estudar', count: counts.unviewed },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSetStudyFilter(tab.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              studyFilter === tab.id
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1 rounded-full ${
                studyFilter === tab.id
                  ? 'bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900'
                  : 'bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Auxiliary bar: Keyboard hint & Deck utilities */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 px-1 pt-0.5 border-t border-zinc-100 dark:border-zinc-850">
        <div className="flex items-center gap-3">
          {onShuffle && (
            <button
              onClick={onShuffle}
              disabled={!hasCards}
              className="hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1 transition-colors disabled:opacity-40 cursor-pointer"
              title="Baralhar cartões"
            >
              <Shuffle className="w-3 h-3" />
              <span>Baralhar</span>
            </button>
          )}

          {onResetProgress && (
            <button
              onClick={onResetProgress}
              disabled={!hasCards}
              className="hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1 transition-colors disabled:opacity-40 cursor-pointer"
              title="Reiniciar estatísticas de estudo"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reiniciar</span>
            </button>
          )}
        </div>

        {/* Shortcuts quick legend */}
        <div className="hidden sm:flex items-center gap-2 text-zinc-400">
          <span>Atalhos:</span>
          <span className="font-mono">← / →</span>
          <span>Navegar</span>
          <span className="font-mono">1 / R</span>
          <span>Rever</span>
          <span className="font-mono">2 / D</span>
          <span>Dominado</span>
        </div>
      </div>
    </div>
  );
};
