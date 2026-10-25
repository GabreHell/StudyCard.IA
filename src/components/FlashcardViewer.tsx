import React from 'react';
import { RotateCw, CheckCircle2, Bookmark, Volume2 } from 'lucide-react';
import { Flashcard } from '../types';
import { speakText, isSpeechSupported } from '../utils/speech';

interface FlashcardViewerProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  currentIndex: number;
  totalCards: number;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({
  card,
  isFlipped,
  onFlip,
  currentIndex,
  totalCards,
}) => {
  const speechAvailable = isSpeechSupported();

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speakText(text);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Meta info */}
      <div className="w-full max-w-xl flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2 px-1">
        <span className="font-mono">
          Cartão {currentIndex + 1} de {totalCards}
        </span>

        {/* Status Pill */}
        <div className="flex items-center gap-1.5">
          {card.status === 'mastered' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <CheckCircle2 className="w-3 h-3" /> Dominado
            </span>
          )}
          {card.status === 'review' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              <Bookmark className="w-3 h-3" /> Rever
            </span>
          )}
          {card.status === 'unviewed' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              Por estudar
            </span>
          )}
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        className="w-full max-w-xl h-72 sm:h-80 perspective-1000 cursor-pointer select-none"
        onClick={onFlip}
        role="button"
        tabIndex={0}
        aria-label={`Flashcard: ${card.term}. ${isFlipped ? 'Mostrando definição (verso)' : 'Mostrando termo (frente)'}. Clique ou prima espaço para virar.`}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onFlip();
          }
        }}
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ease-out ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT SIDE (Term / Concept) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl p-6 sm:p-8 flex flex-col justify-between border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            {/* Top Subhead & Speech button */}
            <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-medium">
              <span>{card.category || 'Termo'}</span>
              <div className="flex items-center gap-2">
                {speechAvailable && (
                  <button
                    type="button"
                    onClick={(e) => handleSpeak(e, card.term)}
                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    aria-label="Ouvir termo por voz sintetizada"
                    title="Ouvir termo (Áudio)"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className="flex items-center gap-1">
                  <RotateCw className="w-3 h-3" /> Frente
                </span>
              </div>
            </div>

            {/* Main Term */}
            <div className="my-auto text-center px-2 sm:px-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug">
                {card.term}
              </h2>
            </div>

            {/* Bottom Hint */}
            <div className="text-center">
              <span className="text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500">
                Clique no cartão ou prima <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px] text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">Espaço</kbd> para virar
              </span>
            </div>
          </div>

          {/* BACK SIDE (Definition / Explanation) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl p-6 sm:p-8 flex flex-col justify-between border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            {/* Top Subhead & Speech button */}
            <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-medium">
              <span>Definição & Conceito</span>
              <div className="flex items-center gap-2">
                {speechAvailable && (
                  <button
                    type="button"
                    onClick={(e) => handleSpeak(e, card.definition)}
                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    aria-label="Ouvir definição por voz sintetizada"
                    title="Ouvir definição (Áudio)"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <RotateCw className="w-3 h-3" /> Verso
                </span>
              </div>
            </div>

            {/* Definition Content */}
            <div className="my-auto px-2 sm:px-4 overflow-y-auto max-h-44 sm:max-h-52">
              <p className="text-base sm:text-lg text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal text-center sm:text-left">
                {card.definition}
              </p>
            </div>

            {/* Bottom Term Reminder */}
            <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 border-t border-zinc-200/60 dark:border-zinc-800/80 pt-2.5">
              <span className="truncate max-w-[200px] font-medium text-zinc-500 dark:text-zinc-400">
                {card.term}
              </span>
              <span>Prima Espaço para voltar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
