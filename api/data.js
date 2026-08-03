// "Tür-Funktion": einziger Zugang zwischen App und Supabase-Datenbank.
// Läuft auf dem Server (Vercel). Der geheime service_role-Schlüssel liegt NUR
// hier in den Umgebungsvariablen – nie in der App im Browser.
//
// Spricht bewusst dasselbe {action: ...}-Protokoll wie das alte Apps-Script,
// damit die App unverändert weiterfunktioniert (Drop-in-Ersatz).
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } })
  : null;

// Aktionen, die den Turnierzustand verändern und deshalb das Admin-Passwort
// brauchen. Alles andere (getState, upsertScores) bleibt offen – das machen
// die Spieler-Geräte im normalen Betrieb.
const ADMIN_ACTIONS = new Set([
  "verifyAdmin",
  "saveSeason",
  "startNewSeason",
  "saveSetup",
  "saveFlightDraw",
  "saveTeamDraw",
  "clearTeamDraw",
  "setAppLocked",
  "clearScores",
  "resetDeviceAssignments",
  "clearResetMarkersAndFullReset",
  "createRoundBackup",
]);

// Vergleich mit konstanter Laufzeit, damit sich das Passwort nicht über
// Antwortzeiten Zeichen für Zeichen erraten lässt.
function passwordMatches(candidate) {
  const expected = String(ADMIN_PASSWORD ?? "");
  const given = String(candidate ?? "");
  if (!expected) return false;
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(given, "utf8");
  if (a.length !== b.length) {
    // Trotzdem einmal vergleichen, damit die Laufzeit nicht die Länge verrät.
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}

// ---- kleine Helfer ------------------------------------------------
function nb(v) {
  if (v === true) return true;
  if (v === false || v == null) return false;
  const s = String(v).trim().toLowerCase();
  return s === "true" || s === "1" || s === "wahr" || s === "yes" || s === "ja";
}
function numOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}
function numOr0(v) {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}
function readBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}
function must(result) {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

// ---- Aktionen -----------------------------------------------------
// Welche Saison ist gerade "die laufende"? Bevorzugt eine ausdruecklich auf
// "active" gesetzte, sonst die neueste noch nicht archivierte, sonst die
// neueste ueberhaupt. So bleibt die App auch dann bedienbar, wenn nach dem
// Archivieren noch niemand die neue Saison scharf geschaltet hat.
function pickCurrentSeason(seasonRows = []) {
  const list = [...(seasonRows || [])].sort((a, b) => Number(b.season) - Number(a.season));
  return list.find((s) => String(s.status).toLowerCase() === "active")
    || list.find((s) => String(s.status).toLowerCase() !== "archived")
    || list[0]
    || null;
}

// Spieler mit dem Handicap der jeweiligen Saison. Ohne das wuerde eine
// spaetere Handicap-Aenderung die Ergebnisse vergangener Turniere verschieben.
function mergePlayersWithSeason(playerRows = [], seasonRows = []) {
  const bySeason = new Map((seasonRows || []).map((r) => [String(r.player_id), r]));
  return (playerRows || []).map((p) => {
    const s = bySeason.get(String(p.id));
    if (!s) return p;
    return {
      ...p,
      handicap_index: s.handicap_index ?? p.handicap_index,
      alias_name: s.alias_name || p.alias_name,
      sort_order: s.sort_order ?? p.sort_order,
    };
  });
}

function mapScoreRows(rows = []) {
  return (rows || []).map((s) => ({
    round_id: s.round_id,
    player_id: s.player_id,
    hole_number: s.hole_number,
    strokes: s.strokes,
    putts_count: s.putts_count,
    picked_up: s.picked_up,
    over_two_putts: s.over_two_putts,
    lady: s.lady,
    scorer_player_id: s.scorer_player_id || "",
    updated_at: s.updated_at,
  }));
}

async function getState() {
  const seasonRows = must(await supabase.from("seasons").select("*").order("season", { ascending: false })) || [];
  const current = pickCurrentSeason(seasonRows);
  const season = Number(current?.season || new Date().getFullYear());

  const [players, courses, rounds, holes, roundPlayers, scores, teamDraw, flight, appState, playerSeasons] = await Promise.all([
    supabase.from("players").select("*").order("sort_order"),
    supabase.from("courses").select("*"),
    supabase.from("rounds").select("*").eq("season", season).order("sort_order"),
    supabase.from("holes").select("*").order("course_id").order("hole_number"),
    supabase.from("round_players").select("*").eq("season", season),
    supabase.from("scores").select("*").eq("season", season),
    supabase.from("team_draw").select("*").eq("season", season).order("sort_order"),
    supabase.from("flight_draw").select("draw").eq("season", season).maybeSingle(),
    supabase.from("app_state").select("*").eq("id", 1).maybeSingle(),
    supabase.from("player_seasons").select("*").eq("season", season),
  ]);

  const rp = (must(roundPlayers) || []).map((r) => ({ round_id: r.round_id, player_id: r.player_id, is_playing: true }));
  const sc = mapScoreRows(must(scores));
  const st = must(appState) || {};
  const flightDraw = must(flight)?.draw || null;
  const teamRows = must(teamDraw) || [];
  const roundRows = must(rounds) || [];
  const activeRound = roundRows.find((r) => String(r.status).toLowerCase() === "active") || null;
  const playerRows = mergePlayersWithSeason(must(players), must(playerSeasons));
  const now = new Date().toISOString();

  return {
    ok: true,
    server_now: now, serverNow: now,
    app_locked: st.app_locked ?? true, appLocked: st.app_locked ?? true,
    full_reset_at: st.full_reset_at || "", fullResetAt: st.full_reset_at || "",
    scores_reset_at: st.scores_reset_at || "", scoresResetAt: st.scores_reset_at || "",
    device_assignments_reset_at: st.device_assignments_reset_at || "", deviceAssignmentsResetAt: st.device_assignments_reset_at || "",
    // Termine kommen jetzt aus der Datenbank statt aus Konstanten im Bundle.
    season,
    season_title: current?.title || "", seasonTitle: current?.title || "",
    season_status: current?.status || "", seasonStatus: current?.status || "",
    lock_at: current?.lock_at || "", lockAt: current?.lock_at || "",
    flight_draw_at: current?.flight_draw_at || "", flightDrawAt: current?.flight_draw_at || "",
    seasons: seasonRows,
    players: playerRows,
    courses: must(courses) || [],
    rounds: roundRows,
    holes: must(holes) || [],
    roundPlayers: rp,
    scores: sc,
    team_draw_rows: teamRows, teamDrawRows: teamRows,
    flight_draw: flightDraw, flightDraw: flightDraw,
    activeRound,
  };
}

// Archiv: liefert je vergangener Saison die Rohdaten, aus denen der Client mit
// seinen eigenen Funktionen (buildFinalNetStandings & Co.) den Endstand
// rechnet. Bewusst keine serverseitige Zweitberechnung - sonst koennten App
// und Archiv unterschiedliche Sieger anzeigen.
async function getHistory() {
  const seasonRows = must(await supabase.from("seasons").select("*").order("season", { ascending: false })) || [];
  const current = pickCurrentSeason(seasonRows);
  // Alles ausser der laufenden Saison. Bewusst nicht nur "archived": sonst
  // taucht ein gerade abgeschlossenes Turnier erst dann in den Erfolgen auf,
  // wenn jemand daran denkt, es von Hand zu archivieren.
  const past = seasonRows.filter((s) => Number(s.season) !== Number(current?.season));
  if (!past.length) return { ok: true, seasons: [] };

  const ids = past.map((s) => Number(s.season));
  const [players, rounds, roundPlayers, scores, playerSeasons] = await Promise.all([
    supabase.from("players").select("*").order("sort_order"),
    supabase.from("rounds").select("*").in("season", ids).order("sort_order"),
    supabase.from("round_players").select("*").in("season", ids),
    supabase.from("scores").select("*").in("season", ids),
    supabase.from("player_seasons").select("*").in("season", ids),
  ]);

  const allPlayers = must(players) || [];
  const allRounds = must(rounds) || [];
  const allRoundPlayers = must(roundPlayers) || [];
  const allScores = must(scores) || [];
  const allPlayerSeasons = must(playerSeasons) || [];

  return {
    ok: true,
    seasons: past.map((s) => {
      const season = Number(s.season);
      return {
        season,
        title: s.title || "",
        lock_at: s.lock_at || "",
        flight_draw_at: s.flight_draw_at || "",
        players: mergePlayersWithSeason(allPlayers, allPlayerSeasons.filter((r) => Number(r.season) === season))
          .filter((p) => allPlayerSeasons.some((r) => Number(r.season) === season && String(r.player_id) === String(p.id))),
        rounds: allRounds.filter((r) => Number(r.season) === season),
        roundPlayers: allRoundPlayers.filter((r) => Number(r.season) === season)
          .map((r) => ({ round_id: r.round_id, player_id: r.player_id, is_playing: true })),
        scores: mapScoreRows(allScores.filter((r) => Number(r.season) === season)),
      };
    }),
  };
}

// Laufende Saison als Zahl. Alle schreibenden Aktionen haengen daran, damit
// nie versehentlich in ein archiviertes Turnier geschrieben wird.
async function currentSeasonNumber() {
  const rows = must(await supabase.from("seasons").select("*").order("season", { ascending: false })) || [];
  const current = pickCurrentSeason(rows);
  if (!current) throw new Error("Keine Saison angelegt.");
  return Number(current.season);
}

async function upsertScores(scores = []) {
  const season = await currentSeasonNumber();
  const rows = (scores || [])
    .filter((s) => s && s.round_id && s.player_id && s.hole_number != null)
    .map((s) => {
      const scorer = String(s.scorer_player_id || "").trim();
      const isControl = Boolean(scorer && scorer === String(s.player_id));
      return {
        season,
        round_id: String(s.round_id),
        player_id: String(s.player_id),
        hole_number: Number(s.hole_number),
        is_control: isControl,
        scorer_player_id: scorer,
        strokes: numOrNull(s.strokes),
        putts_count: numOrNull(s.putts_count),
        picked_up: nb(s.picked_up),
        over_two_putts: nb(s.over_two_putts),
        lady: nb(s.lady),
        updated_at: s.updated_at || new Date().toISOString(),
      };
    });
  if (rows.length) {
    must(await supabase.from("scores").upsert(rows, { onConflict: "season,round_id,player_id,hole_number,is_control" }));
  }
  return { ok: true, saved: rows.length, season };
}

async function saveSetup(body) {
  const season = await currentSeasonNumber();
  const players = body.players || [];
  if (players.length) {
    const rows = players.map((p) => ({
      id: String(p.id),
      character_name: p.character_name || "",
      display_name: p.display_name || "",
      alias_name: p.alias_name || "",
      sort_order: numOr0(p.sort_order),
      handicap_index: numOr0(p.handicap_index),
      course_hcp_goethe: numOr0(p.course_hcp_goethe),
      course_hcp_feininger: numOr0(p.course_hcp_feininger),
    }));
    must(await supabase.from("players").upsert(rows, { onConflict: "id" }));
    // Handicap-Stand der laufenden Saison mitschreiben, damit spaetere
    // Aenderungen die Ergebnisse dieses Turniers nicht rueckwirkend verschieben.
    must(await supabase.from("player_seasons").upsert(
      rows.map((p) => ({
        season,
        player_id: p.id,
        handicap_index: p.handicap_index,
        alias_name: p.alias_name,
        sort_order: p.sort_order,
      })),
      { onConflict: "season,player_id" },
    ));
  }
  const roundId = String(body.round_id || "");
  const courseId = String(body.course_id || "");
  if (roundId) {
    // bisher aktive Runde herabstufen, gewählte Runde aktivieren
    must(await supabase.from("rounds").update({ status: "upcoming" }).eq("season", season).eq("status", "active").neq("round_id", roundId));
    const patch = { status: "active" };
    if (courseId) patch.course_id = courseId;
    must(await supabase.from("rounds").update(patch).eq("season", season).eq("round_id", roundId));
  }
  return { ok: true, season };
}

async function saveFlightDraw(draw) {
  const season = await currentSeasonNumber();
  must(await supabase.from("flight_draw").upsert(
    { season, draw: draw ?? null, updated_at: new Date().toISOString() },
    { onConflict: "season" },
  ));
  return { ok: true, flight_draw: draw ?? null, flightDraw: draw ?? null, season };
}

async function saveTeamDraw(rows) {
  const season = await currentSeasonNumber();
  must(await supabase.from("team_draw").delete().eq("season", season));
  const clean = (rows || []).map((r) => ({
    season,
    draw_key: String(r.draw_key || ""),
    round_id: String(r.round_id || ""),
    round_name: String(r.round_name || ""),
    team_number: String(r.team_number || ""),
    player_id: String(r.player_id || ""),
    player_name: String(r.player_name || ""),
    player_alias: String(r.player_alias || ""),
    sort_order: numOr0(r.sort_order),
    created_at: r.created_at || new Date().toISOString(),
    updated_at: r.updated_at || new Date().toISOString(),
    is_test: nb(r.is_test),
  }));
  if (clean.length) must(await supabase.from("team_draw").insert(clean));
  const data = must(await supabase.from("team_draw").select("*").eq("season", season).order("sort_order")) || [];
  return { ok: true, team_draw_rows: data, teamDrawRows: data };
}

async function clearTeamDraw() {
  const season = await currentSeasonNumber();
  must(await supabase.from("team_draw").delete().eq("season", season));
  return { ok: true, team_draw_rows: [], teamDrawRows: [] };
}

async function setAppLocked(value) {
  const locked = nb(value);
  must(await supabase.from("app_state").update({ app_locked: locked, updated_at: new Date().toISOString() }).eq("id", 1));
  return { ok: true, app_locked: locked, appLocked: locked };
}

async function clearScores() {
  // Nur die laufende Saison. Archivierte Turniere bleiben unangetastet -
  // ohne diese Einschraenkung wuerde ein Admin-Klick die Historie loeschen.
  const season = await currentSeasonNumber();
  const marker = new Date().toISOString();
  must(await supabase.from("scores").delete().eq("season", season));
  must(await supabase.from("app_state").update({ scores_reset_at: marker, updated_at: marker }).eq("id", 1));
  return { ok: true, scores_reset_at: marker, scoresResetAt: marker, season };
}

async function resetDeviceAssignments() {
  const marker = new Date().toISOString();
  must(await supabase.from("app_state").update({ device_assignments_reset_at: marker, updated_at: marker }).eq("id", 1));
  return { ok: true, device_assignments_reset_at: marker, deviceAssignmentsResetAt: marker };
}

async function createRoundBackup(roundId) {
  const season = await currentSeasonNumber();
  const rid = String(roundId || "").trim();
  if (!rid) return { ok: false, error: "round_id fehlt." };
  const rows = must(await supabase.from("scores").select("*").eq("season", season).eq("round_id", rid)) || [];
  must(await supabase.from("score_backups").insert({
    round_id: rid,
    created_at: new Date().toISOString(),
    snapshot: rows,
  }));
  return { ok: true, round_id: rid, backed_up: rows.length, season };
}

async function fullReset() {
  // Ebenfalls nur die laufende Saison - das Archiv ist tabu.
  const season = await currentSeasonNumber();
  const marker = new Date().toISOString();
  must(await supabase.from("scores").delete().eq("season", season));
  must(await supabase.from("team_draw").delete().eq("season", season));
  must(await supabase.from("flight_draw").delete().eq("season", season));
  // app_locked bewusst mit auf true setzen, damit der Reset auf allen Geräten
  // konsistent bleibt (sonst entsperrt der nächste 30s-Sync die Splash wieder).
  must(await supabase.from("app_state").update({
    app_locked: true, full_reset_at: marker, scores_reset_at: marker, device_assignments_reset_at: marker, updated_at: marker,
  }).eq("id", 1));
  return { ok: true, full_reset_at: marker, fullResetAt: marker, season };
}

// Termine und Titel der Saison pflegen - ersetzt die frueheren Konstanten.
async function saveSeason(body) {
  const season = Number(body.season || 0);
  if (!season) return { ok: false, error: "season fehlt." };
  const patch = { season };
  if (body.title != null) patch.title = String(body.title);
  if (body.status != null) patch.status = String(body.status);
  if (body.lock_at !== undefined) patch.lock_at = body.lock_at || null;
  if (body.flight_draw_at !== undefined) patch.flight_draw_at = body.flight_draw_at || null;
  must(await supabase.from("seasons").upsert(patch, { onConflict: "season" }));
  const rows = must(await supabase.from("seasons").select("*").order("season", { ascending: false })) || [];
  return { ok: true, seasons: rows };
}

// Turnierjahr abschliessen und das naechste aufsetzen: die alte Saison wird
// archiviert (Daten bleiben vollstaendig liegen), die neue bekommt vier frische
// Runden und den aktuellen Handicap-Stand.
async function startNewSeason(body) {
  const newSeason = Number(body.season || 0);
  if (!newSeason) return { ok: false, error: "season fehlt." };
  const previous = await currentSeasonNumber().catch(() => null);

  must(await supabase.from("seasons").upsert({
    season: newSeason,
    title: String(body.title || ""),
    status: "active",
    lock_at: body.lock_at || null,
    flight_draw_at: body.flight_draw_at || null,
  }, { onConflict: "season" }));

  if (previous && previous !== newSeason) {
    must(await supabase.from("seasons").update({ status: "archived" }).eq("season", previous));
  }

  const existing = must(await supabase.from("rounds").select("round_id").eq("season", newSeason)) || [];
  if (!existing.length) {
    const template = (body.rounds && body.rounds.length) ? body.rounds : [
      { round_id: "r1", round_name: "Runde 1", stage: "qualification", sort_order: 1, course_id: "goethe" },
      { round_id: "r2", round_name: "Runde 2", stage: "qualification", sort_order: 2, course_id: "feininger" },
      { round_id: "r3", round_name: "Runde 3", stage: "qualification", sort_order: 3, course_id: "goethe" },
      { round_id: "r4", round_name: "Finaltag", stage: "final",        sort_order: 4, course_id: "feininger" },
    ];
    must(await supabase.from("rounds").insert(template.map((r, i) => ({
      season: newSeason,
      round_id: String(r.round_id),
      round_name: String(r.round_name || r.round_id),
      stage: String(r.stage || "qualification"),
      sort_order: numOr0(r.sort_order) || i + 1,
      course_id: r.course_id || null,
      status: i === 0 ? "active" : "upcoming",
    }))));
  }

  const players = must(await supabase.from("players").select("*")) || [];
  if (players.length) {
    must(await supabase.from("player_seasons").upsert(players.map((p) => ({
      season: newSeason,
      player_id: p.id,
      handicap_index: p.handicap_index ?? 0,
      alias_name: p.alias_name || "",
      sort_order: p.sort_order ?? 0,
    })), { onConflict: "season,player_id" }));

    const roundIds = (must(await supabase.from("rounds").select("round_id").eq("season", newSeason)) || []).map((r) => r.round_id);
    const links = [];
    roundIds.forEach((rid) => players.forEach((p) => links.push({ season: newSeason, round_id: rid, player_id: p.id })));
    if (links.length) must(await supabase.from("round_players").upsert(links, { onConflict: "season,round_id,player_id" }));
  }

  return { ok: true, season: newSeason, archived: previous };
}

// ---- Einstieg -----------------------------------------------------
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST erforderlich." });

  const body = readBody(req);
  const action = body.action;

  // Türsteher zuerst, noch vor jeder Konfigurationsprüfung: Wer sich nicht
  // ausweist, soll auch nichts über den Zustand des Servers erfahren.
  // Ohne gesetzte Umgebungsvariable wird bewusst alles abgelehnt (fail closed),
  // damit eine vergessene Konfiguration nicht in einer offenen Tür endet.
  if (ADMIN_ACTIONS.has(action)) {
    if (!ADMIN_PASSWORD || !passwordMatches(body.admin_password)) {
      return res.status(403).json({ ok: false, error: "Admin-Passwort ist falsch." });
    }
  }

  // Reine Passwortprüfung – braucht keine Datenbank. Wird bewusst vor dem
  // Supabase-Check beantwortet, damit das Admin-Panel auch dann noch aufgeht,
  // wenn die Datenbankverbindung gerade klemmt.
  if (action === "verifyAdmin") return res.status(200).json({ ok: true });

  if (!supabase) return res.status(500).json({ ok: false, error: "Supabase-Konfiguration fehlt (SUPABASE_URL / SUPABASE_SERVICE_KEY)." });

  try {
    switch (action) {
      case "getState": return res.status(200).json(await getState());
      case "getHistory": return res.status(200).json(await getHistory());
      case "saveSeason": return res.status(200).json(await saveSeason(body));
      case "startNewSeason": return res.status(200).json(await startNewSeason(body));
      case "upsertScores": return res.status(200).json(await upsertScores(body.scores));
      case "upsertScore": return res.status(200).json(await upsertScores([body.score]));
      case "saveSetup": return res.status(200).json(await saveSetup(body));
      case "saveFlightDraw": return res.status(200).json(await saveFlightDraw(body.draw));
      case "saveTeamDraw": return res.status(200).json(await saveTeamDraw(body.rows));
      case "clearTeamDraw": return res.status(200).json(await clearTeamDraw());
      case "setAppLocked": return res.status(200).json(await setAppLocked(body.app_locked));
      case "clearScores": return res.status(200).json(await clearScores());
      case "resetDeviceAssignments": return res.status(200).json(await resetDeviceAssignments());
      case "clearResetMarkersAndFullReset": return res.status(200).json(await fullReset());
      case "createRoundBackup": return res.status(200).json(await createRoundBackup(body.round_id));
      default: return res.status(400).json({ ok: false, error: "Unbekannte Aktion: " + String(action) });
    }
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
