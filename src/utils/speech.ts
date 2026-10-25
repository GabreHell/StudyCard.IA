/**
 * Speech synthesis utility for reading flashcard terms and definitions.
 */

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakText(text: string, lang = 'pt-PT'): void {
  if (!isSpeechSupported() || !text || !text.trim()) return;

  try {
    window.speechSynthesis.cancel(); // Stop any active speech

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = lang;
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.0;

    // Try to find a matching voice if voices are loaded
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const ptVoice =
        voices.find((v) => v.lang.startsWith('pt')) ||
        voices.find((v) => v.lang.includes('PT') || v.lang.includes('BR')) ||
        voices[0];
      if (ptVoice) {
        utterance.voice = ptVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis not available or failed:', err);
  }
}

export function stopSpeaking(): void {
  if (isSpeechSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}
