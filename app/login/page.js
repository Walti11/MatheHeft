"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/AuthLayout";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("E-Mail oder Passwort ist falsch.");
      return;
    }
    router.replace("/");
    router.refresh();
  };

  return (
    <AuthLayout title="Willkommen zurück! 📒" subtitle="Melde dich mit deinem Eltern-Account an.">
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
          autoComplete="current-password"
          className="mh-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        {error && <p className="mh-auth-error">{error}</p>}

        <button className="mh-btn mh-btn-primary mh-btn-big" type="submit" disabled={loading}>
          {loading ? "Anmelden…" : "Anmelden"}
        </button>
      </form>

      <div className="mh-auth-links">
        <Link href="/forgot-password">Passwort vergessen?</Link>
        <Link href="/register">Neue Familie registrieren</Link>
      </div>
    </AuthLayout>
  );
}
