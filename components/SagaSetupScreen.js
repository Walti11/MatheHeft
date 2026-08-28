"use client";

import { useState } from "react";
import { ChevronRight, Plus, X } from "lucide-react";
import { READING_LEVELS } from "@/lib/storyEngine";

export default function SagaSetupScreen({ onCreate, generating, error }) {
  const [characters, setCharacters] = useState([""]);
  const [hint, setHint] = useState("");
  const [levelKey, setLevelKey] = useState(READING_LEVELS[1].key);

  const updateCharacter = (i, value) => {
    setCharacters((prev) => prev.map((c, idx) => (idx === i ? value : c)));
  };
  const addCharacter = () => setCharacters((prev) => [...prev, ""]);
  const removeCharacter = (i) => setCharacters((prev) => prev.filter((_, idx) => idx !== i));

  const cleanCharacters = characters.map((c) => c.trim()).filter(Boolean);
  const canSubmit = cleanCharacters.length > 0 && !generating;

  return (
    <div className="mh-page">
      <h1 className="mh-h1">Wer ist mit dabei?</h1>

      <div className="mh-card">
        <div className="mh-label">Hauptfiguren</div>
        {characters.map((c, i) => (
          <div className="mh-row" key={i} style={{ marginBottom: 8 }}>
            <input
              className="mh-input"
              value={c}
              onChange={(e) => updateCharacter(i, e.target.value)}
              placeholder="z. B. Giuseppe der Bär"
              maxLength={60}
            />
            {characters.length > 1 && (
              <button className="mh-icon-btn" onClick={() => removeCharacter(i)} aria-label="Figur entfernen">
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        <button className="mh-btn" onClick={addCharacter} type="button">
          <Plus size={16} style={{ marginRight: 4 }} /> Weitere Figur
        </button>

        <div className="mh-label">Was für ein Abenteuer? (optional)</div>
        <input
          className="mh-input"
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          placeholder="z. B. eine Schatzsuche im Wald"
          maxLength={120}
        />

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
          onClick={() => onCreate(cleanCharacters, levelKey, hint.trim())}
          disabled={!canSubmit}
        >
          {generating ? "Erstes Kapitel wird geschrieben…" : (<>Serie starten <ChevronRight size={20} /></>)}
        </button>
        {generating && <p className="mh-subtle" style={{ marginTop: 8 }}>Das dauert einen kleinen Moment…</p>}
      </div>
    </div>
  );
}
