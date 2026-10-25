import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Search,
  Check,
  Bookmark,
  Edit2,
  Download,
  Upload,
  Save,
} from 'lucide-react';
import { Flashcard, CardStatus } from '../types';
import { exportDeckToJson, importDeckFromJson } from '../utils/flashcards';

interface DeckSummaryProps {
  cards: Flashcard[];
  activeCardIndex: number;
  onSelectCard: (index: number) => void;
  onClose: () => void;
  onUpdateCardStatus: (id: string, status: CardStatus) => void;
  onDeleteCard: (id: string) => void;
  onAddCard: (term: string, definition: string, category?: string) => void;
  onEditCard: (id: string, term: string, definition: string, category?: string) => void;
  onImportDeck: (cards: Flashcard[]) => void;
}

export const DeckSummary: React.FC<DeckSummaryProps> = ({
  cards,
  activeCardIndex,
  onSelectCard,
  onClose,
  onUpdateCardStatus,
  onDeleteCard,
  onAddCard,
  onEditCard,
  onImportDeck,
}) => {
  const [filter, setFilter] = useState<'all' | 'mastered' | 'review' | 'unviewed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newDef, setNewDef] = useState('');
  const [newCategory, setNewCategory] = useState('');

  // Editing state
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editTerm, setEditTerm] = useState('');
  const [editDef, setEditDef] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // Import error / feedback
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCards = cards.filter((c) => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.term.toLowerCase().includes(q) ||
        c.definition.toLowerCase().includes(q) ||
        (c.category && c.category.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !newDef.trim()) return;
    onAddCard(newTerm.trim(), newDef.trim(), newCategory.trim() || 'Personalizado');
    setNewTerm('');
    setNewDef('');
    setNewCategory('');
    setIsAdding(false);
  };

  const handleStartEdit = (card: Flashcard, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCardId(card.id);
    setEditTerm(card.term);
    setEditDef(card.definition);
    setEditCategory(card.category || '');
  };

  const handleSaveEdit = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editTerm.trim() || !editDef.trim()) return;
    onEditCard(id, editTerm.trim(), editDef.trim(), editCategory.trim() || undefined);
    setEditingCardId(null);
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
  };

  // Export JSON file
  const handleExportJSON = () => {
    const jsonStr = exportDeckToJson(cards);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards-deck-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Trigger file dialog
  const handleTriggerImport = () => {
    fileInputRef.current?.click();
  };

  // File import handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const res = importDeckFromJson(text);
      if (res.success && res.cards) {
        onImportDeck(res.cards);
        setImportFeedback(`Sucesso: ${res.cards.length} flashcards importados!`);
        setTimeout(() => setImportFeedback(null), 3000);
      } else {
        setImportFeedback(res.error || 'Erro ao importar ficheiro.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deck-summary-title"
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2
              id="deck-summary-title"
              className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
            >
              Gestor do Baralho ({cards.length})
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Gerencie, edite, adicione ou exporte/importe flashcards
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Export JSON */}
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors cursor-pointer"
              title="Exportar baralho em formato JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar JSON</span>
            </button>

            {/* Import JSON */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={handleTriggerImport}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors cursor-pointer"
              title="Importar ficheiro JSON de flashcards"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Importar JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ml-1"
              aria-label="Fechar lista"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Import Feedback Toast */}
        {importFeedback && (
          <div className="px-6 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-200">
            {importFeedback}
          </div>
        )}

        {/* Toolbar: Search, Filters, Add */}
        <div className="px-6 py-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar termo ou definição..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {(
              [
                { id: 'all', label: 'Todos' },
                { id: 'mastered', label: 'Dominados' },
                { id: 'review', label: 'Rever' },
                { id: 'unviewed', label: 'Por Estudar' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  filter === item.id
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="ml-auto sm:ml-2 flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Novo</span>
            </button>
          </div>
        </div>

        {/* Add Card Inline Form */}
        {isAdding && (
          <form
            onSubmit={handleCreateCard}
            className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 flex flex-col gap-2.5"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Termo / Pergunta (Frente)"
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                autoFocus
              />
              <input
                type="text"
                placeholder="Categoria (Opcional)"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full sm:w-36 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
              <button
                type="submit"
                disabled={!newTerm.trim() || !newDef.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 disabled:opacity-40"
              >
                Adicionar
              </button>
            </div>
            <textarea
              placeholder="Definição / Resposta (Verso)"
              value={newDef}
              onChange={(e) => setNewDef(e.target.value)}
              rows={2}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 resize-none"
            />
          </form>
        )}

        {/* Card Items List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {filteredCards.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-xs">
              Nenhum flashcard encontrado para este filtro.
            </div>
          ) : (
            filteredCards.map((card) => {
              const originalIndex = cards.findIndex((c) => c.id === card.id);
              const isActive = originalIndex === activeCardIndex;
              const isEditing = editingCardId === card.id;

              if (isEditing) {
                return (
                  <form
                    key={card.id}
                    onSubmit={(e) => handleSaveEdit(card.id, e)}
                    className="py-3 px-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl my-1 border border-zinc-300 dark:border-zinc-700 flex flex-col gap-2"
                  >
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={editTerm}
                        onChange={(e) => setEditTerm(e.target.value)}
                        placeholder="Termo"
                        className="flex-1 px-2.5 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        placeholder="Categoria"
                        className="w-full sm:w-32 px-2.5 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <textarea
                      value={editDef}
                      onChange={(e) => setEditDef(e.target.value)}
                      placeholder="Definição"
                      rows={2}
                      className="w-full px-2.5 py-1 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={!editTerm.trim() || !editDef.trim()}
                        className="flex items-center gap-1 px-3 py-1 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs rounded font-medium disabled:opacity-40"
                      >
                        <Save className="w-3 h-3" /> Salvar
                      </button>
                    </div>
                  </form>
                );
              }

              return (
                <div
                  key={card.id}
                  className={`py-3 px-3 rounded-xl transition-all flex items-start justify-between gap-3 ${
                    isActive
                      ? 'bg-zinc-100/90 dark:bg-zinc-800/90 ring-1 ring-zinc-300 dark:ring-zinc-700'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-850/50'
                  }`}
                >
                  <div
                    onClick={() => {
                      onSelectCard(originalIndex);
                      onClose();
                    }}
                    className="flex-1 cursor-pointer pr-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                        {card.term}
                      </span>
                      {card.category && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-400">
                          {card.category}
                        </span>
                      )}
                      {isActive && (
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                          (Atual)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {card.definition}
                    </p>
                  </div>

                  {/* Actions: Status toggles, Edit and Delete */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    <button
                      onClick={() =>
                        onUpdateCardStatus(
                          card.id,
                          card.status === 'review' ? 'unviewed' : 'review'
                        )
                      }
                      className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        card.status === 'review'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400'
                      }`}
                      title="Alternar estado Rever"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() =>
                        onUpdateCardStatus(
                          card.id,
                          card.status === 'mastered' ? 'unviewed' : 'mastered'
                        )
                      }
                      className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        card.status === 'mastered'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                      }`}
                      title="Alternar estado Dominado"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleStartEdit(card, e)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                      title="Editar cartão"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteCard(card.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="Eliminar cartão"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
