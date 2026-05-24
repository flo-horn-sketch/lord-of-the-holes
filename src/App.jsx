import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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

const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbzPTQvGhRIn9KWWaQ7Blz2WJQBAH5qjqSy-Plu48JYZpEIB5E3cqO3jCWtWKws-l2eO/exec";
const ADMIN_PASSWORD = "weimar";
const LOCK_COUNTDOWN_TARGET = new Date("2026-05-22T10:00:00+02:00");
const FLIGHT_DRAW_TARGET = new Date("2026-05-21T20:00:00+02:00");
const FLIGHT_DRAW_STORAGE_KEY = "lordOfTheHoles.flightDraw";
const TEAM_DRAW_STORAGE_KEY = "lordOfTheHoles.teamDraw";
const TEAM_DRAW_TARGETS = {
  r1: new Date("2026-05-22T21:00:00+02:00"),
  r2: new Date("2026-05-23T19:30:00+02:00"),
  r3: new Date("2026-05-24T19:45:00+02:00"),
};

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

function normalizeBoolean(value) {
  return value === true || String(value).toLowerCase().trim() === "true" || String(value).toLowerCase().trim() === "ja" || String(value).trim() === "1";
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

function clearLocalScoreStorage() {
  try {
    window.localStorage.removeItem("lordOfTheHoles.pendingScores");
    window.localStorage.removeItem("lordOfTheHoles.localScoreDrafts");
    window.localStorage.removeItem("lordOfTheHoles.cachedState");
  } catch {}
}

function makeScoreClientVersion() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getScoreClientVersion(score) {
  return String(score?.client_version || score?.clientVersion || "").trim();
}

function isSameUploadedScoreVersion(localScore, uploadedScore) {
  if (!localScore || !uploadedScore) return false;
  if (getScoreIdentityKey(localScore) !== getScoreIdentityKey(uploadedScore)) return false;
  const localVersion = getScoreClientVersion(localScore);
  const uploadedVersion = getScoreClientVersion(uploadedScore);
  if (localVersion && uploadedVersion) return localVersion === uploadedVersion;
  return getScoreTimestamp(localScore) <= getScoreTimestamp(uploadedScore);
}

function removeUploadedScoreVersions(currentScores = [], uploadedScores = []) {
  return (currentScores || []).filter((localScore) => !(uploadedScores || []).some((uploadedScore) => isSameUploadedScoreVersion(localScore, uploadedScore)));
}

function cleanHandicapInput(value) {
  const normalized = String(value ?? "").replace(",", ".").replace(/[^0-9.-]/g, "");
  const firstMinus = normalized.startsWith("-") ? "-" : "";
  const withoutMinus = normalized.replace(/-/g, "");
  const parts = withoutMinus.split(".");
  return firstMinus + parts[0] + (parts.length > 1 ? "." + parts.slice(1).join("") : "");
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

function seededRandom(seedText = "") {
  let seed = 2166136261;
  String(seedText).split("").forEach((char) => {
    seed ^= char.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  });
  return function nextRandom() {
    seed += 0x6d2b79f5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithRandom(items = [], random = Math.random) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function pairKey(a, b) {
  return [String(a || ""), String(b || "")].sort().join("|");
}

function splitIntoFlightsForRound(playerIds = [], roundId = "") {
  const ids = [...playerIds];
  if (String(roundId) === "r1") return [ids.slice(0, 3), ids.slice(3, 5)].filter((flight) => flight.length);
  return [ids.slice(0, 3), ids.slice(3, 6)].filter((flight) => flight.length);
}

function assignScorersForFlight(flightPlayerIds = []) {
  return flightPlayerIds.map((scorerId, index) => ({
    scorer_player_id: scorerId,
    player_id: flightPlayerIds[(index + 1) % flightPlayerIds.length],
  }));
}

function scoreFlightPlan(roundPlans = []) {
  const seenPlayerPairs = new Map();
  const seenScorerPairs = new Map();
  let penalty = 0;

  roundPlans.forEach((roundPlan) => {
    (roundPlan.flights || []).forEach((flight) => {
      const playerIds = flight.players || [];
      for (let a = 0; a < playerIds.length; a += 1) {
        for (let b = a + 1; b < playerIds.length; b += 1) {
          const key = pairKey(playerIds[a], playerIds[b]);
          const previous = seenPlayerPairs.get(key) || 0;
          penalty += previous * 14;
          seenPlayerPairs.set(key, previous + 1);
        }
      }

      (flight.scorers || []).forEach((assignment) => {
        const key = `${assignment.scorer_player_id}|${assignment.player_id}`;
        const previous = seenScorerPairs.get(key) || 0;
        penalty += previous * 22;
        seenScorerPairs.set(key, previous + 1);
      });
    });
  });

  return penalty;
}

function buildFlightDraw(players = fallbackPlayers, rounds = fallbackRounds) {
  const allPlayerIds = (players?.length ? players : fallbackPlayers).map((player) => String(player.id)).filter(Boolean);
  const roundList = (rounds?.length ? rounds : fallbackRounds)
    .filter((round) => ["r1", "r2", "r3"].includes(String(round.round_id)))
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const seed = `bruchtal-${Date.now()}-${Math.random().toString(36).slice(2)}-${allPlayerIds.join("-")}`;
  let bestPlan = null;
  let bestScore = Infinity;

  for (let attempt = 0; attempt < 1800; attempt += 1) {
    const random = seededRandom(`${seed}-${attempt}`);
    const roundPlans = roundList.map((round) => {
      const eligibleIds = allPlayerIds.filter((id) => String(round.round_id) !== "r1" || id !== "achim");
      const shuffledIds = shuffleWithRandom(eligibleIds, random);
      const flights = splitIntoFlightsForRound(shuffledIds, round.round_id).map((flightPlayerIds, index) => ({
        flight_number: index + 1,
        players: flightPlayerIds,
        scorers: assignScorersForFlight(flightPlayerIds),
      }));
      return {
        round_id: round.round_id,
        round_name: getRoundChapterLabel(round),
        note: String(round.round_id) === "r1" ? "Gangolf verweilt noch fern der Gefährten und betritt den Pfad erst ab Runde 2." : "",
        flights,
      };
    });
    const score = scoreFlightPlan(roundPlans);
    if (score < bestScore) {
      bestScore = score;
      bestPlan = roundPlans;
      if (score === 0) break;
    }
  }

  return {
    created_at: new Date().toISOString(),
    target_at: FLIGHT_DRAW_TARGET.toISOString(),
    seed,
    score: bestScore,
    rounds: bestPlan || [],
  };
}

function stableFlightDrawSignature(draw) {
  if (!draw) return "";
  try {
    return JSON.stringify(draw);
  } catch {
    return String(Date.now());
  }
}

function areFlightDrawsEqual(a, b) {
  return stableFlightDrawSignature(a) === stableFlightDrawSignature(b);
}

function getAssignedScoredPlayerIdFromDraw(flightDraw, roundId, scorerPlayerId) {
  const normalizedRoundId = String(roundId || "").trim();
  const normalizedScorerId = String(scorerPlayerId || "").trim();
  if (!flightDraw || !normalizedRoundId || !normalizedScorerId) return "";

  const normalizeId = (value) => String(value || "").trim().toLowerCase();
  const scorerKey = normalizeId(normalizedScorerId);
  const roundKey = normalizeId(normalizedRoundId);

  const getAssignmentScorerId = (assignment) => String(
    assignment?.scorer_player_id ||
    assignment?.scorerPlayerId ||
    assignment?.scorer_id ||
    assignment?.scorerId ||
    assignment?.counter_player_id ||
    assignment?.counterPlayerId ||
    assignment?.zaehler_player_id ||
    assignment?.zaehlerPlayerId ||
    assignment?.zähler_player_id ||
    assignment?.zählerPlayerId ||
    assignment?.scorer ||
    assignment?.counter ||
    assignment?.zaehler ||
    assignment?.zähler ||
    ""
  ).trim();

  const getAssignmentScoredPlayerId = (assignment) => String(
    assignment?.player_id ||
    assignment?.playerId ||
    assignment?.scored_player_id ||
    assignment?.scoredPlayerId ||
    assignment?.assigned_player_id ||
    assignment?.assignedPlayerId ||
    assignment?.counted_player_id ||
    assignment?.countedPlayerId ||
    assignment?.target_player_id ||
    assignment?.targetPlayerId ||
    assignment?.scored ||
    assignment?.assigned ||
    assignment?.counted ||
    assignment?.target ||
    ""
  ).trim();

  const collectRows = (draw) => {
    const rows = [];
    if (Array.isArray(draw)) rows.push(...draw);
    if (Array.isArray(draw?.rows)) rows.push(...draw.rows);
    if (Array.isArray(draw?.flight_draw_rows)) rows.push(...draw.flight_draw_rows);
    if (Array.isArray(draw?.flightDrawRows)) rows.push(...draw.flightDrawRows);
    if (Array.isArray(draw?.scorerAssignments)) rows.push(...draw.scorerAssignments);
    if (Array.isArray(draw?.scorer_assignments)) rows.push(...draw.scorer_assignments);
    if (Array.isArray(draw?.assignments)) rows.push(...draw.assignments);
    if (Array.isArray(draw?.zaehler_assignments)) rows.push(...draw.zaehler_assignments);
    if (Array.isArray(draw?.zähler_assignments)) rows.push(...draw.zähler_assignments);

    (draw?.rounds || []).forEach((roundPlan) => {
      (roundPlan?.flights || []).forEach((flight) => {
        [
          ...(Array.isArray(flight.scorers) ? flight.scorers : []),
          ...(Array.isArray(flight.assignments) ? flight.assignments : []),
          ...(Array.isArray(flight.scorerAssignments) ? flight.scorerAssignments : []),
          ...(Array.isArray(flight.scorer_assignments) ? flight.scorer_assignments : []),
          ...(Array.isArray(flight.zaehler_assignments) ? flight.zaehler_assignments : []),
          ...(Array.isArray(flight.zähler_assignments) ? flight.zähler_assignments : []),
        ].forEach((assignment) => rows.push({
          ...assignment,
          round_id: assignment?.round_id || assignment?.roundId || roundPlan.round_id || roundPlan.roundId,
          round_name: assignment?.round_name || assignment?.roundName || roundPlan.round_name || roundPlan.roundName,
          flight_number: assignment?.flight_number || assignment?.flightNumber || flight.flight_number || flight.flightNumber,
        }));
      });
    });
    return rows;
  };

  const rows = collectRows(flightDraw);
  const row = rows.find((item) =>
    normalizeId(item.round_id || item.roundId || "") === roundKey &&
    normalizeId(getAssignmentScorerId(item)) === scorerKey &&
    getAssignmentScoredPlayerId(item)
  );

  return getAssignmentScoredPlayerId(row);
}

function getPlayerFlightFromDraw(flightDraw, roundId, playerId) {
  if (!flightDraw?.rounds?.length || !roundId || !playerId) return null;
  const roundPlan = flightDraw.rounds.find((round) => String(round.round_id) === String(roundId));
  if (!roundPlan?.flights?.length) return null;
  return roundPlan.flights.find((flight) => (flight.players || []).some((id) => String(id) === String(playerId))) || null;
}

function getCourseSettings(id, list = fallbackCourses) {
  const cid = String(id || "goethe").toLowerCase().trim();
  const officialCourse = cid === "feininger"
    ? { course_id: "feininger", course_name: "Feininger Kurs", course_rating: 70.4, slope_rating: 122, par: 71 }
    : { course_id: "goethe", course_name: "Goethe Kurs", course_rating: 72.0, slope_rating: 131, par: 72 };
  const sheetCourse = (list || []).find((item) => String(item?.course_id || "").toLowerCase().trim() === cid);
  return {
    ...sheetCourse,
    ...officialCourse,
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

function formatToPar(value, played = true) {
  if (!played) return "–";
  if (value === 0) return "E";
  return value > 0 ? `+${value}` : String(value);
}

function normalizeRankValue(value) {
  if (value == null) return "";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  return String(value).trim();
}

function getCompetitionRank(items = [], index = 0, getValue = (item) => item?.rankValue ?? item?.value ?? item?.points ?? item?.total ?? "") {
  const currentValue = normalizeRankValue(getValue(items[index], index));
  if (!currentValue) return index + 1;
  let tiedBefore = 0;
  for (let i = 0; i < index; i += 1) {
    const previousValue = normalizeRankValue(getValue(items[i], i));
    if (previousValue === currentValue) tiedBefore += 1;
  }
  return index + 1 - tiedBefore;
}

function isTiedAtRank(items = [], index = 0, getValue = (item) => item?.rankValue ?? item?.value ?? item?.points ?? item?.total ?? "") {
  const currentValue = normalizeRankValue(getValue(items[index], index));
  if (!currentValue) return false;
  return items.some((item, itemIndex) => itemIndex !== index && normalizeRankValue(getValue(item, itemIndex)) === currentValue);
}

function formatCompetitionRank(items = [], index = 0, getValue) {
  const rank = getCompetitionRank(items, index, getValue);
  return isTiedAtRank(items, index, getValue) ? `T${rank}` : String(rank);
}

function getQualificationRankLabel(index) {
  return String(Number(index || 0) + 1);
}

function getRankValue(item) {
  if (!item) return "";
  if (item.totalBestTwo !== undefined && item.totalBestTwo !== null) return item.totalBestTwo;
  if (item.finalHcpAdjustedStrokes !== undefined && item.finalHcpAdjustedStrokes !== null) return `${item.finalGroup || ""}|${item.finalHcpAdjustedStrokes}`;
  if (item.hcpAdjustedStrokes !== undefined && item.hcpAdjustedStrokes !== null) return item.hcpAdjustedStrokes;
  if (item.value !== undefined && item.value !== null) return item.value;
  if (item.points !== undefined && item.points !== null) return item.points;
  if (item.total !== undefined && item.total !== null) return item.total;
  return "";
}

function normalizeHoles(rawHoles) {
  const validHoles = Array.isArray(rawHoles) ? rawHoles.filter((h) => Number(h.hole_number) > 0 && Number(h.par) > 0 && Number(h.hcp) > 0) : [];
  return validHoles.length ? validHoles : fallbackHoles;
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
  return Boolean(score && String(score.round_id || "").trim() && String(score.player_id || "").trim() && Number(score.hole_number) > 0);
}

function mergeScoresPreservingPending(sheetScores = [], pendingScores = [], localDrafts = []) {
  const map = new Map();
  sheetScores.forEach((score) => {
    if (!isValidScorePayload(score)) return;
    map.set(getScoreIdentityKey(score), normalizeScoreRecord(score));
  });
  pendingScores.forEach((score) => {
    if (!isValidScorePayload(score)) return;
    map.set(getScoreIdentityKey(score), normalizeScoreRecord(score));
  });
  localDrafts.forEach((score) => {
    if (!isValidScorePayload(score)) return;
    map.set(getScoreIdentityKey(score), normalizeScoreRecord(score));
  });
  return Array.from(map.values());
}

function hasLocalScoreState(pendingScores = [], localDrafts = []) {
  return (pendingScores || []).some(isValidScorePayload) || (localDrafts || []).some(isValidScorePayload);
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
  if (Number(officialScore.strokes) !== Number(controlScore.strokes) || normalizeBoolean(officialScore.picked_up) !== normalizeBoolean(controlScore.picked_up)) {
    differences.push(`Score: ${formatScoreDiff(officialScore)} ≠ ${formatScoreDiff(controlScore)}`);
  }
  if (normalizeBoolean(officialScore.lady) !== normalizeBoolean(controlScore.lady)) {
    differences.push(`Lady: ${formatBoolDiff(officialScore.lady)} ≠ ${formatBoolDiff(controlScore.lady)}`);
  }
  if (normalizeBoolean(officialScore.over_two_putts) !== normalizeBoolean(controlScore.over_two_putts) || Number(officialScore.putts_count || 0) !== Number(controlScore.putts_count || 0)) {
    differences.push(`Putts: ${formatPuttsDiff(officialScore)} ≠ ${formatPuttsDiff(controlScore)}`);
  }
  return differences.join(" · ");
}

function getMismatchesForHole(scores, roundId, holeNumber, players = []) {
  const playerMap = new Map((players || []).map((player) => [String(player.id), player]));
  const playerIds = Array.from(new Set((scores || [])
    .filter((score) => String(score.round_id || "") === String(roundId || "") && Number(score.hole_number) === Number(holeNumber))
    .map((score) => String(score.player_id || ""))
    .filter(Boolean)));

  return playerIds.map((playerId) => {
    const officialScore = findScoreForPlayerHole(scores, roundId, playerId, holeNumber, false);
    const controlScore = findScoreForPlayerHole(scores, roundId, playerId, holeNumber, true);
    const message = getScoreMismatchMessage(officialScore, controlScore);
    const player = playerMap.get(playerId) || { id: playerId, character_name: playerId, display_name: playerId };
    return {
      playerId,
      player,
      holeNumber,
      officialScore,
      controlScore,
      officialScorerId: String(officialScore?.scorer_player_id || "").trim(),
      message: message ? `Loch ${holeNumber} · ${player.character_name || player.display_name || playerId} · ${message}` : "",
    };
  }).filter((item) => Boolean(item.message));
}

function getMismatchesForRound(scores, roundId, players = []) {
  const holeNumbers = Array.from(new Set((scores || [])
    .filter((score) => String(score.round_id || "") === String(roundId || ""))
    .map((score) => Number(score.hole_number))
    .filter(Boolean)))
    .sort((a, b) => a - b);
  return holeNumbers.flatMap((holeNumber) => getMismatchesForHole(scores, roundId, holeNumber, players));
}

function buildPlayerStats(players, holes, scores) {
  return (players || []).map((p) => {
    const playerScores = (scores || []).filter((s) => String(s.player_id) === String(p.id) && s.strokes !== "" && s.strokes != null);
    const played = playerScores.length;
    const total = playerScores.reduce((sum, s) => sum + Number(s.strokes || 0), 0);
    const parPlayed = playerScores.reduce((sum, s) => sum + Number((holes || []).find((h) => Number(h.hole_number) === Number(s.hole_number))?.par || 0), 0);
    const threePutts = playerScores.filter((s) => normalizeBoolean(s.over_two_putts) && Number(s.putts_count) === 3).length;
    const fourPutts = playerScores.filter((s) => normalizeBoolean(s.over_two_putts) && Number(s.putts_count) === 4).length;
    const fivePlusPutts = playerScores.filter((s) => normalizeBoolean(s.over_two_putts) && Number(s.putts_count) >= 5).length;
    const fourPlusPutts = fourPutts + fivePlusPutts;
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
    return { ...withFallbackAlias(p), played, total, toPar: total - parPlayed, hcpShotsUsed, hcpAdjustedTotal, hcpAdjustedToPar, overTwoPutts: threePutts + fourPlusPutts, threePutts, fourPutts, fivePlusPutts, fourPlusPutts, puttPenaltyEuro: threePutts * 2 + fourPutts * 4 + fivePlusPutts * 10, ladyCount, netStableford, grossStableford };
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

function getFirstUnscoredHole(scores = [], roundId = "", playerId = "", fallbackHole = 1, scorerPlayerId = "") {
  const hasCompletedScore = (targetPlayerId, holeNumber, wantControlScore) => {
    const score = findScoreForPlayerHole(scores, roundId, targetPlayerId, holeNumber, wantControlScore);
    return Boolean(score && score.strokes !== "" && score.strokes != null && score.putts_count !== "" && score.putts_count != null);
  };
  for (let holeNumber = 1; holeNumber <= 18; holeNumber += 1) {
    const officialComplete = playerId ? hasCompletedScore(playerId, holeNumber, false) : false;
    const controlComplete = scorerPlayerId ? hasCompletedScore(scorerPlayerId, holeNumber, true) : false;
    if (!officialComplete || !controlComplete) return holeNumber;
  }
  return 18;
}

function TouchStepper({ label, value, min = 0, max = 12, emptyLabel = "–", status = "", defaultValue = null, disabled = false, onChange, formatValue }) {
  const hasValue = value !== "" && value != null;
  const fallbackValue = defaultValue == null ? min : Number(defaultValue);
  const baseValue = Math.max(min, Math.min(max, Number(hasValue ? value : fallbackValue)));
  const shownValue = hasValue || defaultValue != null ? (formatValue ? formatValue(baseValue) : baseValue) : emptyLabel;
  const setValue = (nextValue) => {
    if (disabled) return;
    onChange(Math.max(min, Math.min(max, Number(nextValue || 0))));
  };
  return (
    <div className="rounded-2xl border border-[rgb(var(--score-accent)/0.34)] bg-[linear-gradient(180deg,rgba(var(--score-accent),0.10),rgba(12,10,9,0.72))] p-2.5 shadow-[inset_0_1px_0_rgba(251,191,36,0.10),0_12px_32px_rgba(0,0,0,0.35)]">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-amber-100">{label}</div>
        {status ? <div className="rounded-full bg-[rgb(var(--score-accent)/0.14)] px-2.5 py-0.5 text-xs font-bold text-amber-100/75">{status}</div> : null}
      </div>
      <div className="grid grid-cols-[82px_1fr_82px] items-center gap-2.5">
        <button type="button" onClick={() => setValue(baseValue - 1)} disabled={disabled || baseValue <= min} className="h-[84px] rounded-2xl border border-[rgb(var(--score-accent)/0.42)] bg-[radial-gradient(circle_at_50%_0%,rgba(var(--score-accent),0.13),rgba(12,10,9,0.96)_58%)] text-4xl font-black leading-none text-amber-100 shadow-[inset_0_1px_0_rgba(251,191,36,0.12),0_8px_22px_rgba(0,0,0,0.38)] transition active:scale-[0.97] disabled:opacity-35">−</button>
        <button type="button" disabled={disabled} onClick={() => setValue(baseValue)} className="h-[84px] rounded-2xl border border-[rgb(var(--score-accent)/0.34)] bg-[radial-gradient(circle_at_50%_0%,rgba(var(--score-accent),0.16),rgba(28,25,23,0.86)_48%,rgba(12,10,9,0.96)_100%)] text-center shadow-[inset_0_0_28px_rgba(251,191,36,0.06),0_10px_26px_rgba(0,0,0,0.42)] ring-1 ring-[rgb(var(--score-accent)/0.16)] transition active:scale-[0.985]">
          <div className="font-serif text-[3.95rem] font-black leading-none text-amber-200 drop-shadow-[0_0_14px_rgba(251,191,36,0.18)]">{shownValue}</div>
          <div className="text-[9px] uppercase tracking-[0.16em] text-amber-100/50">{!hasValue && defaultValue != null ? "tippen" : label}</div>
        </button>
        <button type="button" onClick={() => setValue(baseValue + 1)} disabled={disabled || baseValue >= max} className="h-[84px] rounded-2xl border border-[rgb(var(--score-accent)/0.42)] bg-[radial-gradient(circle_at_50%_0%,rgba(var(--score-accent),0.13),rgba(12,10,9,0.96)_58%)] text-4xl font-black leading-none text-amber-100 shadow-[inset_0_1px_0_rgba(251,191,36,0.12),0_8px_22px_rgba(0,0,0,0.38)] transition active:scale-[0.97] disabled:opacity-35">+</button>
      </div>
    </div>
  );
}

function PuttStepper({ value, disabled = false, max = 6, onChange }) {
  const hasValue = value !== "" && value != null;
  const selected = hasValue ? Number(value || 0) : Math.min(2, Number(max || 0));
  const snakeLabel = selected >= 5 ? "5+ · 10 €" : selected === 4 ? "4 · 4 €" : selected === 3 ? "3 · 2 €" : "keine Snake";
  return <TouchStepper label="Putts" value={value === 0 ? 0 : value || ""} min={0} max={Math.max(0, Number(max || 0))} emptyLabel={String(Math.min(2, Math.max(0, Number(max || 0))))} defaultValue={Math.min(2, Math.max(0, Number(max || 0)))} status={snakeLabel} disabled={disabled} onChange={onChange} />;
}

function ScoreStepper({ value, par, pickedUpStrokes, disabled = false, onChange }) {
  const displayScore = value === "" || value == null ? Number(par || 4) : value;
  const isPickedValue = Number(displayScore) === 0 || Number(displayScore) >= Number(pickedUpStrokes || 0);
  const getScoreStatus = () => {
    if (value === "" || value == null) return "";
    if (isPickedValue) return `X · gewertet ${pickedUpStrokes}`;
    const diff = Number(displayScore) - Number(par || 0);
    if (diff <= -3) return "Albatros";
    if (diff === -2) return "Eagle";
    if (diff === -1) return "Birdie";
    if (diff === 0) return "Par";
    if (diff === 1) return "Bogey";
    if (diff === 2) return "Doppelbogey";
    if (diff === 3) return "Triplebogey";
    return `+${diff}`;
  };
  const effectiveStatus = getScoreStatus();
  return <TouchStepper label="Score" value={value} min={0} max={30} emptyLabel={String(par || 4)} defaultValue={Number(par || 4)} status={effectiveStatus} disabled={disabled} formatValue={(nextValue) => (Number(nextValue) === 0 ? "X" : nextValue)} onChange={onChange} />;
}

function LeaderboardTable({ title, players, columns }) {
  const rankColumn = columns.find((column) => column.rankValue || column.emphasize) || columns[0];
  const getRankValue = (player) => rankColumn?.rankValue ? rankColumn.rankValue(player) : rankColumn?.render ? rankColumn.render(player) : "";
  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-amber-700/30 bg-black/25">
      <div className="border-b border-amber-700/30 bg-amber-500/10 px-2 py-1.5 font-serif text-lg text-amber-200">{title}</div>
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full min-w-[360px] border-collapse text-sm text-amber-50 landscape:min-w-0 landscape:text-[11px]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-amber-100">
              <th className="px-2 py-1.5">#</th>
              <th className="px-2 py-1.5">Spieler</th>
              {columns.map((column) => <th key={column.label} className="px-2 py-1.5 text-right">{column.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {players.map((p, index) => (
              <tr key={p.id} className="border-t border-amber-700/20">
                <td className="px-2 py-1.5 text-amber-200/75">{formatCompetitionRank(players, index, getRankValue)}</td>
                <td className="px-2 py-1.5 font-semibold text-amber-100">{getPlayerLabel(p)}</td>
                {columns.map((column) => <td key={column.label} className={cls("px-2 py-1.5 text-right", column.emphasize && "font-serif text-lg text-amber-300")}>{column.render(p)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TournamentProgressChart({ title, standings = [], rounds = [], valueType = "totalBestTwo" }) {
  const chartRounds = (rounds || []).filter(Boolean).slice().sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const chartPlayers = (standings || []).filter(Boolean);
  const palette = ["#fbbf24", "#38bdf8", "#34d399", "#f472b6", "#a78bfa", "#fb923c", "#f87171", "#fde68a"];
  const getPointValue = (player, roundIndex) => {
    const roundSlice = chartRounds.slice(0, roundIndex + 1);
    if (valueType === "grossTotal") {
      const values = roundSlice.map((round) => player.roundResults?.find((result) => String(result.round_id) === String(round.round_id))?.grossStrokes).filter((value) => value != null);
      return values.length ? values.reduce((sum, value) => sum + Number(value || 0), 0) : null;
    }
    const values = roundSlice.map((round) => player.roundResults?.find((result) => String(result.round_id) === String(round.round_id))?.hcpAdjustedStrokes).filter((value) => value != null);
    if (values.length < 2) return null;
    return values.slice().sort((a, b) => Number(a || 0) - Number(b || 0)).slice(0, 2).reduce((sum, value) => sum + Number(value || 0), 0);
  };
  const playerLines = chartPlayers.map((player, playerIndex) => {
    const points = chartRounds.map((round, roundIndex) => ({ round, roundIndex, value: getPointValue(player, roundIndex) })).filter((point) => point.value != null);
    return { player, points, color: palette[playerIndex % palette.length] };
  }).filter((line) => line.points.length);
  const allValues = playerLines.flatMap((line) => line.points.map((point) => point.value));
  if (!playerLines.length || !chartRounds.length || !allValues.length) return null;
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = Math.max(1, maxValue - minValue);
  const width = 720;
  const height = 250;
  const padLeft = 46;
  const padRight = 18;
  const padTop = 18;
  const padBottom = 42;
  const xFor = (roundIndex) => padLeft + (chartRounds.length <= 1 ? 0 : (roundIndex / (chartRounds.length - 1)) * (width - padLeft - padRight));
  const yFor = (value) => padTop + ((maxValue - value) / range) * (height - padTop - padBottom);
  const axisTicks = Array.from(new Set([minValue, maxValue, Math.round((minValue + maxValue) / 2)].map((value) => Math.round(value * 10) / 10))).sort((a, b) => a - b);
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-amber-700/30 bg-black/20">
      <div className="border-b border-amber-700/30 bg-amber-500/10 px-2 py-1.5">
        <div className="font-serif text-base text-amber-200">{title} · Turnierverlauf</div>
        <div className="text-xs text-amber-100/60">X-Achse: Runden · Y-Achse: {valueType === "grossTotal" ? "kumulierte Brutto-Schläge" : "beste zwei Strokes HCP adjusted"}</div>
      </div>
      <div className="overflow-x-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[620px] rounded-xl bg-black/18">
          {axisTicks.map((tick) => (
            <g key={`tick-${tick}`}>
              <line x1={padLeft} x2={width - padRight} y1={yFor(tick)} y2={yFor(tick)} stroke="rgba(251,191,36,0.16)" strokeDasharray="4 5" />
              <text x={padLeft - 8} y={yFor(tick) + 4} textAnchor="end" fontSize="11" fill="rgba(254,243,199,0.72)">{tick}</text>
            </g>
          ))}
          {chartRounds.map((round, index) => (
            <g key={`round-${round.round_id}`}>
              <line x1={xFor(index)} x2={xFor(index)} y1={padTop} y2={height - padBottom} stroke="rgba(251,191,36,0.08)" />
              <text x={xFor(index)} y={height - 14} textAnchor="middle" fontSize="10" fill="rgba(254,243,199,0.66)">{round.round_name || round.round_id}</text>
            </g>
          ))}
          <line x1={padLeft} x2={width - padRight} y1={height - padBottom} y2={height - padBottom} stroke="rgba(251,191,36,0.22)" />
          <line x1={padLeft} x2={padLeft} y1={padTop} y2={height - padBottom} stroke="rgba(251,191,36,0.22)" />
          {playerLines.map((line) => {
            const d = line.points.map((point) => `${xFor(point.roundIndex)},${yFor(point.value)}`).join(" ");
            const lastPoint = line.points[line.points.length - 1];
            return (
              <g key={line.player.id}>
                <polyline points={d} fill="none" stroke={line.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.92" />
                {line.points.map((point) => <circle key={`${line.player.id}-${point.round?.round_id}`} cx={xFor(point.roundIndex)} cy={yFor(point.value)} r="3.2" fill={line.color} />)}
                {lastPoint ? <text x={Math.min(width - 92, xFor(lastPoint.roundIndex) + 7)} y={yFor(lastPoint.value) + 4} fontSize="10" fontWeight="700" fill={line.color}>{line.player.alias_name || line.player.character_name || line.player.display_name}</text> : null}
              </g>
            );
          })}
        </svg>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-amber-100/75">
          {playerLines.map((line) => <div key={`tlegend-${line.player.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-amber-700/25 bg-black/25 px-2 py-1"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: line.color }} />{line.player.alias_name || line.player.character_name || line.player.display_name}</div>)}
        </div>
      </div>
    </div>
  );
}

function RoundProgressChart({ title, players = [], holes = [], scores = [], metric = "strokesHcpAdjusted" }) {
  const chartPlayers = (players || []).filter(Boolean);
  const chartHoles = (holes || []).filter((hole) => Number(hole.hole_number) > 0).sort((a, b) => Number(a.hole_number) - Number(b.hole_number));
  const palette = ["#fbbf24", "#38bdf8", "#34d399", "#f472b6", "#a78bfa", "#fb923c", "#f87171", "#fde68a"];
  const getMetricLabel = () => {
    if (metric === "strokes") return "Strokes +/−";
    if (metric === "netStableford") return "Netto Stableford";
    if (metric === "grossStableford") return "Brutto Punkte";
    if (metric === "puttPenalty") return "Putt-Kasse €";
    return "Strokes HCP adjusted +/−";
  };
  const playerLines = chartPlayers.map((player, playerIndex) => {
    let cumulative = 0;
    const points = [];
    chartHoles.forEach((hole, holeIndex) => {
      const score = (scores || []).find((item) => String(item.player_id) === String(player.id) && Number(item.hole_number) === Number(hole.hole_number));
      if (!score || score.strokes === "" || score.strokes == null) return;
      const strokes = Number(score.strokes || 0);
      const shots = getShotsOnHole(player.course_hcp, hole.hcp);
      if (metric === "strokes") cumulative += strokes - Number(hole.par || 0);
      else if (metric === "netStableford") cumulative += getScoreStablefordPoints(score, hole.par, shots);
      else if (metric === "grossStableford") cumulative += getScoreStablefordPoints(score, hole.par, 0);
      else if (metric === "puttPenalty") {
        const putts = Number(score.putts_count || 0);
        cumulative += putts >= 5 ? 10 : putts === 4 ? 4 : putts === 3 ? 2 : 0;
      } else cumulative += strokes - shots - Number(hole.par || 0);
      points.push({ hole: Number(hole.hole_number), holeIndex, value: cumulative });
    });
    return { player, points, color: palette[playerIndex % palette.length] };
  }).filter((line) => line.points.length);
  const allValues = playerLines.flatMap((line) => line.points.map((point) => point.value));
  if (!playerLines.length || !chartHoles.length || !allValues.length) return null;
  const minValue = Math.min(...allValues, 0);
  const maxValue = Math.max(...allValues, 0);
  const range = Math.max(1, maxValue - minValue);
  const width = 720;
  const height = 260;
  const padLeft = 42;
  const padRight = 18;
  const padTop = 18;
  const padBottom = 34;
  const xFor = (holeIndex) => padLeft + (chartHoles.length <= 1 ? 0 : (holeIndex / (chartHoles.length - 1)) * (width - padLeft - padRight));
  const yFor = (value) => padTop + ((maxValue - value) / range) * (height - padTop - padBottom);
  const axisTicks = Array.from(new Set([minValue, 0, maxValue].map((value) => Math.round(value * 10) / 10))).sort((a, b) => a - b);
  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-amber-700/30 bg-black/20">
      <div className="border-b border-amber-700/30 bg-amber-500/10 px-2 py-1.5">
        <div className="font-serif text-base text-amber-200">{title} · Verlauf</div>
        <div className="text-xs text-amber-100/60">X-Achse: Löcher · Y-Achse: {getMetricLabel()}</div>
      </div>
      <div className="overflow-x-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[620px] rounded-xl bg-black/18">
          {axisTicks.map((tick) => (
            <g key={`tick-${tick}`}>
              <line x1={padLeft} x2={width - padRight} y1={yFor(tick)} y2={yFor(tick)} stroke="rgba(251,191,36,0.16)" strokeDasharray="4 5" />
              <text x={padLeft - 8} y={yFor(tick) + 4} textAnchor="end" fontSize="11" fill="rgba(254,243,199,0.72)">{formatToPar(tick, true)}</text>
            </g>
          ))}
          {chartHoles.map((hole, index) => (
            <g key={`hole-${hole.hole_number}`}>
              <line x1={xFor(index)} x2={xFor(index)} y1={padTop} y2={height - padBottom} stroke="rgba(251,191,36,0.08)" />
              <text x={xFor(index)} y={height - 12} textAnchor="middle" fontSize="10" fill="rgba(254,243,199,0.62)">{hole.hole_number}</text>
            </g>
          ))}
          <line x1={padLeft} x2={width - padRight} y1={height - padBottom} y2={height - padBottom} stroke="rgba(251,191,36,0.22)" />
          <line x1={padLeft} x2={padLeft} y1={padTop} y2={height - padBottom} stroke="rgba(251,191,36,0.22)" />
          {playerLines.map((line) => {
            const d = line.points.map((point) => `${xFor(point.holeIndex)},${yFor(point.value)}`).join(" ");
            const lastPoint = line.points[line.points.length - 1];
            return (
              <g key={line.player.id}>
                <polyline points={d} fill="none" stroke={line.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.92" />
                {line.points.map((point) => <circle key={`${line.player.id}-${point.hole}`} cx={xFor(point.holeIndex)} cy={yFor(point.value)} r="3.2" fill={line.color} />)}
                {lastPoint ? <text x={Math.min(width - 92, xFor(lastPoint.holeIndex) + 7)} y={yFor(lastPoint.value) + 4} fontSize="10" fontWeight="700" fill={line.color}>{line.player.alias_name || line.player.character_name || line.player.display_name}</text> : null}
              </g>
            );
          })}
        </svg>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-amber-100/75">
          {playerLines.map((line) => <div key={`legend-${line.player.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-amber-700/25 bg-black/25 px-2 py-1"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: line.color }} />{line.player.alias_name || line.player.character_name || line.player.display_name}</div>)}
        </div>
      </div>
    </div>
  );
}

function getCourseShortName(courseId) {
  const normalized = String(courseId || "").toLowerCase().trim();
  if (normalized === "goethe") return "Goethe";
  if (normalized === "feininger") return "Feininger";
  return courseId || "Kurs";
}

function getPuttBuckets(playerScores) {
  const threePutts = playerScores.filter((score) => normalizeBoolean(score.over_two_putts) && Number(score.putts_count) === 3).length;
  const fourPutts = playerScores.filter((score) => normalizeBoolean(score.over_two_putts) && Number(score.putts_count) === 4).length;
  const fivePlusPutts = playerScores.filter((score) => normalizeBoolean(score.over_two_putts) && Number(score.putts_count) >= 5).length;
  const fourPlusPutts = fourPutts + fivePlusPutts;
  return { threePutts, fourPutts, fivePlusPutts, fourPlusPutts, overTwoPutts: threePutts + fourPlusPutts, puttPenaltyEuro: threePutts * 2 + fourPutts * 4 + fivePlusPutts * 10 };
}

function getScorecardSegmentSummary(player, holes = [], scores = [], fromHole = 1, toHole = 18) {
  const segmentHoles = (holes || []).filter((hole) => Number(hole.hole_number) >= fromHole && Number(hole.hole_number) <= toHole);
  const segmentScores = segmentHoles.map((hole) => {
    const score = (scores || []).find((item) => String(item.player_id) === String(player.id) && Number(item.hole_number) === Number(hole.hole_number));
    const strokes = score && score.strokes !== "" && score.strokes != null ? Number(score.strokes || 0) : null;
    const putts = score && score.putts_count !== "" && score.putts_count != null ? Number(score.putts_count || 0) : null;
    const shots = getShotsOnHole(player.course_hcp, hole.hcp);
    return { hole, score, strokes, putts, shots };
  });
  const playedRows = segmentScores.filter((row) => row.strokes != null);
  const par = segmentHoles.reduce((sum, hole) => sum + Number(hole.par || 0), 0);
  const strokes = playedRows.reduce((sum, row) => sum + Number(row.strokes || 0), 0);
  const hcpShots = playedRows.reduce((sum, row) => sum + Number(row.shots || 0), 0);
  const putts = segmentScores.filter((row) => row.putts != null).reduce((sum, row) => sum + Number(row.putts || 0), 0);
  const netStableford = playedRows.reduce((sum, row) => sum + getScoreStablefordPoints(row.score, row.hole.par, row.shots), 0);
  const grossStableford = playedRows.reduce((sum, row) => sum + getScoreStablefordPoints(row.score, row.hole.par, 0), 0);
  const toPar = playedRows.length ? strokes - segmentHoles.reduce((sum, hole) => sum + Number(hole.par || 0), 0) : null;
  const hcpAdjustedToPar = playedRows.length ? strokes - hcpShots - segmentHoles.reduce((sum, hole) => sum + Number(hole.par || 0), 0) : null;
  return { par, strokes: playedRows.length ? strokes : null, hcpAdjusted: playedRows.length ? strokes - hcpShots : null, toPar, hcpAdjustedToPar, hcpShots, putts: playedRows.length ? putts : null, netStableford, grossStableford, played: playedRows.length, holes: segmentHoles.length };
}

function renderScorecardCellsWithSummaries(items = [], renderHoleCell, renderOutCell, renderInCell, renderTotalCell) {
  return (items || []).flatMap((item) => {
    const holeNumber = Number(item?.hole?.hole_number ?? item?.hole_number ?? 0);
    const cells = [renderHoleCell(item)];
    if (holeNumber === 9) cells.push(renderOutCell());
    if (holeNumber === 18) {
      cells.push(renderInCell());
      cells.push(renderTotalCell());
    }
    return cells;
  });
}

function getScoreDiffToPar(score, hole) {
  if (!score || score.strokes === "" || score.strokes == null) return null;
  return Number(score.strokes || 0) - Number(hole?.par || 0);
}

function buildFunPlayerStats(players, holes, scores) {
  return (players || []).map((player) => {
    const playerScores = (scores || []).filter((score) => String(score.player_id) === String(player.id) && score.strokes !== "" && score.strokes != null);
    const enrichedScores = playerScores.map((score) => {
      const hole = (holes || []).find((item) => Number(item.hole_number) === Number(score.hole_number) && (!item.round_id || String(item.round_id) === String(score.round_id)));
      return { score, hole, diff: getScoreDiffToPar(score, hole) };
    }).filter((item) => item.hole);
    const frontScores = enrichedScores.filter((item) => Number(item.hole.hole_number) <= 9);
    const backScores = enrichedScores.filter((item) => Number(item.hole.hole_number) > 9);
    const frontTotal = frontScores.length ? frontScores.reduce((sum, item) => sum + Number(item.score.strokes || 0), 0) : null;
    const backTotal = backScores.length ? backScores.reduce((sum, item) => sum + Number(item.score.strokes || 0), 0) : null;
    const frontPar = frontScores.length ? frontScores.reduce((sum, item) => sum + Number(item.hole.par || 0), 0) : null;
    const backPar = backScores.length ? backScores.reduce((sum, item) => sum + Number(item.hole.par || 0), 0) : null;
    const frontToPar = frontTotal == null || frontPar == null ? null : frontTotal - frontPar;
    const backToPar = backTotal == null || backPar == null ? null : backTotal - backPar;
    const backMinusFront = frontToPar == null || backToPar == null ? null : backToPar - frontToPar;
    const zeroNetPoints = enrichedScores.filter((item) => getScoreStablefordPoints(item.score, item.hole.par, getShotsOnHole(player.course_hcp, item.hole.hcp)) === 0).length;
    const isGangolf = String(player.id || "").toLowerCase() === "achim" || String(player.alias_name || "").toLowerCase() === "gangolf";
    const shortDrinkCount = isGangolf ? 0 : zeroNetPoints;
    const burpeeCount = isGangolf ? zeroNetPoints * 20 : 0;
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
    const { threePutts, fourPutts, fivePlusPutts, fourPlusPutts, puttPenaltyEuro } = getPuttBuckets(playerScores);
    const grossStableford = enrichedScores.reduce((sum, item) => sum + getScoreStablefordPoints(item.score, item.hole.par, 0), 0);
    const netStableford = enrichedScores.reduce((sum, item) => sum + getScoreStablefordPoints(item.score, item.hole.par, getShotsOnHole(player.course_hcp, item.hole.hcp)), 0);
    const hcpBonus = netStableford - grossStableford;
    const hcpShotsUsed = enrichedScores.reduce((sum, item) => sum + getShotsOnHole(player.course_hcp, item.hole.hcp), 0);
    return { ...withFallbackAlias(player), played: enrichedScores.length, zeroNetPoints, shortDrinkCount, burpeeCount, birdies, eaglesOrBetter, pars, parOrBetter, doubleBogeyPlus, triplePlus, pickedUpCount, ladyCount, greenAttempts: greenAttempts.length, greenInRegulation, underRegulation, threePutts, fourPutts, fivePlusPutts, fourPlusPutts, puttPenaltyEuro, frontTotal, backTotal, frontToPar, backToPar, backMinusFront, grossStableford, netStableford, hcpBonus, hcpShotsUsed, pointsPerHcpShot: hcpShotsUsed ? Number((netStableford / hcpShotsUsed).toFixed(2)) : 0 };
  });
}

function buildFunHoleStats(players, holes, scores) {
  const groupedHoles = new Map();
  (holes || []).forEach((hole) => {
    const key = `${String(hole.course_id || "").trim()}|${Number(hole.hole_number || 0)}`;
    if (!groupedHoles.has(key)) {
      groupedHoles.set(key, {
        ...hole,
        course_name: getCourseShortName(hole.course_id),
        roundIds: [],
      });
    }
    const current = groupedHoles.get(key);
    if (hole.round_id && !current.roundIds.includes(String(hole.round_id))) current.roundIds.push(String(hole.round_id));
  });

  return Array.from(groupedHoles.values()).map((hole) => {
    const allowedRoundIds = Array.isArray(hole.roundIds) ? hole.roundIds.map(String) : [];
    const holeScores = (scores || []).filter((score) => {
      const sameHole = Number(score.hole_number) === Number(hole.hole_number);
      const hasScore = score.strokes !== "" && score.strokes != null;
      const roundMatches = allowedRoundIds.length ? allowedRoundIds.includes(String(score.round_id || "")) : true;
      return sameHole && hasScore && roundMatches;
    });
    const played = holeScores.length;
    const totalStrokes = holeScores.reduce((sum, score) => sum + Number(score.strokes || 0), 0);
    const avgScore = played ? totalStrokes / played : 0;
    const avgToPar = played ? avgScore - Number(hole.par || 0) : 0;
    return {
      course_id: hole.course_id || "",
      course_name: getCourseShortName(hole.course_id),
      hole_number: hole.hole_number,
      par: hole.par,
      hcp: hole.hcp,
      played,
      avgScore,
      avgToPar,
      birdies: holeScores.filter((score) => getScoreDiffToPar(score, hole) === -1 && !normalizeBoolean(score.picked_up)).length,
      pars: holeScores.filter((score) => getScoreDiffToPar(score, hole) === 0 && !normalizeBoolean(score.picked_up)).length,
      pickedUpCount: holeScores.filter((score) => normalizeBoolean(score.picked_up)).length,
      ladies: holeScores.filter((score) => normalizeBoolean(score.lady)).length,
      snakes: holeScores.filter((score) => normalizeBoolean(score.over_two_putts)).length,
    };
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

function buildTournamentNetStandings(players, rounds, holes, scores, courses = fallbackCourses) {
  const qualificationRounds = getQualificationRounds(rounds);
  return (players || []).map((player) => {
    const roundResults = qualificationRounds.map((round) => {
      const roundHoles = getRoundHoles(round, holes);
      const roundScores = (scores || []).filter((score) => String(score.round_id) === String(round.round_id) && String(score.player_id) === String(player.id) && score.strokes !== "" && score.strokes != null);
      const playerForRound = getPlayerForCourse(player, round.course_id || "goethe", courses);
      const grossStrokes = roundScores.reduce((sum, score) => sum + Number(score.strokes || 0), 0);
      const hcpShotsUsed = roundScores.reduce((sum, score) => sum + getShotsOnHole(playerForRound.course_hcp, roundHoles.find((h) => Number(h.hole_number) === Number(score.hole_number))?.hcp), 0);
      const hcpAdjustedStrokes = roundScores.length ? grossStrokes - hcpShotsUsed : null;
      return { round_id: round.round_id, round_name: round.round_name, points: hcpAdjustedStrokes, hcpAdjustedStrokes, grossStrokes, hcpShotsUsed, played: roundScores.length };
    });
    const playedResults = roundResults.filter((result) => result.played > 0 && result.hcpAdjustedStrokes != null);
    const counted = [...playedResults].sort((a, b) => Number(a.hcpAdjustedStrokes || 0) - Number(b.hcpAdjustedStrokes || 0)).slice(0, 2);
    const dropped = [...playedResults].sort((a, b) => Number(a.hcpAdjustedStrokes || 0) - Number(b.hcpAdjustedStrokes || 0)).slice(2, 3)[0] || null;
    const hasMinimumQualiRounds = counted.length >= 2;
    return { ...withFallbackAlias(player), roundResults, countedRoundIds: counted.map((result) => result.round_id), droppedRoundId: dropped?.round_id || "", totalBestTwo: hasMinimumQualiRounds ? counted.reduce((sum, result) => sum + Number(result.hcpAdjustedStrokes || 0), 0) : null, roundsPlayed: playedResults.length, hasMinimumQualiRounds };
  }).sort((a, b) => (a.totalBestTwo == null && b.totalBestTwo != null ? 1 : b.totalBestTwo == null && a.totalBestTwo != null ? -1 : Number(a.totalBestTwo || 0) - Number(b.totalBestTwo || 0) || Number(b.roundsPlayed || 0) - Number(a.roundsPlayed || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0)));
}

function buildDgvRoundStats(players = [], round = null, holes = [], scores = [], courses = fallbackCourses) {
  if (!round?.round_id) return [];
  const course = getCourseSettings(round.course_id || "goethe", courses);
  const slope = Number(course?.slope_rating || 113);
  const courseRating = Number(course?.course_rating || course?.rating || course?.cr || 72);
  const roundHoles = (holes || []).filter((hole) => Number(hole.hole_number) > 0).sort((a, b) => Number(a.hole_number) - Number(b.hole_number));
  return (players || []).map((player) => {
    const playerScores = (scores || []).filter((score) => String(score.round_id || "") === String(round.round_id) && String(score.player_id || "") === String(player.id) && score.strokes !== "" && score.strokes != null);
    const strokes = playerScores.reduce((sum, score) => sum + Number(score.strokes || 0), 0);
    const played = playerScores.length;
    const isComplete = roundHoles.length > 0 && played >= roundHoles.length;
    const differential = isComplete ? ((strokes - courseRating) * 113) / slope : null;
    return { ...withFallbackAlias(player), strokes: played ? strokes : null, played, expected: roundHoles.length, courseRating, slope, differential };
  }).sort((a, b) => (a.differential == null && b.differential != null ? 1 : b.differential == null && a.differential != null ? -1 : Number(a.differential || 0) - Number(b.differential || 0) || Number(a.strokes || 0) - Number(b.strokes || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0)));
}

function buildGrossStrokeStandings(players, rounds, holes, scores) {
  const roundList = (rounds?.length ? rounds : fallbackRounds).slice().sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const expectedHoles = roundList.reduce((sum, round) => sum + getRoundHoles(round, holes).length, 0);
  return (players || [])
    .filter((player) => String(player.id || "").toLowerCase() !== "achim" && String(player.alias_name || "").toLowerCase() !== "gangolf")
    .map((player) => {
      const roundResults = roundList.map((round) => {
        const roundScores = (scores || []).filter((score) => String(score.round_id) === String(round.round_id) && String(score.player_id) === String(player.id) && score.strokes !== "" && score.strokes != null);
        return {
          round_id: round.round_id,
          round_name: round.round_name,
          grossStrokes: roundScores.length ? roundScores.reduce((sum, score) => sum + Number(score.strokes || 0), 0) : null,
          played: roundScores.length,
          expected: getRoundHoles(round, holes).length,
        };
      });
      const played = roundResults.reduce((sum, result) => sum + Number(result.played || 0), 0);
      const grossTotal = roundResults.reduce((sum, result) => sum + Number(result.grossStrokes || 0), 0);
      const isComplete = expectedHoles > 0 && played >= expectedHoles;
      return { ...withFallbackAlias(player), roundResults, grossTotal: played ? grossTotal : null, played, expected: expectedHoles, isComplete };
    })
    .sort((a, b) => (a.grossTotal == null && b.grossTotal != null ? 1 : b.grossTotal == null && a.grossTotal != null ? -1 : Number(a.grossTotal || 0) - Number(b.grossTotal || 0) || Number(b.played || 0) - Number(a.played || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0)));
}

function buildFinalNetStandings(players, rounds, holes, scores, courses = fallbackCourses) {
  const qualificationStandings = buildTournamentNetStandings(players, rounds, holes, scores, courses);
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

function FunTable({ title, subtitle = "", players, columns, nameLabel = "Name" }) {
  const hasHoleRows = players.some((item) => item?.hole_number);
  const rankColumn = columns.find((column) => column.rankValue || column.emphasize) || columns[0];
  const getRankValue = (item) => rankColumn?.rankValue ? rankColumn.rankValue(item) : rankColumn?.render ? rankColumn.render(item) : "";
  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-amber-700/30 bg-black/20">
      <div className="border-b border-amber-700/30 bg-amber-500/10 px-2 py-1.5"><div className="font-serif text-lg text-amber-200">{title}</div>{subtitle ? <div className="text-xs text-amber-100/60">{subtitle}</div> : null}</div>
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full min-w-[360px] border-collapse text-sm text-amber-50 landscape:min-w-0 landscape:text-[11px]">
          <thead><tr className="text-left text-xs uppercase tracking-wider text-amber-100"><th className="px-2 py-1.5">Platz</th><th className="px-2 py-1.5">{hasHoleRows ? "Loch" : nameLabel}</th>{columns.map((column) => <th key={column.label} className="px-2 py-1.5 text-right">{column.label}</th>)}</tr></thead>
          <tbody>{players.map((item, index) => <tr key={item.id || `${item.course_id || "course"}-${item.hole_number}-${index}`} className="border-t border-amber-700/20"><td className="px-2 py-1.5 text-amber-200/75">{formatCompetitionRank(players, index, getRankValue)}</td><td className="px-2 py-1.5 font-semibold text-amber-100">{item.hole_number ? `${item.course_name || getCourseShortName(item.course_id)} · Loch ${item.hole_number}` : item.character_name || item.display_name || item.id}</td>{columns.map((column) => <td key={column.label} className={cls("px-2 py-1.5 text-right", column.emphasize && "font-serif text-lg text-amber-300")}>{column.render(item, index)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function MiddleEarthTables({ players, holes, scores, mismatches, rounds = fallbackRounds, allPlayers = players, allHoles = holes, allScores = scores, courses = fallbackCourses, roundPlayers = [], activeRoundId = "" }) {
  const roundList = useMemo(() => (rounds?.length ? rounds : fallbackRounds).slice().sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)), [rounds]);
  const [middleEarthRoundId, setMiddleEarthRoundId] = useState(() => activeRoundId || "all");
  const selectedRound = roundList.find((round) => String(round.round_id) === String(middleEarthRoundId)) || null;
  const isMiddleEarthAllRounds = middleEarthRoundId === "all";
  const selectedMiddleEarthLabel = isMiddleEarthAllRounds ? "Gesamtübersicht · alle Runden" : getRoundChapterLabel(selectedRound);
  const scopedMiddleEarthPlayers = useMemo(() => {
    if (isMiddleEarthAllRounds) return (allPlayers || players || []).map((player) => getPlayerForCourse(player, "goethe", courses));
    return getRoundPlayers(selectedRound?.round_id, allPlayers || players, roundPlayers).map((player) => getPlayerForCourse(player, selectedRound?.course_id || "goethe", courses));
  }, [isMiddleEarthAllRounds, allPlayers, players, courses, selectedRound?.round_id, selectedRound?.course_id, roundPlayers]);
  const scopedMiddleEarthScores = useMemo(() => {
    const sourceScores = allScores?.length ? allScores : scores;
    if (isMiddleEarthAllRounds) return sourceScores || [];
    return (sourceScores || []).filter((score) => String(score.round_id) === String(selectedRound?.round_id || ""));
  }, [isMiddleEarthAllRounds, allScores, scores, selectedRound?.round_id]);
  const scopedMiddleEarthHoles = useMemo(() => {
    const sourceHoles = allHoles?.length ? allHoles : holes;
    const buildRoundScopedHoles = (round) => getRoundHoles(round, sourceHoles).map((hole) => ({
      ...hole,
      round_id: round.round_id,
      course_name: isMiddleEarthAllRounds ? `${round.round_name || round.round_id} · ${getCourseShortName(round.course_id)}` : getCourseShortName(round.course_id),
    }));
    if (isMiddleEarthAllRounds) return roundList.flatMap(buildRoundScopedHoles);
    return selectedRound ? buildRoundScopedHoles(selectedRound) : holes;
  }, [isMiddleEarthAllRounds, allHoles, holes, roundList, selectedRound]);
  const scopedMiddleEarthMismatches = useMemo(() => {
    if (isMiddleEarthAllRounds) return mismatches || [];
    return getMismatchesForRound(scopedMiddleEarthScores, selectedRound?.round_id || "", scopedMiddleEarthPlayers);
  }, [isMiddleEarthAllRounds, mismatches, scopedMiddleEarthScores, selectedRound?.round_id, scopedMiddleEarthPlayers]);
  const funPlayers = useMemo(() => buildFunPlayerStats(scopedMiddleEarthPlayers, scopedMiddleEarthHoles, scopedMiddleEarthScores), [scopedMiddleEarthPlayers, scopedMiddleEarthHoles, scopedMiddleEarthScores]);
  const funHoles = useMemo(() => buildFunHoleStats(scopedMiddleEarthPlayers, scopedMiddleEarthHoles, scopedMiddleEarthScores), [scopedMiddleEarthPlayers, scopedMiddleEarthHoles, scopedMiddleEarthScores]);
  const snakeLords = [...funPlayers].sort((a, b) => Number(b.puttPenaltyEuro || 0) - Number(a.puttPenaltyEuro || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const mordorTributes = [...funPlayers].sort((a, b) => Number(b.shortDrinkCount || 0) - Number(a.shortDrinkCount || 0) || Number(b.zeroNetPoints || 0) - Number(a.zeroNetPoints || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const ladies = [...funPlayers].sort((a, b) => Number(b.ladyCount || 0) - Number(a.ladyCount || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const whiteFlags = [...funPlayers].sort((a, b) => Number(b.pickedUpCount || 0) - Number(a.pickedUpCount || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const parMachines = [...funPlayers].sort((a, b) => Number(b.parOrBetter || 0) - Number(a.parOrBetter || 0) || Number(b.pars || 0) - Number(a.pars || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const greenKeepers = [...funPlayers].sort((a, b) => Number(b.greenInRegulation || 0) - Number(a.greenInRegulation || 0) || Number(b.underRegulation || 0) - Number(a.underRegulation || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const birdieHunters = [...funPlayers].sort((a, b) => Number((b.birdies || 0) + (b.eaglesOrBetter || 0)) - Number((a.birdies || 0) + (a.eaglesOrBetter || 0)) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const bogeyBunkers = [...funPlayers].sort((a, b) => Number(b.doubleBogeyPlus || 0) - Number(a.doubleBogeyPlus || 0) || Number(b.triplePlus || 0) - Number(a.triplePlus || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const hardestHoles = [...funHoles].sort((a, b) => Number(b.avgToPar || 0) - Number(a.avgToPar || 0));
  const favoriteHoles = [...funHoles].sort((a, b) => Number(a.avgToPar || 0) - Number(b.avgToPar || 0));
  const mithrilMiners = [...funPlayers].sort((a, b) => Number(b.pointsPerHcpShot || 0) - Number(a.pointsPerHcpShot || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
  return (
    <Card className="mb-2 rounded-2xl border-amber-700/40 bg-[#20170f]/82 shadow-xl backdrop-blur-sm landscape:rounded-xl">
      <CardContent className="p-2">
        <div className="mb-2">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Mittelerde</p>
          <h2 className="font-serif text-lg text-amber-200">Die Chroniken der Gefährten</h2>
          <p className="mt-1 text-sm text-amber-100/65">{selectedMiddleEarthLabel}</p>
          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-5">
            <button type="button" onClick={() => setMiddleEarthRoundId("all")} className={cls("rounded-xl border px-2 py-1.5 text-xs font-bold", middleEarthRoundId === "all" ? "border-amber-400 bg-amber-500/20 text-amber-100" : "border-amber-700/35 bg-black/25 text-amber-100/65")}>Gesamt</button>
            {roundList.map((round) => (
              <button key={round.round_id} type="button" onClick={() => setMiddleEarthRoundId(round.round_id)} className={cls("rounded-xl border px-2 py-1.5 text-xs font-bold", String(middleEarthRoundId) === String(round.round_id) ? "border-amber-400 bg-amber-500/20 text-amber-100" : "border-amber-700/35 bg-black/25 text-amber-100/65")}>{round.round_name || round.round_id}</button>
            ))}
          </div>
        </div>
        <FunTable title="Shelobs Putt-Kammer" subtitle="Snake-König der Runde" players={snakeLords} columns={[{ label: "3P", render: (p) => p.threePutts }, { label: "4P", render: (p) => p.fourPutts }, { label: "5+P", render: (p) => p.fivePlusPutts }, { label: "€", render: (p) => `${p.puttPenaltyEuro || 0} €`, emphasize: true }]} />
        <FunTable title="Der Tribut Mordors" subtitle="0 Netto-Punkte · Kurze und Gangolfs Burpees" players={mordorTributes} columns={[{ label: "Kurze", render: (p) => p.shortDrinkCount || 0, emphasize: true }, { label: "0 Netto", render: (p) => p.zeroNetPoints || 0 }, { label: "Burpees", render: (p) => p.burpeeCount || 0 }]} />
        <FunTable title="Galadriels Spiegel" subtitle="Lady-Liga" players={ladies} columns={[{ label: "Ladys", render: (p) => p.ladyCount, emphasize: true }, { label: "Quote", render: (p) => p.played ? `${Math.round((p.ladyCount / p.played) * 100)} %` : "–" }]} />
        <FunTable title="Die weißen Fahnen von Minas Tirith" subtitle="Gestrichene Löcher" players={whiteFlags} columns={[{ label: "X", render: (p) => p.pickedUpCount, emphasize: true }, { label: "Quote", render: (p) => p.played ? `${Math.round((p.pickedUpCount / p.played) * 100)} %` : "–" }]} />
        <FunTable title="Die Ents der Fairways" subtitle="Par oder besser" players={parMachines} columns={[{ label: "Par+", render: (p) => p.parOrBetter, emphasize: true }, { label: "Pars", render: (p) => p.pars }, { label: "Birdie+", render: (p) => p.birdies + p.eaglesOrBetter }]} />
        <FunTable title="Die Gärten von Lothlórien" subtitle="Grün in Regulation" players={greenKeepers} columns={[{ label: "GIR", render: (p) => p.greenInRegulation, emphasize: true }, { label: "Unter Reg.", render: (p) => p.underRegulation }, { label: "Quote", render: (p) => p.greenAttempts ? `${Math.round((p.greenInRegulation / p.greenAttempts) * 100)} %` : "–" }]} />
        <FunTable title="Die Adler von Manwë" subtitle="Birdie-Jäger" players={birdieHunters} columns={[{ label: "Eagle+", render: (p) => p.eaglesOrBetter }, { label: "Birdies", render: (p) => p.birdies }, { label: "Summe", render: (p) => p.birdies + p.eaglesOrBetter, emphasize: true }]} />
        <FunTable title="Morias Strafregister" subtitle="Doppelbogey oder schlimmer" players={bogeyBunkers} columns={[{ label: "DB+", render: (p) => p.doubleBogeyPlus, emphasize: true }, { label: "Triple+", render: (p) => p.triplePlus }, { label: "X", render: (p) => p.pickedUpCount }]} />
        <FunTable title="Der Schicksalsberg" subtitle="Härtestes Loch des Feldes" players={hardestHoles} columns={[{ label: "Par", render: (h) => h.par }, { label: "Ø +/−", render: (h) => formatToPar(Math.round(h.avgToPar * 10) / 10, h.played), emphasize: true }, { label: "X", render: (h) => h.pickedUpCount }, { label: "Snake", render: (h) => h.snakes }]} />
        <FunTable title="Bruchtal" subtitle="Lieblingsloch des Feldes" players={favoriteHoles} columns={[{ label: "Par", render: (h) => h.par }, { label: "Ø +/−", render: (h) => formatToPar(Math.round(h.avgToPar * 10) / 10, h.played), emphasize: true }, { label: "Birdies", render: (h) => h.birdies }, { label: "Pars", render: (h) => h.pars }]} />
        <FunTable title="Mithril-Ausbeute" subtitle="Netto-Punkte je erhaltenem Schlag" players={mithrilMiners} columns={[{ label: "SpV genutzt", render: (p) => p.hcpShotsUsed }, { label: "Netto", render: (p) => p.netStableford }, { label: "Quote", render: (p) => p.hcpShotsUsed ? p.pointsPerHcpShot : "–", emphasize: true }]} />
      </CardContent>
    </Card>
  );
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

function getRoundHonorCelebration(players, rounds, holes, scores, roundPlayers, dismissedKeys = [], lockedRoundIds = []) {
  const qualificationRounds = getQualificationRounds(rounds);
  const blockedRoundIds = new Set((lockedRoundIds || []).map((roundId) => String(roundId)));

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
    if (blockedRoundIds.has(String(round.round_id))) continue;
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

function getFinalWinnerCelebration(players, rounds, holes, scores, roundPlayers, courses = fallbackCourses) {
  const finalRound = getFinalRound(rounds);
  if (!finalRound?.round_id || !finalRound?.course_id) return null;
  const finalHoles = getRoundHoles(finalRound, holes);
  const finalPlayers = getRoundPlayers(finalRound.round_id, players, roundPlayers);
  if (!finalHoles.length || !finalPlayers.length) return null;
  const finalScores = (scores || []).filter((score) => String(score.round_id) === String(finalRound.round_id) && score.strokes !== "" && score.strokes != null);
  const allFinalScoresComplete = finalPlayers.every((player) => finalHoles.every((hole) => finalScores.some((score) => String(score.player_id) === String(player.id) && Number(score.hole_number) === Number(hole.hole_number))));
  if (!allFinalScoresComplete) return null;
  const finalStandings = buildFinalNetStandings(players, rounds, holes, scores, courses);
  const winner = finalStandings.find((player) => Number(player.finalRank) === 1) || finalStandings[0] || null;
  if (!winner) return null;
  return { roundId: finalRound.round_id, winner, winnerName: getPlayerLabel(winner), winnerLabel: winner.character_name || winner.display_name || winner.id, finalHcpAdjustedStrokes: winner.finalHcpAdjustedStrokes };
}

function TournamentStandings({ players, rounds, holes, scores, courses = fallbackCourses, activeRoundId = "" }) {
  const standings = useMemo(() => buildTournamentNetStandings(players, rounds, holes, scores, courses), [players, rounds, holes, scores, courses]);
  const finalStandings = useMemo(() => buildFinalNetStandings(players, rounds, holes, scores, courses), [players, rounds, holes, scores, courses]);
  const grossStrokeStandings = useMemo(() => buildGrossStrokeStandings(players, rounds, holes, scores), [players, rounds, holes, scores]);
  const qualificationRounds = getQualificationRounds(rounds);
  const finalRound = getFinalRound(rounds);
  const isFinalActive = String(activeRoundId) === String(finalRound?.round_id || "r4");
  const orderedRounds = (rounds?.length ? rounds : fallbackRounds).slice().sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));

  const getQualRank = (index) => {
    const current = standings[index];
    if (!current || current.totalBestTwo == null) return index + 1;
    const value = Number(current.totalBestTwo);
    const betterCount = standings.filter((item) => item.totalBestTwo != null && Number(item.totalBestTwo) < value).length;
    return betterCount + 1;
  };

  const getQualRankLabel = (index) => {
    const current = standings[index];
    if (!current || current.totalBestTwo == null) return String(index + 1);
    const value = Number(current.totalBestTwo);
    const sameCount = standings.filter((item) => item.totalBestTwo != null && Number(item.totalBestTwo) === value).length;
    const rank = getQualRank(index);
    return sameCount > 1 ? `T${rank}` : String(rank);
  };

  const isFinalQualified = (index) => {
    const current = standings[index];
    return Boolean(current && current.totalBestTwo != null && getQualRank(index) <= 3);
  };

  return (
    <Card className="mb-2 rounded-2xl border-amber-700/40 bg-[#20170f]/82 shadow-xl backdrop-blur-sm landscape:rounded-xl">
      <CardContent className="p-2">
        <div className="mb-3">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Turnier</p>
          <h2 className="font-serif text-lg text-amber-200">{isFinalActive ? "Finalwertung Strokes HCP adjusted" : "Gesamtwertung Strokes HCP adjusted"}</h2>
          {isFinalActive ? <div className="mt-0.5 text-sm font-semibold text-amber-300/85">Am Schicksalsberg · Nur einer trägt den Ring.</div> : null}
          <p className="mt-1 text-sm text-amber-100/70">
            {isFinalActive ? "Finaltag: Finalgruppe und Platzierungsgruppe werden nach Strokes HCP adjusted gewertet." : "Es zählen die besten zwei Strokes-HCP-adjusted-Ergebnisse aus den ersten drei Runden. Rang T3 oder besser liegt oberhalb des Cuts."}
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-amber-700/30 bg-black/20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full min-w-[360px] border-collapse text-sm text-amber-50 landscape:min-w-0 landscape:text-[11px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-amber-100">
                <th className="px-2 py-1.5">#</th>
                <th className="px-2 py-1.5">Spieler</th>
                {isFinalActive ? (
                  <>
                    <th className="px-2 py-1.5 text-right">Quali</th>
                    <th className="px-2 py-1.5 text-right">Final Strokes HCP</th>
                    <th className="px-2 py-1.5 text-right">Löcher</th>
                    <th className="px-2 py-1.5 text-right">Gruppe</th>
                  </>
                ) : (
                  <>
                    {qualificationRounds.map((round) => <th key={round.round_id} className="px-2 py-1.5 text-right">{round.round_name}</th>)}
                    <th className="px-2 py-1.5 text-right">Gesamt</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {isFinalActive ? finalStandings.map((player, index) => (
                <React.Fragment key={player.id}>
                  {index === 3 && <tr><td colSpan={6} className="border-y-2 border-amber-400/70 bg-amber-500/10 px-2 py-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-amber-200">Platzierungsgruppe · Plätze 4–6</td></tr>}
                  <tr className={cls("border-t border-amber-700/20", index < 3 && "bg-emerald-500/5")}>
                    <td className="px-2 py-1.5 font-serif text-lg font-bold text-amber-300">{formatCompetitionRank(finalStandings, index, (item) => `${item.finalGroup}|${item.finalHcpAdjustedStrokes ?? ""}`)}</td>
                    <td className="px-2 py-1.5 font-semibold text-amber-100">{getPlayerLabel(player)}</td>
                    <td className="px-2 py-1.5 text-right text-amber-100/75">{player.qualificationRank}</td>
                    <td className="px-2 py-1.5 text-right font-serif text-lg font-bold text-amber-300">{player.finalHcpAdjustedStrokes ?? "–"}</td>
                    <td className="px-2 py-1.5 text-right text-amber-100">{player.finalPlayed}/18</td>
                    <td className="px-2 py-1.5 text-right text-amber-100/75">{player.finalGroup === "championship" ? "1–3" : "4–6"}</td>
                  </tr>
                </React.Fragment>
              )) : standings.map((player, index) => {
                const qualified = isFinalQualified(index);
                const previousQualified = index > 0 ? isFinalQualified(index - 1) : true;
                return (
                  <React.Fragment key={player.id}>
                    {index > 0 && previousQualified && !qualified && <tr><td colSpan={qualificationRounds.length + 3} className="border-y-2 border-amber-400/70 bg-amber-500/10 px-2 py-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-amber-200">Cut-Linie · Rang T3 oder besser spielt den Finaltag</td></tr>}
                    <tr className={cls("border-t border-amber-700/20", qualified && "bg-emerald-500/5")}>
                      <td className="px-2 py-1.5 text-amber-200/75">{getQualRankLabel(index)}</td>
                      <td className="px-2 py-1.5 font-semibold text-amber-100">
                        {getPlayerLabel(player)}
                        {qualified && <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-200">Final</span>}
                      </td>
                      {qualificationRounds.map((round) => {
                        const result = player.roundResults.find((item) => item.round_id === round.round_id);
                        const isCounted = player.countedRoundIds.includes(round.round_id);
                        const isDropped = player.droppedRoundId === round.round_id;
                        return <td key={round.round_id} className={cls("px-2 py-1.5 text-right", isCounted && "font-bold text-amber-300", isDropped && "text-amber-100/50 line-through")}>{result?.played ? result.points : "–"}</td>;
                      })}
                      <td className="px-2 py-1.5 text-right font-serif text-lg font-bold text-amber-300">{player.totalBestTwo ?? "–"}</td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {!isFinalActive ? <TournamentProgressChart title="Gesamtwertung Strokes HCP adjusted" standings={standings} rounds={qualificationRounds} valueType="totalBestTwo" /> : null}

        <div className="mt-3 overflow-x-auto rounded-2xl border border-amber-700/30 bg-black/20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="border-b border-amber-700/30 bg-amber-500/10 px-2 py-1.5">
            <div className="font-serif text-lg text-amber-200">Brutto Strokes · tatsächliche Schläge</div>
            <div className="text-xs text-amber-100/60">Über alle vier Runden · ohne Gangolf/Achim · Pick-up wird mit der Strichregel gewertet.</div>
          </div>
          <table className="w-full min-w-[420px] border-collapse text-sm text-amber-50 landscape:min-w-0 landscape:text-[11px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-amber-100">
                <th className="px-2 py-1.5">#</th>
                <th className="px-2 py-1.5">Spieler</th>
                {orderedRounds.map((round) => <th key={round.round_id} className="px-2 py-1.5 text-right">{round.round_name}</th>)}
                <th className="px-2 py-1.5 text-right">Gesamt</th>
                <th className="px-2 py-1.5 text-right">Löcher</th>
              </tr>
            </thead>
            <tbody>{grossStrokeStandings.map((player, index) => <tr key={player.id} className="border-t border-amber-700/20"><td className="px-2 py-1.5 text-amber-200/75">{formatCompetitionRank(grossStrokeStandings, index, (item) => item.grossTotal ?? "")}</td><td className="px-2 py-1.5 font-semibold text-amber-100">{getPlayerLabel(player)}</td>{player.roundResults.map((result) => <td key={result.round_id} className="px-2 py-1.5 text-right text-amber-100">{result.grossStrokes ?? "–"}</td>)}<td className="px-2 py-1.5 text-right font-serif text-lg font-bold text-amber-300">{player.grossTotal ?? "–"}</td><td className="px-2 py-1.5 text-right text-amber-100/75">{player.played}/{player.expected || "–"}</td></tr>)}</tbody>
          </table>
        </div>
        <TournamentProgressChart title="Brutto Strokes" standings={grossStrokeStandings} rounds={orderedRounds} valueType="grossTotal" />
      </CardContent>
    </Card>
  );
}

function buildTeamCeremonyTimeline(roundId) {
  const safeRoundId = String(roundId || "");
  return [
    {
      type: "text",
      title: safeRoundId === "r3" ? "Die Bündnisse vor Mordor" : safeRoundId === "r2" ? "Die Bündnisse aus den Minen" : "Die Bündnisse des Tages",
      text: "Die Team-Zeremonie wird vorbereitet. Falls diese Meldung erscheint, ist die sichere Fallback-Zeremonie aktiv.",
      waitLabel: "Die Chronik wird geöffnet ...",
    },
    {
      type: "text",
      title: "Zeremonie gesichert",
      text: "Die App läuft wieder. Die detaillierte Team-Zeremonie kann danach sauber neu aufgebaut werden.",
      waitLabel: "Die Chronik wird versiegelt ...",
    },
  ];
}

function buildFlightCeremonyTimeline(draw) {
  const rounds = Array.isArray(draw?.rounds) ? draw.rounds : [];
  if (!rounds.length) return [];
  const steps = [
    {
      type: "text",
      title: "Die Flüge werden offenbart",
      text: "Der Rat von Bruchtal öffnet das Pergament der Flight-Auslosung. Runde für Runde treten die Gefährten hervor.",
    },
  ];

  rounds.forEach((roundPlan) => {
    const flights = Array.isArray(roundPlan?.flights) ? roundPlan.flights : [];
    const totalPlayers = flights.reduce((sum, flight) => sum + (Array.isArray(flight.players) ? flight.players.length : 0), 0);
    steps.push({
      type: "text",
      title: roundPlan.round_name || roundPlan.round_id || "Runde",
      text: roundPlan.note || "Ein neues Kapitel wird geöffnet. Die Flights treten aus dem Nebel.",
      roundPlan,
    });
    for (let revealCount = 1; revealCount <= totalPlayers; revealCount += 1) {
      steps.push({
        type: "reveal",
        title: roundPlan.round_name || roundPlan.round_id || "Runde",
        text: "Die Namen erscheinen nacheinander im Pergament.",
        roundPlan,
        revealCount,
      });
    }
    steps.push({
      type: "reveal",
      title: `${roundPlan.round_name || roundPlan.round_id || "Runde"} · vollständig`,
      text: "Der Flight ist besiegelt. Ab jetzt gibt es keine Ausreden mehr, nur noch Zeugen.",
      roundPlan,
      revealCount: totalPlayers,
    });
  });

  steps.push({
    type: "text",
    title: "Die Flights sind gesprochen",
    text: "Die Chronik ist versiegelt. Wer nun klagt, möge dies bitte vor dem ersten Abschlag erledigen.",
  });
  return steps;
}

function LordOfTheHolesApp() {
  const cachedState = readLocalJson("lordOfTheHoles.cachedState", null);
  const [players, setPlayers] = useState(cachedState?.players?.length ? cachedState.players : fallbackPlayers);
  const [allPlayers, setAllPlayers] = useState(cachedState?.allPlayers?.length ? cachedState.allPlayers : fallbackPlayers);
  const [courses, setCourses] = useState(cachedState?.courses?.length ? cachedState.courses : fallbackCourses);
  const [rounds, setRounds] = useState(cachedState?.rounds?.length ? cachedState.rounds : fallbackRounds);
  const [roundPlayers, setRoundPlayers] = useState(cachedState?.roundPlayers || []);
  const [activeRound, setActiveRound] = useState(cachedState?.activeRound || null);
  const [holes, setHoles] = useState(cachedState?.holes?.length ? cachedState.holes : fallbackHoles.filter((h) => h.course_id === "goethe"));
  const [allHoles, setAllHoles] = useState(cachedState?.allHoles?.length ? cachedState.allHoles : fallbackHoles);
  const [scores, setScores] = useState(cachedState?.scores?.length ? cachedState.scores.map(normalizeScoreRecord) : []);
  const [allScores, setAllScores] = useState(cachedState?.allScores?.length ? cachedState.allScores.map(normalizeScoreRecord) : []);
  const [pendingScores, setPendingScores] = useState(() => readLocalJson("lordOfTheHoles.pendingScores", []).map(normalizeScoreRecord).filter(isValidScorePayload));
  const pendingScoresRef = useRef(readLocalJson("lordOfTheHoles.pendingScores", []).map(normalizeScoreRecord).filter(isValidScorePayload));
  const [localScoreDrafts, setLocalScoreDrafts] = useState(() => readLocalJson("lordOfTheHoles.localScoreDrafts", []).map(normalizeScoreRecord).filter(isValidScorePayload));
  const localScoreDraftsRef = useRef(readLocalJson("lordOfTheHoles.localScoreDrafts", []).map(normalizeScoreRecord).filter(isValidScorePayload));
  const [scoredPlayerId, setScoredPlayerId] = useState(() => readLocalJson("lordOfTheHoles.scoredPlayerId", ""));
  const [scoredPlayerByRound, setScoredPlayerByRound] = useState(() => readLocalJson("lordOfTheHoles.scoredPlayerByRound", {}));
  const [scoreEntryMode, setScoreEntryMode] = useState("player");
  const [activeHole, setActiveHole] = useState(() => getFirstUnscoredHole(cachedState?.scores?.length ? cachedState.scores : cachedState?.allScores || [], cachedState?.selectedActiveRoundId || cachedState?.activeRound?.round_id || "", readLocalJson("lordOfTheHoles.scoredPlayerId", ""), 1, readLocalJson("lordOfTheHoles.myPlayerId", "")));
  const [view, setView] = useState("score");
  const [mainMenu, setMainMenu] = useState("current");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenuGroups, setOpenMenuGroups] = useState(() => readLocalJson("lordOfTheHoles.openMenuGroups", { tournament: true, round: false, info: false, system: false }));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scoreSyncCount, setScoreSyncCount] = useState(0);
  const [autoSync] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("offline");
  const [error, setError] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(cachedState?.selectedCourseId || "");
  const [selectedActiveRoundId, setSelectedActiveRoundId] = useState(() => readLocalJson("lordOfTheHoles.selectedActiveRoundId", cachedState?.selectedActiveRoundId || "r1"));
  const [myPlayerId, setMyPlayerId] = useState(() => readLocalJson("lordOfTheHoles.myPlayerId", ""));
  const [forceMyPlayerPromptOpen, setForceMyPlayerPromptOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState("");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminEditing, setAdminEditing] = useState(false);
  const [setupSavedMessage, setSetupSavedMessage] = useState("");
  const [backupSavedMessage, setBackupSavedMessage] = useState("");
  const [scoreHintMessage, setScoreHintMessage] = useState("");
  const [adminScoreEntryUnlocks, setAdminScoreEntryUnlocks] = useState(() => readLocalJson("lordOfTheHoles.adminScoreEntryUnlocks", {}));
  const [zeroNetTributeDismissedKeys, setZeroNetTributeDismissedKeys] = useState(() => readLocalJson("lordOfTheHoles.zeroNetTributeDismissedKeys", []));
  const [showSplash, setShowSplash] = useState(true);
  const [splashEntering, setSplashEntering] = useState(false);
  const [appLocked, setAppLocked] = useState(() => readLocalJson("lordOfTheHoles.appLocked", true));
  const [lockUnlockOpen, setLockUnlockOpen] = useState(false);
  const [lockPasswordInput, setLockPasswordInput] = useState("");
  const [lockAdminBypass, setLockAdminBypass] = useState(false);
  const [lockCountdownNow, setLockCountdownNow] = useState(() => new Date());
  const [serverTimeOffsetMs, setServerTimeOffsetMs] = useState(0);
  const [lastServerSync, setLastServerSync] = useState({ offsetMs: 0, rttMs: 0, syncedAt: "", source: "device" });
  const [atomicTimeStatus, setAtomicTimeStatus] = useState("idle");
  const atomicSyncSequenceRef = useRef(0);
  const [deviceAssignmentsResetAt, setDeviceAssignmentsResetAt] = useState(() => readLocalJson("lordOfTheHoles.deviceAssignmentsResetAt", ""));
  const [scoresResetAt, setScoresResetAt] = useState(() => readLocalJson("lordOfTheHoles.scoresResetAt", ""));
  const [fullResetAt, setFullResetAt] = useState(() => readLocalJson("lordOfTheHoles.fullResetAt", ""));
  const [clearScoresConfirmOpen, setClearScoresConfirmOpen] = useState(false);
  const [clearScoresSaving, setClearScoresSaving] = useState(false);
  const [standingsPopup, setStandingsPopup] = useState(null);
  const [winnerPopupDismissedKey, setWinnerPopupDismissedKey] = useState(() => readLocalJson("lordOfTheHoles.winnerPopupDismissedKey", ""));
  const [roundHonorDismissedKeys, setRoundHonorDismissedKeys] = useState(() => readLocalJson("lordOfTheHoles.roundHonorDismissedKeys", []));
  const [scorecardRoundId, setScorecardRoundId] = useState(() => readLocalJson("lordOfTheHoles.scorecardRoundId", ""));
  const [roundTableRoundId, setRoundTableRoundId] = useState(() => readLocalJson("lordOfTheHoles.roundTableRoundId", ""));
  const [dailyTeamSelections, setDailyTeamSelections] = useState(() => readLocalJson("lordOfTheHoles.dailyTeamSelections", {}));
  const [openTeamHoleDetails, setOpenTeamHoleDetails] = useState(() => readLocalJson("lordOfTheHoles.openTeamHoleDetails", {}));
  const [teamDrawRows, setTeamDrawRows] = useState(cachedState?.teamDrawRows || []);
  const [teamDrawSaving, setTeamDrawSaving] = useState(false);
  const [teamCeremonyRunning, setTeamCeremonyRunning] = useState(false);
  const [teamCeremonyTestMode, setTeamCeremonyTestMode] = useState(false);
  const [teamCeremonyRoundId, setTeamCeremonyRoundId] = useState("");
  const [teamCeremonyStepIndex, setTeamCeremonyStepIndex] = useState(0);
  const [teamCeremonySyncStartAt, setTeamCeremonySyncStartAt] = useState("");
  const [teamCeremonyDismissedKeys, setTeamCeremonyDismissedKeys] = useState(() => readLocalJson("lordOfTheHoles.teamCeremonyDismissedKeys", []));
  const [prizeSettings, setPrizeSettings] = useState(() => readLocalJson("lordOfTheHoles.prizeSettings", { topGreenfee: "" }));
  const [roundSummaryDismissedKeys, setRoundSummaryDismissedKeys] = useState(() => readLocalJson("lordOfTheHoles.roundSummaryDismissedKeys", []));
  const [flightDraw, setFlightDraw] = useState(() => readLocalJson(FLIGHT_DRAW_STORAGE_KEY, null));
  const [flightDrawSaving, setFlightDrawSaving] = useState(false);
  const [flightCeremonyRunning, setFlightCeremonyRunning] = useState(false);
  const [flightCeremonyStepIndex, setFlightCeremonyStepIndex] = useState(0);
  const [flightCeremonySyncStartAt, setFlightCeremonySyncStartAt] = useState("");
  const [flightCeremonyCompleted, setFlightCeremonyCompleted] = useState(() => readLocalJson("lordOfTheHoles.flightCeremonyCompleted", false));
  const [flightSummaryOpen, setFlightSummaryOpen] = useState(() => readLocalJson("lordOfTheHoles.flightSummaryOpen", false));
  const [localHandicaps, setLocalHandicaps] = useState({});
  const scoresRef = useRef(scores);
  const allScoresRef = useRef(allScores);
  const introAudioRef = useRef(null);
  const lastLoadedRoundRef = useRef("");
  const lastAutoHoleTargetRef = useRef("");
  const selectedActiveRoundIdRef = useRef(selectedActiveRoundId);
  const scoredPlayerByRoundRef = useRef(scoredPlayerByRound);
  const lockAdminBypassRef = useRef(lockAdminBypass);
  const hintTimerRef = useRef(null);

  const displayedActiveRound = (selectedActiveRoundId && (rounds.length ? rounds : fallbackRounds).find((round) => String(round.round_id) === String(selectedActiveRoundId))) || activeRound || rounds.find((round) => String(round.status).toLowerCase() === "active") || fallbackRounds[0];
  const displayCourseId = displayedActiveRound?.course_id || selectedCourseId || "goethe";
  const activeCourse = (courses.length ? courses : fallbackCourses).find((course) => String(course.course_id) === String(displayCourseId));
  const visiblePlayers = useMemo(() => getRoundPlayers(displayedActiveRound?.round_id, allPlayers, roundPlayers), [displayedActiveRound?.round_id, allPlayers, roundPlayers]);
  const effectiveFlightDraw = useMemo(() => flightDraw || readLocalJson(FLIGHT_DRAW_STORAGE_KEY, null), [flightDraw]);
  const assignedScoredPlayerId = useMemo(() => getAssignedScoredPlayerIdFromDraw(effectiveFlightDraw, displayedActiveRound?.round_id || "", myPlayerId), [effectiveFlightDraw, displayedActiveRound?.round_id, myPlayerId]);
  const myFlightFromDraw = useMemo(() => getPlayerFlightFromDraw(effectiveFlightDraw, displayedActiveRound?.round_id || "", myPlayerId), [effectiveFlightDraw, displayedActiveRound?.round_id, myPlayerId]);
  const scoreablePlayers = useMemo(() => {
    const filteredPlayers = myPlayerId ? visiblePlayers.filter((p) => String(p.id) !== String(myPlayerId)) : visiblePlayers;
    return filteredPlayers.length ? filteredPlayers : visiblePlayers;
  }, [visiblePlayers, myPlayerId]);
  const automaticScoredPlayerBase = assignedScoredPlayerId ? visiblePlayers.find((p) => String(p.id) === String(assignedScoredPlayerId)) : null;
  const isFlightDrawRound = ["r1", "r2", "r3"].includes(String(displayedActiveRound?.round_id || ""));
  const playersWithCurrentHandicaps = useMemo(() => getPlayersForCourse(visiblePlayers, displayCourseId, courses), [visiblePlayers, displayCourseId, courses]);
  const activeHoleData = holes.find((h) => Number(h.hole_number) === Number(activeHole)) || holes[Number(activeHole) - 1] || fallbackHoles.find((h) => h.course_id === displayCourseId && h.hole_number === Number(activeHole)) || fallbackHoles[0];
  const scoredPlayerBase = scoredPlayerId ? visiblePlayers.find((p) => String(p.id) === String(scoredPlayerId)) : null;
  const scoredPlayer = scoredPlayerBase ? getPlayerForCourse(scoredPlayerBase, displayCourseId, courses) : null;
  const myCurrentPlayerBase = myPlayerId ? (visiblePlayers.find((player) => String(player.id) === String(myPlayerId)) || allPlayers.find((player) => String(player.id) === String(myPlayerId))) : null;
  const myCurrentPlayer = myPlayerId ? getPlayerForCourse(myCurrentPlayerBase, displayCourseId, courses) : null;
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
  const roundScoreEntryClosed = useMemo(() => {
    const roundId = String(displayedActiveRound?.round_id || "");
    if (!roundId) return false;
    const roundHolesForLock = (holes?.length ? holes : fallbackHoles.filter((hole) => String(hole.course_id) === String(displayCourseId))).filter((hole) => Number(hole.hole_number) > 0);
    const roundPlayersForLock = visiblePlayers || [];
    if (!roundHolesForLock.length || !roundPlayersForLock.length) return false;
    const hasCompleteScore = (score) => Boolean(score && score.strokes !== "" && score.strokes != null && score.putts_count !== "" && score.putts_count != null);
    const allOfficialScoresComplete = roundPlayersForLock.every((player) => roundHolesForLock.every((hole) => hasCompleteScore(findScoreForPlayerHole(scores, roundId, player.id, hole.hole_number, false))));
    const allControlScoresComplete = roundPlayersForLock.every((player) => roundHolesForLock.every((hole) => hasCompleteScore(findScoreForPlayerHole(scores, roundId, player.id, hole.hole_number, true))));
    const noRoundMismatches = getMismatchesForRound(scores, roundId, roundPlayersForLock).length === 0;
    return allOfficialScoresComplete && allControlScoresComplete && noRoundMismatches;
  }, [displayedActiveRound?.round_id, holes, displayCourseId, visiblePlayers, scores]);
  const adminScoreEntryUnlockedForRound = Boolean(adminScoreEntryUnlocks?.[String(displayedActiveRound?.round_id || "")]);
  const scoreEntryBlockedByRoundLock = roundScoreEntryClosed && !adminScoreEntryUnlockedForRound;
  const canEnterScores = Boolean(displayedActiveRound?.round_id && myPlayerId && (!isFlightDrawRound || assignedScoredPlayerId) && scoredPlayerId && entryPlayerId && entryPlayer && Number(activeHole) > 0 && !scoreEntryBlockedByRoundLock);
  const currentFlightZeroNetPenalties = useMemo(() => {
    const roundId = String(displayedActiveRound?.round_id || "");
    const holeNumber = Number(activeHole || 0);
    if (!roundId || !holeNumber || !activeHoleData) return [];
    const flightPlayerIds = (myFlightFromDraw?.players || []).map((id) => String(id));
    const fallbackPlayerIds = visiblePlayers.map((player) => String(player.id));
    const relevantPlayerIds = flightPlayerIds.length ? flightPlayerIds : fallbackPlayerIds;
    const sourcePlayers = [...(visiblePlayers || []), ...(allPlayers || [])];
    return relevantPlayerIds.map((playerId) => {
      const playerBase = sourcePlayers.find((player) => String(player.id) === String(playerId));
      if (!playerBase) return null;
      const player = getPlayerForCourse(playerBase, displayCourseId, courses);
      const score = findScoreForPlayerHole(scores, roundId, playerId, holeNumber, false);
      const hasCompleteScore = Boolean(score && score.strokes !== "" && score.strokes != null);
      if (!hasCompleteScore) return null;
      const netPoints = getScoreStablefordPoints(score, activeHoleData.par, getShotsOnHole(player?.course_hcp, activeHoleData.hcp));
      if (Number(netPoints) !== 0) return null;
      const isAchim = String(playerId).toLowerCase() === "achim" || String(player?.alias_name || "").toLowerCase() === "gangolf";
      return {
        key: `zero_net_${roundId}_${holeNumber}_${playerId}`,
        roundId,
        holeNumber,
        player,
        playerId,
        action: isAchim ? "20 Burpees" : "Kurzer trinken",
        text: isAchim ? `${getPlayerLabel(player)} hat am Loch den Zorn Mordors geweckt · 20 Burpees vor den Augen des Flights` : `${getPlayerLabel(player)} ist an diesem Loch in den Schatten Mordors geraten · ein Kurzer für den Gefährten`,
      };
    }).filter(Boolean);
  }, [displayedActiveRound?.round_id, activeHole, activeHoleData, myFlightFromDraw, visiblePlayers, allPlayers, displayCourseId, courses, scores]);
  const flightZeroNetTributeQueue = useMemo(() => {
    const roundId = String(displayedActiveRound?.round_id || "");
    if (!roundId) return [];
    const flightPlayerIds = (myFlightFromDraw?.players || []).map((id) => String(id));
    const fallbackPlayerIds = visiblePlayers.map((player) => String(player.id));
    const relevantPlayerIds = flightPlayerIds.length ? flightPlayerIds : fallbackPlayerIds;
    const sourcePlayers = [...(visiblePlayers || []), ...(allPlayers || [])];
    const roundHoles = holes?.length ? holes : fallbackHoles.filter((hole) => String(hole.course_id) === String(displayCourseId));
    const rows = [];
    relevantPlayerIds.forEach((playerId) => {
      const playerBase = sourcePlayers.find((player) => String(player.id) === String(playerId));
      if (!playerBase) return;
      const player = getPlayerForCourse(playerBase, displayCourseId, courses);
      roundHoles.forEach((hole) => {
        const holeNumber = Number(hole.hole_number || 0);
        if (!holeNumber) return;
        const score = findScoreForPlayerHole(scores, roundId, playerId, holeNumber, false);
        const hasCompleteScore = Boolean(score && score.strokes !== "" && score.strokes != null);
        if (!hasCompleteScore) return;
        const netPoints = getScoreStablefordPoints(score, hole.par, getShotsOnHole(player?.course_hcp, hole.hcp));
        if (Number(netPoints) !== 0) return;
        const key = `zero_net_${roundId}_${holeNumber}_${playerId}`;
        if ((zeroNetTributeDismissedKeys || []).includes(key)) return;
        const isAchim = String(playerId).toLowerCase() === "achim" || String(player?.alias_name || "").toLowerCase() === "gangolf";
        rows.push({
          key,
          roundId,
          holeNumber,
          player,
          playerId,
          action: isAchim ? "20 Burpees" : "Kurzer trinken",
          text: isAchim ? `${getPlayerLabel(player)} hat an Loch ${holeNumber} den Zorn Mordors geweckt · 20 Burpees vor den Augen des Flights` : `${getPlayerLabel(player)} ist an Loch ${holeNumber} in den Schatten Mordors geraten · ein Kurzer für den Gefährten`,
        });
      });
    });
    return rows.sort((a, b) => Number(a.holeNumber || 0) - Number(b.holeNumber || 0));
  }, [displayedActiveRound?.round_id, myFlightFromDraw, visiblePlayers, allPlayers, holes, displayCourseId, courses, scores, zeroNetTributeDismissedKeys]);
  const zeroNetTributePopup = flightZeroNetTributeQueue[0] || null;
  const currentEffectiveStrokes = normalizeBoolean(currentScore.picked_up) ? Number(pickedUpStrokes || 0) : Number(currentScore.strokes || 0);
  const maxPuttsForCurrentScore = currentEffectiveStrokes > 1 ? currentEffectiveStrokes - 1 : 0;
  const officialScoreForActiveHole = useMemo(() => findScoreForPlayerHole(scores, displayedActiveRound?.round_id || "r1", scoredPlayerId, activeHole, false), [scores, displayedActiveRound?.round_id, scoredPlayerId, activeHole]);
  const controlScoreForActiveHole = useMemo(() => (myPlayerId ? findScoreForPlayerHole(scores, displayedActiveRound?.round_id || "r1", myPlayerId, activeHole, true) : null), [scores, displayedActiveRound?.round_id, myPlayerId, activeHole]);
  const hasRequiredScoresForNext = Boolean(myPlayerId && officialScoreForActiveHole?.strokes !== "" && officialScoreForActiveHole?.strokes != null && officialScoreForActiveHole?.putts_count !== "" && officialScoreForActiveHole?.putts_count != null && controlScoreForActiveHole?.strokes !== "" && controlScoreForActiveHole?.strokes != null && controlScoreForActiveHole?.putts_count !== "" && controlScoreForActiveHole?.putts_count != null);
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
  const strokePlayLeaderboard = useMemo(() => sortStrokePlay(playerStats), [playerStats]);
  const netStablefordLeaderboard = useMemo(() => sortStableford(playerStats, "netStableford"), [playerStats]);
  const hcpAdjustedStrokeLeaderboard = useMemo(() => sortHcpAdjustedStrokePlay(playerStats), [playerStats]);
  const myCurrentStats = useMemo(() => {
    if (!myPlayerId) return null;
    const existingStats = playerStats.find((player) => String(player.id) === String(myPlayerId));
    if (existingStats) return existingStats;
    const fallbackPlayer = getPlayerForCourse(allPlayers.find((player) => String(player.id) === String(myPlayerId)), displayCourseId, courses);
    if (!fallbackPlayer) return null;
    return buildPlayerStats([fallbackPlayer], holes, officialScores)[0] || null;
  }, [playerStats, myPlayerId, allPlayers, displayCourseId, courses, holes, officialScores]);
  const myHcpAdjustedStrokeRank = useMemo(() => { const index = hcpAdjustedStrokeLeaderboard.findIndex((player) => String(player.id) === String(myPlayerId)); return index >= 0 ? index + 1 : null; }, [hcpAdjustedStrokeLeaderboard, myPlayerId]);
  const myNetStablefordRank = useMemo(() => { const index = netStablefordLeaderboard.findIndex((player) => String(player.id) === String(myPlayerId)); return index >= 0 ? index + 1 : null; }, [netStablefordLeaderboard, myPlayerId]);
  const roundSummaryPopup = useMemo(() => {
    if (!myPlayerId || !displayedActiveRound?.round_id) return null;

    const roundId = displayedActiveRound.round_id;
    const playerBase = visiblePlayers.find((player) => String(player.id) === String(myPlayerId)) || allPlayers.find((player) => String(player.id) === String(myPlayerId));
    const player = getPlayerForCourse(playerBase, displayCourseId, courses);
    if (!player) return null;

    const sortedHoles = (holes.length ? holes : fallbackHoles.filter((hole) => String(hole.course_id) === String(displayCourseId))).sort((a, b) => Number(a.hole_number) - Number(b.hole_number));

    const buildSummary = (checkpoint) => {
      const summaryKey = `round_summary_${roundId}_${myPlayerId}_${checkpoint}`;
      if ((roundSummaryDismissedKeys || []).includes(summaryKey)) return null;

      const checkpointHoles = sortedHoles.filter((hole) => Number(hole.hole_number) <= checkpoint);
      if (checkpointHoles.length < checkpoint) return null;

      const rows = checkpointHoles.map((hole) => {
        const score = officialScores.find((item) =>
          String(item.round_id || "") === String(roundId) &&
          String(item.player_id || "") === String(myPlayerId) &&
          Number(item.hole_number) === Number(hole.hole_number)
        );
        const shots = getShotsOnHole(player.course_hcp, hole.hcp);
        const grossStableford = score ? getScoreStablefordPoints(score, hole.par, 0) : 0;
        const netStableford = score ? getScoreStablefordPoints(score, hole.par, shots) : 0;
        const strokes = score && score.strokes !== "" && score.strokes != null ? Number(score.strokes || 0) : null;
        const putts = score && score.putts_count !== "" && score.putts_count != null ? Number(score.putts_count || 0) : 0;
        const gir = strokes != null && !normalizeBoolean(score?.picked_up) ? strokes - putts <= Number(hole.par || 0) - 2 : false;
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
        girCount,
        pickedUp,
      };
    };

    return buildSummary(9) || buildSummary(18);
  }, [myPlayerId, displayedActiveRound?.round_id, visiblePlayers, allPlayers, displayCourseId, courses, holes, officialScores, roundSummaryDismissedKeys]);
  const roundsWithLocalPendingScores = useMemo(() => {
    const roundIds = new Set();
    [...(pendingScores || []), ...(localScoreDrafts || [])].forEach((score) => {
      const roundId = String(score?.round_id || "");
      if (roundId && isValidScorePayload(score)) roundIds.add(roundId);
    });
    return Array.from(roundIds);
  }, [pendingScores, localScoreDrafts]);
  const roundsWithPalantirMismatches = useMemo(() => {
    const roundIds = new Set();
    (getQualificationRounds(rounds) || []).forEach((round) => {
      const roundId = String(round?.round_id || "");
      if (!roundId) return;
      const playersForRound = getRoundPlayers(roundId, allPlayers, roundPlayers);
      const mismatchesForRound = getMismatchesForRound(officialAllScores, roundId, playersForRound);
      if (mismatchesForRound.length) roundIds.add(roundId);
    });
    return Array.from(roundIds);
  }, [rounds, allPlayers, roundPlayers, officialAllScores]);
  const roundsBlockedForHonor = useMemo(() => Array.from(new Set([...(roundsWithLocalPendingScores || []), ...(roundsWithPalantirMismatches || [])])), [roundsWithLocalPendingScores, roundsWithPalantirMismatches]);
  const displayedRoundHonorCelebration = useMemo(() => getRoundHonorCelebration(allPlayers, rounds, allHoles, officialAllScores, roundPlayers, roundHonorDismissedKeys, roundsBlockedForHonor), [allPlayers, rounds, allHoles, officialAllScores, roundPlayers, roundHonorDismissedKeys, roundsBlockedForHonor]);
  const myRoundHonorRole = useMemo(() => {
    if (!displayedRoundHonorCelebration || !myPlayerId) return "neutral";
    if (displayedRoundHonorCelebration.lords.some((player) => String(player.id) === String(myPlayerId))) return "lord";
    if (displayedRoundHonorCelebration.butlers.some((player) => String(player.id) === String(myPlayerId))) return "shieldbearer";
    return "neutral";
  }, [displayedRoundHonorCelebration, myPlayerId]);
  const roundHonorPersonalMessage = displayedRoundHonorCelebration?.hasPlayoff
    ? "Gleichstand am Hofe Gondors: Erst das Entscheidungsputten klärt die offenen Rollen."
    : myRoundHonorRole === "lord"
      ? `Du bist ${displayedRoundHonorCelebration?.lords?.length === 1 ? "Herr" : "einer der Herren"} von Gondor.`
      : myRoundHonorRole === "shieldbearer"
        ? "Du bist Schildträger im Dienst der Herren von Gondor. Dein Eid ist gesprochen — fortan schützt du Krone, Ehre und sehr fragile Nerven."
        : "Du bleibst freier Gefährte. Beobachte Herren und Schildträger mit Würde — und sei froh, dass dein Eid heute nicht gefordert wird.";
  const roundHonorCloseLabel = myRoundHonorRole === "lord" ? "Krone richten ×" : myRoundHonorRole === "shieldbearer" ? "Schild aufnehmen ×" : "Erlass zur Kenntnis nehmen ×";
  const finalWinnerCelebration = useMemo(() => getFinalWinnerCelebration(allPlayers, rounds, allHoles, officialAllScores, roundPlayers, courses), [allPlayers, rounds, allHoles, officialAllScores, roundPlayers, courses]);
  const finalWinnerPopupKey = finalWinnerCelebration ? `${finalWinnerCelebration.roundId}_${finalWinnerCelebration.winner?.id || "winner"}` : "";
  const showFinalWinnerPopup = Boolean(finalWinnerCelebration && finalWinnerPopupKey !== winnerPopupDismissedKey);
  const showRoundHonorPopup = Boolean(displayedRoundHonorCelebration && !showFinalWinnerPopup && !roundSummaryPopup);
  const identityFlowActive = !showSplash && (!appLocked || lockAdminBypass);
  const myPlayerIsKnown = Boolean(myPlayerId && ([...(visiblePlayers || []), ...(allPlayers || [])].some((player) => String(player.id) === String(myPlayerId))));
  const showDevicePlayerGate = Boolean(identityFlowActive && (!myPlayerIsKnown || forceMyPlayerPromptOpen));
  const lockCountdown = useMemo(() => {
    const diffMs = Math.max(0, LOCK_COUNTDOWN_TARGET.getTime() - (lockCountdownNow.getTime() + serverTimeOffsetMs));
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  }, [lockCountdownNow, serverTimeOffsetMs]);
  const flightDrawCountdown = useMemo(() => {
    const diffMs = Math.max(0, FLIGHT_DRAW_TARGET.getTime() - (lockCountdownNow.getTime() + serverTimeOffsetMs));
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  }, [lockCountdownNow, serverTimeOffsetMs]);
  const atomicTimeActive = ["itime.live", "itime.live-vercel"].includes(String(lastServerSync?.source || "")) && atomicTimeStatus === "online";
  const syncedNow = useMemo(() => new Date(lockCountdownNow.getTime() + (atomicTimeActive ? serverTimeOffsetMs : 0)), [lockCountdownNow, serverTimeOffsetMs, atomicTimeActive]);
  const getSyncedNowMs = () => Date.now() + (atomicTimeActive ? serverTimeOffsetMs : 0);
  const flightDrawUnlocked = atomicTimeActive && syncedNow.getTime() >= FLIGHT_DRAW_TARGET.getTime();
  const flightCeremonyTimeline = useMemo(() => buildFlightCeremonyTimeline(flightDraw), [flightDraw]);
  const unlockedTeamDrawRoundIds = useMemo(() => atomicTimeActive ? Object.entries(TEAM_DRAW_TARGETS).filter(([, target]) => syncedNow.getTime() >= target.getTime()).map(([roundId]) => roundId) : [], [syncedNow, atomicTimeActive]);
  function buildRealTeamCeremonyTimeline(roundId) {
    const rows = (teamDrawRows || []).filter((row) => String(row.round_id || row.roundId || row.round || "") === String(roundId));
    if (!roundId || !rows.length) return buildTeamCeremonyTimeline(roundId);
    const round = (rounds.length ? rounds : fallbackRounds).find((item) => String(item.round_id) === String(roundId));
    const teamMap = { A: [], B: [], C: [] };
    rows.forEach((row) => {
      const teamId = String(row.team_number || row.team_id || "").toUpperCase();
      if (!teamMap[teamId]) teamMap[teamId] = [];
      teamMap[teamId].push(row);
    });

    const playerLabel = (row) => {
      const alias = row?.player_alias || row?.alias_name || "";
      const name = row?.player_name || row?.character_name || row?.display_name || row?.player_id || row?.id || "";
      return alias ? `${alias} (${name})` : name;
    };
    const teamPlayersText = (team) => (team.players || []).map(playerLabel).filter(Boolean).join(" und ") || `Team ${team.teamId}`;

    const standingData = buildDailyTeamStandings(roundId, true);
    const standingMap = new Map((standingData?.teams || []).map((team) => [String(team.teamId || team.team_id || "").toUpperCase(), team]));
    const teamsByLetter = ["A", "B", "C"].map((teamId) => {
      const standing = standingMap.get(teamId) || { teamId, value: 0, detail: "noch ohne Wertung" };
      return { ...standing, teamId, players: teamMap[teamId] || [] };
    });
    const rankedTeams = teamsByLetter.slice().sort((a, b) => Number(b.value || 0) - Number(a.value || 0) || String(a.teamId).localeCompare(String(b.teamId)));
    rankedTeams.forEach((team, index) => {
      team.ceremonyRank = getCompetitionRank(rankedTeams, index, (item) => Number(item.value || 0));
      team.ceremonyRankLabel = formatCompetitionRank(rankedTeams, index, (item) => Number(item.value || 0));
    });
    const resultRevealTeams = rankedTeams.slice().sort((a, b) => Number(b.ceremonyRank || 0) - Number(a.ceremonyRank || 0) || String(a.teamId).localeCompare(String(b.teamId)));

    const modeText = String(roundId) === "r3"
      ? "Vor den Toren Mordors wird Loch für Loch gerichtet. Wer das bessere Netto-Ergebnis bringt, nimmt das Loch — bei Gleichstand wird geteilt."
      : String(roundId) === "r2"
        ? "Runde zwei führt durch die Minen. Heute zählt pro Loch nur der bessere Ball."
        : "Der erste Tag ist geschlagen. Heute zählt die rohe Macht der Netto-Punkte.";
    const rankTexts = {
      1: "Dieses Bündnis steht oben auf dem Pergament.",
      2: "Dieses Bündnis hält die Mitte — gefährlich genug, um noch darüber zu reden.",
      3: "Dieses Bündnis trägt die Last des Tages. Der Palantír hat alles gesehen.",
    };

    const steps = [
      { type: "text", title: String(roundId) === "r3" ? "Die Bündnisse vor Mordor" : "Die Bündnisse des Tages", text: `${getRoundChapterLabel(round)} ist geschlagen. Der Rat öffnet das versiegelte Pergament der Tageswertung.`, waitLabel: "Das Pergament wird entrollt ..." },
      { type: "text", title: "Die Mannschaften werden offenbart", text: `${modeText} Zuerst werden nur die Bündnisse gezogen. Die Wertung bleibt noch im Schatten, bis alle Namen gefallen sind.`, waitLabel: "Die Bündnisse werden entrollt ..." },
      { type: "teamBoard", title: "Drei leere Banner", teams: teamsByLetter, revealCounts: { A: 0, B: 0, C: 0 }, revealLine: "Drei Banner werden erhoben. Noch ist kein Name sichtbar. Der Palantír sammelt Atem.", waitLabel: "Die ersten Namen werden gerufen ..." },
      { type: "teamBoard", title: "Die ersten Namen fallen", teams: teamsByLetter, revealCounts: { A: 1, B: 0, C: 0 }, revealLine: "Das erste Siegel bricht. Ein Name tritt aus dem Pergament.", waitLabel: "Team A erhält den ersten Gefährten ..." },
      { type: "teamBoard", title: "Die ersten Namen fallen", teams: teamsByLetter, revealCounts: { A: 1, B: 1, C: 0 }, revealLine: "Das Pergament wandert weiter. Auch Team B wird berufen.", waitLabel: "Team B erhält den ersten Gefährten ..." },
      { type: "teamBoard", title: "Die ersten Namen fallen", teams: teamsByLetter, revealCounts: { A: 1, B: 1, C: 1 }, revealLine: "Das dritte Fenster glimmt. Team C bekommt seinen ersten Namen.", waitLabel: "Team C erhält den ersten Gefährten ..." },
      { type: "text", title: "Die halben Bündnisse stehen", text: "Drei Namen sind gefallen. Drei Schatten fehlen noch. Der Rat tuschelt, der Palantír glimmt, und irgendwo rechnet jemand bereits heimlich Netto-Punkte nach.", waitLabel: "Die zweiten Siegel werden vorbereitet ..." },
      { type: "teamBoard", title: "Die zweiten Siegel warten", teams: teamsByLetter, revealCounts: { A: 1, B: 1, C: 1 }, revealLine: "Noch bleibt jedes Banner halb gefüllt. Kein zweiter Name ist gefallen — der Palantír lässt den Moment kurz hängen.", waitLabel: "Der zweite Name nähert sich ..." },
      { type: "teamBoard", title: "Die Bündnisse schließen sich", teams: teamsByLetter, revealCounts: { A: 2, B: 1, C: 1 }, revealLine: "Das zweite Siegel glimmt. Team A wird vollständig.", waitLabel: "Team A wird vollständig ..." },
      { type: "teamBoard", title: "Die Bündnisse schließen sich", teams: teamsByLetter, revealCounts: { A: 2, B: 2, C: 1 }, revealLine: "Ein weiterer Name fällt. Team B ist nun vollständig.", waitLabel: "Team B wird vollständig ..." },
      { type: "teamBoard", title: "Die Bündnisse schließen sich", teams: teamsByLetter, revealCounts: { A: 2, B: 2, C: 2 }, revealLine: "Das letzte Siegel bricht. Auch Team C steht nun vollständig im Licht.", waitLabel: "Alle Bündnisse sind offenbart ..." },
    ];

    if (String(roundId) === "r3") {
      steps.push(...buildRealRound3HoleRevealSteps(roundId));
    } else {
      steps.push({ type: "text", title: "Alle Bündnisse sind offenbart", text: "Die Namen sind gefallen. Nun richtet der Palantír die Teams nach ihrer Tageswertung.", waitLabel: "Die Rangfolge wird enthüllt ..." });
    }

    resultRevealTeams.forEach((team) => {
      const rank = Number(team.ceremonyRank || 0);
      const rankLabel = team.ceremonyRankLabel || String(rank);
      steps.push({ type: "teamResult", title: `${rankLabel}. Platz`, text: `Auf Platz ${rankLabel} landen ${teamPlayersText(team)} mit ${team.detail}. ${rankTexts[rank] || "Das Schicksal hat gesprochen."}`, teamId: team.teamId, rank, detail: team.detail, waitLabel: "Die Chronisten notieren ..." });
    });

    steps.push({ type: "text", title: "Die Teams sind gesprochen", text: "Die Bündnisse stehen. Die Rangfolge ist bekannt. Wer nun klagt, möge dies mit Netto-Punkten widerlegen.", waitLabel: "Die Chronik wird versiegelt ..." });
    return steps;
  }

  const teamCeremonyTimeline = useMemo(() => ensureSecondSealWaitStep(teamCeremonyTestMode && String(teamCeremonyRoundId) === "r3" ? buildDummyRound3TeamCeremonyTimeline() : buildRealTeamCeremonyTimeline(teamCeremonyRoundId)), [teamCeremonyTestMode, teamCeremonyRoundId, teamDrawRows, allPlayers, officialAllScores, rounds, roundPlayers, allHoles]);
  const isTeamDrawRoundVisible = (roundId) => {
    const key = `team_ceremony_${roundId}`;
    return Boolean((teamCeremonyDismissedKeys || []).includes(key));
  };

  useEffect(() => { writeLocalJson("lordOfTheHoles.myPlayerId", myPlayerId); }, [myPlayerId]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.scoredPlayerId", scoredPlayerId); }, [scoredPlayerId]);
  useEffect(() => {
    scoredPlayerByRoundRef.current = scoredPlayerByRound;
    writeLocalJson("lordOfTheHoles.scoredPlayerByRound", scoredPlayerByRound);
  }, [scoredPlayerByRound]);
  useEffect(() => {
    selectedActiveRoundIdRef.current = selectedActiveRoundId;
    writeLocalJson("lordOfTheHoles.selectedActiveRoundId", selectedActiveRoundId);
  }, [selectedActiveRoundId]);
  useEffect(() => { pendingScoresRef.current = pendingScores; writeLocalJson("lordOfTheHoles.pendingScores", pendingScores); }, [pendingScores]);
  useEffect(() => { localScoreDraftsRef.current = localScoreDrafts; writeLocalJson("lordOfTheHoles.localScoreDrafts", localScoreDrafts); }, [localScoreDrafts]);
  useEffect(() => { scoresRef.current = scores; }, [scores]);
  useEffect(() => { allScoresRef.current = allScores; }, [allScores]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.appLocked", appLocked); }, [appLocked]);
  useEffect(() => { lockAdminBypassRef.current = lockAdminBypass; }, [lockAdminBypass]);
  useEffect(() => () => {
    if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current);
  }, []);
  useEffect(() => { writeLocalJson("lordOfTheHoles.deviceAssignmentsResetAt", deviceAssignmentsResetAt); }, [deviceAssignmentsResetAt]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.scoresResetAt", scoresResetAt); }, [scoresResetAt]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.fullResetAt", fullResetAt); }, [fullResetAt]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.winnerPopupDismissedKey", winnerPopupDismissedKey); }, [winnerPopupDismissedKey]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.roundHonorDismissedKeys", roundHonorDismissedKeys); }, [roundHonorDismissedKeys]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.scorecardRoundId", scorecardRoundId); }, [scorecardRoundId]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.roundTableRoundId", roundTableRoundId); }, [roundTableRoundId]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.dailyTeamSelections", dailyTeamSelections); }, [dailyTeamSelections]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.openTeamHoleDetails", openTeamHoleDetails); }, [openTeamHoleDetails]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.openMenuGroups", openMenuGroups); }, [openMenuGroups]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.teamCeremonyDismissedKeys", teamCeremonyDismissedKeys); }, [teamCeremonyDismissedKeys]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.prizeSettings", prizeSettings); }, [prizeSettings]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.roundSummaryDismissedKeys", roundSummaryDismissedKeys); }, [roundSummaryDismissedKeys]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.adminScoreEntryUnlocks", adminScoreEntryUnlocks); }, [adminScoreEntryUnlocks]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.zeroNetTributeDismissedKeys", zeroNetTributeDismissedKeys); }, [zeroNetTributeDismissedKeys]);
  useEffect(() => { writeLocalJson(FLIGHT_DRAW_STORAGE_KEY, flightDraw); }, [flightDraw]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.flightCeremonyCompleted", flightCeremonyCompleted); }, [flightCeremonyCompleted]);
  useEffect(() => { writeLocalJson("lordOfTheHoles.flightSummaryOpen", flightSummaryOpen); }, [flightSummaryOpen]);
  useEffect(() => {
    writeLocalJson("lordOfTheHoles.cachedState", { players, allPlayers, courses, rounds, roundPlayers, activeRound, holes, allHoles, scores, allScores, pendingScores, selectedCourseId, selectedActiveRoundId, flightDraw, teamDrawRows, cachedAt: new Date().toISOString() });
  }, [players, allPlayers, courses, rounds, roundPlayers, activeRound, holes, allHoles, scores, allScores, pendingScores, selectedCourseId, selectedActiveRoundId, flightDraw, teamDrawRows]);
  useEffect(() => { introAudioRef.current = new Audio("/intro-sound.mp3"); introAudioRef.current.preload = "auto"; introAudioRef.current.loop = false; }, []);
  useEffect(() => { if (!autoSync) return undefined; loadData({ silent: true }); const timer = setInterval(() => loadData({ silent: true }), 30000); return () => clearInterval(timer); }, [autoSync]);
  // Scores werden bewusst nicht mehr laufend synchronisiert.
  // Jede Eingabe wird lokal gespeichert und erst beim Klick auf "nächstes Loch" zur Datenbank übertragen.
  useEffect(() => {
    if (!selectedActiveRoundId) return;
    const selectedRoundScores = allScores.filter((score) => String(score.round_id || "") === String(selectedActiveRoundId));
    const selectedPendingScores = pendingScoresRef.current.filter((score) => String(score.round_id || "") === String(selectedActiveRoundId));
    const selectedLocalDrafts = localScoreDraftsRef.current.filter((score) => String(score.round_id || "") === String(selectedActiveRoundId));
    const mergedRoundScores = mergeScoresPreservingPending(selectedRoundScores, selectedPendingScores, selectedLocalDrafts);
    setScores(mergedRoundScores);
    const autoHoleTargetKey = `${selectedActiveRoundId}|${scoredPlayerId}`;
    if (lastAutoHoleTargetRef.current !== autoHoleTargetKey) {
      lastAutoHoleTargetRef.current = autoHoleTargetKey;
      setActiveHole(getFirstUnscoredHole(mergedRoundScores, selectedActiveRoundId, scoredPlayerId, 1, myPlayerId));
    }
  }, [selectedActiveRoundId, allScores, scoredPlayerId, myPlayerId]);
  useEffect(() => {
    const timer = window.setInterval(() => setLockCountdownNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    syncAtomicTime();
    const timer = window.setInterval(() => syncAtomicTime(), 5 * 60 * 1000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") syncAtomicTime();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  function getFlightCeremonyStepDuration(step) {
    const completedRevealPlayers = step?.type === "reveal"
      ? (step.roundPlan?.flights || []).reduce((sum, flight) => sum + (flight.players || []).length, 0)
      : 0;
    const revealIsComplete = step?.type === "reveal" && Number(step.revealCount || 0) >= completedRevealPlayers;
    const textLength = String(step?.text || "").length;
    const relaxedReadingDelay = Math.max(4200, Math.min(9800, 2400 + textLength * 34));
    return step?.type === "reveal" ? (revealIsComplete ? 4300 : 1550) : relaxedReadingDelay;
  }

  function getNextSyncedFlightCeremonyStart(timeline = [], forceImmediate = false) {
    const now = getSyncedNowMs();
    if (!forceImmediate && now < FLIGHT_DRAW_TARGET.getTime()) return FLIGHT_DRAW_TARGET.toISOString();
    const totalDuration = (timeline || []).reduce((sum, step) => sum + getFlightCeremonyStepDuration(step), 0);
    if (!forceImmediate && totalDuration > 0 && now - FLIGHT_DRAW_TARGET.getTime() < totalDuration) return FLIGHT_DRAW_TARGET.toISOString();
    const nextBoundary = Math.ceil((now + 2500) / 10000) * 10000;
    return new Date(nextBoundary).toISOString();
  }

  function getSyncedFlightCeremonyIndex(timeline, syncStartAt) {
    const startMs = Date.parse(syncStartAt || "");
    if (!timeline.length || Number.isNaN(startMs)) return 0;
    const elapsed = getSyncedNowMs() - startMs;
    if (elapsed <= 0) return 0;
    let cursor = 0;
    for (let index = 0; index < timeline.length; index += 1) {
      cursor += getFlightCeremonyStepDuration(timeline[index]);
      if (elapsed < cursor) return index;
    }
    return timeline.length;
  }

  useEffect(() => {
    if (!flightCeremonyRunning) return undefined;
    const timeline = flightCeremonyTimeline;
    if (!timeline.length) return undefined;
    const timer = window.setInterval(() => {
      const syncedIndex = getSyncedFlightCeremonyIndex(timeline, flightCeremonySyncStartAt);
      if (syncedIndex >= timeline.length) {
        setFlightCeremonyRunning(false);
        setFlightCeremonyCompleted(true);
        setFlightSummaryOpen(false);
        setFlightCeremonyStepIndex(0);
        setFlightCeremonySyncStartAt("");
        return;
      }
      setFlightCeremonyStepIndex(syncedIndex);
    }, 250);
    return () => window.clearInterval(timer);
  }, [flightCeremonyRunning, flightCeremonyTimeline, flightCeremonySyncStartAt, serverTimeOffsetMs]);

  function getTeamCeremonyStepDuration(step) {
  if (!step) return 3200;
  if (step.type === "holeReveal") return 9500;
  return 3600;
}

function ensureSecondSealWaitStep(timeline = []) {
  const steps = Array.isArray(timeline) ? [...timeline] : [];
  const halfIndex = steps.findIndex((step) => String(step?.title || "") === "Die halben Bündnisse stehen");
  if (halfIndex < 0) return steps;
  const nextStep = steps[halfIndex + 1];
  if (String(nextStep?.title || "") === "Die zweiten Siegel warten") return steps;
  const teamSourceStep = steps.find((step) => step?.type === "teamBoard" && step?.teams?.length) || nextStep;
  const waitStep = {
    type: "teamBoard",
    testMode: Boolean(steps[halfIndex]?.testMode || teamSourceStep?.testMode),
    title: "Die zweiten Siegel warten",
    teams: teamSourceStep?.teams || [],
    revealCounts: { A: 1, B: 1, C: 1 },
    revealLine: "Noch bleibt jedes Banner halb gefüllt. Kein zweiter Name ist gefallen — der Palantír lässt den Moment kurz hängen.",
    waitLabel: "Der zweite Name nähert sich ...",
  };
  steps.splice(halfIndex + 1, 0, waitStep);
  return steps;
}

}

export default function LordOfTheHolesPWA() {
  return (
    <AppErrorBoundary>
      <LordOfTheHolesApp />
    </AppErrorBoundary>
  );
}
