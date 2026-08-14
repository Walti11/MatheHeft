"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <AuthLayout title="E-Mail unterwegs! 📬">
        <p className="mh-subtle">
          Falls ein Konto mit <strong>{email}</strong> existiert, haben wir dir einen Link zum
          Zurücksetzen des Passworts geschickt.
        </p>
        <Link className="mh-btn mh-btn-primary mh-btn-big" href="/login" style={{ display: "block", textAlign: "center", marginTop: 14 }}>
          Zur Anmeldung
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Passwort vergessen? 🔑" subtitle="Wir schicken dir einen Link zum Zurücksetzen.">
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

        {error && <p className="mh-auth-error">{error}</p>}

        <button className="mh-btn mh-btn-primary mh-btn-big" type="submit" disabled={loading}>
          {loading ? "Senden…" : "Link zum Zurücksetzen senden"}
        </button>
      </form>

      <div className="mh-auth-links">
        <Link href="/login">Zurück zur Anmeldung</Link>
      </div>
    </AuthLayout>
  );
}
