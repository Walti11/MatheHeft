"use client";

import { useState } from "react";
import { XCircle, Trophy } from "lucide-react";
import { STAGES, CATEGORIES, DIFFICULTIES, formatNote, formatTime } from "@/lib/gameEngine";

export default function StatsScreen({ profileData }) {
  const [tab, setTab] = useState("stats");
  const history = profileData.history || [];

  const catTally = {};
  CATEGORIES.filter((c) => c.key !== "mix").forEach((c) => (catTally[c.key] = { correct: 0, total: 0 }));
  const wrongCount = {};
  history.forEach((h) =>
    h.tasks.forEach((t) => {
      if (catTally[t.op]) {
        catTally[t.op].total++;
        if (t.isCorrect) catTally[t.op].correct++;
        else wrongCount[t.text] = (wrongCount[t.text] || 0) + 1;
      }
    })
  );
  const problemTasks = Object.entries(wrongCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const avgNote = history.length ? history.reduce((s, h) => s + h.note, 0) / history.length : 0;
  const trend = history.slice(0, 10).reverse();

  const bestList = Object.values(profileData.bestTimes || {}).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="mh-page">
      <h1 className="mh-h1">Statistik</h1>
      <div className="mh-chip-row">
        <button className={`mh-chip ${tab === "stats" ? "mh-chip-active" : ""}`} onClick={() => setTab("stats")}>Statistik</button>
        <button className={`mh-chip ${tab === "best" ? "mh-chip-active" : ""}`} onClick={() => setTab("best")}>Bestenliste</button>
      </div>

      {tab === "stats" && (
        <>
          <div className="mh-card">
            <div className="mh-stats-totals">
              <div><strong>{history.length}</strong><span>Blöcke</span></div>
              <div><strong>{history.length ? formatNote(avgNote) : "–"}</strong><span>Ø Note</span></div>
              <div><strong>{profileData.points}</strong><span>Punkte</span></div>
            </div>
          </div>

          <div className="mh-card">
            <div className="mh-label">Richtig pro Kategorie</div>
            {CATEGORIES.filter((c) => c.key !== "mix").map((c) => {
              const t = catTally[c.key];
              const pct = t.total ? Math.round((t.correct / t.total) * 100) : 0;
              return (
                <div key={c.key} className="mh-bar-row">
                  <span className="mh-bar-label">{c.label}</span>
                  <div className="mh-bar-track">
                    <div className="mh-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="mh-bar-pct">{t.total ? `${pct}%` : "–"}</span>
                </div>
              );
            })}
          </div>

          {problemTasks.length > 0 && (
            <div className="mh-card">
              <div className="mh-label">Häufige Fehler</div>
              <div className="mh-result-list">
                {problemTasks.map(([text, count]) => (
                  <div key={text} className="mh-result-row mh-row-bad">
                    <XCircle size={16} />
                    <span>{text} =</span>
                    <span className="mh-correct-hint">{count}× falsch</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {trend.length > 0 && (
            <div className="mh-card">
              <div className="mh-label">Notenverlauf (letzte {trend.length})</div>
              <div className="mh-trend">
                {trend.map((h, i) => (
                  <div key={i} className="mh-trend-col" title={formatNote(h.note)}>
                    <div className="mh-trend-bar" style={{ height: `${((h.note - 1) / 5) * 100}%` }} />
                    <span className="mh-trend-val">{formatNote(h.note)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {history.length === 0 && <p className="mh-subtle">Noch keine Blöcke abgeschlossen – leg los!</p>}
        </>
      )}

      {tab === "best" && (
        <div className="mh-card">
          {bestList.length === 0 && <p className="mh-subtle">Noch keine Bestzeiten – schliesse einen fehlerfreien Block ab!</p>}
          {bestList.map((b, i) => {
            const stageLabel = STAGES.find((s) => s.key === b.stageKey)?.label;
            const catLabel = CATEGORIES.find((c) => c.key === b.category)?.label;
            const diffLabel = DIFFICULTIES.find((d) => d.key === b.diffKey)?.label;
            return (
              <div key={i} className="mh-result-row mh-row-good">
                <Trophy size={16} />
                <span>{stageLabel} · {catLabel}{b.mulSeries ? ` (${b.mulSeries}er-Reihe)` : ""} · {diffLabel} · {b.blockSize} Aufg.</span>
                <span className="mh-correct-hint">{formatTime(b.seconds)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
