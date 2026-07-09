# Lord of the Holes — Optimierungsplan

> Erstellt: 2026-07-09 · Basis: aktueller `main`-Stand (commit-Historie: 464 Commits)
> Zweck: priorisierte, risikobewertete Roadmap. Wir arbeiten die Punkte gemeinsam ab.

## Kennzahlen (Ist-Zustand)

| Metrik | Wert | Bewertung |
|---|---|---|
| Größe `src/App.jsx` | 5210 Zeilen | 🔴 Monolith |
| Hauptcomponent `LordOfTheHolesApp` | Z. 1569–5203 (~3600 Z.) | 🔴 |
| `useState`-Hooks im Hauptcomponent | ~60 | 🔴 |
| Hook-Aufrufe gesamt | 182 | 🔴 |
| Funktionen *innerhalb* des Components (pro Render neu) | 121 | 🔴 |
| `React.memo` / `useCallback` | 0 | 🔴 |
| Feste Abhängigkeits-Versionen | 0 (alle `"latest"`) | 🔴 |
| Lockfile committed | nein | 🔴 |
| Tote Dateien | `App.jsx`, `index.css` (Root) | 🟡 |
| Secrets im Client-Bundle | `ADMIN_PASSWORD`, Lock-PW, Sheet-URL | 🟡 |
| Tests / Lint / CI | keine | 🟡 |

---

## Priorität 1 — Quick-Wins (risikoarm, sofort)

### 1.1 Tote Dateien entfernen
- **`App.jsx`** (Root, 10 Z.) — importiert `./App.jsx` (sich selbst), wird nie geladen. Entry ist `src/main.jsx` → `src/App.jsx`.
- **`index.css`** (Root, 890 Z.) — nicht verwendet; genutzt wird `src/index.css` (455 Z.).
- **Aufwand:** 5 Min · **Risiko:** minimal (vorher `grep` bestätigt: keine Referenzen) · **Nutzen:** weniger Verwirrung, kleineres Repo.

### 1.2 Abhängigkeiten pinnen + Lockfile
- `package.json` nutzt für **alle** Deps `"latest"`. Ohne Lockfile kann jeder Vercel-Build eine andere React-/Vite-/framer-motion-Version ziehen → Deploy kann ohne Codeänderung brechen.
- **Maßnahme:** konkrete Versionen eintragen (z. B. `react@^18.3`, `vite@^5`, …), `npm install` lokal ausführen, **`package-lock.json` committen**, Vercel Install-Command auf `npm ci` stellen.
- **Aufwand:** 30 Min · **Risiko:** gering · **Nutzen:** reproduzierbare, stabile Deploys.

### 1.3 Tailwind aus dem CDN holen
- `index.html:17` lädt `https://cdn.tailwindcss.com` — der komplette JIT-Compiler läuft im Browser bei jedem Aufruf (offiziell „not for production"). Kostet ~200–400 KB + Verzögerung + FOUC.
- **Maßnahme:** Tailwind als Dev-Dependency + PostCSS-Plugin, `tailwind.config.js` mit `content`-Pfaden, CSS-Import in `src/index.css`. Ergebnis: nur genutzte Klassen im Bundle, kein Runtime-Compiler.
- **Aufwand:** 1–2 h · **Risiko:** mittel (Purge muss alle dynamischen Klassen erfassen — Testlauf nötig) · **Nutzen:** deutlich schnellerer First Paint.

### 1.4 Config auslagern
- `ADMIN_PASSWORD = "weimar"`, Lock-Passwort und `GOOGLE_SHEETS_API_URL` stehen als Klartext-Konstanten im Bundle (`src/App.jsx:51–52`). Alles im Browser lesbar → „Admin" ist rein kosmetisch.
- **Maßnahme (klein):** URLs/Flags nach `import.meta.env` (`.env` + Vercel Env Vars) verschieben — trennt Config von Code.
- **Maßnahme (richtig, optional):** Admin-Check serverseitig ins Apps Script verlagern, statt clientseitig. Für eine Freundesrunde optional, aber ehrlich benannt.
- **Aufwand:** 30 Min (klein) / mehr (Server) · **Risiko:** gering · **Nutzen:** saubere Trennung, ehrliches Security-Modell.

---

## Priorität 2 — Performance (messbar, mittlerer Aufwand)

Kernproblem: **jede** Zustandsänderung rendert den kompletten ~3600-Zeilen-Baum neu, inkl. aller Standings/Tabellen. Verstärkt durch 121 pro-Render neu erzeugte Funktionen und 0 Memoisierung.

### 2.1 Countdown-Interval isolieren
- `src/App.jsx:1997` setzt jede **Sekunde** `lockCountdownNow = new Date()` → Re-Render der ganzen App im Sekundentakt, obwohl nur eine Countdown-Anzeige betroffen ist.
- **Maßnahme:** Countdown in eigene kleine Component (`<LockCountdown target={…}/>`) mit eigenem `useState`. Sekunden-Tick betrifft dann nur diese Component.
- **Aufwand:** 30 Min · **Nutzen:** eliminiert 1 Re-Render/Sekunde des Gesamtbaums.

### 2.2 Sub-Components memoisieren
- `TournamentStandings`, `LeaderboardTable`, `FunTable`, `MiddleEarthTables`, `TournamentProgressChart`, `RoundProgressChart` etc. sind Top-Level-Components, aber **nicht** `React.memo` → rechnen bei jedem Parent-Render neu (inkl. der teuren `build*Standings`-Aggregationen).
- **Maßnahme:** in `React.memo` wrappen; sicherstellen dass Props referenzstabil sind (siehe 2.3/2.4).
- **Aufwand:** 1–2 h · **Nutzen:** überspringt teure Tabellen-Rechnung wenn deren Daten unverändert.

### 2.3 Derived Values konsequent memoisieren
- Inline pro Render berechnet (nicht memoisiert), z. B. `displayedActiveRound` (Z. 1662), `activeCourse` (1664), `activeHoleData` (1676), diverse `.find()/.filter()`-Ketten.
- **Maßnahme:** in `useMemo` mit präzisen Dependencies überführen. Vorsicht: nur dort wo die Berechnung nicht trivial ist — Über-Memoisierung schadet auch.
- **Aufwand:** 2–3 h · **Nutzen:** stabile Referenzen als Voraussetzung für 2.2.

### 2.4 Interne Funktionen stabilisieren
- 121 Funktionen werden im Component-Body definiert → neue Referenz je Render. Solange sie nur bei Events aufgerufen werden, unkritisch; als Props an memoisierte Children brechen sie aber die Memoisierung.
- **Maßnahme:** die Handler, die an memoisierte Children gehen, in `useCallback`; reine Helfer ohne State-Bezug **aus dem Component herausziehen** (Modul-Ebene).
- **Aufwand:** verschränkt mit 2.5 · **Nutzen:** Voraussetzung für greifende Memoisierung.

### 2.5 State bündeln (`useReducer`)
- ~60 einzelne `useState` — viele gehören logisch zusammen (Flight-Ceremony: `running/stepIndex/syncStartAt/…`; Team-Ceremony analog; Lock-State; Admin-State).
- **Maßnahme:** verwandte States in `useReducer`-Slices zusammenfassen. Reduziert Setter-Flut, macht Übergänge atomar (kein Zwischen-Render mit inkonsistentem State).
- **Aufwand:** 3–5 h · **Risiko:** mittel (Logik-Umbau, gut testen) · **Nutzen:** weniger Renders, klarere Übergänge.

### 2.6 Polling smarter
- `src/App.jsx:1980` holt alle 30 s den **kompletten** State (`getState`) vom Apps Script.
- **Maßnahme (klein):** Backoff wenn Tab im Hintergrund (`visibilitychange`) — teils schon für Atomic-Time vorhanden, aufs Daten-Polling ausweiten.
- **Maßnahme (groß):** serverseitig `?since=<version>` / ETag, nur Deltas übertragen. Nur nötig wenn das Sheet spürbar langsam wird.
- **Aufwand:** 1 h (klein) · **Nutzen:** weniger Netzlast/Renders, längere Akkulaufzeit auf dem Platz.

---

## Priorität 3 — Refactor / Struktur (größter Aufwand, beste Langzeitwirkung)

Ziel: aus einer 5210-Zeilen-Datei eine modulare Struktur machen. **Inkrementell**, nach Prio 2 — memoisierte, stabile Grenzen erleichtern das Extrahieren.

Vorgeschlagene Struktur:
```
src/
  main.jsx
  App.jsx                 # nur noch Shell + Routing/Views
  lib/
    scoring.js            # Stableford, Handicap, Shots (getStablefordPoints, getShotsOnHole, …)
    standings.js          # build*Standings, sort*, Ranking
    draw.js               # Flight-/Team-Draw, seededRandom, shuffle
    storage.js            # readLocalJson/writeLocalJson/clear…
    sheet.js              # callSheetApi, loadData, save-Logik
    time.js               # Atomic-Time-Sync, getSyncedNowMs
  components/
    tables/               # LeaderboardTable, FunTable, TournamentStandings, MiddleEarthTables
    charts/               # TournamentProgressChart, RoundProgressChart
    steppers/             # TouchStepper, PuttStepper, ScoreStepper
    ceremony/             # Flight-/Team-Ceremony UI
    ui/                    # Card, CardContent, Button
  hooks/
    useAtomicTime.js
    useSheetSync.js
    useCeremony.js
```
- **Reihenfolge:** zuerst **reine Helfer** (kein State) rausziehen — die ~40 Top-Level-Funktionen vor Z. 1569 sind sofort verschiebbar (`lib/scoring.js`, `lib/standings.js`, `lib/draw.js`, `lib/storage.js`). Danach UI-Components, zuletzt die Hooks/Datenschicht.
- **Aufwand:** 1–3 Tage inkrementell · **Risiko:** mittel — **braucht ein Sicherheitsnetz** (siehe Prio 4) · **Nutzen:** wartbar, mehrere Leute/Agenten können parallel arbeiten, schnellere HMR.

---

## Priorität 4 — Tooling / Sicherheitsnetz (Enabler)

Ohne das ist Prio 3 riskant (keine Möglichkeit, Regressionen zu erkennen).

- **4.1 ESLint + Prettier** — `eslint-plugin-react-hooks` findet fehlende/falsche Dependencies (bei 182 Hooks garantiert lohnend). Aufwand: 1 h.
- **4.2 Vitest + ein paar Kern-Tests** — die reine Rechenlogik (`scoring.js`, `standings.js`, `draw.js`) ist ideal testbar und deckt das Herz der App ab. Aufwand: halber Tag für Grundstock.
- **4.3 GitHub Action** — `npm ci && npm run build && npm run lint && npm test` bei jedem Push. Aufwand: 30 Min.
- **Nutzen:** jede spätere Änderung (v. a. Refactor) wird automatisch abgesichert.

---

## Empfohlene Reihenfolge

1. **Prio 1 komplett** (Quick-Wins) — sofort sichtbarer Aufräum-Effekt, quasi risikofrei.
2. **Prio 4.1 + 4.3** (ESLint + CI) — billiges Sicherheitsnetz, deckt sofort Hook-Bugs auf.
3. **Prio 2.1 + 2.2** (Countdown isolieren, Tabellen memoisieren) — größter Perf-Gewinn fürs Geld.
4. **Prio 4.2** (Tests der Rechenlogik) — Netz vor dem großen Umbau.
5. **Prio 3** (Refactor) inkrementell, beginnend mit den reinen Helfern.
6. **Prio 2.3–2.6** (tiefere Perf) begleitend während/nach dem Refactor.

## Offene Fragen an dich (Flo)
- Wie viele Leute nutzen die App gleichzeitig? (relevant für Prio 2.6 Polling)
- Ist die App aktuell „live" (Turnier läuft) oder gibt's ein ruhiges Zeitfenster für Umbauten?
- Wie wichtig ist echte Admin-Sicherheit vs. „reicht als Kosmetik unter Freunden"?
- Soll ich Prio 1 gleich als konkrete Änderungen umsetzen, oder willst du erst drüberschauen?
