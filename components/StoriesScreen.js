"use client";

import { Newspaper, BookMarked, ChevronRight } from "lucide-react";
import { findTopic } from "@/lib/storyEngine";

export default function StoriesScreen({ library, loadingLibrary, onNewTopical, onNewSaga, onOpenTopical, onOpenSaga }) {
  const topicalStories = library?.topicalStories || [];
  const sagas = library?.sagas || [];

  return (
    <div className="mh-page">
      <h1 className="mh-h1">Geschichten hören 📖</h1>

      <div className="mh-menu-grid">
        <button className="mh-menu-card" onClick={onNewTopical}>
          <Newspaper size={30} />
          <span>Neue Tagesthema-Geschichte</span>
        </button>
        <button className="mh-menu-card" onClick={onNewSaga}>
          <BookMarked size={30} />
          <span>Neue Serie starten</span>
        </button>
      </div>

      {loadingLibrary && <p className="mh-subtle" style={{ marginTop: 16 }}>Lade Geschichten…</p>}

      {!loadingLibrary && sagas.length > 0 && (
        <div className="mh-card" style={{ marginTop: 16 }}>
          <div className="mh-label">Meine Serien</div>
          <div className="mh-result-list">
            {sagas.map((s) => (
              <button key={s.id} className="mh-result-row mh-story-list-item" onClick={() => onOpenSaga(s)}>
                <span>{s.title} · {s.characters.join(", ")}</span>
                <span className="mh-correct-hint">{s.chapter_count} Kapitel <ChevronRight size={14} /></span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!loadingLibrary && topicalStories.length > 0 && (
        <div className="mh-card" style={{ marginTop: 16 }}>
          <div className="mh-label">Tagesthema-Geschichten</div>
          <div className="mh-result-list">
            {topicalStories.map((s) => (
              <button key={s.id} className="mh-result-row mh-story-list-item" onClick={() => onOpenTopical(s)}>
                <span>{s.title} · {findTopic(s.topic_key).emoji} {findTopic(s.topic_key).label}</span>
                <span className="mh-correct-hint"><ChevronRight size={14} /></span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!loadingLibrary && sagas.length === 0 && topicalStories.length === 0 && (
        <p className="mh-subtle">Noch keine Geschichte erstellt – leg los!</p>
      )}
    </div>
  );
}
