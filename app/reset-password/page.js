"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/AuthLayout";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const code = searchParams.get("code");
    (async () => {
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }
      setReady(true);
    })();
  }, [searchParams]);

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
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.replace("/login"), 1500);
  };

  if (!ready) {
    return (
      <AuthLayout title="Einen Moment… 🔑">
        <p className="mh-subtle">Link wird geprüft…</p>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout title="Passwort geändert! ✅">
        <p className="mh-subtle">Du wirst gleich zur Anmeldung weitergeleitet.</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Neues Passwort setzen 🔑">
      <form onSubmit={submit}>
        <label className="mh-label" htmlFor="password">Neues Passwort</label>
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
          {loading ? "Speichern…" : "Passwort speichern"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
