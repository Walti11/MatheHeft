"use client";

import { Lock } from "lucide-react";
import { REWARDS } from "@/lib/gameEngine";

export default function RewardsScreen({ points, profile, onChooseAvatar }) {
  return (
    <div className="mh-page">
      <h1 className="mh-h1">Belohnungen</h1>
      <p className="mh-subtle">Sammle Punkte durchs Üben und schalte neue Avatare frei. Du hast aktuell <strong>{points}</strong> Punkte.</p>
      <div className="mh-reward-grid">
        {REWARDS.map((r) => {
          const unlocked = points >= r.threshold;
          const active = profile.avatar === r.emoji;
          return (
            <button
              key={r.emoji}
              className={`mh-reward-card ${unlocked ? "" : "mh-reward-locked"} ${active ? "mh-reward-active" : ""}`}
              disabled={!unlocked}
              onClick={() => unlocked && onChooseAvatar(r.emoji)}
            >
              {unlocked ? <span className="mh-reward-emoji">{r.emoji}</span> : <Lock size={26} />}
              <span>{r.label}</span>
              {!unlocked && <span className="mh-reward-need">{r.threshold} Pkt.</span>}
              {active && <span className="mh-reward-need">gewählt</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
