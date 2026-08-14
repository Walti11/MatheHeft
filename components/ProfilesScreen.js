"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export default function ProfilesScreen({ profiles, onSelect, onCreate }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const clean = name.trim();
    if (!clean || saving) return;
    setSaving(true);
    await onCreate(clean);
    setSaving(false);
    setName("");
    setCreating(false);
  };

  return (
    <div className="mh-page">
      <h1 className="mh-h1">Wer übt heute? 📒</h1>
      <div className="mh-profile-grid">
        {profiles.map((p) => (
          <button key={p.id} className="mh-profile-card" onClick={() => onSelect(p)}>
            <span className="mh-avatar-lg">{p.avatar}</span>
            <span className="mh-profile-card-name">{p.name}</span>
          </button>
        ))}
        {!creating && (
          <button className="mh-profile-card mh-profile-card-new" onClick={() => setCreating(true)}>
            <Plus size={32} />
            <span className="mh-profile-card-name">Neues Profil</span>
          </button>
        )}
      </div>
      {creating && (
        <div className="mh-card mh-new-profile-form">
          <label className="mh-label">Wie heisst du?</label>
          <div className="mh-row">
            <input
              autoFocus
              className="mh-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Name eingeben"
              maxLength={20}
            />
            <button className="mh-btn mh-btn-primary" onClick={submit} disabled={saving}>
              Los!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
