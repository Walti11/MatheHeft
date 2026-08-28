/* ------------------------------------------------------------------ */
/* Konfiguration: Themen & Lesestufen                                  */
/* ------------------------------------------------------------------ */

export const STORY_TOPICS = [
  { key: "sport", label: "Sport", emoji: "⚽" },
  { key: "wissenschaft", label: "Wissenschaft", emoji: "🔬" },
  { key: "tiere", label: "Tiere & Natur", emoji: "🦁" },
  { key: "weltall", label: "Weltall", emoji: "🚀" },
  { key: "technik", label: "Technik & Erfindungen", emoji: "⚙️" },
  { key: "abenteuer", label: "Abenteuer & Reisen", emoji: "🗺️" },
  { key: "musik", label: "Musik & Kunst", emoji: "🎨" },
];

export const READING_LEVELS = [
  { key: "kg", label: "Kindergarten / 1. Klasse", desc: "sehr kurze, einfache Sätze, Grundwortschatz" },
  { key: "unter", label: "2.–3. Klasse", desc: "kurze Sätze, einfacher Wortschatz mit einzelnen neuen Wörtern" },
  { key: "mittel", label: "4.–5. Klasse", desc: "abwechslungsreichere Sätze, erweiterter Wortschatz" },
  { key: "ober", label: "6. Klasse", desc: "komplexere Satzstrukturen, anspruchsvollerer Wortschatz" },
];

export function findTopic(key) {
  return STORY_TOPICS.find((t) => t.key === key) || STORY_TOPICS[0];
}

export function findLevel(key) {
  return READING_LEVELS.find((l) => l.key === key) || READING_LEVELS[1];
}

/* ------------------------------------------------------------------ */
/* Prompt-Bausteine (rein Textgenerierung, kein API-Zugriff)           */
/* ------------------------------------------------------------------ */

const COMMON_RULES = `- Länge: ca. 800–1100 Wörter (zum Vorlesen, Vorlesedauer ca. 5–10 Minuten)
- Klare, kindgerechte Spannung mit einem fröhlichen, positiven Ausgang – kein Grusel, keine Gewalt, keine traurigen oder verstörenden Inhalte
- Korrekte, abwechslungsreiche Satzstrukturen als sprachliches Vorbild
- Baue 4–6 Wörter ein, die für die Lesestufe etwas neu oder anspruchsvoller sind, und liste sie separat mit je einer kurzen, kindgerechten Erklärung`;

export function buildTopicalPrompt({ topic, level }) {
  return `Du bist eine liebevolle Kinderbuch-Autorin und schreibst kurze Vorlesegeschichten auf Deutsch.

Schreibe eine spannende, aber fröhliche und positive Vorlesegeschichte zum Thema "${topic.label}". Die Geschichte ist frei erfunden (keine echten Personen, keine echten aktuellen Ereignisse), soll aber Lust auf das Thema "${topic.label}" machen.

Lesestufe der Kinder: ${level.label} (${level.desc}).

Vorgaben:
${COMMON_RULES}
- Erfinde einen passenden, neugierig machenden Titel

Gib deine Antwort ausschliesslich über den Funktionsaufruf "return_story" zurück.`;
}

export function buildSagaPrompt({ characters, level, adventureHint, isFirstChapter, previousSummary, chapterNumber }) {
  const cast = characters.join(", ");
  const intro = isFirstChapter
    ? `Dies ist das allererste Kapitel einer neuen Serie. Führe die Figuren charmant ein und beginne ein neues, fröhliches Abenteuer.`
    : `Bisheriger Verlauf der Serie (Zusammenfassung): ${previousSummary}

Schreibe Kapitel ${chapterNumber} als direkte Fortsetzung, die nahtlos an diese Zusammenfassung anknüpft.`;

  return `Du bist eine liebevolle Kinderbuch-Autorin und schreibst eine fortlaufende Vorlese-Geschichtenserie auf Deutsch mit denselben wiederkehrenden Hauptfiguren.

Hauptfiguren: ${cast}
${adventureHint ? `Wunsch der Kinder für die Serie: ${adventureHint}` : ""}

${intro}

Lesestufe der Kinder: ${level.label} (${level.desc}).

Vorgaben:
${COMMON_RULES}
- Ein gutes, rundes Ende für dieses Kapitel – darf neugierig auf die Fortsetzung machen, aber kein echter Cliffhanger-Schock
- Erfinde einen Kapiteltitel
${isFirstChapter ? '- Erfinde ausserdem einen Titel für die gesamte Serie' : ""}
- Schreibe zusätzlich eine kurze, aktuelle Gesamt-Zusammenfassung der Serie (3–5 Sätze) bis inklusive diesem Kapitel, die als Gedächtnisstütze für die nächste Fortsetzung dient

Gib deine Antwort ausschliesslich über den Funktionsaufruf "return_chapter" zurück.`;
}
