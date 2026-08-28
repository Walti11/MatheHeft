"use client";

import { PencilLine, BarChart3, Award, BookOpen } from "lucide-react";
import { nextReward } from "@/lib/gameEngine";

export default function MenuScreen({ profile, points, onNav }) {
  const upcoming = nextReward(points);
  return (
    <div className="mh-page">
      <h1 className="mh-h1">Hallo {profile.name}! {profile.avatar}</h1>
      {upcoming && (
        <p className="mh-subtle">
          Noch <strong>{upcoming.threshold - points}</strong> Punkte bis {upcoming.emoji} {upcoming.label}
        </p>
      )}
      <div className="mh-menu-grid">
        <button className="mh-menu-card" onClick={() => onNav("select")}>
          <PencilLine size={30} />
          <span>Rechnen starten</span>
        </button>
        <button className="mh-menu-card" onClick={() => onNav("stories")}>
          <BookOpen size={30} />
          <span>Geschichten hören</span>
        </button>
        <button className="mh-menu-card" onClick={() => onNav("stats")}>
          <BarChart3 size={30} />
          <span>Statistik &amp; Bestenliste</span>
        </button>
        <button className="mh-menu-card" onClick={() => onNav("rewards")}>
          <Award size={30} />
          <span>Belohnungen</span>
        </button>
      </div>
    </div>
  );
}
