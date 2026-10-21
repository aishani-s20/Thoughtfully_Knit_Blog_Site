import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side initialization of Gemini client with User-Agent telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// 1. Ingestion Pipeline: Stanza Splitting & 2D Sentiment Scoring
// -------------------------------------------------------------
app.post('/api/gemini/ingest', async (req, res) => {
  try {
    const { rawMarkdown } = req.body;
    if (!rawMarkdown || typeof rawMarkdown !== 'string') {
      return res.status(400).json({ error: 'rawMarkdown string is required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
      });
    }

    const prompt = `Analyze this poetry or essay manuscript for the "Thoughtfully Knit" publication platform.
Extract metadata, split into distinct stanzas, and compute 2D emotional sentiment coordinates for ambient generative audio.

Coordinates:
- Valence: float from -1.0 (melancholic, dark, grief, existential) to +1.0 (bright, joyful, serene, transcendent)
- Arousal: float from 0.0 (still, muted, quiet, whispered) to 1.0 (intense, kinetic, stormy, loud)
- Dominant emotion: 2-3 words (e.g. "Contemplative Rain", "Quiet Resignation", "Luminous Hope")
- Musical Key: Suggested musical key for ambient chord mapping (e.g., "D Minor 9th", "F Lydian", "A Dorian")

Also generate atmospheric weather-adapted variations for each stanza (Rain, Clear, Night, Fog) that preserve the rhythm and meaning while subtly altering imagery.

Manuscript content:
${rawMarkdown}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            authorNotes: { type: Type.STRING },
            stanzas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  index: { type: Type.INTEGER },
                  baseText: { type: Type.STRING },
                  weatherVariants: {
                    type: Type.OBJECT,
                    properties: {
                      rain: { type: Type.STRING },
                      clear: { type: Type.STRING },
                      night: { type: Type.STRING },
                      fog: { type: Type.STRING },
                    },
                  },
                  sentiment: {
                    type: Type.OBJECT,
                    properties: {
                      valence: { type: Type.NUMBER },
                      arousal: { type: Type.NUMBER },
                      dominantEmotion: { type: Type.STRING },
                      musicalKey: { type: Type.STRING },
                    },
                    required: ['valence', 'arousal', 'dominantEmotion', 'musicalKey'],
                  },
                },
                required: ['index', 'baseText', 'sentiment'],
              },
            },
          },
          required: ['title', 'subtitle', 'tags', 'stanzas'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: unknown) {
    console.error('Ingestion error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown ingestion error';
    return res.status(500).json({ error: msg });
  }
});

// -------------------------------------------------------------
// 2. Ask the Archive: Streaming SSE Literary RAG Chat
// -------------------------------------------------------------
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, activePoem, poemsContext } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message string is required' });
    }

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    // Prepare contextual literature prompt
    let contextPrompt = `You are the Literary Custodian and Archivist of "Thoughtfully Knit", an interactive publication that weaves poetry, architecture, machine learning, and human sensory experience.\n\n`;

    if (activePoem) {
      contextPrompt += `CURRENTLY OPEN POEM:
Title: "${activePoem.title}" (${activePoem.subtitle})
Author Notes / Hidden Backstory:
${activePoem.authorNotes}

Stanzas:
${activePoem.stanzas?.map((s: { index: number; baseText: string }) => `[Stanza ${s.index + 1}]\n${s.baseText}`).join('\n\n')}
\n---\n`;
    }

    if (Array.isArray(poemsContext) && poemsContext.length > 0) {
      contextPrompt += `OTHER POEMS IN THE ARCHIVE:\n`;
      poemsContext.forEach((p: { title: string; tags: string[]; authorNotes: string }) => {
        if (p.title !== activePoem?.title) {
          contextPrompt += `- "${p.title}" (Themes: ${p.tags?.join(', ') || 'General'}): ${p.authorNotes?.slice(0, 180)}...\n`;
        }
      });
      contextPrompt += `\n---\n`;
    }

    contextPrompt += `GUIDELINES:
- Speak with quiet literary grace, depth, and precision. Avoid hyperbole or marketing jargon.
- When answering questions about meaning, metaphor, or imagery, cite specific stanzas and author notes where relevant.
- Address questions thoughtfully, whether about the philosophy of the poem, the sensory soundscapes, the weather variations, or the craft of writing.`;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ],
      config: {
        systemInstruction: contextPrompt,
        temperature: 0.7,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: unknown) {
    console.error('Chat error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    if (!res.headersSent) {
      res.status(500).json({ error: msg });
    } else {
      res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
      res.end();
    }
  }
});

// -------------------------------------------------------------
// 3. Vite Middleware mounting for SPA
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Thoughtfully Knit full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
