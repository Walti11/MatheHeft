"use client";

import { Sparkles, ChevronRight } from "lucide-react";
import { findTopic } from "@/lib/storyEngine";

export default function StoryReaderScreen({ mode, chapter, saga, chapters, onSelectChapter, onNextChapter, generatingNext, error }) {
  if (!chapter) return null;
  const paragraphs = chapter.content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const isLatestChapter = mode === "saga" && saga && chapter.chapter_number === saga.chapter_count;

  return (
    <div className="mh-page">
      {mode === "saga" && saga && (
        <>
          <p className="mh-subtle">{saga.title} · {saga.characters.join(", ")}</p>
          {chapters && chapters.length > 1 && (
            <div className="mh-chip-row" style={{ marginBottom: 10 }}>
              {chapters.map((c) => (
                <button
                  key={c.id}
                  className={`mh-chip ${c.id === chapter.id ? "mh-chip-active" : ""}`}
                  onClick={() => onSelectChapter(c.id)}
                >
                  Kapitel {c.chapter_number}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <h1 className="mh-h1">
        {mode === "saga" ? `Kapitel ${chapter.chapter_number}: ` : ""}{chapter.title}
      </h1>
      {mode === "topical" && (
        <p className="mh-subtle">{findTopic(chapter.topic_key).emoji} {findTopic(chapter.topic_key).label}</p>
      )}

      <div className="mh-card mh-story-text">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {chapter.new_words && chapter.new_words.length > 0 && (
        <div className="mh-card">
          <div className="mh-label"><Sparkles size={14} style={{ marginRight: 4, verticalAlign: -2 }} />Neue Wörter</div>
          <div className="mh-result-list">
            {chapter.new_words.map((w, i) => (
              <div key={i} className="mh-result-row mh-row-good">
                <strong>{w.word}</strong>
                <span className="mh-correct-hint">{w.explanation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="mh-auth-error">{error}</p>}

      {mode === "saga" && isLatestChapter && (
        <button className="mh-btn mh-btn-primary mh-btn-big" onClick={onNextChapter} disabled={generatingNext}>
          {generatingNext ? "Nächstes Kapitel wird geschrieben…" : (<>Nächstes Kapitel <ChevronRight size={20} /></>)}
        </button>
      )}
    </div>
  );
}
