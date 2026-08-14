# Mathe-Heft

Mathe-Übungs-App im Schulheft-Design mit Eltern-Login und Kinderprofilen, die
geräteübergreifend synchron sind (Laptop, Tablet, Handy).

- **Frontend:** Next.js (App Router)
- **Backend/Auth/DB:** Supabase (Postgres + Supabase Auth)
- **Hosting:** Vercel

Der komplette Code ist fertig. Es fehlen nur noch dein eigenes Supabase-Projekt
und (optional) das Deployment auf Vercel. Die folgende Anleitung führt dich
Schritt für Schritt durch, was **du** einmalig in den jeweiligen Web-Oberflächen
tun musst.

## 1. Supabase-Projekt anlegen

1. Gehe auf [supabase.com](https://supabase.com) und erstelle ein kostenloses Konto.
2. Klicke auf **"New Project"**.
   - Region: **Europe (Frankfurt)** oder eine andere EU-Region.
   - Wähle ein Datenbank-Passwort (merken/aufschreiben, wird selten gebraucht).
3. Warte, bis das Projekt bereit ist (~1-2 Minuten).
4. Öffne links **SQL Editor** → **New query**, füge den kompletten Inhalt von
   [`supabase/schema.sql`](supabase/schema.sql) ein und klicke **Run**.
   Das legt die Tabellen `profiles`, `sessions`, `best_times` inkl. Row-Level-Security
   an.
5. Gehe zu **Project Settings → API**. Dort findest du:
   - **Project URL** → kommt in `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** Key → kommt in `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Gehe zu **Authentication → URL Configuration** und trage ein:
   - **Site URL:** `http://localhost:3000` (später zusätzlich deine Vercel-URL, z. B. `https://mathe-heft.vercel.app`)
   - **Redirect URLs:** `http://localhost:3000/reset-password` (und später zusätzlich die Vercel-Variante)

   Das ist nötig, damit der "Passwort vergessen"-Link in der E-Mail korrekt zurück zur App führt.

## 2. Lokal einrichten

```bash
cp .env.local.example .env.local
```

Trage in `.env.local` die Werte aus Schritt 1.5 ein:

```
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
```

Dann starten:

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) → du landest auf `/login`.
Registriere eine Familie über **"Neue Familie registrieren"**, bestätige die
E-Mail (Link kommt von Supabase) und logge dich ein.

## 3. GitHub-Repository anlegen

```bash
git init
git add .
git commit -m "Initial commit: Mathe-Heft"
```

Erstelle auf [github.com/new](https://github.com/new) ein neues (privates) Repository
und push den Code:

```bash
git remote add origin https://github.com/DEIN-USERNAME/mathe-heft.git
git branch -M main
git push -u origin main
```

## 4. Deployment auf Vercel

1. Erstelle ein Konto auf [vercel.com](https://vercel.com) (Login via GitHub empfohlen).
2. **"Add New… → Project"** → das eben gepushte GitHub-Repo importieren.
3. Bei **Environment Variables** die gleichen zwei Werte wie in `.env.local` eintragen:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy** klicken. Nach ein paar Minuten bekommst du eine feste URL wie
   `https://mathe-heft.vercel.app`.
5. Zurück in Supabase unter **Authentication → URL Configuration**: die Vercel-URL
   zusätzlich bei **Site URL** und **Redirect URLs** (`https://mathe-heft.vercel.app/reset-password`)
   eintragen.

Ab jetzt löst jeder `git push` auf `main` automatisch ein neues Deployment aus.

## Projektstruktur

```
lib/gameEngine.js       Reine Spiel-Logik (Aufgaben-Generator, Noten, Zeiten) – 1:1 aus dem Original übernommen
lib/data.js              Datenzugriff (Profile, Sessions, Bestzeiten) über Supabase
lib/supabase/            Supabase-Client für Browser, Server Components und Middleware
middleware.js            Schützt alle Seiten ausser /login, /register, /forgot-password, /reset-password
app/login, /register,
/forgot-password,
/reset-password           Auth-Seiten
app/page.js               Lädt den eingeloggten Nutzer, rendert AppShell
components/AppShell.js    Screen-Steuerung (Profile → Menü → Üben → Ergebnis → Statistik → Belohnungen)
components/*Screen.js     Die einzelnen Bildschirme, strukturell identisch zum Original
supabase/schema.sql       Datenbank-Schema + Row Level Security
```

## Familien-Konzept

- Ein Supabase-Auth-Konto (E-Mail/Passwort) = eine Familie.
- Nach dem Login sieht man nur die eigenen Kinderprofile ("Wer übt heute?").
- Kinder loggen sich nicht separat ein, sie wählen nur ihr Profil.
- Fortschritt (Punkte, Verlauf, Bestzeiten) ist in Supabase gespeichert und daher
  auf jedem Gerät identisch, sobald die Eltern eingeloggt sind.
