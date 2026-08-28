"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { STORY_TOPICS, READING_LEVELS } from "@/lib/storyEngine";

export default function TopicalSetupScreen({ onGenerate, generating, error }) {
  const [topicKey, setTopicKey] = useState(STORY_TOPICS[0].key);
  const [levelKey, setLevelKey] = useState(READING_LEVELS[1].key);

  return (
    <div className="mh-page">
      <h1 className="mh-h1">Worüber soll die Geschichte handeln?</h1>

      <div className="mh-card">
        <div className="mh-label">Thema</div>
        <div className="mh-chip-row">
          {STORY_TOPICS.map((t) => (
            <button
              key={t.key}
              className={`mh-chip ${topicKey === t.key ? "mh-chip-active" : ""}`}
              onClick={() => setTopicKey(t.key)}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        <div className="mh-label">Lesestufe</div>
        <div className="mh-chip-row">
          {READING_LEVELS.map((l) => (
            <button
              key={l.key}
              className={`mh-chip ${levelKey === l.key ? "mh-chip-active" : ""}`}
              onClick={() => setLevelKey(l.key)}
            >
              {l.label}
            </button>
          ))}
        </div>

        {error && <p className="mh-auth-error">{error}</p>}

        <button
          className="mh-btn mh-btn-primary mh-btn-big"
          onClick={() => onGenerate(topicKey, levelKey)}
          disabled={generating}
        >
          {generating ? "Geschichte wird geschrieben…" : (<>Geschichte erstellen <ChevronRight size={20} /></>)}
        </button>
        {generating && <p className="mh-subtle" style={{ marginTop: 8 }}>Das dauert einen kleinen Moment…</p>}
      </div>
    </div>
  );
}
