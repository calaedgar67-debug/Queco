import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const STOPWORDS = new Set([
  'como',
  'preparar',
  'hacer',
  'receta',
  'casera',
  'casero',
  'caseras',
  'caseros',
  'paso',
  'facil',
  'rapido',
  'rapida',
  'con',
  'sin',
  'para',
  'del',
  'las',
  'los',
  'una',
  'uno',
  'unos',
  'unas',
  'por',
  'olla',
  'sarten',
  'estilo',
  'criollo',
  'criolla',
  'tradicional',
  'hogarena',
  'hogareno',
  'rustico',
  'rustica',
]);

// Cachés en memoria para velocidad instantánea
const queryToVideoIdCache = new Map<string, string>();
const imageBufferCache = new Map<string, { buffer: Buffer; contentType: string }>();

function normalizePlain(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

function extractDishTokens(dishTitle: string): string[] {
  return normalizePlain(dishTitle)
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w))
    .map((w) => (w.endsWith('es') && w.length > 5 ? w.slice(0, -2) : w.endsWith('s') && w.length > 4 ? w.slice(0, -1) : w));
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Tiempo de espera agotado (${label} > ${ms}ms)`));
    }, ms);

    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Busca en YouTube el video culinario cuyo título coincide literalmente con el nombre del plato,
 * penalizando ingredientes ajenos no mencionados (ej. arroz si el plato no lleva arroz) y evitando
 * repetir imágenes entre opciones del mismo menú.
 */
async function resolveBestDishVideoId(
  dishTitle: string,
  excludeIds: Set<string> = new Set()
): Promise<string | null> {
  const normKey = normalizePlain(dishTitle);
  const cached = queryToVideoIdCache.get(normKey);
  if (cached && !excludeIds.has(cached)) {
    return cached;
  }

  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `receta ${dishTitle}`
    )}`;
    const response = await withTimeout(
      fetch(searchUrl, {
        headers: {
          'Accept-Language': 'es-419,es;q=0.9',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
      }),
      3200,
      'youtube-search'
    );

    if (!response.ok) return null;
    const html = await response.text();
    const marker = 'var ytInitialData = ';
    const startIdx = html.indexOf(marker);
    if (startIdx === -1) return null;
    const endIdx = html.indexOf(';</script>', startIdx);
    if (endIdx === -1) return null;

    const data = JSON.parse(html.slice(startIdx + marker.length, endIdx));
    const sectionContents =
      data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer
        ?.contents || [];

    const candidates: { id: string; title: string }[] = [];
    for (const sec of sectionContents) {
      const items = sec?.itemSectionRenderer?.contents || [];
      for (const item of items) {
        const vr = item?.videoRenderer;
        const id = vr?.videoId;
        const vTitle = vr?.title?.runs?.[0]?.text;
        if (typeof id === 'string' && typeof vTitle === 'string' && !excludeIds.has(id)) {
          candidates.push({ id, title: vTitle });
        }
        if (candidates.length >= 10) break;
      }
      if (candidates.length >= 10) break;
    }

    if (candidates.length === 0) return null;

    const targetTokens = extractDishTokens(dishTitle);
    const dishHasArroz = normKey.includes('arroz');
    const dishHasPasta = normKey.includes('pasta') || normKey.includes('espagueti') || normKey.includes('fideo');
    const dishHasArepa = normKey.includes('arepa');

    let best = candidates[0];
    let bestScore = -999;

    for (let i = 0; i < candidates.length; i++) {
      const cand = candidates[i];
      const candNorm = normalizePlain(cand.title);
      let score = Math.max(0, 6 - i); // Ligera preferencia por los primeros resultados orgánicos

      for (const token of targetTokens) {
        if (candNorm.includes(token)) {
          score += 10;
        }
      }

      // Coherencia estricta de formato principal
      if (dishHasArepa && !candNorm.includes('arepa')) score -= 25;
      if (!dishHasArepa && candNorm.includes('arepa')) score -= 18;
      if (!dishHasArroz && candNorm.includes('arroz con')) score -= 15;
      if (!dishHasPasta && (candNorm.includes('espagueti') || candNorm.includes('pasta'))) score -= 15;

      if (score > bestScore) {
        bestScore = score;
        best = cand;
      }
    }

    queryToVideoIdCache.set(normKey, best.id);
    return best.id;
  } catch {
    return null;
  }
}

async function fetchCleanVideoFrameBuffer(videoId: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  const cached = imageBufferCache.get(videoId);
  if (cached) return cached;

  // Priorizamos fotogramas limpios 16:9 de alta definición sin franjas negras
  const candidateUrls = [
    `https://i.ytimg.com/vi/${videoId}/hq720.jpg`,
    `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  ];

  for (const url of candidateUrls) {
    try {
      const resp = await withTimeout(fetch(url), 2500, 'ytimg');
      if (resp.ok) {
        const arrayBuf = await resp.arrayBuffer();
        if (arrayBuf.byteLength > 1500) {
          const buffer = Buffer.from(arrayBuf);
          const contentType = resp.headers.get('content-type') || 'image/jpeg';
          const entry = { buffer, contentType };
          if (imageBufferCache.size > 150) {
            const firstKey = imageBufferCache.keys().next().value;
            if (firstKey) imageBufferCache.delete(firstKey);
          }
          imageBufferCache.set(videoId, entry);
          return entry;
        }
      }
    } catch {
      // Intentar siguiente variante de resolución
    }
  }

  return null;
}

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

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Endpoint propio de imágenes literales de platos por nombre o videoId
  app.get('/api/recipe-image', async (req, res) => {
    try {
      const explicitVideoId = typeof req.query.videoId === 'string' ? req.query.videoId.trim() : '';
      const dishTitle = typeof req.query.title === 'string' ? req.query.title.trim() : '';

      let videoId = explicitVideoId;
      if (!videoId && dishTitle) {
        videoId = (await resolveBestDishVideoId(dishTitle)) || '';
      }

      if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        res.status(404).end();
        return;
      }

      const img = await fetchCleanVideoFrameBuffer(videoId);
      if (!img) {
        res.status(404).end();
        return;
      }

      res.setHeader('Content-Type', img.contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(img.buffer);
    } catch {
      res.status(500).end();
    }
  });

  app.post('/api/suggest-recipes', async (req, res) => {
    try {
      const rawIngredients = Array.isArray(req.body?.ingredients) ? req.body.ingredients : [];
      const preference = typeof req.body?.preference === 'string' ? req.body.preference : 'todos';

      const ingredients = rawIngredients
        .map((item: unknown) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean)
        .slice(0, 20);

      if (ingredients.length === 0) {
        res.status(400).json({ error: 'Ingresa al menos un ingrediente de tu despensa o nevera.' });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error: 'Usando motor culinario instantáneo.',
          useFallback: true,
        });
        return;
      }

      const preferenceInstruction =
        preference === 'rapido'
          ? 'Prioriza recetas rápidas de máximo 25 minutos.'
          : preference === 'una_olla'
            ? 'Prioriza recetas prácticas de una sola olla o sartén.'
            : 'Ofrece 4 preparaciones bien diferenciadas entre sí.';

      const prompt = `Insumos disponibles hoy en casa: ${ingredients.join(', ')}.
${preferenceInstruction}

Devuelve ÚNICAMENTE un arreglo JSON (array de 4 objetos) con 4 recetas caseras cotidianas en español que aprovechen estos insumos (asume agua, sal y aceite disponibles).
Cada objeto debe tener exactamente estas propiedades:
- "id": string (slug corto)
- "title": string (nombre claro, literal y tradicional del plato, ej. "Pollo sudado con papas", "Arepas rellenas de pollo cremoso")
- "subtitle": string (descripción literal y apetitosa de 1 línea)
- "prepTimeMinutes": number (ej. 20, 35)
- "difficulty": "Fácil" | "Media"
- "servings": number (ej. 3, 4)
- "archetype": "stew" | "rice" | "skillet"
- "matchedIngredients": string[] (insumos usados de la lista del usuario)
- "minimalMissingItems": string[] (0 a 3 ingredientes menores faltantes como cebolla, ajo o tomate; [] si no falta nada)
- "culinaryReason": string (ej. "Te falta un poco de cebolla y ajo para armar el sofrito y realzar el sabor.")
- "steps": string[] (4 pasos breves y claros, 1 oración por paso)
- "chefTip": string (1 consejo práctico de cocina casera)
- "affinityScore": number (entero entre 80 y 98)`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
          config: {
            systemInstruction:
              'Eres Queco, chef experto en cocina casera diaria. Responde únicamente con un JSON array válido de 4 recetas distintas en español.',
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            temperature: 0.55,
            responseMimeType: 'application/json',
          },
        }),
        6500,
        'gemini-3.1-flash-lite'
      );

      const rawText = response.text?.trim() || '[]';
      const parsedPayload = JSON.parse(rawText);
      const list = Array.isArray(parsedPayload)
        ? parsedPayload
        : Array.isArray(parsedPayload?.recipes)
          ? parsedPayload.recipes
          : [];

      if (list.length === 0) {
        res.status(502).json({ error: 'Respuesta vacía.', useFallback: true });
        return;
      }

      const typedList: Record<string, unknown>[] = list.slice(0, 4);
      const baseRecipes = typedList.map((item, idx) => ({
        id: typeof item.id === 'string' && item.id ? `${item.id}-${idx}` : `receta-${idx + 1}`,
        title: String(item.title || 'Plato casero del día'),
        subtitle: String(item.subtitle || 'Preparación práctica con tus ingredientes disponibles.'),
        prepTimeMinutes: Number(item.prepTimeMinutes) || 30,
        difficulty: item.difficulty === 'Media' ? 'Media' : 'Fácil',
        servings: Number(item.servings) || 4,
        archetype:
          item.archetype === 'stew' || item.archetype === 'rice' || item.archetype === 'skillet'
            ? item.archetype
            : 'skillet',
        matchedIngredients: Array.isArray(item.matchedIngredients) ? item.matchedIngredients : ingredients,
        minimalMissingIngredients: {
          items: Array.isArray(item.minimalMissingItems) ? item.minimalMissingItems.slice(0, 3) : [],
          culinaryReason: String(
            item.culinaryReason || 'Tienes los ingredientes base listos para empezar a cocinar.'
          ),
        },
        steps:
          Array.isArray(item.steps) && item.steps.length > 0
            ? item.steps.map((s) => String(s))
            : [
                'Prepara y corta los ingredientes principales en trozos uniformes.',
                'Sofríe a fuego medio con sal y condimentos básicos hasta dorar.',
                'Cocina hasta alcanzar el punto tierno ideal y rectifica sazón.',
              ],
        chefTip: String(item.chefTip || 'Prueba y ajusta el punto de sal justo antes de servir.'),
        affinityScore: Math.max(65, Math.min(99, Number(item.affinityScore) || 90)),
      }));

      const recipes = baseRecipes.map((r, i) => ({
        ...r,
        imageUrl: `/api/recipe-image?title=${encodeURIComponent(r.title)}&slot=${i}`,
      }));

      res.json({ recipes });
    } catch (error) {
      console.error('Error generating recipes:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Usando respaldo culinario local.',
        useFallback: true,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Queco server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
