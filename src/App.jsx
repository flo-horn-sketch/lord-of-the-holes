import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

function Card({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function CardContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function Button({ className = "", children, type = "button", ...props }) {
  return (
    <button type={type} className={className} {...props}>
      {children}
    </button>
  );
}

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Lord of the Holes runtime error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-stone-950 p-4 text-amber-50">
          <div className="mx-auto max-w-md rounded-2xl border border-red-500/60 bg-red-950/40 p-4">
            <div className="font-serif text-lg text-red-100">App-Fehler</div>
            <p className="mt-2 text-sm text-red-100/80">Die App konnte nicht vollständig geladen werden. Bitte diese Meldung oder den Konsolenfehler schicken.</p>
            <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-black/40 p-3 text-xs text-red-100">{String(this.state.error?.message || this.state.error)}</pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbyamITQ2Nj7h9woLyZ2inRlRpBbZYxL6ZVOPn5HEQ1LdPLREqEu2jNzAnYphCsHsS7N/exec";
const ADMIN_PASSWORD = "weimar";
const LOCK_COUNTDOWN_TARGET = new Date("2026-05-22T11:00:00+02:00");

const fallbackAliases = {
  florian: "Sliceron",
  kio: "Foredo",
  phillip: "Golfum",
  achim: "Gangolf",
  andreas: "Bogeymir",
  mucky: "Gimme",
};

const fallbackPlayers = [
  { id: "florian", character_name: "Florian", display_name: "Florian", alias_name: "Sliceron", sort_order: 1, handicap_index: 0, course_hcp_goethe: 0, course_hcp_feininger: 0 },
  { id: "mucky", character_name: "Mucky", display_name: "Mucky", alias_name: "Gimme", sort_order: 2, handicap_index: 0, course_hcp_goethe: 0, course_hcp_feininger: 0 },
  { id: "kio", character_name: "Kio", display_name: "Kio", alias_name: "Foredo", sort_order: 3, handicap_index: 0, course_hcp_goethe: 0, course_hcp_feininger: 0 },
  { id: "andreas", character_name: "Andreas", display_name: "Andreas", alias_name: "Bogeymir", sort_order: 4, handicap_index: 0, course_hcp_goethe: 0, course_hcp_feininger: 0 },
  { id: "achim", character_name: "Achim", display_name: "Achim", alias_name: "Gangolf", sort_order: 5, handicap_index: 0, course_hcp_goethe: 0, course_hcp_feininger: 0 },
  { id: "phillip", character_name: "Phillip", display_name: "Phillip", alias_name: "Golfum", sort_order: 6, handicap_index: 0, course_hcp_goethe: 0, course_hcp_feininger: 0 },
];

const fallbackCourses = [
  { course_id: "goethe", course_name: "Goethe Kurs", course_rating: 72.0, slope_rating: 131, par: 72 },
  { course_id: "feininger", course_name: "Feininger Kurs", course_rating: 70.4, slope_rating: 122, par: 71 },
];

const fallbackRounds = [
  { round_id: "r1", round_name: "Runde 1", course_id: "goethe", status: "active", stage: "qualification", sort_order: 1 },
  { round_id: "r2", round_name: "Runde 2", course_id: "goethe", status: "upcoming", stage: "qualification", sort_order: 2 },
  { round_id: "r3", round_name: "Runde 3", course_id: "feininger", status: "upcoming", stage: "qualification", sort_order: 3 },
  { round_id: "r4", round_name: "Finaltag", course_id: "goethe", status: "upcoming", stage: "final", sort_order: 4 },
];

const fallbackHoles = [
  { course_id: "goethe", hole_number: 1, meters: 345, par: 4, hcp: 11 },
  { course_id: "goethe", hole_number: 2, meters: 474, par: 5, hcp: 5 },
  { course_id: "goethe", hole_number: 3, meters: 155, par: 3, hcp: 13 },
  { course_id: "goethe", hole_number: 4, meters: 486, par: 5, hcp: 1 },
  { course_id: "goethe", hole_number: 5, meters: 323, par: 4, hcp: 9 },
  { course_id: "goethe", hole_number: 6, meters: 367, par: 4, hcp: 3 },
  { course_id: "goethe", hole_number: 7, meters: 450, par: 5, hcp: 7 },
  { course_id: "goethe", hole_number: 8, meters: 144, par: 3, hcp: 17 },
  { course_id: "goethe", hole_number: 9, meters: 278, par: 4, hcp: 15 },
  { course_id: "goethe", hole_number: 10, meters: 379, par: 4, hcp: 6 },
  { course_id: "goethe", hole_number: 11, meters: 180, par: 3, hcp: 18 },
  { course_id: "goethe", hole_number: 12, meters: 335, par: 4, hcp: 10 },
  { course_id: "goethe", hole_number: 13, meters: 363, par: 4, hcp: 4 },
  { course_id: "goethe", hole_number: 14, meters: 349, par: 4, hcp: 14 },
  { course_id: "goethe", hole_number: 15, meters: 324, par: 4, hcp: 12 },
  { course_id: "goethe", hole_number: 16, meters: 172, par: 3, hcp: 16 },
  { course_id: "goethe", hole_number: 17, meters: 530, par: 5, hcp: 2 },
  { course_id: "goethe", hole_number: 18, meters: 317, par: 4, hcp: 8 },
  { course_id: "feininger", hole_number: 1, meters: 338, par: 4, hcp: 9 },
  { course_id: "feininger", hole_number: 2, meters: 142, par: 3, hcp: 17 },
  { course_id: "feininger", hole_number: 3, meters: 483, par: 5, hcp: 3 },
  { course_id: "feininger", hole_number: 4, meters: 348, par: 4, hcp: 7 },
  { course_id: "feininger", hole_number: 5, meters: 371, par: 4, hcp: 1 },
  { course_id: "feininger", hole_number: 6, meters: 160, par: 3, hcp: 15 },
  { course_id: "feininger", hole_number: 7, meters: 512, par: 5, hcp: 5 },
  { course_id: "feininger", hole_number: 8, meters: 342, par: 4, hcp: 11 },
  { course_id: "feininger", hole_number: 9, meters: 319, par: 4, hcp: 13 },
  { course_id: "feininger", hole_number: 10, meters: 340, par: 4, hcp: 8 },
  { course_id: "feininger", hole_number: 11, meters: 155, par: 3, hcp: 18 },
  { course_id: "feininger", hole_number: 12, meters: 487, par: 5, hcp: 2 },
  { course_id: "feininger", hole_number: 13, meters: 362, par: 4, hcp: 6 },
  { course_id: "feininger", hole_number: 14, meters: 330, par: 4, hcp: 10 },
  { course_id: "feininger", hole_number: 15, meters: 170, par: 3, hcp: 16 },
  { course_id: "feininger", hole_number: 16, meters: 389, par: 4, hcp: 4 },
  { course_id: "feininger", hole_number: 17, meters: 315, par: 4, hcp: 14 },
  { course_id: "feininger", hole_number: 18, meters: 358, par: 4, hcp: 12 },
];

function cls(...items) {
  return items.filter(Boolean).join(" ");
}

function Icon({ children, className = "", size = 18, spin = false }) {
  return (
    <span aria-hidden="true" className={cls("inline-flex items-center justify-center leading-none", spin && "animate-spin", className)} style={{ width: size, height: size, fontSize: size }}>
      {children}
    </span>
  );
}

function normalizeBoolean(value) {
  return value === true || String(value).toLowerCase().trim() === "true" || String(value).toLowerCase().trim() === "ja" || String(value).trim() === "1";
}

function cleanHandicapInput(value) {
  const normalized = String(value ?? "").replace(",", ".").replace(/[^0-9.-]/g, "");
  const firstMinus = normalized.startsWith("-") ? "-" : "";
  const withoutMinus = normalized.replace(/-/g, "");
  const parts = withoutMinus.split(".");
  return firstMinus + parts[0] + (parts.length > 1 ? "." + parts.slice(1).join("") : "");
}

function readLocalJson(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function formatToPar(value, played = true) {
  if (!played) return "–";
  if (value === 0) return "E";
  return value > 0 ? `+${value}` : String(value);
}

function withFallbackAlias(player) {
  if (!player) return player;
  const id = String(player.id || "").trim();
  return {
    ...player,
    id,
    character_name: String(player.character_name || player.display_name || id || "").trim(),
    display_name: String(player.display_name || player.character_name || id || "").trim(),
    alias_name: String(player.alias_name || fallbackAliases[id] || "").trim(),
    sort_order: Number(player.sort_order || 0),
  };
}

function getPlayerLabel(player) {
  if (!player) return "";
  const normalized = withFallbackAlias(player);
  const realName = normalized.character_name || normalized.display_name || normalized.id;
  return normalized.alias_name ? `${normalized.alias_name} (${realName})` : realName;
}

function normalizeHoles(rawHoles) {
  const validHoles = Array.isArray(rawHoles) ? rawHoles.filter((h) => Number(h.hole_number) > 0 && Number(h.par) > 0 && Number(h.hcp) > 0) : [];
  return validHoles.length ? validHoles : fallbackHoles;
}

function getCourseSettings(id, list = fallbackCourses) {
  const cid = String(id || "goethe").toLowerCase().trim();
  const fallbackCourse = cid === "feininger" ? fallbackCourses[1] : fallbackCourses[0];
  const sheetCourse = (list || []).find((item) => String(item?.course_id || "").toLowerCase().trim() === cid);
  return {
    ...fallbackCourse,
    ...sheetCourse,
    course_rating: Number(sheetCourse?.course_rating || sheetCourse?.rating || sheetCourse?.cr || fallbackCourse.course_rating),
    slope_rating: Number(sheetCourse?.slope_rating || sheetCourse?.slope || sheetCourse?.sr || fallbackCourse.slope_rating),
    par: Number(sheetCourse?.par || fallbackCourse.par),
  };
}

function calculatePlayingHandicap(handicapIndex, course) {
  const hcpIndex = Number(String(handicapIndex ?? "0").replace(",", ".") || 0);
  const slope = Number(course?.slope_rating || 113);
  const courseRating = Number(course?.course_rating || course?.rating || course?.cr || course?.par || 72);
  const par = Number(course?.par || 72);
  return Math.round(hcpIndex * (slope / 113) + (courseRating - par));
}

function getHandicapIndex(player) {
  const rawValue = player?.handicap_index ?? player?.dgv_hcp ?? player?.hcp_index ?? "";
  if (rawValue === "" || rawValue == null) return null;
  const parsed = Number(String(rawValue).replace(",", "."));
  return Number.isNaN(parsed) ? null : parsed;
}

function getCourseHandicap(player, courseId = "goethe", courses = fallbackCourses) {
  const handicapIndex = getHandicapIndex(player);
  if (handicapIndex != null) return calculatePlayingHandicap(handicapIndex, getCourseSettings(courseId, courses));
  const normalizedCourseId = String(courseId || "goethe").toLowerCase().trim();
  if (normalizedCourseId === "feininger") return Number(player?.course_hcp_feininger ?? 0);
  return Number(player?.course_hcp_goethe ?? 0);
}

function getPlayerForCourse(player, courseId = "goethe", courses = fallbackCourses) {
  if (!player) return null;
  return { ...withFallbackAlias(player), course_hcp: getCourseHandicap(player, courseId, courses) };
}

function getPlayersForCourse(players, courseId = "goethe", courses = fallbackCourses) {
  return (players || []).map((player) => getPlayerForCourse(player, courseId, courses)).filter(Boolean);
}

function getShotsOnHole(courseHcp, holeHcp) {
  const hcp = Number(courseHcp || 0);
  const strokeIndex = Number(holeHcp || 18);
  if (hcp <= 0) return 0;
  return Math.floor((hcp + 18 - strokeIndex) / 18);
}

function getStablefordPoints(strokes, par, shots) {
  if (strokes === "" || strokes == null) return 0;
  const netScore = Number(strokes) - Number(shots || 0);
  const diff = netScore - Number(par || 0);
  return Math.max(0, 2 - diff);
}

function getScoreStablefordPoints(score, par, shots) {
  if (!score || score.strokes === "" || score.strokes == null) return 0;
  if (normalizeBoolean(score.picked_up)) return 0;
  return getStablefordPoints(score.strokes, par, shots);
}

function getPickedUpStrokes(player, hole) {
  return Number(hole?.par || 0) * 2 + 1;
}

function formatShotMarks(shots) {
  const count = Math.max(0, Number(shots || 0));
  return count === 0 ? "–" : "|".repeat(count);
}

function getPuttBuckets(playerScores) {
  const threePutts = playerScores.filter((s) => normalizeBoolean(s.over_two_putts) && Number(s.putts_count) === 3).length;
  const fourPlusPutts = playerScores.filter((s) => normalizeBoolean(s.over_two_putts) && Number(s.putts_count) >= 4).length;
  return { threePutts, fourPlusPutts, overTwoPutts: threePutts + fourPlusPutts };
}

function getCourseShortName(courseId) {
  const normalized = String(courseId || "").toLowerCase().trim();
  if (normalized === "goethe") return "Goethe";
  if (normalized === "feininger") return "Feininger";
  return courseId || "Kurs";
}

function getRoundHoles(round, holes) {
  if (!round?.course_id) return [];
  return (holes || []).filter((hole) => String(hole.course_id) === String(round.course_id)).sort((a, b) => Number(a.hole_number) - Number(b.hole_number));
}

function getRoundPlayers(roundId, allPlayers, roundPlayers) {
  const rowsForRound = Array.isArray(roundPlayers) ? roundPlayers.filter((rp) => String(rp.round_id).trim() === String(roundId).trim()) : [];
  if (rowsForRound.length) {
    const allowedIds = rowsForRound.filter((rp) => normalizeBoolean(rp.is_playing)).map((rp) => String(rp.player_id).trim());
    return (allPlayers || []).filter((p) => allowedIds.includes(String(p.id).trim())).map(withFallbackAlias);
  }
  if (String(roundId).trim() === "r1") return (allPlayers || []).filter((p) => String(p.id).trim() !== "achim").map(withFallbackAlias);
  return (allPlayers || []).map(withFallbackAlias);
}

function normalizeScoreRecord(score) {
  return { ...score, picked_up: normalizeBoolean(score?.picked_up), over_two_putts: normalizeBoolean(score?.over_two_putts), lady: normalizeBoolean(score?.lady) };
}

function isScorerControlScore(score) {
  const playerId = String(score?.player_id || "").trim();
  const scorerPlayerId = String(score?.scorer_player_id || "").trim();
  return Boolean(playerId && scorerPlayerId && playerId === scorerPlayerId);
}

function getScoreIdentityKey(score) {
  return [String(score?.round_id || "").trim(), String(score?.player_id || "").trim(), String(score?.hole_number || "").trim(), isScorerControlScore(score) ? "control" : "official"].join("|");
}

function getScoreTimestamp(score) {
  const time = Date.parse(score?.updated_at || "");
  return Number.isNaN(time) ? 0 : time;
}

function isValidScorePayload(score) {
  return Boolean(
    score &&
    String(score.round_id || "").trim() &&
    String(score.player_id || "").trim() &&
    Number(score.hole_number) > 0
  );
}

function isNewerOrEqualScore(candidate, existing) {
  return getScoreTimestamp(candidate) >= getScoreTimestamp(existing);
}

function mergeScoresPreservingPending(sheetScores = [], pendingScores = []) {
  const map = new Map();
  sheetScores.forEach((score) => {
    if (!score || !score.player_id || !score.hole_number) return;
    map.set(getScoreIdentityKey(score), normalizeScoreRecord(score));
  });
  pendingScores.forEach((score) => {
    if (!score || !score.player_id || !score.hole_number) return;
    const key = getScoreIdentityKey(score);
    const existing = map.get(key);
    if (!existing || isNewerOrEqualScore(score, existing)) map.set(key, normalizeScoreRecord(score));
  });
  return Array.from(map.values());
}

function getOfficialScores(scores) {
  return (scores || []).filter((score) => !isScorerControlScore(score));
}

function findScoreForPlayerHole(scores, roundId, playerId, holeNumber, wantControlScore) {
  return (scores || []).find((score) => String(score.round_id || "") === String(roundId || "") && String(score.player_id || "") === String(playerId || "") && Number(score.hole_number) === Number(holeNumber) && isScorerControlScore(score) === wantControlScore) || null;
}

function formatBoolDiff(value) {
  return normalizeBoolean(value) ? "Ja" : "Nein";
}

function formatScoreDiff(score) {
  if (!score || score.strokes === "" || score.strokes == null) return "–";
  return normalizeBoolean(score.picked_up) ? "X" : String(score.strokes);
}

function formatPuttsDiff(score) {
  if (!score || score.putts_count === "" || score.putts_count == null) return "–";
  return String(score.putts_count);
}

function getScoreMismatchMessage(officialScore, controlScore) {
  if (!officialScore || !controlScore) return "";
  const officialHasScore = officialScore.strokes !== "" && officialScore.strokes != null;
  const controlHasScore = controlScore.strokes !== "" && controlScore.strokes != null;
  if (!officialHasScore || !controlHasScore) return "";
  const differences = [];
  if (Number(officialScore.strokes) !== Number(controlScore.strokes) || normalizeBoolean(officialScore.picked_up) !== normalizeBoolean(controlScore.picked_up)) differences.push(`Score: ${formatScoreDiff(officialScore)} ≠ ${formatScoreDiff(controlScore)}`);
  if (normalizeBoolean(officialScore.lady) !== normalizeBoolean(controlScore.lady)) differences.push(`Lady: ${formatBoolDiff(officialScore.lady)} ≠ ${formatBoolDiff(controlScore.lady)}`);
  if (normalizeBoolean(officialScore.over_two_putts) !== normalizeBoolean(controlScore.over_two_putts) || Number(officialScore.putts_count || 0) !== Number(controlScore.putts_count || 0)) differences.push(`Putts: ${formatPuttsDiff(officialScore)} ≠ ${formatPuttsDiff(controlScore)}`);
  return differences.join(" · ");
}

function getMismatchesForHole(scores, roundId, holeNumber, players = []) {
  const playerMap = new Map((players || []).map((player) => [String(player.id), player]));
  const playerIds = Array.from(new Set((scores || []).filter((score) => String(score.round_id || "") === String(roundId || "") && Number(score.hole_number) === Number(holeNumber)).map((score) => String(score.player_id || "")).filter(Boolean)));
  return playerIds.map((playerId) => {
    const officialScore = findScoreForPlayerHole(scores, roundId, playerId, holeNumber, false);
    const controlScore = findScoreForPlayerHole(scores, roundId, playerId, holeNumber, true);
    const message = getScoreMismatchMessage(officialScore, controlScore);
    const player = playerMap.get(playerId) || { id: playerId, character_name: playerId, display_name: playerId };
    return { playerId, player, holeNumber, officialScore, controlScore, officialScorerId: String(officialScore?.scorer_player_id || "").trim(), message: message ? `Loch ${holeNumber} · ${player.character_name || player.display_name || playerId} · ${message}` : "" };
  }).filter((item) => Boolean(item.message));
}

function getMismatchesForRound(scores, roundId, players = []) {
  const holeNumbers = Array.from(new Set((scores || []).filter((score) => String(score.round_id || "") === String(roundId || "")).map((score) => Number(score.hole_number)).filter(Boolean))).sort((a, b) => a - b);
  return holeNumbers.flatMap((holeNumber) => getMismatchesForHole(scores, roundId, holeNumber, players));
}

function buildPlayerStats(players, holes, scores) {
  return (players || []).map((p) => {
    const playerScores = (scores || []).filter((s) => String(s.player_id) === String(p.id) && s.strokes !== "" && s.strokes != null);
    const played = playerScores.length;
    const total = playerScores.reduce((sum, s) => sum + Number(s.strokes || 0), 0);
    const parPlayed = playerScores.reduce((sum, s) => sum + Number((holes || []).find((h) => Number(h.hole_number) === Number(s.hole_number))?.par || 0), 0);
    const { threePutts, fourPlusPutts, overTwoPutts } = getPuttBuckets(playerScores);
    const netStableford = playerScores.reduce((sum, s) => {
      const hole = (holes || []).find((h) => Number(h.hole_number) === Number(s.hole_number));
      return sum + getScoreStablefordPoints(s, hole?.par, getShotsOnHole(p.course_hcp, hole?.hcp));
    }, 0);
    const grossStableford = playerScores.reduce((sum, s) => {
      const hole = (holes || []).find((h) => Number(h.hole_number) === Number(s.hole_number));
      return sum + getScoreStablefordPoints(s, hole?.par, 0);
    }, 0);
    const hcpShotsUsed = playerScores.reduce((sum, s) => {
      const hole = (holes || []).find((h) => Number(h.hole_number) === Number(s.hole_number));
      return sum + getShotsOnHole(p.course_hcp, hole?.hcp);
    }, 0);
    const hcpAdjustedTotal = total - hcpShotsUsed;
    const hcpAdjustedToPar = hcpAdjustedTotal - parPlayed;
    const ladyCount = playerScores.filter((s) => normalizeBoolean(s.lady)).length;
    return { ...withFallbackAlias(p), played, total, toPar: total - parPlayed, hcpShotsUsed, hcpAdjustedTotal, hcpAdjustedToPar, overTwoPutts, threePutts, fourPlusPutts, puttPenaltyEuro: threePutts * 2 + fourPlusPutts * 4, ladyCount, netStableford, grossStableford };
  });
}

function sortStrokePlay(stats) {
  return [...(stats || [])].sort((a, b) => (a.played === 0 && b.played > 0 ? 1 : b.played === 0 && a.played > 0 ? -1 : a.toPar - b.toPar || b.played - a.played || Number(a.sort_order || 0) - Number(b.sort_order || 0)));
}

function sortStableford(stats, fieldName) {
  return [...(stats || [])].sort((a, b) => (a.played === 0 && b.played > 0 ? 1 : b.played === 0 && a.played > 0 ? -1 : Number(b[fieldName] || 0) - Number(a[fieldName] || 0) || b.played - a.played || Number(a.sort_order || 0) - Number(b.sort_order || 0)));
}

function sortHcpAdjustedStrokePlay(stats) {
  return [...(stats || [])].sort((a, b) => (a.played === 0 && b.played > 0 ? 1 : b.played === 0 && a.played > 0 ? -1 : Number(a.hcpAdjustedToPar || 0) - Number(b.hcpAdjustedToPar || 0) || Number(a.hcpAdjustedTotal || 0) - Number(b.hcpAdjustedTotal || 0) || b.played - a.played || Number(a.sort_order || 0) - Number(b.sort_order || 0)));
}

function getScoreDiffToPar(score, hole) {
  if (!score || score.strokes === "" || score.strokes == null) return null;
  return Number(score.strokes || 0) - Number(hole?.par || 0);
}

function buildFunPlayerStats(players, holes, scores) {
  return (players || []).map((player) => {
    const playerScores = (scores || []).filter((score) => String(score.player_id) === String(player.id) && score.strokes !== "" && score.strokes != null);
    const enrichedScores = playerScores.map((score) => ({ score, hole: (holes || []).find((item) => Number(item.hole_number) === Number(score.hole_number)), diff: getScoreDiffToPar(score, (holes || []).find((item) => Number(item.hole_number) === Number(score.hole_number))) })).filter((item) => item.hole);
    const frontScores = enrichedScores.filter((item) => Number(item.hole.hole_number) <= 9);
    const backScores = enrichedScores.filter((item) => Number(item.hole.hole_number) > 9);
    const frontTotal = frontScores.length ? frontScores.reduce((sum, item) => sum + Number(item.score.strokes || 0), 0) : null;
    const backTotal = backScores.length ? backScores.reduce((sum, item) => sum + Number(item.score.strokes || 0), 0) : null;
    const frontPar = frontScores.length ? frontScores.reduce((sum, item) => sum + Number(item.hole.par || 0), 0) : null;
    const backPar = backScores.length ? backScores.reduce((sum, item) => sum + Number(item.hole.par || 0), 0) : null;
    const frontToPar = frontTotal == null || frontPar == null ? null : frontTotal - frontPar;
    const backToPar = backTotal == null || backPar == null ? null : backTotal - backPar;
    const backMinusFront = frontToPar == null || backToPar == null ? null : backToPar - frontToPar;
    const birdies = enrichedScores.filter((item) => item.diff === -1 && !normalizeBoolean(item.score.picked_up)).length;
    const eaglesOrBetter = enrichedScores.filter((item) => item.diff != null && item.diff <= -2 && !normalizeBoolean(item.score.picked_up)).length;
    const pars = enrichedScores.filter((item) => item.diff === 0 && !normalizeBoolean(item.score.picked_up)).length;
    const parOrBetter = enrichedScores.filter((item) => item.diff != null && item.diff <= 0 && !normalizeBoolean(item.score.picked_up)).length;
    const doubleBogeyPlus = enrichedScores.filter((item) => item.diff != null && item.diff >= 2).length;
    const triplePlus = enrichedScores.filter((item) => item.diff != null && item.diff >= 3).length;
    const pickedUpCount = enrichedScores.filter((item) => normalizeBoolean(item.score.picked_up)).length;
    const ladyCount = enrichedScores.filter((item) => normalizeBoolean(item.score.lady)).length;
    const greenAttempts = enrichedScores.filter((item) => item.score.putts_count !== "" && item.score.putts_count != null && !normalizeBoolean(item.score.picked_up));
    const greenInRegulation = greenAttempts.filter((item) => Number(item.score.strokes || 0) - Number(item.score.putts_count || 0) <= Number(item.hole.par || 0) - 2).length;
    const underRegulation = greenAttempts.filter((item) => Number(item.score.strokes || 0) - Number(item.score.putts_count || 0) <= Number(item.hole.par || 0) - 3).length;
    const { threePutts, fourPlusPutts } = getPuttBuckets(playerScores);
    const grossStableford = enrichedScores.reduce((sum, item) => sum + getScoreStablefordPoints(item.score, item.hole.par, 0), 0);
    const netStableford = enrichedScores.reduce((sum, item) => sum + getScoreStablefordPoints(item.score, item.hole.par, getShotsOnHole(player.course_hcp, item.hole.hcp)), 0);
    const hcpBonus = netStableford - grossStableford;
    const hcpShotsUsed = enrichedScores.reduce((sum, item) => sum + getShotsOnHole(player.course_hcp, item.hole.hcp), 0);
    return { ...withFallbackAlias(player), played: enrichedScores.length, birdies, eaglesOrBetter, pars, parOrBetter, doubleBogeyPlus, triplePlus, pickedUpCount, ladyCount, greenAttempts: greenAttempts.length, greenInRegulation, underRegulation, threePutts, fourPlusPutts, puttPenaltyEuro: threePutts * 2 + fourPlusPutts * 4, frontTotal, backTotal, frontToPar, backToPar, backMinusFront, grossStableford, netStableford, hcpBonus, hcpShotsUsed, pointsPerHcpShot: hcpShotsUsed ? Number((netStableford / hcpShotsUsed).toFixed(2)) : 0 };
  });
}

function buildFunHoleStats(players, holes, scores) {
  return (holes || []).map((hole) => {
    const holeScores = (scores || []).filter((score) => Number(score.hole_number) === Number(hole.hole_number) && score.strokes !== "" && score.strokes != null);
    const played = holeScores.length;
    const totalStrokes = holeScores.reduce((sum, score) => sum + Number(score.strokes || 0), 0);
    const avgScore = played ? totalStrokes / played : 0;
    const avgToPar = played ? avgScore - Number(hole.par || 0) : 0;
    return { course_id: hole.course_id || "", course_name: getCourseShortName(hole.course_id), hole_number: hole.hole_number, par: hole.par, hcp: hole.hcp, played, avgScore, avgToPar, birdies: holeScores.filter((score) => getScoreDiffToPar(score, hole) === -1 && !normalizeBoolean(score.picked_up)).length, pars: holeScores.filter((score) => getScoreDiffToPar(score, hole) === 0 && !normalizeBoolean(score.picked_up)).length, pickedUpCount: holeScores.filter((score) => normalizeBoolean(score.picked_up)).length, ladies: holeScores.filter((score) => normalizeBoolean(score.lady)).length, snakes: holeScores.filter((score) => normalizeBoolean(score.over_two_putts)).length };
  }).filter((item) => item.played > 0);
}

function buildScorerMismatchStats(mismatches, players) {
  const playerMap = new Map((players || []).map((player) => [String(player.id), withFallbackAlias(player)]));
  const stats = new Map();
  (players || []).forEach((player) => stats.set(String(player.id), { ...withFallbackAlias(player), asPlayer: 0, asScorer: 0, total: 0 }));
  (mismatches || []).forEach((item) => {
    const playerId = String(item.playerId || "");
    const scorerId = String(item.officialScorerId || "");
    if (playerId) {
      const current = stats.get(playerId) || { ...(playerMap.get(playerId) || { id: playerId, character_name: playerId }), asPlayer: 0, asScorer: 0, total: 0 };
      current.asPlayer += 1;
      current.total += 1;
      stats.set(playerId, current);
    }
    if (scorerId) {
      const current = stats.get(scorerId) || { ...(playerMap.get(scorerId) || { id: scorerId, character_name: scorerId }), asPlayer: 0, asScorer: 0, total: 0 };
      current.asScorer += 1;
      current.total += 1;
      stats.set(scorerId, current);
    }
  });
  return Array.from(stats.values()).sort((a, b) => Number(b.total || 0) - Number(a.total || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function getQualificationRounds(rounds) {
  return (rounds?.length ? rounds : fallbackRounds).filter((round) => String(round.stage || "qualification") === "qualification").sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)).slice(0, 3);
}

function getFinalRound(rounds) {
  return (rounds?.length ? rounds : fallbackRounds).find((round) => String(round.round_id) === "r4") || (rounds?.length ? rounds : fallbackRounds).find((round) => String(round.stage) === "final") || fallbackRounds[3];
}

function getRoundChapterLabel(round) {
  const roundId = String(round?.round_id || "").trim();
  const sortOrder = Number(round?.sort_order || 0);
  const stage = String(round?.stage || "").toLowerCase().trim();
  if (stage === "final" || roundId === "r4" || sortOrder === 4) return "Finaltag · Am Schicksalsberg";
  if (roundId === "r1" || sortOrder === 1) return "Runde 1 · Die Gefährten brechen auf";
  if (roundId === "r2" || sortOrder === 2) return "Runde 2 · Durch die Minen von Moria";
  if (roundId === "r3" || sortOrder === 3) return "Runde 3 · Vor den Toren Mordors";
  return `${round?.round_name || "Runde"} · Kapitel der Runde`;
}

function buildTournamentNetStandings(players, rounds, holes, scores) {
  const qualificationRounds = getQualificationRounds(rounds);
  return (players || []).map((player) => {
    const roundResults = qualificationRounds.map((round) => {
      const roundHoles = getRoundHoles(round, holes);
      const roundScores = (scores || []).filter((score) => String(score.round_id) === String(round.round_id) && String(score.player_id) === String(player.id) && score.strokes !== "" && score.strokes != null);
      const playerForRound = getPlayerForCourse(player, round.course_id || "goethe");
      const grossStrokes = roundScores.reduce((sum, score) => sum + Number(score.strokes || 0), 0);
      const hcpShotsUsed = roundScores.reduce((sum, score) => sum + getShotsOnHole(playerForRound.course_hcp, roundHoles.find((h) => Number(h.hole_number) === Number(score.hole_number))?.hcp), 0);
      const hcpAdjustedStrokes = roundScores.length ? grossStrokes - hcpShotsUsed : null;
      return { round_id: round.round_id, round_name: round.round_name, points: hcpAdjustedStrokes, hcpAdjustedStrokes, grossStrokes, hcpShotsUsed, played: roundScores.length };
    });
    const playedResults = roundResults.filter((result) => result.played > 0 && result.hcpAdjustedStrokes != null);
    const counted = [...playedResults].sort((a, b) => Number(a.hcpAdjustedStrokes || 0) - Number(b.hcpAdjustedStrokes || 0)).slice(0, 2);
    const dropped = [...playedResults].sort((a, b) => Number(a.hcpAdjustedStrokes || 0) - Number(b.hcpAdjustedStrokes || 0)).slice(2, 3)[0] || null;
    return { ...withFallbackAlias(player), roundResults, countedRoundIds: counted.map((result) => result.round_id), droppedRoundId: dropped?.round_id || "", totalBestTwo: counted.length ? counted.reduce((sum, result) => sum + Number(result.hcpAdjustedStrokes || 0), 0) : null, roundsPlayed: playedResults.length };
  }).sort((a, b) => (a.totalBestTwo == null && b.totalBestTwo != null ? 1 : b.totalBestTwo == null && a.totalBestTwo != null ? -1 : Number(a.totalBestTwo || 0) - Number(b.totalBestTwo || 0) || Number(b.roundsPlayed || 0) - Number(a.roundsPlayed || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0)));
}

function buildFinalNetStandings(players, rounds, holes, scores) {
  const qualificationStandings = buildTournamentNetStandings(players, rounds, holes, scores);
  const finalRound = getFinalRound(rounds);
  const finalHoles = getRoundHoles(finalRound, holes);
  const withFinalScores = qualificationStandings.map((player, qualificationIndex) => {
    const finalScores = (scores || []).filter((score) => String(score.round_id) === String(finalRound?.round_id) && String(score.player_id) === String(player.id) && score.strokes !== "" && score.strokes != null);
    const playerForRound = getPlayerForCourse(player, finalRound?.course_id || "goethe");
    const finalGrossStrokes = finalScores.reduce((sum, score) => sum + Number(score.strokes || 0), 0);
    const finalHcpShotsUsed = finalScores.reduce((sum, score) => sum + getShotsOnHole(playerForRound.course_hcp, finalHoles.find((h) => Number(h.hole_number) === Number(score.hole_number))?.hcp), 0);
    return { ...withFallbackAlias(player), qualificationRank: qualificationIndex + 1, finalHcpAdjustedStrokes: finalScores.length ? finalGrossStrokes - finalHcpShotsUsed : null, finalGrossStrokes, finalHcpShotsUsed, finalPlayed: finalScores.length, finalGroup: qualificationIndex < 3 ? "championship" : "placement" };
  });
  const sortFinalGroup = (items) => [...items].sort((a, b) => (a.finalHcpAdjustedStrokes == null && b.finalHcpAdjustedStrokes != null ? 1 : b.finalHcpAdjustedStrokes == null && a.finalHcpAdjustedStrokes != null ? -1 : Number(a.finalHcpAdjustedStrokes || 0) - Number(b.finalHcpAdjustedStrokes || 0) || Number(a.qualificationRank || 0) - Number(b.qualificationRank || 0)));
  const championshipGroup = sortFinalGroup(withFinalScores.filter((p) => p.finalGroup === "championship")).map((p, i) => ({ ...p, finalRank: i + 1 }));
  const placementGroup = sortFinalGroup(withFinalScores.filter((p) => p.finalGroup === "placement")).map((p, i) => ({ ...p, finalRank: i + 4 }));
  return [...championshipGroup, ...placementGroup];
}

function buildRoundHcpAdjustedStandings(players, round, holes, scores, roundPlayers) {
  if (!round?.round_id || !round?.course_id) return [];
  const roundHoles = getRoundHoles(round, holes);
  const roundPlayersList = getRoundPlayers(round.round_id, players, roundPlayers);
  return roundPlayersList.map((player) => {
    const playerForRound = getPlayerForCourse(player, round.course_id || "goethe");
    const playerScores = (scores || []).filter((score) => String(score.round_id) === String(round.round_id) && String(score.player_id) === String(player.id) && score.strokes !== "" && score.strokes != null);
    const grossStrokes = playerScores.reduce((sum, score) => sum + Number(score.strokes || 0), 0);
    const hcpShotsUsed = playerScores.reduce((sum, score) => sum + getShotsOnHole(playerForRound.course_hcp, roundHoles.find((h) => Number(h.hole_number) === Number(score.hole_number))?.hcp), 0);
    const hcpAdjustedStrokes = playerScores.length ? grossStrokes - hcpShotsUsed : null;
    const isComplete = roundHoles.length > 0 && roundHoles.every((hole) => playerScores.some((score) => Number(score.hole_number) === Number(hole.hole_number)));
    return { ...withFallbackAlias(player), grossStrokes, hcpShotsUsed, hcpAdjustedStrokes, played: playerScores.length, isComplete };
  }).sort((a, b) => (a.hcpAdjustedStrokes == null && b.hcpAdjustedStrokes != null ? 1 : b.hcpAdjustedStrokes == null && a.hcpAdjustedStrokes != null ? -1 : Number(a.hcpAdjustedStrokes || 0) - Number(b.hcpAdjustedStrokes || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0)));
}

function getRoundHonorCelebration(players, rounds, holes, scores, roundPlayers, dismissedKeys = []) {
  const qualificationRounds = getQualificationRounds(rounds);

  const sameHcpAdjustedScore = (a, b) => Number(a?.hcpAdjustedStrokes) === Number(b?.hcpAdjustedStrokes);
  const buildCutoffDecision = (standings, count, side) => {
    if (!standings.length || count <= 0) return { fixed: [], playoff: [], slotsOpen: 0, hasPlayoff: false };

    if (side === "top") {
      const boundary = standings[count - 1];
      if (!boundary) return { fixed: standings.slice(0, count), playoff: [], slotsOpen: 0, hasPlayoff: false };
      const fixed = standings.filter((player) => Number(player.hcpAdjustedStrokes) < Number(boundary.hcpAdjustedStrokes));
      const tiedAtBoundary = standings.filter((player) => sameHcpAdjustedScore(player, boundary));
      const slotsOpen = count - fixed.length;
      if (tiedAtBoundary.length > slotsOpen) return { fixed, playoff: tiedAtBoundary, slotsOpen, hasPlayoff: true };
      return { fixed: standings.slice(0, count), playoff: [], slotsOpen: 0, hasPlayoff: false };
    }

    const boundaryIndex = Math.max(0, standings.length - count);
    const boundary = standings[boundaryIndex];
    if (!boundary) return { fixed: standings.slice(-count).reverse(), playoff: [], slotsOpen: 0, hasPlayoff: false };
    const fixed = standings.filter((player) => Number(player.hcpAdjustedStrokes) > Number(boundary.hcpAdjustedStrokes)).reverse();
    const tiedAtBoundary = standings.filter((player) => sameHcpAdjustedScore(player, boundary));
    const slotsOpen = count - fixed.length;
    if (tiedAtBoundary.length > slotsOpen) return { fixed, playoff: tiedAtBoundary, slotsOpen, hasPlayoff: true };
    return { fixed: standings.slice(-count).reverse(), playoff: [], slotsOpen: 0, hasPlayoff: false };
  };

  for (const round of qualificationRounds) {
    if (!round?.round_id || !round?.course_id) continue;
    const popupKey = `round_honor_${round.round_id}`;
    if ((dismissedKeys || []).includes(popupKey)) continue;
    const standings = buildRoundHcpAdjustedStandings(players, round, holes, scores, roundPlayers);
    if (!standings.length || standings.some((player) => !player.isComplete)) continue;
    const roundOrder = Number(round.sort_order || qualificationRounds.findIndex((item) => String(item.round_id) === String(round.round_id)) + 1);
    const lordCount = roundOrder === 1 ? 1 : 2;
    const butlerCount = roundOrder === 1 ? 1 : 2;
    const lordDecision = buildCutoffDecision(standings, lordCount, "top");
    const butlerDecision = buildCutoffDecision(standings, butlerCount, "bottom");
    return {
      key: popupKey,
      roundId: round.round_id,
      roundName: round.round_name || `Runde ${roundOrder}`,
      roundOrder,
      lords: lordDecision.fixed,
      butlers: butlerDecision.fixed,
      lordCount,
      butlerCount,
      lordPlayoff: lordDecision.playoff,
      lordPlayoffSlots: lordDecision.slotsOpen,
      butlerPlayoff: butlerDecision.playoff,
      butlerPlayoffSlots: butlerDecision.slotsOpen,
      hasPlayoff: lordDecision.hasPlayoff || butlerDecision.hasPlayoff,
    };
  }
  return null;
}

function getFinalWinnerCelebration(players, rounds, holes, scores, roundPlayers) {
  const finalRound = getFinalRound(rounds);
  if (!finalRound?.round_id || !finalRound?.course_id) return null;
  const finalHoles = getRoundHoles(finalRound, holes);
  const finalPlayers = getRoundPlayers(finalRound.round_id, players, roundPlayers);
  if (!finalHoles.length || !finalPlayers.length) return null;
  const finalScores = (scores || []).filter((score) => String(score.round_id) === String(finalRound.round_id) && score.strokes !== "" && score.strokes != null);
  const allFinalScoresComplete = finalPlayers.every((player) => finalHoles.every((hole) => finalScores.some((score) => String(score.player_id) === String(player.id) && Number(score.hole_number) === Number(hole.hole_number))));
  if (!allFinalScoresComplete) return null;
  const finalStandings = buildFinalNetStandings(players, rounds, holes, scores);
  const winner = finalStandings.find((player) => Number(player.finalRank) === 1) || finalStandings[0] || null;
  if (!winner) return null;
  return { roundId: finalRound.round_id, winner, winnerName: getPlayerLabel(winner), winnerLabel: winner.character_name || winner.display_name || winner.id, finalHcpAdjustedStrokes: winner.finalHcpAdjustedStrokes };
}

function getScoreRelationLabel(score, par) {
  if (score === "" || score == null) return "offen";
  if (Number(score) === 0) return "gestrichen";
  const diff = Number(score) - Number(par || 0);
  if (diff <= -3) return "Albatros";
  if (diff === -2) return "Eagle";
  if (diff === -1) return "Birdie";
  if (diff === 0) return "Par";
  if (diff === 1) return "Bogey";
  if (diff === 2) return "Double Bogey";
  if (diff === 3) return "Triple Bogey";
  return `+${diff}`;
}

function triggerSoftVibration() {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") navigator.vibrate(10);
  } catch {}
}

function TouchStepper({ label, value, min = 0, max = 12, emptyLabel = "–", status = "", defaultValue = null, disabled = false, onChange, formatValue }) {
  const hasValue = value !== "" && value != null;
  const fallbackValue = defaultValue == null ? min : Number(defaultValue);
  const baseValue = Math.max(min, Math.min(max, Number(hasValue ? value : fallbackValue)));
  const shownValue = hasValue || defaultValue != null ? (formatValue ? formatValue(baseValue) : baseValue) : emptyLabel;
  const setValue = (nextValue) => {
    if (disabled) return;
    triggerSoftVibration();
    onChange(Math.max(min, Math.min(max, Number(nextValue || 0))));
  };
  return (
    <div className="rounded-2xl border border-amber-500/35 bg-[linear-gradient(180deg,rgba(48,35,22,0.72),rgba(12,10,9,0.72))] p-2.5 shadow-[inset_0_1px_0_rgba(251,191,36,0.12),0_12px_32px_rgba(0,0,0,0.35)]">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-amber-100">{label}</div>
        {status ? <div className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-100/75">{status}</div> : null}
      </div>
      <div className="grid grid-cols-[82px_1fr_82px] items-center gap-2.5">
        <button type="button" onClick={() => setValue(baseValue - 1)} disabled={disabled || baseValue <= min} className="h-[84px] rounded-2xl border border-amber-500/45 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.16),rgba(12,10,9,0.96)_58%)] text-4xl font-black leading-none text-amber-100 shadow-[inset_0_1px_0_rgba(251,191,36,0.16),0_8px_22px_rgba(0,0,0,0.38)] transition active:scale-[0.97] disabled:opacity-35">−</button>
        <button type="button" disabled={disabled} onClick={() => setValue(baseValue)} className="h-[84px] rounded-2xl border border-amber-400/35 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.22),rgba(28,25,23,0.86)_48%,rgba(12,10,9,0.96)_100%)] text-center shadow-[inset_0_0_28px_rgba(251,191,36,0.08),0_10px_26px_rgba(0,0,0,0.42)] ring-1 ring-amber-300/10 transition active:scale-[0.985]">
          <div className="font-serif text-[3.95rem] font-black leading-none text-amber-200 drop-shadow-[0_0_14px_rgba(251,191,36,0.18)]">{shownValue}</div>
          <div className="text-[9px] uppercase tracking-[0.16em] text-amber-100/50">{!hasValue && defaultValue != null ? "tippen" : label}</div>
        </button>
        <button type="button" onClick={() => setValue(baseValue + 1)} disabled={disabled || baseValue >= max} className="h-[84px] rounded-2xl border border-amber-500/45 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.16),rgba(12,10,9,0.96)_58%)] text-4xl font-black leading-none text-amber-100 shadow-[inset_0_1px_0_rgba(251,191,36,0.16),0_8px_22px_rgba(0,0,0,0.38)] transition active:scale-[0.97] disabled:opacity-35">+</button>
      </div>
    </div>
  );
}

function PuttStepper({ value, disabled = false, onChange }) {
  const hasValue = value !== "" && value != null;
  const selected = hasValue ? Number(value || 0) : 2;
  const snakeLabel = selected >= 4 ? "4+ · 4 €" : selected === 3 ? "3 · 2 €" : "keine Snake";
  return <TouchStepper label="Putts" value={value === 0 ? 0 : value || ""} min={0} max={6} emptyLabel="2" defaultValue={2} status={snakeLabel} disabled={disabled} onChange={onChange} />;
}

function ScoreStepper({ value, par, pickedUpStrokes, disabled = false, onChange }) {
  const displayScore = value === "" || value == null ? Number(par || 4) : value;
  const isPickedValue = Number(displayScore) === 0 || Number(displayScore) >= Number(pickedUpStrokes || 0);
  const effectiveStatus = value === "" || value == null ? "" : isPickedValue ? `X · gewertet ${pickedUpStrokes}` : getScoreRelationLabel(displayScore, par);
  return <TouchStepper label="Score" value={value} min={0} max={30} emptyLabel={String(par || 4)} defaultValue={Number(par || 4)} status={effectiveStatus} disabled={disabled} formatValue={(nextValue) => (Number(nextValue) === 0 ? "X" : nextValue)} onChange={onChange} />;
}

function LeaderboardTable({ title, players, columns }) {
  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-amber-700/30 bg-black/25">
      <div className="border-b border-amber-700/30 bg-amber-500/10 px-2 py-1.5 font-serif text-lg text-amber-200">{title}</div>
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full min-w-[360px] border-collapse text-sm text-amber-50 landscape:min-w-0 landscape:text-[11px]">
          <thead><tr className="text-left text-xs uppercase tracking-wider text-amber-100"><th className="px-2 py-1.5">#</th><th className="px-2 py-1.5">Spieler</th>{columns.map((column) => <th key={column.label} className="px-2 py-1.5 text-right">{column.label}</th>)}</tr></thead>
          <tbody>{players.map((p, index) => <tr key={p.id} className="border-t border-amber-700/20"><td className="px-2 py-1.5 text-amber-200/75">{index + 1}</td><td className="px-2 py-1.5 font-semibold text-amber-100">{getPlayerLabel(p)}</td>{columns.map((column) => <td key={column.label} className={cls("px-2 py-1.5 text-right", column.emphasize && "font-serif text-lg text-amber-300")}>{column.render(p)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function FunTable({ title, subtitle = "", players, columns, nameLabel = "Name" }) {
  const hasHoleRows = players.some((item) => item?.hole_number);
  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-amber-700/30 bg-black/25">
      <div className="border-b border-amber-700/30 bg-amber-500/10 px-2 py-1.5"><div className="font-serif text-lg text-amber-200">{title}</div>{subtitle ? <div className="text-xs text-amber-100/60">{subtitle}</div> : null}</div>
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full min-w-[360px] border-collapse text-sm text-amber-50 landscape:min-w-0 landscape:text-[11px]">
          <thead><tr className="text-left text-xs uppercase tracking-wider text-amber-100"><th className="px-2 py-1.5">Platz</th><th className="px-2 py-1.5">{hasHoleRows ? "Loch" : nameLabel}</th>{columns.map((column) => <th key={column.label} className="px-2 py-1.5 text-right">{column.label}</th>)}</tr></thead>
          <tbody>{players.map((item, index) => <tr key={item.id || `${item.course_id || "course"}-${item.hole_number}-${index}`} className="border-t border-amber-700/20"><td className="px-2 py-1.5 text-amber-200/75">{index + 1}</td><td className="px-2 py-1.5 font-semibold text-amber-100">{item.hole_number ? `${item.course_name || getCourseShortName(item.course_id)} · Loch ${item.hole_number}` : item.character_name || item.display_name || item.id}</td>{columns.map((column) => <td key={column.label} className={cls("px-2 py-1.5 text-right", column.emphasize && "font-serif text-lg text-amber-300")}>{column.render(item, index)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function MiddleEarthTables({ players, holes, scores, mismatches }) {
  const funPlayers = useMemo(() => buildFunPlayerStats(players, holes, scores), [players, holes, scores]);
  const funHoles = useMemo(() => buildFunHoleStats(players, holes, scores), [players, holes, scores]);
  const palantirStats = useMemo(() => buildScorerMismatchStats(mismatches, players), [mismatches, players]);
  const snakeLords = [...funPlayers].sort((a, b) => Number(b.puttPenaltyEuro || 0) - Number(a.puttPenaltyEuro || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const ladies = [...funPlayers].sort((a, b) => Number(b.ladyCount || 0) - Number(a.ladyCount || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const whiteFlags = [...funPlayers].sort((a, b) => Number(b.pickedUpCount || 0) - Number(a.pickedUpCount || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const parMachines = [...funPlayers].sort((a, b) => Number(b.parOrBetter || 0) - Number(a.parOrBetter || 0) || Number(b.pars || 0) - Number(a.pars || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const greenKeepers = [...funPlayers].sort((a, b) => Number(b.greenInRegulation || 0) - Number(a.greenInRegulation || 0) || Number(b.underRegulation || 0) - Number(a.underRegulation || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const birdieHunters = [...funPlayers].sort((a, b) => Number((b.birdies || 0) + (b.eaglesOrBetter || 0)) - Number((a.birdies || 0) + (a.eaglesOrBetter || 0)) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const bogeyBunkers = [...funPlayers].sort((a, b) => Number(b.doubleBogeyPlus || 0) - Number(a.doubleBogeyPlus || 0) || Number(b.triplePlus || 0) - Number(a.triplePlus || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const comebackKings = [...funPlayers].filter((p) => p.backMinusFront != null).sort((a, b) => Number(a.backMinusFront) - Number(b.backMinusFront));
  const hardestHoles = [...funHoles].sort((a, b) => Number(b.avgToPar || 0) - Number(a.avgToPar || 0));
  const favoriteHoles = [...funHoles].sort((a, b) => Number(a.avgToPar || 0) - Number(b.avgToPar || 0));
  const hcpRaiders = [...funPlayers].sort((a, b) => Number(b.hcpBonus || 0) - Number(a.hcpBonus || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const mithrilMiners = [...funPlayers].sort((a, b) => Number(b.pointsPerHcpShot || 0) - Number(a.pointsPerHcpShot || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
  return (
    <Card className="mb-2 rounded-2xl border-amber-700/40 bg-[#20170f]/82 shadow-xl backdrop-blur-sm landscape:rounded-xl">
      <CardContent className="p-2">
        <div className="mb-2"><p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Mittelerde</p><h2 className="font-serif text-lg text-amber-200">Die Chroniken der Runde</h2><p className="mt-1 text-sm text-amber-100/65">Fun-Tabellen aus den Scores der aktuellen Runde.</p></div>
        <FunTable title="Shelobs Putt-Kammer" subtitle="Snake-König der Runde" players={snakeLords} columns={[{ label: "3P", render: (p) => p.threePutts }, { label: "4+P", render: (p) => p.fourPlusPutts }, { label: "€", render: (p) => `${p.puttPenaltyEuro || 0} €`, emphasize: true }]} />
        <FunTable title="Galadriels Spiegel" subtitle="Lady-Liga" players={ladies} columns={[{ label: "Ladys", render: (p) => p.ladyCount, emphasize: true }, { label: "Quote", render: (p) => p.played ? `${Math.round((p.ladyCount / p.played) * 100)} %` : "–" }]} />
        <FunTable title="Die weißen Fahnen von Minas Tirith" subtitle="Gestrichene Löcher" players={whiteFlags} columns={[{ label: "X", render: (p) => p.pickedUpCount, emphasize: true }, { label: "Quote", render: (p) => p.played ? `${Math.round((p.pickedUpCount / p.played) * 100)} %` : "–" }]} />
        <FunTable title="Die Ents der Fairways" subtitle="Par oder besser" players={parMachines} columns={[{ label: "Par+", render: (p) => p.parOrBetter, emphasize: true }, { label: "Pars", render: (p) => p.pars }, { label: "Birdie+", render: (p) => p.birdies + p.eaglesOrBetter }]} />
        <FunTable title="Die Gärten von Lothlórien" subtitle="Grün in Regulation" players={greenKeepers} columns={[{ label: "GIR", render: (p) => p.greenInRegulation, emphasize: true }, { label: "Unter Reg.", render: (p) => p.underRegulation }, { label: "Quote", render: (p) => p.greenAttempts ? `${Math.round((p.greenInRegulation / p.greenAttempts) * 100)} %` : "–" }]} />
        <FunTable title="Die Adler von Manwë" subtitle="Birdie-Jäger" players={birdieHunters} columns={[{ label: "Eagle+", render: (p) => p.eaglesOrBetter }, { label: "Birdies", render: (p) => p.birdies }, { label: "Summe", render: (p) => p.birdies + p.eaglesOrBetter, emphasize: true }]} />
        <FunTable title="Morias Strafregister" subtitle="Doppelbogey oder schlimmer" players={bogeyBunkers} columns={[{ label: "DB+", render: (p) => p.doubleBogeyPlus, emphasize: true }, { label: "Triple+", render: (p) => p.triplePlus }, { label: "X", render: (p) => p.pickedUpCount }]} />
        <FunTable title="Der Schicksalsberg" subtitle="Härtestes Loch des Feldes" players={hardestHoles} columns={[{ label: "Par", render: (h) => h.par }, { label: "Ø +/−", render: (h) => formatToPar(Math.round(h.avgToPar * 10) / 10, h.played), emphasize: true }, { label: "X", render: (h) => h.pickedUpCount }, { label: "Snake", render: (h) => h.snakes }]} />
        <FunTable title="Bruchtal" subtitle="Lieblingsloch des Feldes" players={favoriteHoles} columns={[{ label: "Par", render: (h) => h.par }, { label: "Ø +/−", render: (h) => formatToPar(Math.round(h.avgToPar * 10) / 10, h.played), emphasize: true }, { label: "Birdies", render: (h) => h.birdies }, { label: "Pars", render: (h) => h.pars }]} />
        <FunTable title="Mithril-Ausbeute" subtitle="Netto-Punkte je erhaltenem Schlag" players={mithrilMiners} columns={[{ label: "SpV genutzt", render: (p) => p.hcpShotsUsed }, { label: "Netto", render: (p) => p.netStableford }, { label: "Quote", render: (p) => p.hcpShotsUsed ? p.pointsPerHcpShot : "–", emphasize: true }]} />
        <FunTable title="Palantír-Protokoll" subtitle="Abweichungen bei Score-Kontrolle" players={palantirStats} columns={[{ label: "Als Spieler", render: (p) => p.asPlayer }, { label: "Als Zähler", render: (p) => p.asScorer }, { label: "Gesamt", render: (p) => p.total, emphasize: true }]} />
      </CardContent>
    </Card>
  );
}

function TournamentStandings({ players, rounds, holes, scores, activeRoundId = "" }) {
  const standings = useMemo(() => buildTournamentNetStandings(players, rounds, holes, scores), [players, rounds, holes, scores]);
  const finalStandings = useMemo(() => buildFinalNetStandings(players, rounds, holes, scores), [players, rounds, holes, scores]);
  const qualificationRounds = getQualificationRounds(rounds);
  const finalRound = getFinalRound(rounds);
  const isFinalActive = String(activeRoundId) === String(finalRound?.round_id || "r4");
  return (
    <Card className="mb-2 rounded-2xl border-amber-700/40 bg-[#20170f]/82 shadow-xl backdrop-blur-sm landscape:rounded-xl">
      <CardContent className="p-2">
        <div className="mb-3"><p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Turnier</p><h2 className="font-serif text-lg text-amber-200">{isFinalActive ? "Finalwertung Strokes HCP adjusted" : "Gesamtwertung Strokes HCP adjusted"}</h2>{isFinalActive ? <div className="mt-0.5 text-sm font-semibold text-amber-300/85">Am Schicksalsberg · Nur einer trägt den Ring.</div> : null}<p className="mt-1 text-sm text-amber-100/70">{isFinalActive ? "Finaltag: Top 3 nach der Qualifikation spielen Plätze 1–3 aus. Die übrigen Spieler spielen Plätze 4–6 aus." : "Es zählen die besten zwei Strokes-HCP-adjusted-Ergebnisse aus den ersten drei Runden. Niedriger ist besser. Nach Platz 3 liegt der aktuelle Cut."}</p></div>
        <div className="overflow-x-auto rounded-2xl border border-amber-700/30 bg-black/25 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full min-w-[760px] border-collapse text-sm text-amber-50 landscape:min-w-0 landscape:text-[11px]">
            <thead><tr className="text-left text-xs uppercase tracking-wider text-amber-100"><th className="px-2 py-1.5">#</th><th className="px-2 py-1.5">Spieler</th>{isFinalActive ? <><th className="px-2 py-1.5 text-right">Quali</th><th className="px-2 py-1.5 text-right">Final Strokes HCP</th><th className="px-2 py-1.5 text-right">Löcher</th><th className="px-2 py-1.5 text-right">Gruppe</th></> : <>{qualificationRounds.map((round) => <th key={round.round_id} className="px-2 py-1.5 text-right">{round.round_name}</th>)}<th className="px-2 py-1.5 text-right">Gesamt</th></>}</tr></thead>
            <tbody>{isFinalActive ? finalStandings.map((player, index) => <React.Fragment key={player.id}>{index === 3 && <tr><td colSpan={6} className="border-y-2 border-amber-400/70 bg-amber-500/10 px-2 py-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-amber-200">Platzierungsgruppe · Plätze 4–6</td></tr>}<tr className={cls("border-t border-amber-700/20", index < 3 && "bg-emerald-500/5")}><td className="px-2 py-1.5 font-serif text-lg font-bold text-amber-300">{player.finalRank}</td><td className="px-2 py-1.5 font-semibold text-amber-100">{getPlayerLabel(player)}</td><td className="px-2 py-1.5 text-right text-amber-100/75">{player.qualificationRank}</td><td className="px-2 py-1.5 text-right font-serif text-lg font-bold text-amber-300">{player.finalHcpAdjustedStrokes ?? "–"}</td><td className="px-2 py-1.5 text-right text-amber-100">{player.finalPlayed}/18</td><td className="px-2 py-1.5 text-right text-amber-100/75">{player.finalGroup === "championship" ? "1–3" : "4–6"}</td></tr></React.Fragment>) : standings.map((player, index) => <React.Fragment key={player.id}>{index === 3 && <tr><td colSpan={qualificationRounds.length + 3} className="border-y-2 border-amber-400/70 bg-amber-500/10 px-2 py-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-amber-200">Cut-Linie · Top 3 spielen den Finaltag</td></tr>}<tr className={cls("border-t border-amber-700/20", index < 3 && "bg-emerald-500/5")}><td className="px-2 py-1.5 text-amber-200/75">{index + 1}</td><td className="px-2 py-1.5 font-semibold text-amber-100">{getPlayerLabel(player)}{index < 3 && <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-200">Final</span>}</td>{qualificationRounds.map((round) => { const result = player.roundResults.find((item) => item.round_id === round.round_id); const isCounted = player.countedRoundIds.includes(round.round_id); const isDropped = player.droppedRoundId === round.round_id; return <td key={round.round_id} className={cls("px-2 py-1.5 text-right", isCounted && "font-bold text-amber-300", isDropped && "text-amber-100/50 line-through")}>{result?.played ? result.points : "–"}</td>; })}<td className="px-2 py-1.5 text-right font-serif text-lg font-bold text-amber-300">{player.totalBestTwo ?? "–"}</td></tr></React.Fragment>)}</tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

async function callSheetApi(payload) {
  const url = new URL(GOOGLE_SHEETS_API_URL);
  url.searchParams.set("payload", JSON.stringify(payload));
  url.searchParams.set("cacheBust", String(Date.now()));
  const response = await fetch(url.toString(), { method: "GET" });
  if (!response.ok) throw new Error("Datenbank nicht erreichbar.");
  const data = await response.json();
  if (data && data.ok === false) throw new Error(data.error || "Datenbank meldet einen Fehler.");
  return data;
}

function getFirstUnscoredHole(scores = [], roundId = "", playerId = "", fallbackHole = 1, scorerPlayerId = "") {
  const hasCompletedScore = (targetPlayerId, holeNumber, wantControlScore) => {
    const score = findScoreForPlayerHole(scores, roundId, targetPlayerId, holeNumber, wantControlScore);
    return Boolean(
      score &&
      score.strokes !== "" &&
      score.strokes != null &&
      score.putts_count !== "" &&
      score.putts_count != null
    );
  };

  for (let holeNumber = 1; holeNumber <= 18; holeNumber += 1) {
    const officialComplete = playerId ? hasCompletedScore(playerId, holeNumber, false) : false;
    const controlComplete = scorerPlayerId ? hasCompletedScore(scorerPlayerId, holeNumber, true) : false;
    if (!officialComplete || !controlComplete) return holeNumber;
  }
  return Number(fallbackHole || 18);
}

function LordOfTheHolesApp() {
  const cachedState = readLocalJson("lordOfTheHoles.cachedState", null);
  const [players, setPlayers] = useState(cachedState?.players?.length ? cachedState.players : fallbackPlayers);
  const [allPlayers, setAllPlayers] = useState(cachedState?.allPlayers?.length ? cachedState.allPlayers : fallbackPlayers);
  const [courses, setCourses] = useState(cachedState?.courses?.length ? cachedState.courses : fallbackCourses);
  const [rounds, setRounds] = useState(cachedState?.rounds?.length ? cachedState.rounds : fallbackRounds);
  const [roundPlayers, setRoundPlayers] = useState(cachedState?.roundPlayers || []);
  const [scorerAssignments, setScorerAssignments] = useState([]);
  const [activeRound, setActiveRound] = useState(cachedState?.activeRound || null);
  const [holes, setHoles] = useState(cachedState?.holes?.length ? cachedState.holes : fallbackHoles.filter((h) => h.course_id === "goethe"));
  const [allHoles, setAllHoles] = useState(cachedState?.allHoles?.length ? cachedState.allHoles : fallbackHoles);
  const [scores, setScores] = useState(cachedState?.scores?.length ? cachedState.scores.map(normalizeScoreRecord) : []);
  const [allScores, setAllScores] = useState(cachedState?.allScores?.length ? cachedState.allScores.map(normalizeScoreRecord) : []);
  const [pendingScores, setPendingScores] = useState(() => readLocalJson("lordOfTheHoles.pendingScores", []).map(normalizeScoreRecord).filter(isValidScorePayload));
  const pendingScoresRef = useRef(readLocalJson("lordOfTheHoles.pendingScores", []).map(normalizeScoreRecord).filter(isValidScorePayload));
  const lastLoadedRoundRef = useRef("");
  const lastAutoHoleTargetRef = useRef("");
  const [localHandicaps, setLocalHandicaps] = useState({});
  const [scoredPlayerId, setScoredPlayerId] = useState(() => readLocalJson("lordOfTheHoles.scoredPlayerId", ""));
  const [roundScorerPromptOpen, setRoundScorerPromptOpen] = useState(false);
  const [scoredPlayerByRound, setScoredPlayerByRound] = useState(() => readLocalJson("lordOfTheHoles.scoredPlayerByRound", {}));
  const [scoreEntryMode, setScoreEntryMode] = useState("player");
  const [activeHole, setActiveHole] = useState(() => getFirstUnscoredHole(cachedState?.scores?.length ? cachedState.scores : cachedState?.allScores || [], cachedState?.selectedActiveRoundId || cachedState?.activeRound?.round_id || "", readLocalJson("lordOfTheHoles.scoredPlayerId", ""), 1, readLocalJson("lordOfTheHoles.myPlayerId", "")));
  const [view, setView] = useState("score");
  const [mainMenu, setMainMenu] = useState("current");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [setupSaving, setSetupSaving] = useState(false);
  const [backupSaving, setBackupSaving] = useState(false);
  const [autoSync] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("offline");
  const [error, setError] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(cachedState?.selectedCourseId || "");
  const [selectedActiveRoundId, setSelectedActiveRoundId] = useState(() => readLocalJson("lordOfTheHoles.selectedActiveRoundId", cachedState?.selectedActiveRoundId || "r1"));
  const [myPlayerId, setMyPlayerId] = useState(() => readLocalJson("lordOfTheHoles.myPlayerId", ""));
  const [adminPinInput, setAdminPinInput] = useState("");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminEditing, setAdminEditing] = useState(false);
  const [setupSavedMessage, setSetupSavedMessage] = useState("");
  const [backupSavedMessage, setBackupSavedMessage] = useState("");
  const [scoreHintMessage, setScoreHintMessage] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const [splashEntering, setSplashEntering] = useState(false);
  const [appLocked, setAppLocked] = useState(() => readLocalJson("lordOfTheHoles.appLocked", false));
  const [lockUnlockOpen, setLockUnlockOpen] = useState(false);
  const [lockPasswordInput, setLockPasswordInput] = useState("");
  const [lockAdminBypass, setLockAdminBypass] = useState(false);
  const [lockCountdownNow, setLockCountdownNow] = useState(() => new Date());
  const [deviceAssignmentsResetAt, setDeviceAssignmentsResetAt] = useState(() => readLocalJson("lordOfTheHoles.deviceAssignmentsResetAt", ""));
  const introAudioRef = useRef(null);
  const lastPopupSoundKeyRef = useRef("");
  const [clearScoresConfirmOpen, setClearScoresConfirmOpen] = useState(false);
  const [clearScoresSaving, setClearScoresSaving] = useState(false);
  const [clearScoresError, setClearScoresError] = useState("");
  const [standingsPopup, setStandingsPopup] = useState(null);
  const [winnerPopupDismissedKey, setWinnerPopupDismissedKey] = useState(() => readLocalJson("lordOfTheHoles.winnerPopupDismissedKey", ""));
  const [roundHonorDismissedKeys, setRoundHonorDismissedKeys] = useState(() => readLocalJson("lordOfTheHoles.roundHonorDismissedKeys", []));
  const [scorecardRoundId, setScorecardRoundId] = useState(() => readLocalJson("lordOfTheHoles.scorecardRoundId", ""));
  const [roundTableRoundId, setRoundTableRoundId] = useState(() => readLocalJson("lordOfTheHoles.roundTableRoundId", ""));
  const [roundSummaryDismissedKeys, setRoundSummaryDismissedKeys] = useState(() => readLocalJson("lordOfTheHoles.roundSummaryDismissedKeys", []));

  const displayedActiveRound = (selectedActiveRoundId && (rounds.length ? rounds : fallbackRounds).find((round) => String(round.round_id) === String(selectedActiveRoundId))) || activeRound || rounds.find((round) => String(round.status).toLowerCase() === "active") || fallbackRounds[0];
  const displayCourseId = displayedActiveRound?.course_id || selectedCourseId || "goethe";
  const activeCourse = (courses.length ? courses : fallbackCourses).find((course) => String(course.course_id) === String(displayCourseId));
  const visiblePlayers = useMemo(() => getRoundPlayers(displayedActiveRound?.round_id, allPlayers, roundPlayers), [displayedActiveRound?.round_id, allPlayers, roundPlayers]);
  const scoreablePlayers = useMemo(() => {
    const filteredPlayers = myPlayerId ? visiblePlayers.filter((p) => String(p.id) !== String(myPlayerId)) : visiblePlayers;
    return filteredPlayers.length ? filteredPlayers : visiblePlayers;
  }, [visiblePlayers, myPlayerId]);
  const playersWithCurrentHandicaps = useMemo(() => getPlayersForCourse(visiblePlayers, displayCourseId, courses), [visiblePlayers, displayCourseId, courses]);
  const activeHoleData = holes.find((h) => Number(h.hole_number) === Number(activeHole)) || holes[Number(activeHole) - 1] || fallbackHoles.find((h) => h.course_id === displayCourseId && h.hole_number === Number(activeHole)) || fallbackHoles[0];
  const scoredPlayerBase = scoredPlayerId ? scoreablePlayers.find((p) => String(p.id) === String(scoredPlayerId)) : null;
  const scoredPlayer = scoredPlayerBase ? getPlayerForCourse(scoredPlayerBase, displayCourseId, courses) : null;
  const myCurrentPlayer = myPlayerId ? getPlayerForCourse(visiblePlayers.find((player) => String(player.id) === String(myPlayerId)), displayCourseId, courses) : null;
  const isScorerEntryMode = scoreEntryMode === "scorer" && Boolean(myCurrentPlayer);
  const entryPlayerId = isScorerEntryMode ? myPlayerId : scoredPlayerId;
  const entryPlayer = isScorerEntryMode ? myCurrentPlayer : scoredPlayer;
  const pickedUpStrokes = getPickedUpStrokes(entryPlayer, activeHoleData);
  const entryPlayerShotsOnActiveHole = getShotsOnHole(entryPlayer?.course_hcp, activeHoleData?.hcp);
  const currentScore = useMemo(() => scores.find((s) => {
    const sameHole = String(s.round_id || "") === String(displayedActiveRound?.round_id || "r1") && Number(s.hole_number) === Number(activeHole);
    if (!sameHole) return false;
    if (isScorerEntryMode) return String(s.player_id) === String(entryPlayerId) && isScorerControlScore(s);
    return String(s.player_id) === String(entryPlayerId) && !isScorerControlScore(s);
  }) || { strokes: "", picked_up: false, over_two_putts: false, putts_count: "", lady: false }, [scores, entryPlayerId, activeHole, displayedActiveRound?.round_id, isScorerEntryMode]);
  const canEnterScores = Boolean(displayedActiveRound?.round_id && myPlayerId && scoredPlayerId && entryPlayerId && entryPlayer && Number(activeHole) > 0);
  const hasCurrentScore = currentScore.strokes !== "" && currentScore.strokes != null;
  const hasCurrentPutts = currentScore.putts_count !== "" && currentScore.putts_count != null;
  const officialScoreForActiveHole = useMemo(() => findScoreForPlayerHole(scores, displayedActiveRound?.round_id || "r1", scoredPlayerId, activeHole, false), [scores, displayedActiveRound?.round_id, scoredPlayerId, activeHole]);
  const controlScoreForActiveHole = useMemo(() => (myPlayerId ? findScoreForPlayerHole(scores, displayedActiveRound?.round_id || "r1", myPlayerId, activeHole, true) : null), [scores, displayedActiveRound?.round_id, myPlayerId, activeHole]);
  const hasOfficialScoreForNext = officialScoreForActiveHole && officialScoreForActiveHole.strokes !== "" && officialScoreForActiveHole.strokes != null;
  const hasOfficialPuttsForNext = officialScoreForActiveHole && officialScoreForActiveHole.putts_count !== "" && officialScoreForActiveHole.putts_count != null;
  const hasControlScoreForNext = Boolean(myPlayerId && controlScoreForActiveHole && controlScoreForActiveHole.strokes !== "" && controlScoreForActiveHole.strokes != null);
  const hasControlPuttsForNext = Boolean(myPlayerId && controlScoreForActiveHole && controlScoreForActiveHole.putts_count !== "" && controlScoreForActiveHole.putts_count != null);
  const hasRequiredScoresForNext = Boolean(myPlayerId && hasOfficialScoreForNext && hasOfficialPuttsForNext && hasControlScoreForNext && hasControlPuttsForNext);
  const officialScores = useMemo(() => getOfficialScores(scores), [scores]);
  const officialAllScores = useMemo(() => getOfficialScores(allScores), [allScores]);
  const roundMismatches = useMemo(() => getMismatchesForRound(scores, displayedActiveRound?.round_id || "r1", visiblePlayers), [scores, displayedActiveRound?.round_id, visiblePlayers]);
  const responsibleHoleMismatches = useMemo(() => myPlayerId ? roundMismatches.filter((item) => String(item.playerId) === String(myPlayerId) || String(item.officialScorerId) === String(myPlayerId)) : [], [roundMismatches, myPlayerId]);
  const visibleScoreMismatchMessages = responsibleHoleMismatches.map((item) => item.message);
  const hasScoreMismatch = responsibleHoleMismatches.length > 0;
  const selectedPlayerMismatch = useMemo(() => responsibleHoleMismatches.find((item) => String(item.playerId) === String(scoredPlayerId) && Number(item.holeNumber) === Number(activeHole)) || responsibleHoleMismatches.find((item) => String(item.playerId) === String(scoredPlayerId)) || null, [responsibleHoleMismatches, scoredPlayerId, activeHole]);
  const ownPlayerMismatch = useMemo(() => myPlayerId ? responsibleHoleMismatches.find((item) => String(item.playerId) === String(myPlayerId)) || null : null, [responsibleHoleMismatches, myPlayerId]);
  const hasSelectedPlayerScoreMismatch = Boolean(selectedPlayerMismatch?.message);
  const hasOwnScoreMismatch = Boolean(ownPlayerMismatch?.message);
  const playerStats = useMemo(() => buildPlayerStats(playersWithCurrentHandicaps, holes, officialScores), [playersWithCurrentHandicaps, holes, officialScores]);
  const myCurrentStats = useMemo(() => (myPlayerId ? playerStats.find((player) => String(player.id) === String(myPlayerId)) || null : null), [playerStats, myPlayerId]);
  const strokePlayLeaderboard = useMemo(() => sortStrokePlay(playerStats), [playerStats]);
  const netStablefordLeaderboard = useMemo(() => sortStableford(playerStats, "netStableford"), [playerStats]);
  const grossStablefordLeaderboard = useMemo(() => sortStableford(playerStats, "grossStableford"), [playerStats]);
  const hcpAdjustedStrokeLeaderboard = useMemo(() => sortHcpAdjustedStrokePlay(playerStats), [playerStats]);
  const puttPenaltyLeaderboard = useMemo(() => [...playerStats].sort((a, b) => Number(b.puttPenaltyEuro || 0) - Number(a.puttPenaltyEuro || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0)), [playerStats]);
  const myHcpAdjustedStrokeRank = useMemo(() => { const index = hcpAdjustedStrokeLeaderboard.findIndex((player) => String(player.id) === String(myPlayerId)); return index >= 0 ? index + 1 : null; }, [hcpAdjustedStrokeLeaderboard, myPlayerId]);
  const myNetStablefordRank = useMemo(() => { const index = netStablefordLeaderboard.findIndex((player) => String(player.id) === String(myPlayerId)); return index >= 0 ? index + 1 : null; }, [netStablefordLeaderboard, myPlayerId]);
  const finalWinnerCelebration = useMemo(() => getFinalWinnerCelebration(allPlayers, rounds, allHoles, officialAllScores, roundPlayers), [allPlayers, rounds, allHoles, officialAllScores, roundPlayers]);
  const roundHonorCelebration = useMemo(() => getRoundHonorCelebration(allPlayers, rounds, allHoles, officialAllScores, roundPlayers, roundHonorDismissedKeys), [allPlayers, rounds, allHoles, officialAllScores, roundPlayers, roundHonorDismissedKeys]);
  const displayedRoundHonorCelebration = roundHonorCelebration;
  const myRoundHonorRole = useMemo(() => {
    if (!displayedRoundHonorCelebration || !myPlayerId) return "neutral";
    if (displayedRoundHonorCelebration.lords.some((player) => String(player.id) === String(myPlayerId))) return "lord";
    if (displayedRoundHonorCelebration.butlers.some((player) => String(player.id) === String(myPlayerId))) return "shieldbearer";
    return "neutral";
  }, [displayedRoundHonorCelebration, myPlayerId]);
  const roundHonorPersonalMessage = displayedRoundHonorCelebration?.hasPlayoff ? "Gleichstand am Hofe Gondors: Erst das Entscheidungsputten klärt die offenen Rollen." : myRoundHonorRole === "lord" ? `Du bist ${displayedRoundHonorCelebration?.lords?.length === 1 ? "Herr" : "einer der Herren"} von Gondor.` : myRoundHonorRole === "shieldbearer" ? "Du bist Schildträger im Dienst der Herren von Gondor. Dein Eid ist gesprochen — fortan schützt du Krone, Ehre und sehr fragile Nerven." : "Du bleibst freier Gefährte. Beobachte Herren und Schildträger mit Würde — und sei froh, dass dein Eid heute nicht gefordert wird.";
  const roundHonorCloseLabel = myRoundHonorRole === "lord" ? "Krone richten ×" : myRoundHonorRole === "shieldbearer" ? "Schild aufnehmen ×" : "Erlass zur Kenntnis nehmen ×";
  const finalWinnerPopupKey = finalWinnerCelebration ? `${finalWinnerCelebration.roundId}_${finalWinnerCelebration.winner?.id || "winner"}` : "";
  const showFinalWinnerPopup = Boolean(finalWinnerCelebration && finalWinnerPopupKey !== winnerPopupDismissedKey);
  const roundSummaryPopup = useMemo(() => {
    if (!myPlayerId || !displayedActiveRound?.round_id) return null;

    const roundId = displayedActiveRound.round_id;
    const playerBase = visiblePlayers.find((player) => String(player.id) === String(myPlayerId));
    const player = getPlayerForCourse(playerBase, displayCourseId, courses);
    if (!player) return null;

    const sortedHoles = (holes.length ? holes : fallbackHoles.filter((hole) => String(hole.course_id) === String(displayCourseId))).sort((a, b) => Number(a.hole_number) - Number(b.hole_number));

    const buildSummary = (checkpoint) => {
      const summaryKey = `round_summary_${roundId}_${myPlayerId}_${checkpoint}`;
      if ((roundSummaryDismissedKeys || []).includes(summaryKey)) return null;

      const checkpointHoles = sortedHoles.filter((hole) => Number(hole.hole_number) <= checkpoint);
      if (checkpointHoles.length < checkpoint) return null;

      const rows = checkpointHoles.map((hole) => {
        const score = officialScores.find(
          (item) =>
            String(item.round_id || "") === String(roundId) &&
            String(item.player_id || "") === String(myPlayerId) &&
            Number(item.hole_number) === Number(hole.hole_number)
        );
        const shots = getShotsOnHole(player.course_hcp, hole.hcp);
        const grossStableford = score ? getScoreStablefordPoints(score, hole.par, 0) : 0;
        const netStableford = score ? getScoreStablefordPoints(score, hole.par, shots) : 0;
        const strokes = score && score.strokes !== "" && score.strokes != null ? Number(score.strokes || 0) : null;
        const putts = score && score.putts_count !== "" && score.putts_count != null ? Number(score.putts_count || 0) : null;
        const gir = strokes != null && putts != null && !normalizeBoolean(score?.picked_up) ? strokes - putts <= Number(hole.par || 0) - 2 : false;
        return { hole, score, shots, grossStableford, netStableford, strokes, putts, gir };
      });

      if (rows.some((row) => row.strokes == null)) return null;

      const strokes = rows.reduce((sum, row) => sum + Number(row.strokes || 0), 0);
      const par = rows.reduce((sum, row) => sum + Number(row.hole.par || 0), 0);
      const putts = rows.reduce((sum, row) => sum + Number(row.putts || 0), 0);
      const hcpShots = rows.reduce((sum, row) => sum + Number(row.shots || 0), 0);
      const netStableford = rows.reduce((sum, row) => sum + Number(row.netStableford || 0), 0);
      const grossStableford = rows.reduce((sum, row) => sum + Number(row.grossStableford || 0), 0);
      const birdiesOrBetter = rows.filter((row) => row.strokes != null && row.strokes - Number(row.hole.par || 0) <= -1 && !normalizeBoolean(row.score?.picked_up)).length;
      const pars = rows.filter((row) => row.strokes != null && row.strokes - Number(row.hole.par || 0) === 0 && !normalizeBoolean(row.score?.picked_up)).length;
      const girCount = rows.filter((row) => row.gir).length;
      const pickedUp = rows.filter((row) => normalizeBoolean(row.score?.picked_up)).length;

      return {
        key: summaryKey,
        checkpoint,
        title: checkpoint === 9 ? "Halbzeit-Chronik" : "Runden-Chronik",
        subtitle: checkpoint === 9 ? "Nach 9 Löchern" : "Nach 18 Löchern",
        playerName: getPlayerLabel(player),
        strokes,
        toPar: strokes - par,
        hcpAdjustedStrokes: strokes - hcpShots,
        netStableford,
        grossStableford,
        putts,
        birdiesOrBetter,
        pars,
        girCount,
        pickedUp,
      };
    };

    return buildSummary(9) || buildSummary(18);
  }, [myPlayerId, displayedActiveRound?.round_id, visiblePlayers, displayCourseId, courses, holes, officialScores, roundSummaryDismissedKeys]);
  const showPlayerSelectPopup = false;
  const lockCountdown = useMemo(() => {
    const diffMs = Math.max(0, LOCK_COUNTDOWN_TARGET.getTime() - lockCountdownNow.getTime());
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  }, [lockCountdownNow]);
  const identityRoundId = String(displayedActiveRound?.round_id || "");
  const currentAssignedScoredPlayerId = getLocalScoredPlayerForRound(identityRoundId);showSplash && (!appLocked || lockAdminBypass);
  const needsMyPlayerSelection = Boolean(identityFlowActive && !myPlayerId);
  const needsScoredPlayerSelection = false;
  const activePopupSoundKey = showSplash || showPlayerSelectPopup ? "" : roundSummaryPopup ? `roundSummary:${roundSummaryPopup.key}` : showFinalWinnerPopup ? `finalWinner:${finalWinnerPopupKey}` : displayedRoundHonorCelebration ? `roundHonor:${displayedRoundHonorCelebration.key}` : clearScoresConfirmOpen ? "clearScoresConfirm" : backupSavedMessage ? "backupSaved" : setupSavedMessage ? "setupSaved" : clearScoresError ? "clearScoresError" : error ? "error" : "";

  useEffect(() => {
    if (scoredPlayerId && !scoreablePlayers.some((p) => String(p.id) === String(scoredPlayerId))) setScoredPlayerId("");
    if (!myPlayerId && scoreEntryMode === "scorer") setScoreEntryMode("player");
    if (Number(activeHole) < 1 || Number(activeHole) > 18) setActiveHole(1);
  }, [scoreablePlayers, scoredPlayerId, myPlayerId, scoreEntryMode, activeHole]);

  useEffect(() => {
    const roundId = String(displayedActiveRound?.round_id || "");
    if (!roundId || !myPlayerId || showSplash || (appLocked && !lockAdminBypass)) return;
    const storedPlayerId = getLocalScoredPlayerFuseEffect(() => {
    const roundId = String(displayedActiveRound?.round_id || "");
    if (!roundId || !myPlayerId || showSplash || (appLocked && !lockAdminBypass)) return;
    const storedPlayerId = getLocalScoredPlayerForRound(roundId);
    const storedPlayerIsValid = Boolean(storedPlayerId && scoreablePlayers.some((player) => String(player.id) === String(storedPlayerId)));
    if (lastLoadedRoundRef.current !== roundId) {
      lastLoadedRoundRef.current = roundId;
      setScoreEntryMode("player");
    }
    if (storedPlayerIsValid) {
      if (String(scoredPlayerId || "") !== String(storedPlayerId)) setScoredPlayerId(storedPlayerId);
      setRoundScorerPromptOpen(false);
    } else {
      if (scoredPlayerId) setScoredPlayerId("");
      setRoundScorerPromptOpen(true);
    }
  }, [displayedActiveRound?.round_id, myPlayerId, scoreablePlayers, scoredPlayerByRound, scoredPlayerId, showSplash, appLocked, lockAdminBypass]);terval(timer);
  }, [appLocked]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.scoredPlayerId", scoredPlayerId); }, [scoredPlayerId]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.scoredPlayerByRound", scoredPlayerByRound); }, [scoredPlayerByRound]);
  
  useEffect(() => { writeLocalJson("lordOfTheHoles.winnerPopupDismissedKey", winnerPopupDismissedKey); }, [winnerPopupDismissedKey]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.roundHonorDismissedKeys", roundHonorDismissedKeys); }, [roundHonorDismissedKeys]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.scorecardRoundId", scorecardRoundId); }, [scorecardRoundId]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.roundTableRoundId", roundTableRoundId); }, [roundTableRoundId]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.selectedActiveRoundId", selectedActiveRoundId); }, [selectedActiveRoundId]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.roundSummaryDismissedKeys", roundSummaryDismissedKeys); }, [roundSummaryDismissedKeys]);
  useEffect(() => { pendingScoresRef.current = pendingScores; writeLocalJson("lordOfTheHoles.pendingScores", pendingScores); }, [pendingScores]);
  useEffect(() => {
    writeLocalJson("lordOfTheHoles.cachedState", { players, allPlayers, courses, rounds, roundPlayers, activeRound, holes, allHoles, scores, allScores, pendingScores, selectedCourseId, selectedActiveRoundId, cachedAt: new Date().toISOString() });
  }, [players, allPlayers, courses, rounds, roundPlayers, activeRound, holes, allHoles, scores, allScores, pendingScores, selectedCourseId, selectedActiveRoundId]);
  useEffect(() => { introAudioRef.current = new Audio("/intro-sound.mp3"); introAudioRef.current.preload = "auto"; introAudioRef.current.loop = false; }, []);
  useEffect(() => { if (!autoSync) return undefined; loadData({ silent: true }); const timer = setInterval(() => loadData({ silent: true }), 30000); return () => clearInterval(timer); }, [autoSync]);
  useEffect(() => { if (!autoSync || !pendingScores.length) return undefined; const timer = setInterval(() => flushPendingScores(), 10000); return () => clearInterval(timer); }, [autoSync, pendingScores]);
  useEffect(() => {
    if (!selectedActiveRoundId) return;
    const selectedRoundScores = allScores.filter((score) => String(score.round_id || "") === String(selectedActiveRoundId));
    const selectedPendingScores = pendingScoresRef.current.filter((score) => String(score.round_id || "") === String(selectedActiveRoundId));
    const mergedRoundScores = mergeScoresPreservingPending(selectedRoundScores, selectedPendingScores);
    setScores(mergedRoundScores);

    const autoHoleTargetKey = `${selectedActiveRoundId}|${scoredPlayerId}`;
    if (lastAutoHoleTargetRef.current !== autoHoleTargetKey) {
      lastAutoHoleTargetRef.current = autoHoleTargetKey;
      setActiveHole(getFirstUnscoredHole(mergedRoundScores, selectedActiveRoundId, scoredPlayerId, 1, myPlayerId));
    }
  }, [selectedActiveRoundId, allScores, scoredPlayerId, myPlayerId]);
  useEffect(() => {
    if (!activePopupSoundKey) { lastPopupSoundKeyRef.current = ""; return; }
    if (lastPopupSoundKeyRef.current === activePopupSoundKey) return;
    lastPopupSoundKeyRef.current = activePopupSoundKey;
    playPopupSound();
  }, [activePopupSoundKey]);

  function applyPlayers(nextActivePlayers, nextAllPlayers = nextActivePlayers, courseList = courses) {
    setPlayers(nextActivePlayers.map(withFallbackAlias));
    setAllPlayers(nextAllPlayers.map(withFallbackAlias));
    if (adminEditing) return;
    const nextHandicaps = {};
    nextAllPlayers.forEach((player) => { nextHandicaps[`hcp_index_${player.id}`] = String(player.handicap_index ?? player.dgv_hcp ?? player.hcp_index ?? ""); });
    setLocalHandicaps(nextHandicaps);
  }

  async function loadData({ silent = false } = {}) {
    if (!silent) setLoading(true);
    try {
      const data = await callSheetApi({ action: "getState" });
      if (data.app_locked != null || data.appLocked != null) {
        const nextAppLocked = normalizeBoolean(data.app_locked ?? data.appLocked);
        setAppLocked(nextAppLocked);
        if (nextAppLocked && !lockAdminBypass) setShowSplash(true);
      }
      const nextDeviceAssignmentsResetAt = String(data.device_assignments_reset_at || data.deviceAssignmentsResetAt || "");
      const localDeviceAssignmentsResetAt = String(readLocalJson("lordOfTheHoles.deviceAssignmentsResetAt", "") || "");
      if (nextDeviceAssignmentsResetAt && nextDeviceAssignmentsResetAt !== localDeviceAssignmentsResetAt) {
        setMyPlayerId("");
        setScoredPlayerId("");
        setScoreEntryMode("player");
        setRoundScorerPromptOpen(false);
        setPendingScores([]);
        pendingScoresRef.current = [];
        writeLocalJson("lordOfTheHoles.myPlayerId", "");
        writeLocalJson("lordOfTheHoles.scoredPlayerId", "");
                writeLocalJson("lordOfTheHoles.pendingScores", []);
        writeLocalJson("lordOfTheHoles.deviceAssignmentsResetAt", nextDeviceAssignmentsResetAt);
        setDeviceAssignmentsResetAt(nextDeviceAssignmentsResetAt);
      } else if (nextDeviceAssignmentsResetAt && nextDeviceAssignmentsResetAt !== deviceAssignmentsResetAt) {
        setDeviceAssignmentsResetAt(nextDeviceAssignmentsResetAt);
      }
      const nextAllPlayers = (data.players?.length ? data.players : fallbackPlayers).map(withFallbackAlias);
      const nextRounds = data.rounds?.length ? data.rounds : fallbackRounds;
      const nextCourses = data.courses?.length ? data.courses : fallbackCourses;
      const nextActiveRound = data.activeRound || nextRounds.find((round) => String(round.status).toLowerCase() === "active") || nextRounds[0] || fallbackRounds[0];
      const nextActiveRoundId = String(nextActiveRound?.round_id || "");
      const lastSeenActiveRoundId = String(readLocalJson("lordOfTheHoles.lastSeenActiveRoundId", "") || "");
      if (nextActiveRoundId && lastSeenActiveRoundId && nextActiveRoundId !== lastSeenActiveRoundId) {
        setScoredPlayerId("");
        setScoreEntryMode("player");
        lastLoadedRoundRef.current = "";
      }
      if (nextActiveRoundId) writeLocalJson("lordOfTheHoles.lastSeenActiveRoundId", nextActiveRoundId);
      const nextActivePlayers = data.activePlayers?.length ? data.activePlayers.map(withFallbackAlias) : getRoundPlayers(nextActiveRound?.round_id, nextAllPlayers, data.roundPlayers || []);
      setCourses(nextCourses);
      setRounds(nextRounds);
      setRoundPlayers(data.roundPlayers || []);
      setScorerAssignments([]);
      setActiveRound(nextActiveRound);
      const previousRoundId = selectedActiveRoundId;
      const nextRoundId = nextActiveRound?.round_id || fallbackRounds[0].round_id;
      setSelectedCourseId(nextActiveRound?.course_id || "");
      setSelectedActiveRoundId(nextRoundId);
      if (nextRoundId) writeLocalJson("lordOfTheHoles.lastSeenActiveRoundId", nextRoundId);
      if (String(previousRoundId || "") !== String(nextRoundId || "")) {
        setScoredPlayerId("");
        setScoreEntryMode("player");
        lastLoadedRoundRef.current = "";
      }
      applyPlayers(nextActivePlayers, nextAllPlayers, nextCourses);
      setHoles(normalizeHoles(data.activeHoles?.length ? data.activeHoles : data.holes).filter((hole) => !nextActiveRound?.course_id || String(hole.course_id) === String(nextActiveRound.course_id)));
      setAllHoles(normalizeHoles(data.holes));
      const sheetAllScores = (data.scores || []).map(normalizeScoreRecord);
      const sheetActiveScores = (data.activeScores || []).map(normalizeScoreRecord);
      const livePendingScores = pendingScoresRef.current;
      const nextAllScores = mergeScoresPreservingPending(sheetAllScores, livePendingScores);
      const nextActiveScores = mergeScoresPreservingPending(sheetActiveScores, livePendingScores.filter((score) => String(score.round_id || "") === String(nextActiveRound?.round_id || "")));
      setAllScores(nextAllScores);
      setScores(nextActiveScores);
      setConnectionStatus("online");
      setError("");
      return data;
    } catch (err) {
      setConnectionStatus("offline");
      setError(err.message || "Datenbank konnte nicht geladen werden.");
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  }

  function optimisticUpdate(patch) {
    const safeRoundId = String(displayedActiveRound?.round_id || "").trim();
    const safePlayerId = String(entryPlayerId || "").trim();
    const safeHoleNumber = Number(activeHole || 0);
    if (!safeRoundId || !safePlayerId || !safeHoleNumber) {
      throw new Error("Score kann noch nicht gespeichert werden: Runde, Spieler oder Loch fehlt.");
    }
    const next = normalizeScoreRecord({ round_id: safeRoundId, player_id: safePlayerId, hole_number: safeHoleNumber, strokes: currentScore.strokes ?? "", picked_up: normalizeBoolean(currentScore.picked_up), over_two_putts: normalizeBoolean(currentScore.over_two_putts), putts_count: currentScore.putts_count ?? "", lady: normalizeBoolean(currentScore.lady), scorer_player_id: isScorerEntryMode ? entryPlayerId : myPlayerId || "", updated_at: new Date().toISOString(), ...patch });
    const sameScore = (score) => String(score.round_id) === String(next.round_id) && String(score.player_id) === String(next.player_id) && Number(score.hole_number) === Number(next.hole_number) && isScorerControlScore(score) === isScorerControlScore(next);
    const updateList = (current) => current.some(sameScore) ? current.map((s) => sameScore(s) ? next : s) : [...current, next];
    setScores(updateList);
    setAllScores(updateList);
    return next;
  }

  function addPendingScore(score) {
    if (!isValidScorePayload(score)) return;
    setPendingScores((current) => {
      const key = getScoreIdentityKey(score);
      const nextPendingScores = [...current.filter((item) => getScoreIdentityKey(item) !== key), normalizeScoreRecord(score)];
      pendingScoresRef.current = nextPendingScores;
      writeLocalJson("lordOfTheHoles.pendingScores", nextPendingScores);
      return nextPendingScores;
    });
  }

  function removePendingScore(score) {
    setPendingScores((current) => {
      const targetKey = getScoreIdentityKey(score);
      const targetTimestamp = getScoreTimestamp(score);
      const nextPendingScores = current.filter((item) => getScoreIdentityKey(item) !== targetKey || getScoreTimestamp(item) > targetTimestamp);
      pendingScoresRef.current = nextPendingScores;
      writeLocalJson("lordOfTheHoles.pendingScores", nextPendingScores);
      return nextPendingScores;
    });
  }

  async function savePendingScore(score) {
    if (!isValidScorePayload(score)) { removePendingScore(score); return true; }
    try { await callSheetApi({ action: "upsertScore", score }); removePendingScore(score); setConnectionStatus("online"); setError(""); return true; }
    catch (err) { setConnectionStatus("offline"); setError(err.message || "Score ist lokal gesichert und wird später synchronisiert."); return false; }
  }

  async function flushPendingScores() {
    const livePendingScores = [...pendingScoresRef.current].filter(isValidScorePayload);
    if (livePendingScores.length !== pendingScoresRef.current.length) {
      pendingScoresRef.current = livePendingScores;
      setPendingScores(livePendingScores);
      writeLocalJson("lordOfTheHoles.pendingScores", livePendingScores);
    }
    if (!livePendingScores.length) return true;
    let allSaved = true;
    for (const pendingScore of livePendingScores) {
      const saved = await savePendingScore(pendingScore);
      if (!saved) allSaved = false;
    }
    return allSaved;
  }

  async function saveScore(patch) {
    if (!canEnterScores) {
      setScoreHintMessage("Erst Runde, Spieler und Zähler auswählen.");
      window.setTimeout(() => setScoreHintMessage(""), 1800);
      return;
    }
    let next;
    try {
      next = optimisticUpdate(patch);
    } catch (err) {
      setError(err.message || "Score kann noch nicht gespeichert werden.");
      return;
    }
    addPendingScore(next);
    setSaving(true);
    try { await callSheetApi({ action: "upsertScore", score: next }); removePendingScore(next); setConnectionStatus("online"); setError(""); }
    catch { addPendingScore(next); setConnectionStatus("offline"); setError("Score lokal gesichert. Wird automatisch synchronisiert, sobald die Datenbank erreichbar ist."); }
    finally { setSaving(false); }
  }

  function goToNextHole() {
    if (activeHole === 18) return;
    if (!hasRequiredScoresForNext) {
      if (!myPlayerId) {
        setScoreHintMessage("Bitte zuerst unter Einstellungen auswählen, wer du auf diesem Handy bist.");
        window.setTimeout(() => setScoreHintMessage(""), 2400);
        return;
      }
      const missingItems = [];
      if (!hasOfficialScoreForNext) missingItems.push(`Score für ${getPlayerLabel(scoredPlayer) || "Spieler"}`);
      if (!hasOfficialPuttsForNext) missingItems.push(`Putts für ${getPlayerLabel(scoredPlayer) || "Spieler"}`);
      if (!hasControlScoreForNext) missingItems.push("mein Score");
      if (!hasControlPuttsForNext) missingItems.push("meine Putts");
      setScoreHintMessage(`Erst ${missingItems.join(", ")} eintragen, dann weiter.`);
      window.setTimeout(() => setScoreHintMessage(""), 2400);
      return;
    }
    setScoreHintMessage("");
    setActiveHole((h) => Math.min(18, h + 1));
  }

  async function createRoundBackup() {
    setBackupSavedMessage("");
    setBackupSaving(true);
    try { const result = await callSheetApi({ action: "createRoundBackup", round_id: displayedActiveRound?.round_id || "r1" }); setConnectionStatus("online"); setError(""); setBackupSavedMessage(result?.backup_sheet_name ? `Backup erstellt: ${result.backup_sheet_name}` : `${displayedActiveRound?.round_name || "Runde"} wurde gesichert.`); }
    catch (err) { setConnectionStatus("offline"); setError(err.message || "Backup konnte nicht erstellt werden."); }
    finally { setBackupSaving(false); }
  }

  async function clearAllScores() {
    setClearScoresSaving(true);
    setClearScoresError("");
    setError("");
    try { const result = await callSheetApi({ action: "clearScores" }); setScores([]); setAllScores([]); setPendingScores([]); pendingScoresRef.current = []; writeLocalJson("lordOfTheHoles.pendingScores", []); writeLocalJson("lordOfTheHoles.cachedState", null); setConnectionStatus("online"); setClearScoresConfirmOpen(false); setBackupSavedMessage(result?.backup_sheet_name ? `Backup erstellt: ${result.backup_sheet_name}` : ""); setSetupSavedMessage("Alle Scores wurden gelöscht. Backups bleiben erhalten."); await loadData({ silent: true }); }
    catch (err) { setConnectionStatus("offline"); const message = err.message || "Scores konnten nicht gelöscht werden."; setClearScoresError(message); setError(message); }
    finally { setClearScoresSaving(false); }
  }

  async function clearScoresAndDeviceAssignments() {
    await clearAllScores();
    setSetupSavedMessage("Scores wurden gelöscht. Backups bleiben erhalten.");
  }

  async function resetDeviceAssignmentsForAll() {
    setSetupSavedMessage("");
    try {
      const result = await callSheetApi({ action: "resetDeviceAssignments" });
      const resetAt = String(result?.device_assignments_reset_at || result?.deviceAssignmentsResetAt || new Date().toISOString());
      setDeviceAssignmentsResetAt(resetAt);
      setMyPlayerId("");
      setScoredPlayerId("");
      setScoreEntryMode("player");
        setRoundScorerPromptOpen(false);
      setPendingScores([]);
      pendingScoresRef.current = [];
      writeLocalJson("lordOfTheHoles.myPlayerId", "");
      writeLocalJson("lordOfTheHoles.scoredPlayerId", "");
            writeLocalJson("lordOfTheHoles.pendingScores", []);
      writeLocalJson("lordOfTheHoles.deviceAssignmentsResetAt", resetAt);
      setConnectionStatus("online");
      setError("");
      setSetupSavedMessage("Wer bin ich / Wen zähle ich und lokale offene Scores wurden für dieses Gerät zurückgesetzt. Andere Geräte übernehmen den Reset beim nächsten Laden.");
    } catch (err) {
      setConnectionStatus("offline");
      setError(err.message || "Geräte-Zuordnung konnte nicht für alle zurückgesetzt werden.");
    }
  }

  async function saveFullSetup() {
    setBackupSavedMessage("");
    setSetupSavedMessage("");
    const nextAllPlayers = allPlayers.map((p) => {
      const hcpIndexKey = `hcp_index_${p.id}`;
      const hcpIndexInput = cleanHandicapInput(localHandicaps[hcpIndexKey] ?? p.handicap_index ?? p.dgv_hcp ?? p.hcp_index ?? "");
      const handicapIndex = hcpIndexInput === "" || hcpIndexInput === "-" ? 0 : Number(hcpIndexInput);
      const nextPlayer = { ...p, handicap_index: handicapIndex };
      return { ...nextPlayer, course_hcp_goethe: getCourseHandicap(nextPlayer, "goethe", courses), course_hcp_feininger: getCourseHandicap(nextPlayer, "feininger", courses) };
    });
    if (!selectedActiveRoundId) { setError("Bitte zuerst eine Runde auswählen."); return; }
    setSetupSaving(true);
    try { await callSheetApi({ action: "saveSetup", round_id: selectedActiveRoundId, course_id: selectedCourseId || "", players: nextAllPlayers.map((p) => ({ id: p.id, character_name: p.character_name, display_name: p.display_name, alias_name: p.alias_name || fallbackAliases[p.id] || "", sort_order: p.sort_order, handicap_index: p.handicap_index, course_hcp_goethe: p.course_hcp_goethe, course_hcp_feininger: p.course_hcp_feininger })) }); setAllPlayers(nextAllPlayers.map(withFallbackAlias)); setConnectionStatus("online"); setError(""); setSetupSavedMessage("Setup wurde erfolgreich in der Datenbank gespeichert."); setAdminEditing(false); await loadData({ silent: true }); }
    catch (err) { setConnectionStatus("offline"); setError(err.message || "Setup konnte nicht gespeichert werden."); }
    finally { setSetupSaving(false); }
  }


  async function saveAdminRoundCourse(nextRoundId, nextCourseId) {
    if (!isAdminUnlocked || !nextRoundId) return;
    setSetupSavedMessage("");
    setBackupSavedMessage("");
    setSetupSaving(true);
    try {
      const nextAllPlayers = allPlayers.map((p) => {
        const hcpIndexKey = `hcp_index_${p.id}`;
        const hcpIndexInput = cleanHandicapInput(localHandicaps[hcpIndexKey] ?? p.handicap_index ?? p.dgv_hcp ?? p.hcp_index ?? "");
        const handicapIndex = hcpIndexInput === "" || hcpIndexInput === "-" ? 0 : Number(hcpIndexInput);
        const nextPlayer = { ...p, handicap_index: handicapIndex };
        return { ...nextPlayer, course_hcp_goethe: getCourseHandicap(nextPlayer, "goethe", courses), course_hcp_feininger: getCourseHandicap(nextPlayer, "feininger", courses) };
      });
      await callSheetApi({
        action: "saveSetup",
        round_id: nextRoundId,
        course_id: nextCourseId || "",
        players: nextAllPlayers.map((p) => ({
          id: p.id,
          character_name: p.character_name,
          display_name: p.display_name,
          alias_name: p.alias_name || fallbackAliases[p.id] || "",
          sort_order: p.sort_order,
          handicap_index: p.handicap_index,
          course_hcp_goethe: p.course_hcp_goethe,
          course_hcp_feininger: p.course_hcp_feininger,
        })),
      });
      setAllPlayers(nextAllPlayers.map(withFallbackAlias));
      setConnectionStatus("online");
      setError("");
      setSetupSavedMessage("Admin-Änderung wurde automatisch gespeichert.");
      setAdminEditing(false);
      await loadData({ silent: true });
    } catch (err) {
      setConnectionStatus("offline");
      setError(err.message || "Admin-Änderung konnte nicht automatisch gespeichert werden.");
    } finally {
      setSetupSaving(false);
    }
  }

  async function playPopupSound() {
    try { if (introAudioRef.current) { introAudioRef.current.loop = false; introAudioRef.current.pause(); introAudioRef.current.currentTime = 0; await introAudioRef.current.play(); } } catch {}
  }

  async function enterRoundFromSplash() {
    if (appLocked || splashEntering) return;
    await playPopupSound();
    setShowSplash(false);
    loadData({ silent: true });
  }

  async function setGlobalAppLock(nextLocked) {
    setSetupSavedMessage("");
    try {
      await callSheetApi({ action: "setAppLocked", app_locked: nextLocked });
      setAppLocked(nextLocked);
      setShowSplash(nextLocked);
      setLockUnlockOpen(false);
      setLockPasswordInput("");
      setConnectionStatus("online");
      setError("");
      setSetupSavedMessage(nextLocked ? "App wurde für alle Geräte gesperrt." : "App wurde für alle Geräte freigegeben.");
    } catch (err) {
      setConnectionStatus("offline");
      setError(err.message || "App-Sperre konnte nicht global gespeichert werden.");
    }
  }

  async function enterLockedAppAsAdmin() {
    if (lockPasswordInput !== ADMIN_PASSWORD) {
      setError("Passwort ist falsch.");
      return;
    }
    if (splashEntering) return;
    setSplashEntering(true);
    const data = await loadData({ silent: true });
    setSplashEntering(false);
    if (!data) return;
    setLockAdminBypass(true);
    setIsAdminUnlocked(true);
    setMainMenu("current");
    setView("score");
    setShowSplash(false);
    setLockUnlockOpen(false);
    setLockPasswordInput("");
    setError("");
  }

  function getLocalScoredPlayerForRound(roundId) {
    return String(scoredPlayerByRound?.[roundId] || "");
  }

  function saveLocalScoredPlayerForRound(roundId, scoredPlayerIdValue) {
    if (!roundId || !scoredPlayerIdValue) return;
    setScoredPlayerByRound((current) => ({ ...(current || {}), [roundId]: scoredPlayerIdValue }));
  }

  function setMainMenuAndView(value) {
    setMainMenu(value);
    setMenuOpen(false);
    if (value === "current") setView("score");
    if (value === "roundTables") setView("leaderboard");
    if (value === "tournament") setView("tournament");
    if (value === "archive") setView("archive");
    if (value === "fun") setView("fun");
    if (value === "settings") setView("handicaps");
    if (value === "admin") setView("admin");
  }

  function renderHeader() {
    const activeRoundIsFinal = String(displayedActiveRound?.stage || "") === "final" || String(displayedActiveRound?.round_id || "") === "r4";
    const activeRoundChapterLabel = getRoundChapterLabel(displayedActiveRound);
    const subtitle = mainMenu === "current" ? activeRoundChapterLabel : mainMenu === "roundTables" ? "Tabellen Runde" : mainMenu === "tournament" ? activeRoundIsFinal ? "Turnier · Am Schicksalsberg" : "Turnier · Kapitel der Gefährten" : mainMenu === "archive" ? "Scorekarten · Chroniken der Runde" : mainMenu === "fun" ? "Mittelerde" : mainMenu === "admin" ? "Admin" : "Einstellungen";
    return (
      <motion.header initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-1 pt-1">
        <div className="relative flex h-8 items-center justify-center">
          <div className="pointer-events-none absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-amber-500/35 bg-black/40 px-2.5 py-0.5 text-[10px] text-amber-100/80 shadow-[inset_0_1px_0_rgba(251,191,36,0.12),0_8px_18px_rgba(0,0,0,0.28)]">
            <Icon size={14} className={connectionStatus === "online" ? "animate-pulse text-emerald-300" : "text-red-300"}>{connectionStatus === "online" ? "●" : "○"}</Icon>
            <span>{pendingScores.length ? `${pendingScores.length} offen` : connectionStatus === "online" ? "Datenbank verbunden" : "Datenbank offline"}</span>
          </div>
          <button type="button" onClick={() => setMenuOpen((value) => !value)} className="ml-auto rounded-xl border border-amber-500/35 bg-[linear-gradient(180deg,rgba(48,35,22,0.82),rgba(12,10,9,0.82))] px-2.5 py-1 text-base leading-none text-amber-100 shadow-[inset_0_1px_0_rgba(251,191,36,0.12),0_8px_18px_rgba(0,0,0,0.35)] backdrop-blur-sm transition active:scale-[0.96]" aria-label="Menü öffnen">☰</button>
          {menuOpen ? <div className="absolute right-0 top-[34px] z-30 w-64 overflow-hidden rounded-2xl border border-amber-700/40 bg-stone-950/95 text-left shadow-2xl shadow-black/70 backdrop-blur">{[["current", "Scoring"], ["roundTables", "Tabellen Runde"], ["tournament", "Turnier"], ["archive", "Scorekarten"], ["fun", "Mittelerde"], ["settings", "Einstellungen"], ["admin", "Admin"]].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMainMenuAndView(value)}
              className={cls(
                "block w-full border-b border-amber-700/20 text-left last:border-b-0",
                value === "current" ? "px-4 py-4 text-base font-black" : "px-4 py-2.5 text-sm",
                mainMenu === value
                  ? value === "current"
                    ? "bg-[linear-gradient(180deg,rgba(217,119,6,0.98),rgba(146,64,14,0.96))] text-amber-50 shadow-[inset_0_1px_0_rgba(251,191,36,0.28)]"
                    : "bg-amber-700/55 text-amber-50"
                  : value === "current"
                    ? "bg-amber-500/10 text-amber-200"
                    : "bg-transparent text-amber-100/85"
              )}
            >
              {value === "current" ? (
                <span className="flex items-center justify-between gap-3">
                  <span>
                    <span className="block font-serif text-lg leading-tight">Scoring</span>
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100/65">Score eingeben</span>
                  </span>
                  <span className="text-xl drop-shadow-[0_0_10px_rgba(251,191,36,0.35)]">➜</span>
                </span>
              ) : (
                <span className="pl-2">{label}</span>
              )}
            </button>
          ))}</div> : null}
        </div>
      </motion.header>
    );
  }

  function renderStatusMessages() {
    return <>{error && <Card className="mb-2 rounded-2xl border-amber-700/40 bg-amber-950/50"><CardContent className="p-3 text-sm text-amber-100">{error}</CardContent></Card>}</>;
  }

  function renderCurrentTabs() {
    return null;
  }

  function renderTournamentView() {
    return <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="landscape:fixed landscape:inset-0 landscape:z-40 landscape:overflow-auto landscape:bg-stone-950 landscape:p-3"><div className="landscape:mx-auto landscape:max-w-none landscape:pb-6"><TournamentStandings players={allPlayers} rounds={rounds} holes={allHoles} scores={officialAllScores} activeRoundId={displayedActiveRound?.round_id} /></div></motion.section>;
  }

  function renderAdminView() {
    return (
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="mb-2 rounded-2xl border border-amber-500/30 bg-[linear-gradient(180deg,rgba(48,35,22,0.86),rgba(18,13,9,0.82))] shadow-[inset_0_1px_0_rgba(251,191,36,0.10),0_18px_46px_rgba(0,0,0,0.38)] backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="mb-2"><p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Admin</p><h2 className="font-serif text-lg text-amber-200">Turnierverwaltung</h2><p className="mt-1 text-sm text-amber-100/65">Aktive Runde und Spielvorgaben sind sichtbar, aber erst nach Passworteingabe bearbeitbar.</p></div>
            {!isAdminUnlocked ? <div className="mb-2 rounded-2xl border border-amber-700/30 bg-black/25 p-2"><label className="mb-1 block text-sm text-amber-100/80">Admin-Passwort</label><input type="password" value={adminPinInput} onChange={(e) => setAdminPinInput(e.target.value)} placeholder="Passwort eingeben" className="mb-3 w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2 text-amber-50 placeholder:text-amber-100/30" /><Button onClick={() => { if (adminPinInput === ADMIN_PASSWORD) { setIsAdminUnlocked(true); setError(""); } else { setError("Admin-Passwort ist falsch."); } }} className="w-full rounded-2xl bg-amber-600 py-2 text-amber-50">Admin entsperren</Button></div> : <div className="mb-2 rounded-2xl border border-emerald-700/30 bg-emerald-950/30 p-3 text-sm text-emerald-100">Admin entsperrt. Änderungen können gespeichert werden.</div>}
            <div className="mb-2 rounded-2xl border border-amber-700/30 bg-black/25 p-2"><label className="mb-1 block text-sm text-amber-100/80">Aktive Runde</label><select value={selectedActiveRoundId} onChange={(e) => { const nextRoundId = e.target.value; const nextRound = (rounds.length ? rounds : fallbackRounds).find((round) => String(round.round_id) === String(nextRoundId)); const nextCourseId = nextRound?.course_id || selectedCourseId || ""; setAdminEditing(true); setSelectedActiveRoundId(nextRoundId); setSelectedCourseId(nextCourseId); setScoredPlayerId(""); lastLoadedRoundRef.current = ""; setScoreEntryMode("player"); saveAdminRoundCourse(nextRoundId, nextCourseId); }} disabled={!isAdminUnlocked || setupSaving} className="w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2 text-amber-50 disabled:opacity-60"><option value="">Runde auswählen</option>{(rounds.length ? rounds : fallbackRounds).map((round) => <option key={round.round_id} value={round.round_id}>{round.round_name}</option>)}</select></div>
            <div className="mb-2 rounded-2xl border border-amber-700/30 bg-black/25 p-2"><label className="mb-1 block text-sm text-amber-100/80">Kurs für aktive Runde</label><select value={selectedCourseId} onChange={(e) => { const nextCourseId = e.target.value; setAdminEditing(true); setSelectedCourseId(nextCourseId); saveAdminRoundCourse(selectedActiveRoundId, nextCourseId); }} disabled={!isAdminUnlocked || setupSaving} className="w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2 text-amber-50 disabled:opacity-60"><option value="">Kurs auswählen</option>{(courses.length ? courses : fallbackCourses).map((course) => <option key={course.course_id} value={course.course_id}>{course.course_name}</option>)}</select></div>
            <div className="space-y-2">{allPlayers.map((p) => { const hcpIndexKey = `hcp_index_${p.id}`; const hcpIndexValue = localHandicaps[hcpIndexKey] ?? String(p.handicap_index ?? p.dgv_hcp ?? p.hcp_index ?? ""); const previewPlayer = { ...p, handicap_index: hcpIndexValue === "" || hcpIndexValue === "-" ? 0 : Number(String(hcpIndexValue).replace(",", ".")) }; const goetheSpv = getCourseHandicap(previewPlayer, "goethe", courses); const feiningerSpv = getCourseHandicap(previewPlayer, "feininger", courses); return <div key={p.id} className="rounded-xl border border-amber-700/30 bg-black/25 p-2"><div className="mb-2 font-semibold text-amber-100">{getPlayerLabel(p)}<div className="text-xs font-normal text-amber-100/70">DGV-HCP eintragen · Spielvorgabe wird automatisch berechnet</div></div><div className="rounded-xl border border-amber-700/20 bg-black/25 p-2"><label className="mb-1 block text-xs font-bold uppercase tracking-[0.16em] text-amber-300/80">DGV HCP / Handicap Index</label><input inputMode="decimal" disabled={!isAdminUnlocked} value={hcpIndexValue} onChange={(e) => { setAdminEditing(true); setLocalHandicaps((current) => ({ ...current, [hcpIndexKey]: cleanHandicapInput(e.target.value) })); }} className="w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2 text-center text-amber-50 disabled:opacity-60" /><div className="mt-2 grid grid-cols-2 gap-2 text-center text-xs text-amber-100/75"><div className="rounded-xl bg-amber-50/5 p-2"><div>Goethe SpV</div><b className="text-lg text-amber-200">{goetheSpv}</b></div><div className="rounded-xl bg-amber-50/5 p-2"><div>Feininger SpV</div><b className="text-lg text-amber-200">{feiningerSpv}</b></div></div></div></div>; })}</div>
            <Button disabled={!isAdminUnlocked || setupSaving} onClick={saveFullSetup} className="mt-2 w-full rounded-2xl bg-amber-600 py-2 text-amber-50 disabled:opacity-50">{setupSaving ? "Speichere ..." : "HCP-Werte speichern"}</Button>
            <Button disabled={!isAdminUnlocked || backupSaving} onClick={createRoundBackup} className="mt-2 w-full rounded-2xl border border-emerald-500/40 bg-emerald-700/80 py-2 text-emerald-50 disabled:opacity-50">{backupSaving ? "Erstelle Backup ..." : "Backup für aktive Runde erstellen"}</Button>
            {appLocked ? <Button disabled={!isAdminUnlocked} onClick={() => { setGlobalAppLock(false); setLockAdminBypass(false); }} className="mt-2 w-full rounded-2xl border border-emerald-500/40 bg-emerald-800/70 py-2 text-emerald-50 disabled:opacity-50">App für alle freigeben</Button> : <Button disabled={!isAdminUnlocked} onClick={() => { setMenuOpen(false); setLockAdminBypass(false); setGlobalAppLock(true); }} className="mt-2 w-full rounded-2xl border border-amber-500/40 bg-stone-950/70 py-2 text-amber-100 disabled:opacity-50">App für alle sperren</Button>}
            <Button disabled={!isAdminUnlocked || clearScoresSaving || connectionStatus !== "online"} onClick={() => { setClearScoresError(""); setClearScoresConfirmOpen(true); }} className="mt-2 w-full rounded-2xl border border-red-500/50 bg-red-950/60 py-2 text-red-100 disabled:opacity-50">Scores löschen</Button>
            <Button disabled={!isAdminUnlocked || clearScoresSaving || connectionStatus !== "online"} onClick={() => { setClearScoresError(""); setClearScoresConfirmOpen(true); }} className="mt-2 w-full rounded-2xl border border-red-500/50 bg-red-950/60 py-2 text-red-100 disabled:opacity-50">Scores löschen</Button>
            <Button disabled={!isAdminUnlocked || connectionStatus !== "online"} onClick={resetDeviceAssignmentsForAll} className="mt-2 w-full rounded-2xl border border-amber-500/40 bg-stone-950/70 py-2 text-amber-100 disabled:opacity-50">Spieler-/Zähler-Zuordnungen zurücksetzen</Button>
          </CardContent>
        </Card>
      </motion.section>
    );
  }

  function renderSettingsView() {
    return <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}><Card className="mb-2 rounded-2xl border border-amber-500/30 bg-[linear-gradient(180deg,rgba(48,35,22,0.86),rgba(18,13,9,0.82))] shadow-[inset_0_1px_0_rgba(251,191,36,0.10),0_18px_46px_rgba(0,0,0,0.38)] backdrop-blur-sm"><CardContent className="p-3"><p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Einstellungen</p><h2 className="font-serif text-lg text-amber-200">Mein Handy</h2><p className="mt-1 text-sm text-amber-100/65">Diese Einstellung wird nur lokal auf diesem Handy gespeichert.</p><div className="mt-2 rounded-2xl border border-amber-700/30 bg-black/25 p-2"><label className="mb-1 block text-sm text-amber-100/80">Wer bin ich auf diesem Handy?</label><select value={myPlayerId} onChange={(e) => setMyPlayerId(e.target.value)} className="w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2 text-amber-50"><option value="">Spieler auswählen</option>{allPlayers.map((player) => <option key={player.id} value={player.id}>{getPlayerLabel(player)}</option>)}</select><p className="mt-2 text-xs text-amber-100/60">Dieser Spieler wird auf diesem Handy beim Score-Zählen ausgeblendet, damit man sich nicht selbst zählt.</p></div><div className="mt-2 rounded-2xl border border-amber-700/30 bg-black/25 p-2"><label className="mb-1 block text-sm text-amber-100/80">Wen zähle ich?</label><select value={scoredPlayerId} onChange={(e) => { const nextPlayerId = e.target.value; setScoredPlayerId(nextPlayerId); if (displayedActiveRound?.round_id && nextPlayerId) saveScorerAssignmentForRound(displayedActiveRound.round_id, nextPlayerId); }} className="w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2 text-amber-50"><option value="">Spieler auswählen</option>{scoreablePlayers.map((player) => <option key={player.id} value={player.id}>{getPlayerLabel(player)}</option>)}</select><p className="mt-2 text-xs text-amber-100/60">Dieser Spieler ist links im Score-Bereich vorausgewählt.</p></div></Caif (displayedActiveRound?.round_id && nextPlayerId) saveLocalScoredPlayerForRound(displayedActiveRound.round_id, nextPlayerId);nst isNetStableford = standingsPopup === "netStableford";
    const isStrokePlay = standingsPopup === "strokePlay";
    const title = isStrokePlay ? "Klassisches Zählspiel" : isNetStableford ? "Netto Stableford" : "Strokes HCP adjusted";
    const tablePlayers = isStrokePlay ? strokePlayLeaderboard : isNetStableford ? netStablefordLeaderboard : hcpAdjustedStrokeLeaderboard;
    return <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 px-3 backdrop-blur-sm"><div className="max-h-[82vh] w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/45 bg-stone-950 text-amber-50 shadow-2xl shadow-black/80"><div className="flex items-start justify-between gap-2 border-b border-amber-700/35 bg-amber-500/10 p-3"><div><div className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Tabelle</div><div className="font-serif text-lg text-amber-200">{title}</div></div><button type="button" onClick={() => setStandingsPopup(null)} className="rounded-xl border border-amber-500/40 bg-black/25 px-3 py-1 text-lg font-bold leading-none text-amber-100">×</button></div><div className="max-h-[68vh] overflow-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><table className="w-full border-collapse text-sm text-amber-50"><thead><tr className="text-left text-xs uppercase tracking-wider text-amber-100/80"><th className="px-2 py-2">#</th><th className="px-2 py-2">Spieler</th><th className="px-2 py-2 text-right">{isNetStableford ? "Punkte" : "+/−"}</th><th className="px-2 py-2 text-right">Löcher</th></tr></thead><tbody>{tablePlayers.map((player, index) => <tr key={player.id} className={cls("border-t border-amber-700/20", myPlayerId && String(player.id) === String(myPlayerId) && "bg-amber-500/15")}><td className="px-2 py-2 text-amber-200/80">{index + 1}</td><td className="px-2 py-2 font-semibold text-amber-100">{getPlayerLabel(player)}</td><td className="px-2 py-2 text-right font-serif text-lg font-bold text-amber-300">{isStrokePlay ? formatToPar(player.toPar, player.played) : isNetStableford ? player.netStableford : formatToPar(player.hcpAdjustedToPar, player.played)}</td><td className="px-2 py-2 text-right text-amber-100/80">{player.played}/18</td></tr>)}</tbody></table></div></div></div>;
  }

  function renderScoreView() {
    return (
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="mb-2 rounded-2xl bg-transparent shadow-none">
          <CardContent className="p-2">
            <div className={cls("mb-2 rounded-2xl border bg-[linear-gradient(180deg,rgba(48,35,22,0.70),rgba(12,10,9,0.62))] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(251,191,36,0.10),0_10px_28px_rgba(0,0,0,0.30)]", hasScoreMismatch ? "border-red-500/60" : "border-amber-500/30")}>
              <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                  <div className="font-serif text-[1.7rem] font-black leading-none text-amber-200">{displayedActiveRound?.round_name || "Runde 1"}</div>
                  <div className="text-right leading-snug">
                    <div className="text-xs font-semibold text-amber-100/85">{getRoundChapterLabel(displayedActiveRound).replace(`${displayedActiveRound?.round_name || ""} · `, "")}</div>
                    <div className="text-[11px] text-amber-100/65">{activeCourse?.course_name || "Kein Kurs ausgewählt"}</div>
                  </div>
                </div>
                <div className="text-right">
                  {hasScoreMismatch ? <div className="rounded-full border border-red-400/50 bg-red-950/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-100">Abweichung</div> : null}
                </div>
              </div>
            </div>

            {myCurrentStats ? (
              <div className="mb-2 w-full rounded-xl border border-amber-700/30 bg-black/25 p-1.5 text-left">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-amber-300/75">Mein Stand</div>
                  <div className="font-serif text-xs text-amber-200">{getPlayerLabel(myCurrentStats)}</div>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
                  <button type="button" onClick={() => setStandingsPopup("strokePlay")} className="rounded-xl border border-amber-500/20 bg-[linear-gradient(180deg,rgba(251,191,36,0.08),rgba(0,0,0,0.18))] p-1.5 text-amber-50 shadow-[inset_0_1px_0_rgba(251,191,36,0.10)] transition active:scale-[0.98]">
                    <div className="text-amber-100">Tats. Strokes</div>
                    <b className="text-base text-amber-200">{myCurrentStats.played ? myCurrentStats.total : "–"}</b>
                    <div className="mt-0.5 text-[9px] text-amber-100/70">Platz {strokePlayLeaderboard.findIndex((player) => String(player.id) === String(myPlayerId)) >= 0 ? strokePlayLeaderboard.findIndex((player) => String(player.id) === String(myPlayerId)) + 1 : "–"}</div>
                  </button>
                  <button type="button" onClick={() => setStandingsPopup("hcpAdjusted")} className="rounded-xl border border-amber-500/20 bg-[linear-gradient(180deg,rgba(251,191,36,0.08),rgba(0,0,0,0.18))] p-1.5 text-amber-50 shadow-[inset_0_1px_0_rgba(251,191,36,0.10)] transition active:scale-[0.98]">
                    <div className="text-amber-100">HCP +/−</div>
                    <b className="text-base text-amber-200">{myCurrentStats.played ? formatToPar(myCurrentStats.hcpAdjustedToPar, true) : "–"}</b>
                    <div className="mt-0.5 text-[9px] text-amber-100/70">Platz {myHcpAdjustedStrokeRank || "–"}</div>
                  </button>
                  <button type="button" onClick={() => setStandingsPopup("netStableford")} className="rounded-xl border border-amber-500/20 bg-[linear-gradient(180deg,rgba(251,191,36,0.08),rgba(0,0,0,0.18))] p-1.5 text-amber-50 shadow-[inset_0_1px_0_rgba(251,191,36,0.10)] transition active:scale-[0.98]">
                    <div className="text-amber-100">Netto Stbl</div>
                    <b className="text-base text-amber-200">{myCurrentStats.netStableford}</b>
                    <div className="mt-0.5 text-[9px] text-amber-100/70">Platz {myNetStablefordRank || "–"}</div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-2 rounded-xl border border-amber-700/30 bg-black/25 p-1.5 text-[10px] text-amber-100/75">Unter Einstellungen kannst du festlegen, wer du bist.</div>
            )}

            {myPlayerId && !currentAssignedScoredPlayerIsValid ? (
              <div className="mb-2 rounded-2xl border border-amber-500/45 bg-stone-950/75 p-2 shadow-xl shadow-black/30 backdrop-blur-sm">
                <div className="mb-2 text-center">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/75">Neue Zähl-Zuordnung</div>
                  <div className="font-serif text-lg font-black text-amber-200">Wen zählst du?</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {scoreablePlayers.map((player) => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => {
                        setScoredPlayerId(player.id);
                        saveScorerAssignmentForRound(displayedActiveRound?.round_id || "", player.id);
                        setRoundScorerPromptOpen(false);
                      }}
                      className="rounded-2xl bg-stone-800 px-2 py-3 font-serif text-sm font-bold text-amber-100 active:scale-[0.98]"
                    >
                      {getPlayerLabel(player)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <divsaveLocalScoredPlayerForRound(displayedActiveRound?.round_id || "", player.id);")}>
              {myCurrentPlayer ? (
                <div className="mb-2 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setScoreEntryMode("player")} className={cls("rounded-2xl px-2 py-3 text-sm font-bold", !isScorerEntryMode ? "bg-amber-600 text-amber-50" : "bg-stone-800 text-amber-100", hasSelectedPlayerScoreMismatch && "ring-1 ring-red-400/60")}>
                    <span className="block truncate font-serif text-sm leading-none">{getPlayerLabel(scoredPlayer) || "Spieler"}</span>{hasSelectedPlayerScoreMismatch ? <span className="ml-1">⚠</span> : null}
                  </button>
                  <button type="button" onClick={() => setScoreEntryMode("scorer")} className={cls("rounded-xl px-2 py-1.5 text-xs font-bold", isScorerEntryMode ? "bg-amber-600 text-amber-50" : "bg-stone-800 text-amber-100", hasOwnScoreMismatch && "ring-1 ring-red-400/60")}>
                    <span className="block truncate font-serif text-sm leading-none">Mein Score</span>{hasOwnScoreMismatch ? <span className="ml-1">⚠</span> : null}
                  </button>
                </div>
              ) : null}

              {visibleScoreMismatchMessages.length ? (
                <div className="mb-2 rounded-xl border border-red-500/50 bg-red-950/40 p-1.5 text-xs text-red-100">
                  <span className="underline underline-offset-4">Palantír meldet Abweichung</span>
                  <div className="mt-1 space-y-0.5">{visibleScoreMismatchMessages.map((message) => <div key={message}>{message}</div>)}</div>
                </div>
              ) : null}

              <div className="mb-1.5 grid grid-cols-[auto_1fr] items-center gap-2 rounded-2xl border border-amber-700/35 bg-black/25 px-3 py-2 text-[10px] text-amber-100/70">
                <div className="font-serif text-xl font-black leading-none text-amber-200">Loch {activeHole}</div>
                <div className="flex items-center justify-end gap-2.5 text-right text-[11px]">
                  <span>Par <b className="text-amber-200">{activeHoleData.par}</b></span>
                  <span>HCP <b className="text-amber-200">{activeHoleData.hcp}</b></span>
                  <span>{activeHoleData.meters} m</span>
                  <span>Vorgabe <b className="text-amber-200 tracking-[0.18em]">{formatShotMarks(entryPlayerShotsOnActiveHole)}</b></span>
                </div>
              </div>

              <div className="mb-3">
                <ScoreStepper
                  value={normalizeBoolean(currentScore.picked_up) ? 0 : currentScore.strokes ?? ""}
                  par={activeHoleData?.par || 4}
                  pickedUpStrokes={pickedUpStrokes}
                  disabled={!canEnterScores}
                  onChange={(scoreValue) =>
                    Number(scoreValue) === 0 || Number(scoreValue) >= Number(pickedUpStrokes || 0)
                      ? saveScore({ strokes: pickedUpStrokes, picked_up: true })
                      : saveScore({ strokes: scoreValue, picked_up: false })
                  }
                />
              </div>

              <div className="mb-3">
                <PuttStepper value={currentScore.putts_count} disabled={!canEnterScores} onChange={(putts) => saveScore({ putts_count: putts, over_two_putts: Number(putts) >= 3 })} />
              </div>

              <div className="mb-3 rounded-2xl border border-amber-700/40 bg-black/25 p-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-amber-100">Lady</div>
                    <div className="text-[10px] text-amber-100/65">Markiert eine Lady.</div>
                  </div>
                  <input type="checkbox" disabled={!canEnterScores} checked={normalizeBoolean(currentScore.lady)} onChange={(e) => saveScore({ lady: e.target.checked })} className="h-6 w-6 accent-amber-500 disabled:opacity-40" />
                </div>
              </div>

              {scoreHintMessage ? <div className="mb-2 rounded-xl border border-amber-500/40 bg-amber-950/50 p-1.5 text-center text-xs font-semibold text-amber-100">{scoreHintMessage}</div> : null}

              <div className="grid grid-cols-2 gap-2">
                <Button disabled={activeHole === 1} onClick={() => setActiveHole((h) => Math.max(1, h - 1))} className="rounded-2xl bg-stone-800 py-3 text-base font-bold text-amber-100">Zurück</Button>
                <Button disabled={activeHole === 18 || !canEnterScores} onClick={goToNextHole} className={cls("rounded-2xl py-3 text-base font-bold text-amber-50 disabled:opacity-50", hasRequiredScoresForNext ? "bg-amber-600" : "bg-amber-700/60 ring-1 ring-amber-500/30")}>Loch {Math.min(18, Number(activeHole || 1) + 1)}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    );
  }

  function renderLeaderboardView() {
    const availableRounds = rounds.length ? rounds : fallbackRounds;
    const tableRound = availableRounds.find((round) => String(round.round_id) === String(roundTableRoundId)) || displayedActiveRound || availableRounds[0] || fallbackRounds[0];
    const tableCourseId = tableRound?.course_id || displayCourseId || "goethe";
    const tableCourse = (courses.length ? courses : fallbackCourses).find((course) => String(course.course_id) === String(tableCourseId));
    const tableHoles = (allHoles.length ? allHoles : fallbackHoles)
      .filter((hole) => String(hole.course_id) === String(tableCourseId))
      .sort((a, b) => Number(a.hole_number) - Number(b.hole_number));
    const tablePlayers = getPlayersForCourse(getRoundPlayers(tableRound?.round_id, allPlayers, roundPlayers), tableCourseId, courses);
    const tableScores = officialAllScores.filter((score) => String(score.round_id || "") === String(tableRound?.round_id || ""));
    const tableStats = buildPlayerStats(tablePlayers, tableHoles, tableScores);
    const tableStrokePlayLeaderboard = sortStrokePlay(tableStats);
    const tableNetStablefordLeaderboard = sortStableford(tableStats, "netStableford");
    const tableGrossStablefordLeaderboard = sortStableford(tableStats, "grossStableford");
    const tableHcpAdjustedStrokeLeaderboard = sortHcpAdjustedStrokePlay(tableStats);
    const tablePuttPenaltyLeaderboard = [...tableStats].sort((a, b) => Number(b.puttPenaltyEuro || 0) - Number(a.puttPenaltyEuro || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));

    return (
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="landscape:fixed landscape:inset-0 landscape:z-40 landscape:overflow-auto landscape:bg-stone-950 landscape:p-3">
        <div className="landscape:mx-auto landscape:max-w-none landscape:pb-6">
          <Card className="mb-2 rounded-2xl border border-amber-500/30 bg-[linear-gradient(180deg,rgba(48,35,22,0.86),rgba(18,13,9,0.82))] shadow-[inset_0_1px_0_rgba(251,191,36,0.10),0_18px_46px_rgba(0,0,0,0.38)] backdrop-blur-sm">
            <CardContent className="p-3 text-sm text-amber-100">
              <div className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Tabellen Runde</div>
              <div className="mt-1 font-serif text-lg text-amber-200">{tableRound?.round_name || "Runde"}</div>
              <div className="text-amber-100/65">{tableCourse?.course_name || "Kurs"}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {availableRounds.map((round) => (
                  <button
                    key={round.round_id}
                    type="button"
                    onClick={() => setRoundTableRoundId(round.round_id)}
                    className={cls(
                      "rounded-xl border px-2 py-2 text-xs font-bold",
                      String(tableRound?.round_id) === String(round.round_id)
                        ? "border-amber-400/60 bg-amber-600 text-amber-50"
                        : "border-amber-700/35 bg-black/25 text-amber-100"
                    )}
                  >
                    {round.round_name || round.round_id}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="mb-2 rounded-2xl border border-amber-500/30 bg-[linear-gradient(180deg,rgba(48,35,22,0.86),rgba(18,13,9,0.82))] shadow-[inset_0_1px_0_rgba(251,191,36,0.10),0_18px_46px_rgba(0,0,0,0.38)] backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="mb-2"><p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Leaderboard</p></div>
              <LeaderboardTable title="Klassisches Zählspiel" players={tableStrokePlayLeaderboard} columns={[{ label: "+/−", render: (p) => formatToPar(p.toPar, p.played), emphasize: true }, { label: "Schläge", render: (p) => p.played ? p.total : "–" }, { label: "Löcher", render: (p) => `${p.played}/18` }]} />
              <LeaderboardTable title="Netto Stableford" players={tableNetStablefordLeaderboard} columns={[{ label: "Punkte", render: (p) => p.netStableford, emphasize: true }, { label: "Löcher", render: (p) => `${p.played}/18` }]} />
              <LeaderboardTable title="Zählspiel HCP adjusted" players={tableHcpAdjustedStrokeLeaderboard} columns={[{ label: "+/−", render: (p) => formatToPar(p.hcpAdjustedToPar, p.played), emphasize: true }, { label: "Netto", render: (p) => p.played ? p.hcpAdjustedTotal : "–" }, { label: "Löcher", render: (p) => `${p.played}/18` }]} />
              <LeaderboardTable title="Brutto Punkte" players={tableGrossStablefordLeaderboard} columns={[{ label: "Punkte", render: (p) => p.grossStableford, emphasize: true }, { label: "Schläge", render: (p) => p.played ? p.total : "–" }, { label: "Löcher", render: (p) => `${p.played}/18` }]} />
              <LeaderboardTable title="Putt-Kasse" players={tablePuttPenaltyLeaderboard} columns={[{ label: "3 Putts", render: (p) => `${p.threePutts} × 2 €` }, { label: "4+ Putts", render: (p) => `${p.fourPlusPutts} × 4 €` }, { label: "Gesamt", render: (p) => `${p.puttPenaltyEuro || 0} €`, emphasize: true }]} />
            </CardContent>
          </Card>
        </div>
      </motion.section>
    );
  }

  function renderFunView() {
    return <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="landscape:fixed landscape:inset-0 landscape:z-40 landscape:overflow-auto landscape:bg-stone-950 landscape:p-3"><div className="landscape:mx-auto landscape:max-w-none landscape:pb-6"><MiddleEarthTables players={playersWithCurrentHandicaps} holes={holes} scores={officialScores} mismatches={roundMismatches} /></div></motion.section>;
  }

  function getStrokesCellClass(score, hole) {
    if (!score || score.strokes === "" || score.strokes == null) return "bg-black/10 text-amber-100/55";
    if (normalizeBoolean(score.picked_up)) return "bg-red-900/65 text-red-100 ring-1 ring-red-400/40";
    const diff = Number(score.strokes || 0) - Number(hole?.par || 0);
    if (diff <= -1) return "bg-emerald-700/70 text-emerald-50 ring-1 ring-emerald-300/30";
    if (diff === 0) return "bg-amber-500/25 text-amber-100 ring-1 ring-amber-300/25";
    if (diff === 1) return "bg-orange-800/65 text-orange-100 ring-1 ring-orange-300/25";
    return "bg-red-900/65 text-red-100 ring-1 ring-red-400/40";
  }

  function renderArchiveView() {
    const availableRounds = rounds.length ? rounds : fallbackRounds;
    const archiveRound = availableRounds.find((round) => String(round.round_id) === String(scorecardRoundId)) || displayedActiveRound || availableRounds[0] || fallbackRounds[0];
    const archiveCourseId = archiveRound?.course_id || displayCourseId || "goethe";
    const archiveCourse = (courses.length ? courses : fallbackCourses).find((course) => String(course.course_id) === String(archiveCourseId));
    const scorecardHoles = (allHoles.length ? allHoles : fallbackHoles)
      .filter((hole) => String(hole.course_id) === String(archiveCourseId))
      .sort((a, b) => Number(a.hole_number) - Number(b.hole_number));
    const scorecardPlayers = getPlayersForCourse(getRoundPlayers(archiveRound?.round_id, allPlayers, roundPlayers), archiveCourseId, courses);
    const scorecardScores = officialAllScores.filter((score) => String(score.round_id || "") === String(archiveRound?.round_id || ""));

    return (
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="landscape:fixed landscape:inset-0 landscape:z-40 landscape:overflow-auto landscape:bg-stone-950 landscape:p-3">
        <div className="landscape:mx-auto landscape:max-w-none landscape:pb-6">
          <Card className="mb-2 rounded-2xl border border-amber-500/30 bg-[linear-gradient(180deg,rgba(48,35,22,0.86),rgba(18,13,9,0.82))] shadow-[inset_0_1px_0_rgba(251,191,36,0.10),0_18px_46px_rgba(0,0,0,0.38)] backdrop-blur-sm">
            <CardContent className="p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Scorekarten</p>
              <div className="mt-0.5 text-sm font-semibold text-amber-300/85">Chroniken der Runde</div>
              <h2 className="font-serif text-lg text-amber-200">{archiveRound?.round_name || "Aktive Runde"}</h2>
              <p className="mt-1 text-sm text-amber-100/70">{archiveCourse?.course_name || "Kurs"} · klassische Scorekarte je Spieler</p>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {availableRounds.map((round) => (
                  <button
                    key={round.round_id}
                    type="button"
                    onClick={() => setScorecardRoundId(round.round_id)}
                    className={cls(
                      "rounded-xl border px-2 py-2 text-xs font-bold",
                      String(archiveRound?.round_id) === String(round.round_id)
                        ? "border-amber-400/60 bg-amber-600 text-amber-50"
                        : "border-amber-700/35 bg-black/25 text-amber-100"
                    )}
                  >
                    {round.round_name || round.round_id}
                  </button>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px] text-amber-100/70 sm:grid-cols-4">
                <div className="rounded-lg bg-emerald-700/50 px-2 py-1 text-emerald-50">Birdie oder besser</div>
                <div className="rounded-lg bg-amber-500/20 px-2 py-1 text-amber-100">Par</div>
                <div className="rounded-lg bg-orange-800/55 px-2 py-1 text-orange-100">Bogey</div>
                <div className="rounded-lg bg-red-900/60 px-2 py-1 text-red-100">Doppelbogey+ / X</div>
              </div>
            </CardContent>
          </Card>

          {scorecardPlayers.map((player) => {
            const playerScores = scorecardHoles.map((hole) => {
              const score = scorecardScores.find(
                (item) =>
                  String(item.player_id || "") === String(player.id) &&
                  Number(item.hole_number) === Number(hole.hole_number)
              );
              const shots = getShotsOnHole(player.course_hcp, hole.hcp);
              const grossStableford = score ? getScoreStablefordPoints(score, hole.par, 0) : 0;
              const netStableford = score ? getScoreStablefordPoints(score, hole.par, shots) : 0;
              const hcpAdjustedStrokes = score && score.strokes !== "" && score.strokes != null ? Number(score.strokes || 0) - shots : null;
              const hcpAdjustedToPar = hcpAdjustedStrokes != null ? hcpAdjustedStrokes - Number(hole.par || 0) : null;
              return { hole, score, shots, grossStableford, netStableford, hcpAdjustedStrokes, hcpAdjustedToPar };
            });

            const playedRows = playerScores.filter((row) => row.score && row.score.strokes !== "" && row.score.strokes != null);
            const totalStrokes = playedRows.reduce((sum, row) => sum + Number(row.score?.strokes || 0), 0);
            const totalGrossStableford = playedRows.reduce((sum, row) => sum + Number(row.grossStableford || 0), 0);
            const totalNetStableford = playedRows.reduce((sum, row) => sum + Number(row.netStableford || 0), 0);
            const totalHcpAdjustedStrokes = playedRows.reduce((sum, row) => sum + Number(row.hcpAdjustedStrokes || 0), 0);
            const totalParPlayed = playedRows.reduce((sum, row) => sum + Number(row.hole?.par || 0), 0);
            const totalHcpAdjustedToPar = playedRows.length ? totalHcpAdjustedStrokes - totalParPlayed : null;

            return (
              <Card key={player.id} className="mb-3 rounded-2xl border-amber-700/40 bg-[#20170f]/82 shadow-xl backdrop-blur-sm">
                <CardContent className="p-3">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <div className="font-serif text-lg font-bold text-amber-200">{getPlayerLabel(player)}</div>
                      <div className="text-xs text-amber-100/65">SpV {Number(player.course_hcp || 0)} · {playedRows.length}/18 Löcher</div>
                    </div>
                    <div className="rounded-2xl border border-amber-700/30 bg-black/25 px-3 py-2 text-right text-xs text-amber-100/80">
                      <div>Strokes HCP adjusted</div>
                      <b className="font-serif text-lg text-amber-300">{playedRows.length ? totalHcpAdjustedStrokes : "–"}</b>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-amber-700/30 bg-black/25 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <table className="w-full min-w-[760px] border-collapse text-xs text-amber-50 landscape:min-w-0 landscape:text-[11px]">
                      <thead>
                        <tr className="text-left uppercase tracking-wider text-amber-100/80">
                          <th className="px-2 py-1.5">Loch</th>
                          {scorecardHoles.map((hole) => <th key={hole.hole_number} className="px-1.5 py-1.5 text-center">{hole.hole_number}</th>)}
                          <th className="px-2 py-1.5 text-center">Σ</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-amber-700/20">
                          <td className="px-2 py-1.5 font-semibold text-amber-100">Par</td>
                          {scorecardHoles.map((hole) => <td key={hole.hole_number} className="px-1.5 py-1.5 text-center">{hole.par}</td>)}
                          <td className="px-2 py-1.5 text-center font-bold text-amber-200">{scorecardHoles.reduce((sum, hole) => sum + Number(hole.par || 0), 0)}</td>
                        </tr>
                        <tr className="border-t border-amber-700/20">
                          <td className="px-2 py-1.5 font-semibold text-amber-100">Vorgabe</td>
                          {playerScores.map(({ hole, shots }) => (
                            <td key={hole.hole_number} className="px-1.5 py-1.5 text-center font-bold tracking-[0.18em] text-amber-300">
                              {Number(shots || 0) > 0 ? "|".repeat(Number(shots || 0)) : ""}
                            </td>
                          ))}
                          <td className="px-2 py-1.5 text-center font-bold text-amber-300">
                            {playedRows.length ? playedRows.reduce((sum, row) => sum + Number(row.shots || 0), 0) : ""}
                          </td>
                        </tr>
                        <tr className="border-t border-amber-700/20">
                          <td className="px-2 py-1.5 font-semibold text-amber-100">Strokes</td>
                          {playerScores.map(({ hole, score }) => (
                            <td key={hole.hole_number} className="px-1 py-1.5 text-center">
                              <span className={cls("inline-flex min-w-[26px] justify-center rounded-lg px-1.5 py-0.5 font-bold", getStrokesCellClass(score, hole))}>
                                {score ? normalizeBoolean(score.picked_up) ? "X" : score.strokes || "–" : "–"}
                              </span>
                            </td>
                          ))}
                          <td className="px-2 py-1.5 text-center font-bold text-amber-300">{playedRows.length ? totalStrokes : "–"}</td>
                        </tr>
                        <tr className="border-t border-amber-700/20">
                          <td className="px-2 py-1.5 font-semibold text-amber-100">Strokes HCP adjusted</td>
                          {playerScores.map(({ hole, hcpAdjustedStrokes }) => (
                            <td key={hole.hole_number} className="px-1.5 py-1.5 text-center">{hcpAdjustedStrokes ?? "–"}</td>
                          ))}
                          <td className="px-2 py-1.5 text-center font-bold text-amber-300">{playedRows.length ? totalHcpAdjustedStrokes : "–"}</td>
                        </tr>
                        <tr className="border-t border-amber-700/20">
                          <td className="px-2 py-1.5 font-semibold text-amber-100">+/− HCP adjusted</td>
                          {playerScores.map(({ hole, hcpAdjustedToPar }) => (
                            <td key={hole.hole_number} className="px-1.5 py-1.5 text-center">
                              {hcpAdjustedToPar == null ? "–" : formatToPar(hcpAdjustedToPar, true)}
                            </td>
                          ))}
                          <td className="px-2 py-1.5 text-center font-bold text-amber-300">
                            {totalHcpAdjustedToPar == null ? "–" : formatToPar(totalHcpAdjustedToPar, true)}
                          </td>
                        </tr>
                        <tr className="border-t border-amber-700/20">
                          <td className="px-2 py-1.5 font-semibold text-amber-100">Netto Stblf.</td>
                          {playerScores.map(({ hole, score, netStableford }) => (
                            <td key={hole.hole_number} className="px-1.5 py-1.5 text-center">{score ? netStableford : "–"}</td>
                          ))}
                          <td className="px-2 py-1.5 text-center font-bold text-amber-300">{playedRows.length ? totalNetStableford : "–"}</td>
                        </tr>
                        <tr className="border-t border-amber-700/20">
                          <td className="px-2 py-1.5 font-semibold text-amber-100">Brutto</td>
                          {playerScores.map(({ hole, score, grossStableford }) => (
                            <td key={hole.hole_number} className="px-1.5 py-1.5 text-center">{score ? grossStableford : "–"}</td>
                          ))}
                          <td className="px-2 py-1.5 text-center font-bold text-amber-300">{playedRows.length ? totalGrossStableford : "–"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.section>
    );
  }

  function renderActiveView() {
    if (loading) return <Card className="rounded-2xl border-amber-700/40 bg-[#20170f]/82 shadow-xl backdrop-blur-sm"><CardContent className="flex items-center gap-2 p-3 text-amber-100"><Icon spin>⟳</Icon> Lade Datenbank ...</CardContent></Card>;
    if (view === "tournament") return renderTournamentView();
    if (view === "admin") return renderAdminView();
    if (view === "handicaps") return renderSettingsView();
    if (view === "score") return renderScoreView();
    if (view === "leaderboard") return renderLeaderboardView();
    if (view === "fun") return renderFunView();
    return renderArchiveView();
  }

  return (
    <div className="min-h-screen bg-black text-amber-50">
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/lord-bg.webp')" }} />
      <div className="fixed inset-0 bg-black/45" />
      <div className="fixed inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.58)_38%,rgba(0,0,0,0.86)_100%)]" />
      {((showSplash || appLocked) && !lockAdminBypass) ? <div className="fixed inset-0 z-[100] bg-black"><div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/lord-bg.webp')" }} /><div className="absolute inset-0 bg-black/25" />{!appLocked ? <div className="absolute inset-x-0 bottom-8 flex justify-center px-6 pb-[env(safe-area-inset-bottom)]"><button type="button" disabled={splashEntering} onClick={enterRoundFromSplash} className="w-full max-w-xs rounded-2xl border border-amber-300/55 bg-black/55 px-5 py-2.5 font-serif text-lg font-black tracking-wide text-amber-200 shadow-2xl shadow-black/70 backdrop-blur-sm active:scale-[0.98] disabled:opacity-60">Runde betreten</button></div> : <div className="absolute inset-x-4 bottom-10 mx-auto max-w-sm rounded-3xl border border-amber-500/35 bg-black/55 p-4 text-center text-amber-50 shadow-2xl shadow-black/70 backdrop-blur-sm"><div className="font-serif text-xl font-black text-amber-200">Der Rat ist noch nicht einberufen.</div><div className="mt-2 text-sm text-amber-100/80">Im Weimarer Land werden Stimmen gesenkt, alte Karten entrollt und verdächtig ernste Blicke ausgetauscht. Die Gefährten werden bald gerufen.</div><div className="mt-4 grid grid-cols-4 gap-1.5 rounded-2xl border border-amber-500/25 bg-black/35 p-2 text-center">
                  <div><div className="font-serif text-xl font-black text-amber-200">{lockCountdown.days}</div><div className="text-[9px] uppercase tracking-[0.14em] text-amber-100/60">Tage</div></div>
                  <div><div className="font-serif text-xl font-black text-amber-200">{String(lockCountdown.hours).padStart(2, "0")}</div><div className="text-[9px] uppercase tracking-[0.14em] text-amber-100/60">Std</div></div>
                  <div><div className="font-serif text-xl font-black text-amber-200">{String(lockCountdown.minutes).padStart(2, "0")}</div><div className="text-[9px] uppercase tracking-[0.14em] text-amber-100/60">Min</div></div>
                  <div><div className="font-serif text-xl font-black text-amber-200">{String(lockCountdown.seconds).padStart(2, "0")}</div><div className="text-[9px] uppercase tracking-[0.14em] text-amber-100/60">Sek</div></div>
                </div><div className="mt-3 text-xs uppercase tracking-[0.18em] text-amber-300/70">Bitte noch einen Augenblick an der Pforte warten</div></div>}{appLocked ? <button type="button" onClick={() => setLockUnlockOpen(true)} className="absolute bottom-3 left-3 h-8 w-8 rounded-full text-[10px] text-amber-100/10" aria-label="Admin-Zugang">•</button> : null}{appLocked && lockUnlockOpen ? <div className="absolute inset-x-4 bottom-8 mx-auto max-w-xs rounded-2xl border border-amber-700/35 bg-black/70 p-3 text-amber-50 shadow-2xl shadow-black/70 backdrop-blur-sm"><div className="mb-2 text-xs uppercase tracking-[0.18em] text-amber-300/70">Admin</div><input type="password" value={lockPasswordInput} onChange={(e) => setLockPasswordInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") enterLockedAppAsAdmin(); }} placeholder="Passwort" className="mb-2 w-full rounded-xl border border-amber-700/40 bg-stone-950 p-2 text-amber-50 placeholder:text-amber-100/30" autoFocus /><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => { setLockUnlockOpen(false); setLockPasswordInput(""); }} className="rounded-xl bg-stone-800 py-2 text-sm font-bold text-amber-100">Abbrechen</button><button type="button" disabled={splashEntering} onClick={enterLockedAppAsAdmin} className="rounded-xl bg-amber-600 py-2 text-sm font-bold text-amber-50 disabled:opacity-60">{splashEntering ? "Lade ..." : "Admin rein"}</button></div></div> : null}</div> : null}
      {showPlayerSelectPopup ? (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/72 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-amber-400/55 bg-stone-950 text-amber-50 shadow-2xl shadow-black/80">
            <div className="bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.22),transparent_45%),linear-gradient(180deg,rgba(41,37,36,0.94),rgba(12,10,9,1))] p-4 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-amber-300/45 bg-black/25 text-3xl">🧙</div>
              <div className="text-[10px] uppercase tracking-[0.26em] text-amber-100/70">Dieses Handy gehört zu</div>
              <div className="mt-2 font-serif text-xl font-black text-amber-200">Wer bist du?</div>
              <p className="mt-2 text-sm text-amber-100/70">Wähle zuerst deinen Spieler. Erst dann kann die App offiziellen Score und deinen Kontrollscore sauber trennen.</p>
              <div className="mt-4 rounded-2xl border border-amber-700/35 bg-black/25 p-2 text-left">
                <label className="mb-1 block text-sm text-amber-100/80">Wer bin ich auf diesem Handy?</label>
                <select value={myPlayerId} onChange={(e) => setMyPlayerId(e.target.value)} className="w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2 text-amber-50">
                  <option value="">Spieler auswählen</option>
                  {allPlayers.map((player) => <option key={player.id} value={player.id}>{getPlayerLabel(player)}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <main className="relative z-10 mx-auto max-w-md px-2 py-1.5">
        {renderHeader()}
        {renderStatusMessages()}
        {renderCurrentTabs()}
        {renderActiveView()}
        <footer className="pb-2 pt-1 text-center text-[9px] uppercase tracking-[0.16em] text-amber-100/35">© Lord of the Holes Association</footer>
      </main>
      {setupSavedMessage ? <div className="fixed inset-x-3 top-4 z-50 mx-auto max-w-md rounded-2xl border border-emerald-500/50 bg-emerald-950/95 p-3 text-emerald-50 shadow-2xl shadow-black/60 backdrop-blur"><div className="flex items-start justify-between gap-2"><div><div className="font-serif text-lg text-emerald-100">Gespeichert</div><div className="mt-0.5 text-sm text-emerald-100/85">{setupSavedMessage}</div></div><button type="button" onClick={() => setSetupSavedMessage("")} className="rounded-xl border border-emerald-400/40 bg-black/25 px-3 py-1 text-sm font-bold text-emerald-50">×</button></div></div> : null}
      {backupSavedMessage ? <div className="fixed inset-x-3 top-4 z-50 mx-auto max-w-md rounded-2xl border border-emerald-500/50 bg-emerald-950/95 p-3 text-emerald-50 shadow-2xl shadow-black/60 backdrop-blur"><div className="flex items-start justify-between gap-2"><div><div className="font-serif text-lg text-emerald-100">Backup erstellt</div><div className="mt-0.5 text-sm text-emerald-100/85">{backupSavedMessage}</div></div><button type="button" onClick={() => setBackupSavedMessage("")} className="rounded-xl border border-emerald-400/40 bg-black/25 px-3 py-1 text-sm font-bold text-emerald-50">×</button></div></div> : null}
      {renderPopupStandingsTable()}
      {needsMyPlayerSelection ? (
        <div className="fixed inset-0 z-[94] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/45 bg-stone-950 text-amber-50 shadow-2xl shadow-black/80">
            <div className="bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.20),transparent_45%),linear-gradient(180deg,rgba(41,37,36,0.94),rgba(12,10,9,1))] p-4 text-center">
              <div className="text-[10px] uppercase tracking-[0.24em] text-amber-300/75">Dieses Handy</div>
              <div className="mt-1 font-serif text-2xl font-black text-amber-200">Wer bist du?</div>
              <div className="mt-1 text-sm text-amber-100/70">Wähle deinen eigenen Spieler. Diese Auswahl bleibt auf diesem Handy gespeichert.</div>
              <div className="mt-4 grid gap-2">
                {visiblePlayers.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => {
                      setMyPlayerId(player.id);
                      setScoreEntryMode("player");
                    }}
                    className="rounded-2xl border border-amber-700/35 bg-stone-900 px-3 py-3 font-serif text-base font-bold text-amber-100 transition active:scale-[0.98]"
                  >
                    {getPlayerLabel(player)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {roundSummaryPopup ? (
        <div className="fixed inset-0 z-[94] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-amber-400/60 bg-stone-950 text-center text-amber-50 shadow-2xl shadow-black/80">
            <div className="bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.25),transparent_45%),linear-gradient(180deg,rgba(41,37,36,0.92),rgba(12,10,9,1))] p-5">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-amber-300/50 bg-black/25 text-3xl shadow-xl shadow-amber-950/40">📜</div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-amber-100/70">{roundSummaryPopup.subtitle}</div>
              <div className="mt-2 font-serif text-2xl font-black text-amber-200">{roundSummaryPopup.title}</div>
              <div className="mt-1 text-sm font-semibold text-amber-100/80">{roundSummaryPopup.playerName}</div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-left text-sm">
                <div className="rounded-2xl border border-amber-500/30 bg-black/25 p-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-amber-300/70">Strokes</div>
                  <div className="font-serif text-2xl font-black text-amber-200">{roundSummaryPopup.strokes}</div>
                  <div className="text-xs text-amber-100/65">{formatToPar(roundSummaryPopup.toPar, true)} zu Par</div>
                </div>
                <div className="rounded-2xl border border-amber-500/30 bg-black/25 p-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-amber-300/70">HCP adjusted</div>
                  <div className="font-serif text-2xl font-black text-amber-200">{roundSummaryPopup.hcpAdjustedStrokes}</div>
                  <div className="text-xs text-amber-100/65">Strokes HCP</div>
                </div>
                <div className="rounded-2xl border border-amber-500/30 bg-black/25 p-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-amber-300/70">Netto Stblf.</div>
                  <div className="font-serif text-2xl font-black text-amber-200">{roundSummaryPopup.netStableford}</div>
                  <div className="text-xs text-amber-100/65">Punkte</div>
                </div>
                <div className="rounded-2xl border border-amber-500/30 bg-black/25 p-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-amber-300/70">Brutto</div>
                  <div className="font-serif text-2xl font-black text-amber-200">{roundSummaryPopup.grossStableford}</div>
                  <div className="text-xs text-amber-100/65">Punkte</div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-1.5 text-xs text-amber-100/80">
                <div className="rounded-xl bg-amber-500/10 p-2"><b className="block text-amber-200">{roundSummaryPopup.putts}</b>Putts</div>
                <div className="rounded-xl bg-emerald-500/10 p-2"><b className="block text-emerald-200">{roundSummaryPopup.girCount}</b>GIR</div>
                <div className="rounded-xl bg-amber-500/10 p-2"><b className="block text-amber-200">{roundSummaryPopup.birdiesOrBetter}</b>Birdie+</div>
                <div className="rounded-xl bg-red-500/10 p-2"><b className="block text-red-100">{roundSummaryPopup.pickedUp}</b>X</div>
              </div>
            </div>
            <div className="p-3">
              <button
                type="button"
                onClick={() => setRoundSummaryDismissedKeys((current) => Array.from(new Set([...(current || []), roundSummaryPopup.key])))}
                className="w-full rounded-2xl border border-amber-500/45 bg-amber-600 px-4 py-2.5 text-sm font-bold text-amber-50"
              >
                Chronik schließen ×
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {displayedRoundHonorCelebration && !showFinalWinnerPopup && !roundSummaryPopup ? <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"><div className="w-full max-w-md overflow-hidden rounded-3xl border border-amber-400/60 bg-stone-950 text-center text-amber-50 shadow-2xl shadow-black/80"><div className="bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.28),transparent_45%),linear-gradient(180deg,rgba(120,53,15,0.55),rgba(12,10,9,1))] p-5"><div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-amber-300/50 bg-black/25 text-3xl shadow-xl shadow-amber-950/40">⚜</div><div className="text-[10px] uppercase tracking-[0.28em] text-amber-100/70">{displayedRoundHonorCelebration.roundName} beendet</div><div className="mt-2 font-serif text-lg font-black text-amber-200">Gondors Erlass</div><div className="mt-1 text-sm text-amber-100/70">Die Runde ist gespielt. Den Herren von Gondor werden ihre Schildträger zur Seite gestellt — der Hofstaat wird neu geordnet.</div><div className="mt-2 rounded-2xl border border-amber-300/40 bg-amber-500/10 p-3 text-sm font-semibold text-amber-50">{roundHonorPersonalMessage}</div><div className="mt-2 rounded-2xl border border-amber-500/35 bg-black/25 p-3 text-left"><div className="text-xs uppercase tracking-[0.22em] text-amber-300/75">{displayedRoundHonorCelebration.lords.length === 1 ? "Herr von Gondor" : "Herren von Gondor"}</div><div className="mt-2 space-y-1">{displayedRoundHonorCelebration.lords.map((player, index) => <div key={player.id} className="flex items-center justify-between gap-2 rounded-xl bg-amber-500/10 px-2 py-1.5"><span className="font-serif text-lg font-black text-amber-200">{index + 1}. {getPlayerLabel(player)}</span><span className="text-xs text-amber-100/70">{player.hcpAdjustedStrokes}</span></div>)}</div></div>{displayedRoundHonorCelebration.lordPlayoff?.length ? <div className="mt-2 rounded-2xl border border-amber-400/45 bg-amber-500/10 p-3 text-left"><div className="text-xs uppercase tracking-[0.22em] text-amber-300/80">Entscheidungsputten um {displayedRoundHonorCelebration.lordPlayoffSlots} Herr{displayedRoundHonorCelebration.lordPlayoffSlots === 1 ? "enplatz" : "enplätze"}</div><div className="mt-2 space-y-1">{displayedRoundHonorCelebration.lordPlayoff.map((player) => <div key={player.id} className="flex items-center justify-between gap-2 rounded-xl bg-amber-500/10 px-2 py-1.5"><span className="font-serif text-lg font-black text-amber-200">{getPlayerLabel(player)}</span><span className="text-xs text-amber-100/70">{player.hcpAdjustedStrokes}</span></div>)}</div><div className="mt-2 text-xs text-amber-100/75">Diese Spieler müssen ins Entscheidungsputten, bis die offenen Herrenplätze geklärt sind.</div></div> : null}<div className="mt-2 rounded-2xl border border-red-500/35 bg-black/25 p-3 text-left"><div className="text-xs uppercase tracking-[0.22em] text-red-200/80">Schildträger im Dienst der Herren</div><div className="mt-2 space-y-1">{displayedRoundHonorCelebration.butlers.map((player) => <div key={player.id} className="flex items-center justify-between gap-2 rounded-xl bg-red-500/10 px-2 py-1.5"><span className="font-serif text-lg font-black text-red-100">{getPlayerLabel(player)}</span><span className="text-xs text-red-100/70">{player.hcpAdjustedStrokes}</span></div>)}</div></div>{displayedRoundHonorCelebration.butlerPlayoff?.length ? <div className="mt-2 rounded-2xl border border-red-400/45 bg-red-500/10 p-3 text-left"><div className="text-xs uppercase tracking-[0.22em] text-red-200/80">Entscheidungsputten um {displayedRoundHonorCelebration.butlerPlayoffSlots} Schildträgerplatz{displayedRoundHonorCelebration.butlerPlayoffSlots === 1 ? "" : "plätze"}</div><div className="mt-2 space-y-1">{displayedRoundHonorCelebration.butlerPlayoff.map((player) => <div key={player.id} className="flex items-center justify-between gap-2 rounded-xl bg-red-500/10 px-2 py-1.5"><span className="font-serif text-lg font-black text-red-100">{getPlayerLabel(player)}</span><span className="text-xs text-red-100/70">{player.hcpAdjustedStrokes}</span></div>)}</div><div className="mt-2 text-xs text-red-100/75">Nur diese punktgleichen Spieler müssen ins Entscheidungsputten um den offenen Schildträgerdienst. Bereits eindeutig feststehende Schildträger müssen nicht antreten.</div></div> : null}<div className="mt-2 rounded-2xl border border-amber-500/25 bg-black/25 p-2 text-sm text-amber-100/75">{displayedRoundHonorCelebration.hasPlayoff ? "Gondor wartet auf das Entscheidungsputten. Erst danach ist geklärt, wer Krone trägt und wer Schild hält." : displayedRoundHonorCelebration.roundOrder === 1 ? "Der Herr von Gondor steht fest. Sein Schildträger ebenso. Der Dienst ist ehrenvoll — und vermutlich leicht erniedrigend." : "Die Herren von Gondor und ihre Schildträger stehen fest. Der Hofstaat ist informiert, die Eide sind gesprochen, die Knie zittern."}</div></div><div className="p-3"><button type="button" onClick={() => setRoundHonorDismissedKeys((current) => Array.from(new Set([...(current || []), displayedRoundHonorCelebration.key])))} className="w-full rounded-2xl border border-amber-500/45 bg-amber-600 px-4 py-2.5 text-sm font-bold text-amber-50">{roundHonorCloseLabel}</button></div></div></div> : null}
      {showFinalWinnerPopup && !roundSummaryPopup ? <div className="fixed inset-0 z-[96] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"><div className="w-full max-w-md overflow-hidden rounded-3xl border border-amber-400/60 bg-stone-950 text-center text-amber-50 shadow-2xl shadow-black/80"><div className="bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.28),transparent_45%),linear-gradient(180deg,rgba(120,53,15,0.55),rgba(12,10,9,1))] p-5"><div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-amber-300/50 bg-black/25 text-3xl shadow-xl shadow-amber-950/40">♛</div><div className="text-[10px] uppercase tracking-[0.28em] text-amber-100/70">Finale beendet</div><div className="mt-2 font-serif text-lg font-black text-amber-200">Lord of the Holes 2026 ist</div><div className="mt-2 font-serif text-4xl font-black text-amber-300 drop-shadow">{finalWinnerCelebration?.winnerName}</div><div className="mt-2 text-sm text-amber-100/70">{finalWinnerCelebration?.winnerLabel}</div><div className="mt-2 rounded-2xl border border-amber-500/35 bg-black/25 p-2 text-sm text-amber-100">Final Strokes HCP: <b className="text-amber-200">{finalWinnerCelebration?.finalHcpAdjustedStrokes ?? "–"}</b></div></div><div className="p-3"><button type="button" onClick={() => setWinnerPopupDismissedKey(finalWinnerPopupKey)} className="w-full rounded-2xl border border-amber-500/45 bg-amber-600 px-4 py-2.5 text-sm font-bold text-amber-50">Krone anerkennen ×</button></div></div></div> : null}
      {clearScoresConfirmOpen ? <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-3xl border border-red-500/60 bg-stone-950 p-4 text-red-50 shadow-2xl shadow-black/70"><div className="font-serif text-lg text-red-100">Alle Scores löschen?</div><p className="mt-2 text-sm text-red-100/80">Dadurch werden alle Einträge im Tab Scores gelöscht. Vorher wird automatisch ein Backup erstellt. Backup-Tabs bleiben erhalten.</p>{clearScoresError ? <div className="mt-2 rounded-2xl border border-red-400/50 bg-red-950/50 p-2 text-xs text-red-100">Fehler: {clearScoresError}</div> : null}<div className="mt-2 grid grid-cols-2 gap-2"><button type="button" disabled={clearScoresSaving} onClick={() => setClearScoresConfirmOpen(false)} className="rounded-2xl border border-amber-700/40 bg-stone-900 px-3 py-2.5 text-sm font-bold text-amber-100 disabled:opacity-50">Abbrechen</button><button type="button" disabled={clearScoresSaving} onClick={clearAllScores} className="rounded-2xl border border-red-400/60 bg-red-700 px-3 py-2.5 text-sm font-bold text-red-50 disabled:opacity-50">{clearScoresSaving ? "Lösche ..." : "Ja, Scores löschen"}</button></div></div></div> : null}
    </div>
  );
}


export default function LordOfTheHolesPWA() {
  return (
    <AppErrorBoundary>
      <LordOfTheHolesApp />
    </AppErrorBoundary>
  );
}
