# Lord of the Holes

React/Vite scoring app for the Lord of the Holes golf rounds.

## Deploy on Vercel

1. Upload this project folder to a GitHub repository.
2. Import the repository in Vercel.
3. Use:
   - Framework Preset: Vite
   - Build Command: npm run build
   - Output Directory: dist
   - Install Command: npm install

## Offline / PWA

Die App wird per `vite-plugin-pwa` mit einem Service Worker gebaut. App-Shell,
Icons, Hintergrundbild und Intro-Sound liegen im Precache — die App startet damit
komplett ohne Netz (relevant auf dem Platz).

Nicht gecacht werden das Apps-Script-Backend und `/api/atomic-time`; beide gehen
immer ans Netz. Scores, die offline eingegeben werden, liegen wie bisher in
`localStorage` und werden bei Verbindung nachgesynct.

**Updates:** Ein neuer Service Worker übernimmt bewusst erst beim nächsten
Kaltstart (`registerType: "prompt"`), damit kein Reload mitten in die
Score-Eingabe platzt. Nach einem Deploy sehen Geräte die neue Version also erst,
wenn die App einmal vollständig geschlossen und neu geöffnet wurde.

## Google Sheet

No new sheet changes are required for deployment.

Keep Apps Script deployed as:
- Execute as: Me
- Who has access: Anyone

The current Apps Script URL is stored in `src/App.jsx`.
