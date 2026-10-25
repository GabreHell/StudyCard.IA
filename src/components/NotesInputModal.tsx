import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Loader2, ArrowRight } from 'lucide-react';
import { SAMPLE_STUDY_NOTES } from '../utils/sampleData';

interface NotesInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (text: string, count: number) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export const NotesInputModal: React.FC<NotesInputModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isLoading,
  error,
}) => {
  const [inputText, setInputText] = useState('');
  const [cardCount, setCardCount] = useState(8);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    await onGenerate(inputText, cardCount);
  };

  const handleLoadSample = (sampleText: string) => {
    setInputText(sampleText);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notes-modal-title"
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <h2
                id="notes-modal-title"
                className="text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-tight"
              >
                Gerar Flashcards de Apontamentos
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Cole os seus textos de estudo ou use um exemplo temático
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto flex flex-col gap-4">
          {/* Preset Samples */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Exemplos rápidos de apontamentos:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_STUDY_NOTES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadSample(sample.text)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors cursor-pointer"
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div className="flex flex-col gap-1.5 flex-1">
            <label
              htmlFor="notes-textarea"
              className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              Os seus apontamentos ou resumo de estudo:
            </label>
            <textarea
              id="notes-textarea"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Cole aqui o texto dos seus apontamentos, resumos, definições ou tópicos...&#10;&#10;Exemplo:&#10;Mitocôndria: Organelo responsável pela respiração celular aeróbia e produção de ATP.&#10;Cloroplasto: Estrutura celular onde ocorre a fotossíntese."
              rows={8}
              className="w-full px-3.5 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all resize-y font-sans leading-relaxed"
            />
            <div className="flex justify-between items-center text-[11px] text-zinc-400 dark:text-zinc-500 px-1">
              <span>A IA do Gemini extrai os termos essenciais e as respetivas definições.</span>
              <span>{inputText.length} caracteres</span>
            </div>
          </div>

          {/* Target Quantity Selector */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
            <div>
              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 block">
                Quantidade pretendida de cartões
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Selecione o tamanho ideal do baralho
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[5, 8, 12, 15].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCardCount(num)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    cardCount === num
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A extrair conceitos...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Flashcards</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
