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
async function getState() {
  const [players, courses, rounds, holes, roundPlayers, scores, teamDraw, flight, appState] = await Promise.all([
    supabase.from("players").select("*").order("sort_order"),
    supabase.from("courses").select("*"),
    supabase.from("rounds").select("*").order("sort_order"),
    supabase.from("holes").select("*").order("course_id").order("hole_number"),
    supabase.from("round_players").select("*"),
    supabase.from("scores").select("*"),
    supabase.from("team_draw").select("*").order("sort_order"),
    supabase.from("flight_draw").select("draw").eq("id", 1).maybeSingle(),
    supabase.from("app_state").select("*").eq("id", 1).maybeSingle(),
  ]);

  const rp = (must(roundPlayers) || []).map((r) => ({ round_id: r.round_id, player_id: r.player_id, is_playing: true }));
  const sc = (must(scores) || []).map((s) => ({
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
  const st = must(appState) || {};
  const flightDraw = must(flight)?.draw || null;
  const teamRows = must(teamDraw) || [];
  const roundRows = must(rounds) || [];
  const activeRound = roundRows.find((r) => String(r.status).toLowerCase() === "active") || null;
  const now = new Date().toISOString();

  return {
    ok: true,
    server_now: now, serverNow: now,
    app_locked: st.app_locked ?? true, appLocked: st.app_locked ?? true,
    full_reset_at: st.full_reset_at || "", fullResetAt: st.full_reset_at || "",
    scores_reset_at: st.scores_reset_at || "", scoresResetAt: st.scores_reset_at || "",
    device_assignments_reset_at: st.device_assignments_reset_at || "", deviceAssignmentsResetAt: st.device_assignments_reset_at || "",
    players: must(players) || [],
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

async function upsertScores(scores = []) {
  const rows = (scores || [])
    .filter((s) => s && s.round_id && s.player_id && s.hole_number != null)
    .map((s) => {
      const scorer = String(s.scorer_player_id || "").trim();
      const isControl = Boolean(scorer && scorer === String(s.player_id));
      return {
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
    must(await supabase.from("scores").upsert(rows, { onConflict: "round_id,player_id,hole_number,is_control" }));
  }
  return { ok: true, saved: rows.length };
}

async function saveSetup(body) {
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
  }
  const roundId = String(body.round_id || "");
  const courseId = String(body.course_id || "");
  if (roundId) {
    // bisher aktive Runde herabstufen, gewählte Runde aktivieren
    must(await supabase.from("rounds").update({ status: "upcoming" }).eq("status", "active").neq("round_id", roundId));
    const patch = { status: "active" };
    if (courseId) patch.course_id = courseId;
    must(await supabase.from("rounds").update(patch).eq("round_id", roundId));
  }
  return { ok: true };
}

async function saveFlightDraw(draw) {
  must(await supabase.from("flight_draw").upsert(
    { id: 1, draw: draw ?? null, updated_at: new Date().toISOString() },
    { onConflict: "id" },
  ));
  return { ok: true, flight_draw: draw ?? null, flightDraw: draw ?? null };
}

async function saveTeamDraw(rows) {
  must(await supabase.from("team_draw").delete().gt("id", 0));
  const clean = (rows || []).map((r) => ({
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
  const data = must(await supabase.from("team_draw").select("*").order("sort_order")) || [];
  return { ok: true, team_draw_rows: data, teamDrawRows: data };
}

async function clearTeamDraw() {
  must(await supabase.from("team_draw").delete().gt("id", 0));
  return { ok: true, team_draw_rows: [], teamDrawRows: [] };
}

async function setAppLocked(value) {
  const locked = nb(value);
  must(await supabase.from("app_state").update({ app_locked: locked, updated_at: new Date().toISOString() }).eq("id", 1));
  return { ok: true, app_locked: locked, appLocked: locked };
}

async function clearScores() {
  const marker = new Date().toISOString();
  must(await supabase.from("scores").delete().gte("hole_number", 0));
  must(await supabase.from("app_state").update({ scores_reset_at: marker, updated_at: marker }).eq("id", 1));
  return { ok: true, scores_reset_at: marker, scoresResetAt: marker };
}

async function resetDeviceAssignments() {
  const marker = new Date().toISOString();
  must(await supabase.from("app_state").update({ device_assignments_reset_at: marker, updated_at: marker }).eq("id", 1));
  return { ok: true, device_assignments_reset_at: marker, deviceAssignmentsResetAt: marker };
}

async function createRoundBackup(roundId) {
  const rid = String(roundId || "").trim();
  if (!rid) return { ok: false, error: "round_id fehlt." };
  const rows = must(await supabase.from("scores").select("*").eq("round_id", rid)) || [];
  must(await supabase.from("score_backups").insert({
    round_id: rid,
    created_at: new Date().toISOString(),
    snapshot: rows,
  }));
  return { ok: true, round_id: rid, backed_up: rows.length };
}

async function fullReset() {
  const marker = new Date().toISOString();
  must(await supabase.from("scores").delete().gte("hole_number", 0));
  must(await supabase.from("team_draw").delete().gt("id", 0));
  must(await supabase.from("flight_draw").delete().eq("id", 1));
  // app_locked bewusst mit auf true setzen, damit der Reset auf allen Geräten
  // konsistent bleibt (sonst entsperrt der nächste 30s-Sync die Splash wieder).
  must(await supabase.from("app_state").update({
    app_locked: true, full_reset_at: marker, scores_reset_at: marker, device_assignments_reset_at: marker, updated_at: marker,
  }).eq("id", 1));
  return { ok: true, full_reset_at: marker, fullResetAt: marker };
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
