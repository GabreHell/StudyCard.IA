import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractLocalFlashcards } from './src/utils/flashcards';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get Gemini client safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Flashcards generation API endpoint
app.post('/api/generate-flashcards', async (req: Request, res: Response) => {
  try {
    const { text, targetCount } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        error: 'Por favor, insira algum texto ou apontamentos para gerar flashcards.',
      });
    }

    const trimmedText = text.trim();
    const count = typeof targetCount === 'number' && targetCount > 0 ? targetCount : 8;

    const ai = getGeminiClient();

    if (!ai) {
      // Offline / Local heuristic extraction fallback
      const localCards = extractLocalFlashcards(trimmedText);
      if (localCards.length > 0) {
        return res.json({
          source: 'local-heuristic',
          cards: localCards.map((c) => ({
            id: c.id,
            term: c.term,
            definition: c.definition,
            status: 'unviewed',
            category: 'Apontamentos',
          })),
          note: 'Flashcards gerados usando o analisador inteligente integrado.',
        });
      }

      // If text is freeform without explicit delimiters, create chunk-based cards
      const paragraphs = trimmedText
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 10);

      const generated = paragraphs.slice(0, 8).map((para, idx) => {
        const sentences = para.split(/[.!?]\s+/).filter(Boolean);
        const term = sentences[0]?.slice(0, 50) || `Conceito ${idx + 1}`;
        const definition = sentences.slice(1).join('. ') || para;
        return {
          id: `card-${Date.now()}-${idx + 1}`,
          term,
          definition: definition.length > 0 ? definition : para,
          status: 'unviewed',
          category: 'Apontamentos',
        };
      });

      return res.json({
        source: 'local-heuristic',
        cards: generated,
        note: 'Flashcards gerados localmente a partir dos parágrafos.',
      });
    }

    // Call Gemini API with structured response
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Extraia os conceitos mais importantes dos seguintes apontamentos de estudo e crie entre 4 e ${count} flashcards excelentes para memorização ativa.\n\nApontamentos:\n"""\n${trimmedText}\n"""`,
      config: {
        systemInstruction:
          'É um especialista pedagógico em flashcards e repetição espaçada. O seu objetivo é extrair conceitos-chave, termos, processos ou fórmulas essenciais do texto do estudante. A "frente" (term) deve ser concisa (termo ou pergunta clara). O "verso" (definition) deve ser a explicação direta, clara e auto-suficiente. Mantenha a mesma língua dos apontamentos (prioritariamente português).',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'Lista de flashcards extraídos com termo e definição',
          items: {
            type: Type.OBJECT,
            properties: {
              term: {
                type: Type.STRING,
                description: 'O termo-chave, conceito, pergunta ou título do cartão (frente).',
              },
              definition: {
                type: Type.STRING,
                description: 'A definição, explicação clara ou resposta do cartão (verso).',
              },
              category: {
                type: Type.STRING,
                description: 'Categoria ou tópico a que pertence o cartão.',
              },
            },
            required: ['term', 'definition'],
          },
        },
      },
    });

    const outputText = response.text?.trim() || '[]';
    let parsedCards: Array<{ term: string; definition: string; category?: string }> = [];

    try {
      parsedCards = JSON.parse(outputText);
    } catch {
      // Fallback in case JSON wrapping has markdown ticks
      const cleanJson = outputText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      parsedCards = JSON.parse(cleanJson);
    }

    if (!Array.isArray(parsedCards) || parsedCards.length === 0) {
      throw new Error('Formato de resposta inesperado do modelo');
    }

    const cards = parsedCards.map((item, index) => ({
      id: `ai-card-${Date.now()}-${index + 1}`,
      term: item.term || `Conceito ${index + 1}`,
      definition: item.definition || 'Sem definição',
      category: item.category || 'Geral',
      status: 'unviewed',
    }));

    return res.json({
      source: 'gemini',
      cards,
    });
  } catch (error: any) {
    console.error('Erro na geração de flashcards:', error);
    // Graceful fallback to local extraction so user experience never breaks
    const fallbackCards = extractLocalFlashcards(req.body.text || '');
    if (fallbackCards.length > 0) {
      return res.json({
        source: 'local-fallback',
        cards: fallbackCards,
        warning: 'Gerado via analisador de texto de reserva devido a indisponibilidade momentânea da IA.',
      });
    }

    return res.status(500).json({
      error: 'Não foi possível gerar os flashcards com o texto fornecido. Tente adicionar mais detalhes ou outro formato.',
      details: error?.message,
    });
  }
});

// Setup dev server with Vite or static production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
