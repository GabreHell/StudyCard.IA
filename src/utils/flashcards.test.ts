import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractLocalFlashcards,
  calculateDeckProgress,
  getNextCardIndex,
  filterStudyCards,
  exportDeckToJson,
  importDeckFromJson,
  Flashcard,
} from './flashcards';

test('extractLocalFlashcards correctly parses colon and hyphen delimited notes', () => {
  const notes = `
  Mitocôndria: Organelo celular responsável pela produção de ATP e respiração celular.
  Cloroplasto - Organelo onde ocorre a fotossíntese nas células vegetais.
  Ribossomo: Sintetiza proteínas a partir do RNA mensageiro.
  `;
  const cards = extractLocalFlashcards(notes);
  assert.equal(cards.length, 3);
  assert.equal(cards[0].term, 'Mitocôndria');
  assert.equal(
    cards[0].definition,
    'Organelo celular responsável pela produção de ATP e respiração celular.'
  );
  assert.equal(cards[1].term, 'Cloroplasto');
  assert.equal(cards[0].status, 'unviewed');
});

test('extractLocalFlashcards handles empty or whitespace text gracefully', () => {
  assert.deepEqual(extractLocalFlashcards(''), []);
  assert.deepEqual(extractLocalFlashcards('   \n  \n'), []);
});

test('calculateDeckProgress accurately calculates percentages and counts', () => {
  const cards: Flashcard[] = [
    { id: '1', term: 'A', definition: 'Def A', status: 'mastered' },
    { id: '2', term: 'B', definition: 'Def B', status: 'mastered' },
    { id: '3', term: 'C', definition: 'Def C', status: 'review' },
    { id: '4', term: 'D', definition: 'Def D', status: 'unviewed' },
  ];

  const progress = calculateDeckProgress(cards);
  assert.equal(progress.total, 4);
  assert.equal(progress.mastered, 2);
  assert.equal(progress.review, 1);
  assert.equal(progress.unviewed, 1);
  assert.equal(progress.progressPercent, 50);
  assert.equal(progress.summaryText, '2/4 dominados');
});

test('getNextCardIndex cycles forward and backward safely', () => {
  assert.equal(getNextCardIndex(0, 3, 'next'), 1);
  assert.equal(getNextCardIndex(2, 3, 'next'), 0);
  assert.equal(getNextCardIndex(0, 3, 'prev'), 2);
  assert.equal(getNextCardIndex(1, 3, 'prev'), 0);
  assert.equal(getNextCardIndex(0, 0, 'next'), 0);
});

test('filterStudyCards filters deck correctly by status', () => {
  const cards: Flashcard[] = [
    { id: '1', term: 'A', definition: 'Def A', status: 'mastered' },
    { id: '2', term: 'B', definition: 'Def B', status: 'review' },
    { id: '3', term: 'C', definition: 'Def C', status: 'unviewed' },
  ];
  assert.equal(filterStudyCards(cards, 'all').length, 3);
  assert.equal(filterStudyCards(cards, 'review').length, 1);
  assert.equal(filterStudyCards(cards, 'review')[0].term, 'B');
  assert.equal(filterStudyCards(cards, 'mastered').length, 1);
  assert.equal(filterStudyCards(cards, 'unviewed').length, 1);
});

test('exportDeckToJson and importDeckFromJson roundtrip successfully', () => {
  const cards: Flashcard[] = [
    { id: '1', term: 'Célula', definition: 'Unidade fundamental da vida', status: 'mastered', category: 'Biologia' },
    { id: '2', term: 'Átomo', definition: 'Menor unidade da matéria', status: 'review', category: 'Química' },
  ];
  const jsonStr = exportDeckToJson(cards);
  assert.ok(jsonStr.includes('Célula'));

  const result = importDeckFromJson(jsonStr);
  assert.equal(result.success, true);
  assert.equal(result.cards?.length, 2);
  assert.equal(result.cards?.[0].term, 'Célula');
  assert.equal(result.cards?.[0].status, 'mastered');
});

test('importDeckFromJson rejects invalid JSON gracefully', () => {
  const invalidResult = importDeckFromJson('{ invalid json');
  assert.equal(invalidResult.success, false);
  assert.ok(invalidResult.error);

  const emptyArrayResult = importDeckFromJson('[]');
  assert.equal(emptyArrayResult.success, false);
});

