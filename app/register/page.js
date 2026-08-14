"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/AuthLayout";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <AuthLayout title="Fast geschafft! 📬">
        <p className="mh-subtle">
          Wir haben dir eine E-Mail an <strong>{email}</strong> geschickt. Bitte bestätige
          deine Adresse über den Link in der E-Mail, danach kannst du dich anmelden.
        </p>
        <Link className="mh-btn mh-btn-primary mh-btn-big" href="/login" style={{ display: "block", textAlign: "center", marginTop: 14 }}>
          Zur Anmeldung
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Neue Familie registrieren 👨‍👩‍👧" subtitle="Ein Konto pro Familie – danach legst du Profile für deine Kinder an.">
      <form onSubmit={submit}>
        <label className="mh-label" htmlFor="email">E-Mail</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          className="mh-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="deine@email.ch"
        />

        <label className="mh-label" htmlFor="password">Passwort</label>
        <input
          id="password"
          type="password"
          required
          autoComplete="new-password"
          className="mh-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="mind. 6 Zeichen"
        />

        <label className="mh-label" htmlFor="passwordConfirm">Passwort bestätigen</label>
        <input
          id="passwordConfirm"
          type="password"
          required
          autoComplete="new-password"
          className="mh-input"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          placeholder="••••••••"
        />

        {error && <p className="mh-auth-error">{error}</p>}

        <button className="mh-btn mh-btn-primary mh-btn-big" type="submit" disabled={loading}>
          {loading ? "Registrieren…" : "Familie registrieren"}
        </button>
      </form>

      <div className="mh-auth-links">
        <Link href="/login">Schon registriert? Jetzt anmelden</Link>
      </div>
    </AuthLayout>
  );
}
