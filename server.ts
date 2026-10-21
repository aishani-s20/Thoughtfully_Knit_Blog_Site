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

// Predetermined natural soundscape recordings available in Thoughtfully Knit
const AVAILABLE_SOUNDSCAPES_PROMPT = `
Predetermined Natural Soundscapes (Authentic nature recordings, zero musical chords):
1. "steady_rain" (Rain Sound - Tags: rain, water, grief, solitude, window, monsoon, roof): Gentle rain sound pattering on roof, leaves, and window glass.
2. "ocean_waves" (Sea Sound - Tags: sea, ocean, waves, shore, coast, cliff, tide, distance): Rhythmic sea waves and coastal surf rolling against the shore and receding.
3. "morning_birds" (Morning Birds Sound - Tags: birds, morning, dawn, meadow, sunlight, trees, spring, hope): Fresh morning songbirds singing in a dawn meadow with a gentle breeze.
4. "night_crickets" (Night Crickets Sound - Tags: night, crickets, darkness, stars, stillness, midnight, silence): Soothing nocturnal field crickets under a quiet starlit sky.
5. "crackling_hearth" (Fireplace & Hearth Sound - Tags: fire, hearth, embers, warmth, craft, wood, winter, cabin): Warm crackling fireplace with burning wood logs and gentle embers.
6. "mountain_wind" (Mountain Wind Sound - Tags: wind, pines, mountain, air, altitude, solitude, stone): Serene mountain wind softly moving through wild pine trees.
`;

// ----------------------------------------------------------------------
// 1. Ingestion Pipeline: Whole-Text Evaluation & Soundscape Selection
// ----------------------------------------------------------------------
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

    const prompt = `Analyze this poetry or literary essay manuscript as a SINGLE COHESIVE WORK for the "Thoughtfully Knit" publication platform.

DO NOT divide the text into stanzas or chop it up. Treat the entire manuscript as an unbroken literary piece.
DO NOT generate text variations for weather—the author's text must remain completely authentic and unchanged.

Select the SINGLE BEST MATCHING PREDETERMINED SOUNDSCAPE from the curated library below based on the emotional core, imagery, and atmosphere of the entire poem:

${AVAILABLE_SOUNDSCAPES_PROMPT}

Manuscript:
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
            fullText: { type: Type.STRING, description: 'The complete unbroken text of the poem exactly as written, preserving intentional line breaks.' },
            selectedSoundscapeId: {
              type: Type.STRING,
              description: 'Must be one of: steady_rain, ocean_waves, morning_birds, night_crickets, crackling_hearth, mountain_wind',
            },
            soundscapeName: { type: Type.STRING, description: 'Human-readable title of the chosen soundscape' },
            soundscapeRationale: { type: Type.STRING, description: '1-2 sentences explaining why this acoustic soundscape matches the poem' },
            overallMood: { type: Type.STRING, description: '2-4 words summarizing the overall emotional mood' },
          },
          required: [
            'title',
            'subtitle',
            'tags',
            'authorNotes',
            'fullText',
            'selectedSoundscapeId',
            'soundscapeName',
            'soundscapeRationale',
            'overallMood',
          ],
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

// ----------------------------------------------------------------------
// 2. Ask the Archive: Streaming SSE Literary RAG Chat
// ----------------------------------------------------------------------
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, activePoem, poemsContext } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message string is required' });
    }

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    let contextPrompt = `You are the Literary Custodian and Archivist of "Thoughtfully Knit", an interactive publication that weaves poetry, architecture, machine learning, and human sensory experience.\n\n`;

    if (activePoem) {
      contextPrompt += `CURRENTLY OPEN WORK:
Title: "${activePoem.title}" (${activePoem.subtitle})
Acoustic Soundscape: ${activePoem.soundscapeName} (${activePoem.soundscapeRationale})
Author Notes / Hidden Backstory:
${activePoem.authorNotes}

Complete Verse:
${activePoem.fullText}
\n---\n`;
    }

    if (Array.isArray(poemsContext) && poemsContext.length > 0) {
      contextPrompt += `OTHER WORKS IN THE ARCHIVE:\n`;
      poemsContext.forEach((p: { title: string; tags: string[]; authorNotes: string }) => {
        if (p.title !== activePoem?.title) {
          contextPrompt += `- "${p.title}" (Themes: ${p.tags?.join(', ') || 'General'}): ${p.authorNotes?.slice(0, 160)}...\n`;
        }
      });
      contextPrompt += `\n---\n`;
    }

    contextPrompt += `GUIDELINES:
- Speak with quiet literary grace, depth, and precision. Avoid hyperbole or artificial hype.
- When answering questions about meaning, metaphor, or acoustic soundscapes, refer to the author notes and poem themes.
- Emphasize that poetry text is sacred and remains constant, while the ambient soundscape breathes and reacts to the weather outside.`;

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

// ----------------------------------------------------------------------
// 3. Vite Middleware mounting for SPA
// ----------------------------------------------------------------------
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
