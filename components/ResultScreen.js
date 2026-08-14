"use client";

import { useState, useEffect, useRef } from "react";
import { Star, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { STAGES, CATEGORIES, computeNote, formatNote, formatTime, comboKey } from "@/lib/gameEngine";
import { createClient } from "@/lib/supabase/client";
import { saveSessionResult } from "@/lib/data";

export default function ResultScreen({ runConfig, sessionResult, profileData, setProfileData, profileId, onAgain, onMenu }) {
  const savedRef = useRef(false);
  const correct = sessionResult.tasks.filter((t) => t.isCorrect).length;
  const total = sessionResult.tasks.length;
  const note = computeNote(correct, total, runConfig.fine);
  const stageLabel = STAGES.find((s) => s.key === runConfig.stageKey)?.label;
  const catLabel = CATEGORIES.find((c) => c.key === runConfig.category)?.label;
  const key = comboKey(runConfig.stageKey, runConfig.category, runConfig.diffKey, runConfig.blockSize, runConfig.mulSeries);
  const [isNewBest, setIsNewBest] = useState(false);
  const [earned, setEarned] = useState(0);
  const [saving, setSaving] = useState(true);

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    const pointsEarned = correct * 10 + (correct === total ? total * 5 : 0);
    setEarned(pointsEarned);

    const historyEntry = {
      id: sessionResult.tasks[0]?.id || Date.now().toString(36),
      date: new Date().toISOString(),
      stageKey: runConfig.stageKey,
      category: runConfig.category,
      diffKey: runConfig.diffKey,
      blockSize: runConfig.blockSize,
      correct, total, note,
      timeSeconds: sessionResult.timeSeconds,
      tasks: sessionResult.tasks,
    };

    (async () => {
      const supabase = createClient();
      const { newPoints, isNewBest: newBest } = await saveSessionResult(supabase, {
        profileId, runConfig, sessionResult, correct, total, note, pointsEarned,
      });
      setIsNewBest(newBest);

      setProfileData((prev) => {
        const nextBestTimes = { ...prev.bestTimes };
        if (newBest) {
          nextBestTimes[key] = {
            seconds: sessionResult.timeSeconds, date: new Date().toISOString(),
            stageKey: runConfig.stageKey, category: runConfig.category,
            diffKey: runConfig.diffKey, blockSize: runConfig.blockSize,
            mulSeries: runConfig.mulSeries || null,
          };
        }
        return {
          points: newPoints,
          history: [historyEntry, ...prev.history].slice(0, 80),
          bestTimes: nextBestTimes,
        };
      });
      setSaving(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mh-page">
      <h1 className="mh-h1">Block fertig! 🎉</h1>
      <div className="mh-card mh-result-summary">
        <div className="mh-grade-circle">
          <span>{formatNote(note)}</span>
        </div>
        <div className="mh-result-facts">
          <div>{stageLabel} · {catLabel}{runConfig.mulSeries ? ` (${runConfig.mulSeries}er-Reihe)` : ""}</div>
          <div>{correct} von {total} richtig</div>
          <div>Zeit: {formatTime(sessionResult.timeSeconds)} {isNewBest && <strong className="mh-new-best">Neue Bestzeit!</strong>}</div>
          <div className="mh-points-earned">
            +{earned} Punkte <Star size={14} fill="var(--gold)" stroke="var(--gold)" />
            {saving && <span className="mh-subtle" style={{ marginLeft: 8 }}>speichert…</span>}
          </div>
        </div>
      </div>

      <div className="mh-card">
        <div className="mh-label">Übersicht deiner Aufgaben</div>
        <div className="mh-result-list">
          {sessionResult.tasks.map((t, i) => (
            <div key={i} className={`mh-result-row ${t.isCorrect ? "mh-row-good" : "mh-row-bad"}`}>
              {t.isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              <span>{t.text} = {t.given}</span>
              {!t.isCorrect && <span className="mh-correct-hint">richtig: {t.correctAnswer}</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="mh-row">
        <button className="mh-btn mh-btn-primary" onClick={onAgain}>
          <RotateCcw size={16} style={{ marginRight: 6 }} /> Nochmal
        </button>
        <button className="mh-btn" onClick={onMenu}>Zur Übersicht</button>
      </div>
    </div>
  );
}
