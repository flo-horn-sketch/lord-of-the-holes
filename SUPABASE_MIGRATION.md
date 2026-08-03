# Umzug: Google-Tabelle → Supabase

Ziel: weg von der langsamen, unsicheren Google-Tabelle, hin zu einer echten
Datenbank (Supabase). **Sauberer, schneller, sicherer** – ohne dass sich für
deine Freunde beim Benutzen etwas ändert.

## Wie es danach aufgebaut ist (in Alltagssprache)

Heute: `App  →  Google-Hilfsprogramm  →  Google-Tabelle`

Neu: `App  →  kleine Tür-Funktion (auf Vercel)  →  Supabase-Datenbank`

Die „Tür-Funktion" ist wichtig für die **Sicherheit**: Der geheime
Datenbank-Schlüssel liegt nur dort auf dem Server – **nie** in der App, die
deine Freunde im Browser laden. So kann kein Fremder aus dem Internet die
Daten lesen oder verändern, obwohl es keinen Login gibt.

## Der Fahrplan (in ruhigen Schritten)

| # | Schritt | Wer macht's |
|---|---------|-------------|
| 1 | **Supabase-Account + Projekt anlegen** (kostenlos) | **Du** (ich führe dich durch) |
| 2 | Datenbank-Tabellen anlegen (Bauplan liegt fertig in `supabase/schema.sql`) | Ich |
| 3 | Bestehende Daten aus der Google-Tabelle in Supabase übertragen | Ich |
| 4 | „Tür-Funktion" auf Vercel bauen, die App mit Supabase verbindet | Ich |
| 5 | Geheime Schlüssel sicher in Vercel hinterlegen | Du + ich (Schritt für Schritt) |
| 6 | Auf einer **Test-Adresse** ausprobieren, ob alles läuft | Ich prüfe, du schaust mit |
| 7 | Erst wenn alles passt: live schalten. Google-Tabelle bleibt als Backup. | Gemeinsam |

**Wichtig & ehrlich:**
- Das ist ein größerer Umbau und passiert über mehrere Arbeits-Sitzungen.
- Deine **jetzige App bleibt die ganze Zeit unangetastet und live** – wir bauen
  das Neue daneben auf und schalten erst um, wenn es sicher funktioniert.
- Die Google-Tabelle **löschen wir nicht** – sie bleibt als Sicherheitsnetz.

## Das brauche ich von dir – Schritt 1: Account anlegen

1. Geh auf **https://supabase.com** und klick oben rechts auf **„Start your project"**.
2. Melde dich an (am einfachsten mit deinem GitHub-Konto `flo-horn-sketch`, das du schon hast – Button „Continue with GitHub").
3. Klick auf **„New project"**.
   - **Name:** z. B. `lord-of-the-holes`
   - **Database Password:** lass dir eins erzeugen und **speicher es sicher ab** (Passwort-Manager). Brauchen wir evtl. später.
   - **Region:** **Frankfurt (eu-central-1)** – nah an deinen Freunden = schnell.
4. Auf „Create new project" klicken und ~1 Minute warten, bis es fertig ist.

Wenn das steht, **sag mir einfach Bescheid** („Projekt ist da"). Dann erkläre
ich dir, wo du die zwei Angaben findest, die ich brauche – und wie du den
geheimen Schlüssel **sicher** (nicht hier im Chat) hinterlegst.

> Keine Sorge, dass du etwas kaputt machst: In diesem Schritt entsteht nur ein
> leeres, neues Projekt. Es ist mit deiner App noch gar nicht verbunden.
