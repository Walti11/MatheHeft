"use client";

import { Star, Home, ArrowLeft, LogOut } from "lucide-react";

export default function TopBar({ profile, screen, onHome, onBack, onSignOut, points }) {
  return (
    <div className="mh-topbar">
      <div className="mh-topbar-left">
        {screen !== "profiles" && (
          <button className="mh-icon-btn" onClick={onBack} aria-label="Zurück">
            <ArrowLeft size={20} />
          </button>
        )}
        {screen !== "profiles" && (
          <button className="mh-icon-btn" onClick={onHome} aria-label="Startseite">
            <Home size={20} />
          </button>
        )}
        <button className="mh-icon-btn" onClick={onSignOut} aria-label="Ausloggen">
          <LogOut size={16} /> Ausloggen
        </button>
      </div>
      {profile && (
        <div className="mh-topbar-profile">
          <span className="mh-avatar-sm">{profile.avatar}</span>
          <span className="mh-profile-name">{profile.name}</span>
          <span className="mh-points-pill">
            <Star size={14} style={{ marginRight: 4 }} fill="var(--gold)" stroke="var(--gold)" />
            {points}
          </span>
        </div>
      )}
    </div>
  );
}
