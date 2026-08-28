import "server-only";

const MODEL = "gemini-3.6-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const NEW_WORDS_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      word: { type: "STRING" },
      explanation: { type: "STRING" },
    },
    required: ["word", "explanation"],
  },
};

const STORY_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    story: { type: "STRING" },
    newWords: NEW_WORDS_SCHEMA,
  },
  required: ["title", "story", "newWords"],
};

const CHAPTER_SCHEMA = {
  type: "OBJECT",
  properties: {
    sagaTitle: { type: "STRING", description: "Titel der Serie, nur beim ersten Kapitel relevant." },
    chapterTitle: { type: "STRING" },
    story: { type: "STRING" },
    updatedSummary: { type: "STRING" },
    newWords: NEW_WORDS_SCHEMA,
  },
  required: ["chapterTitle", "story", "updatedSummary", "newWords"],
};

const RETRYABLE_STATUS = new Set([429, 503]);
const RETRY_DELAYS_MS = [1500, 3000];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(prompt, schema) {
  const res = await fetch(`${ENDPOINT}?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data?.error?.message || "Die KI-Anfrage ist fehlgeschlagen.");
    error.status = res.status;
    throw error;
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Die KI hat keine Antwort geliefert.");
  }
  return JSON.parse(text);
}

async function generateStructured(prompt, schema) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY ist nicht gesetzt.");
  }

  for (let attempt = 0; ; attempt++) {
    try {
      return await callGemini(prompt, schema);
    } catch (err) {
      const isRetryable = RETRYABLE_STATUS.has(err.status);
      if (!isRetryable || attempt >= RETRY_DELAYS_MS.length) {
        if (isRetryable) {
          throw new Error("Die Geschichten-KI ist gerade stark ausgelastet. Bitte versuch es in ein, zwei Minuten nochmal.");
        }
        throw err;
      }
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }
}

export function generateTopicalStory(prompt) {
  return generateStructured(prompt, STORY_SCHEMA);
}

export function generateSagaChapter(prompt) {
  return generateStructured(prompt, CHAPTER_SCHEMA);
}
