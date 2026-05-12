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
            <div className="font-serif text-xl text-red-100">App-Fehler</div>
            <p className="mt-2 text-sm text-red-100/80">
              Die App konnte nicht vollständig geladen werden. Bitte diese Meldung oder den Konsolenfehler schicken.
            </p>
            <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-black/40 p-3 text-xs text-red-100">
              {String(this.state.error?.message || this.state.error)}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const GOOGLE_SHEETS_API_URL =
  "https://script.google.com/macros/s/AKfycbz2Gn8dQ4jqvDr6r1LoTSrJ7YttJ5bWH-3BdT3IvQfga8b3SDeAdheItnwUO3uxKEnk/exec";

const ADMIN_PASSWORD = "weimar";

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
  { round_id: "r1", round_name: "Runde 1", course_id: "", status: "active", stage: "qualification", sort_order: 1 },
  { round_id: "r2", round_name: "Runde 2", course_id: "", status: "upcoming", stage: "qualification", sort_order: 2 },
  { round_id: "r3", round_name: "Runde 3", course_id: "", status: "upcoming", stage: "qualification", sort_order: 3 },
  { round_id: "r4", round_name: "Finaltag", course_id: "", status: "upcoming", stage: "final", sort_order: 4 },
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
];

function cls(...items) {
  return items.filter(Boolean).join(" ");
}

function Icon({ children, className = "", size = 18, spin = false }) {
  return (
    <span
      aria-hidden="true"
      className={cls("inline-flex items-center justify-center leading-none", spin && "animate-spin", className)}
      style={{ width: size, height: size, fontSize: size }}
    >
      {children}
    </span>
  );
}

function normalizeBoolean(value) {
  return value === true || String(value).toLowerCase().trim() === "true" || String(value).toLowerCase().trim() === "ja" || String(value).trim() === "1";
}

function cleanNumericInput(value) {
  return String(value ?? "").replace(/[^0-9]/g, "");
}

function cleanHandicapInput(value) {
  const normalized = String(value ?? "")
    .replace(",", ".")
    .replace(/[^0-9.-]/g, "");
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
  const validHoles = Array.isArray(rawHoles)
    ? rawHoles.filter((h) => Number(h.hole_number) > 0 && Number(h.par) > 0 && Number(h.hcp) > 0)
    : [];
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

function roundPlayingHandicap(value) {
  return Math.round(Number(value || 0));
}

function calculatePlayingHandicap(handicapIndex, course) {
  const hcpIndex = Number(String(handicapIndex ?? "0").replace(",", ".") || 0);
  const slope = Number(course?.slope_rating || 113);
  const courseRating = Number(course?.course_rating || course?.rating || course?.cr || course?.par || 72);
  const par = Number(course?.par || 72);
  return roundPlayingHandicap(hcpIndex * (slope / 113) + (courseRating - par));
}

function getHandicapIndex(player) {
  const rawValue = player?.handicap_index ?? player?.dgv_hcp ?? player?.hcp_index ?? "";
  if (rawValue === "" || rawValue == null) return null;
  const parsed = Number(String(rawValue).replace(",", "."));
  return Number.isNaN(parsed) ? null : parsed;
}

function getCourseHandicap(player, courseId = "goethe", courses = fallbackCourses) {
  const handicapIndex = getHandicapIndex(player);
  if (handicapIndex != null) {
    return calculatePlayingHandicap(handicapIndex, getCourseSettings(courseId, courses));
  }

  const normalizedCourseId = String(courseId || "goethe").toLowerCase().trim();
  if (normalizedCourseId === "feininger") return Number(player?.course_hcp_feininger ?? 0);
  return Number(player?.course_hcp_goethe ?? 0);
}

function getPlayerForCourse(player, courseId = "goethe", courses = fallbackCourses) {
  if (!player) return null;
  return {
    ...withFallbackAlias(player),
    course_hcp: getCourseHandicap(player, courseId, courses),
  };
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

function getPickedUpStrokes(player, hole, courseId = "goethe") {
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

function getRoundCourse(round, courses) {
  return (courses || fallbackCourses).find((course) => String(course.course_id) === String(round?.course_id));
}

function getRoundHoles(round, holes) {
  if (!round?.course_id) return [];
  return (holes || [])
    .filter((hole) => String(hole.course_id) === String(round.course_id))
    .sort((a, b) => Number(a.hole_number) - Number(b.hole_number));
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

function buildPlayerStats(players, holes, scores) {
  return (players || []).map((p) => {
    const playerScores = (scores || []).filter((s) => String(s.player_id) === String(p.id) && s.strokes !== "" && s.strokes != null);
    const played = playerScores.length;
    const total = playerScores.reduce((sum, s) => sum + Number(s.strokes || 0), 0);
    const parPlayed = playerScores.reduce((sum, s) => {
      const hole = (holes || []).find((h) => Number(h.hole_number) === Number(s.hole_number));
      return sum + Number(hole?.par || 0);
    }, 0);
    const { threePutts, fourPlusPutts, overTwoPutts } = getPuttBuckets(playerScores);
    const netStableford = playerScores.reduce((sum, s) => {
      const hole = (holes || []).find((h) => Number(h.hole_number) === Number(s.hole_number));
      const shots = getShotsOnHole(p.course_hcp, hole?.hcp);
      return sum + getScoreStablefordPoints(s, hole?.par, shots);
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

    return {
      ...withFallbackAlias(p),
      played,
      total,
      toPar: total - parPlayed,
      hcpShotsUsed,
      hcpAdjustedTotal,
      hcpAdjustedToPar,
      overTwoPutts,
      threePutts,
      fourPlusPutts,
      puttPenaltyEuro: threePutts * 2 + fourPlusPutts * 4,
      ladyCount,
      netStableford,
      grossStableford,
    };
  });
}

function sortStrokePlay(stats) {
  return [...(stats || [])].sort((a, b) => {
    if (a.played === 0 && b.played > 0) return 1;
    if (b.played === 0 && a.played > 0) return -1;
    return a.toPar - b.toPar || b.played - a.played || Number(a.sort_order || 0) - Number(b.sort_order || 0);
  });
}

function sortStableford(stats, fieldName) {
  return [...(stats || [])].sort((a, b) => {
    if (a.played === 0 && b.played > 0) return 1;
    if (b.played === 0 && a.played > 0) return -1;
    return Number(b[fieldName] || 0) - Number(a[fieldName] || 0) || b.played - a.played || Number(a.sort_order || 0) - Number(b.sort_order || 0);
  });
}

function sortHcpAdjustedStrokePlay(stats) {
  return [...(stats || [])].sort((a, b) => {
    if (a.played === 0 && b.played > 0) return 1;
    if (b.played === 0 && a.played > 0) return -1;
    return Number(a.hcpAdjustedToPar || 0) - Number(b.hcpAdjustedToPar || 0) || Number(a.hcpAdjustedTotal || 0) - Number(b.hcpAdjustedTotal || 0) || b.played - a.played || Number(a.sort_order || 0) - Number(b.sort_order || 0);
  });
}

function sortPuttPenalties(stats) {
  return [...(stats || [])].sort((a, b) => Number(b.puttPenaltyEuro || 0) - Number(a.puttPenaltyEuro || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function sortLadyCounts(stats) {
  return [...(stats || [])].sort((a, b) => Number(b.ladyCount || 0) - Number(a.ladyCount || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function getScoreDiffToPar(score, hole) {
  if (!score || score.strokes === "" || score.strokes == null) return null;
  return Number(score.strokes || 0) - Number(hole?.par || 0);
}

function buildFunPlayerStats(players, holes, scores) {
  return (players || []).map((player) => {
    const playerScores = (scores || []).filter((score) => String(score.player_id) === String(player.id) && score.strokes !== "" && score.strokes != null);
    const enrichedScores = playerScores.map((score) => {
      const hole = (holes || []).find((item) => Number(item.hole_number) === Number(score.hole_number));
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

    const birdies = enrichedScores.filter((item) => item.diff === -1 && !normalizeBoolean(item.score.picked_up)).length;
    const eaglesOrBetter = enrichedScores.filter((item) => item.diff != null && item.diff <= -2 && !normalizeBoolean(item.score.picked_up)).length;
    const pars = enrichedScores.filter((item) => item.diff === 0 && !normalizeBoolean(item.score.picked_up)).length;
    const parOrBetter = enrichedScores.filter((item) => item.diff != null && item.diff <= 0 && !normalizeBoolean(item.score.picked_up)).length;
    const doubleBogeyPlus = enrichedScores.filter((item) => item.diff != null && item.diff >= 2).length;
    const triplePlus = enrichedScores.filter((item) => item.diff != null && item.diff >= 3).length;
    const pickedUpCount = enrichedScores.filter((item) => normalizeBoolean(item.score.picked_up)).length;
    const ladyCount = enrichedScores.filter((item) => normalizeBoolean(item.score.lady)).length;
    const { threePutts, fourPlusPutts } = getPuttBuckets(playerScores);
    const grossStableford = enrichedScores.reduce((sum, item) => sum + getScoreStablefordPoints(item.score, item.hole.par, 0), 0);
    const netStableford = enrichedScores.reduce((sum, item) => {
      const shots = getShotsOnHole(player.course_hcp, item.hole.hcp);
      return sum + getScoreStablefordPoints(item.score, item.hole.par, shots);
    }, 0);
    const hcpBonus = netStableford - grossStableford;
    const hcpShotsUsed = enrichedScores.reduce((sum, item) => sum + getShotsOnHole(player.course_hcp, item.hole.hcp), 0);

    return {
      ...withFallbackAlias(player),
      played: enrichedScores.length,
      birdies,
      eaglesOrBetter,
      pars,
      parOrBetter,
      doubleBogeyPlus,
      triplePlus,
      pickedUpCount,
      ladyCount,
      threePutts,
      fourPlusPutts,
      puttPenaltyEuro: threePutts * 2 + fourPlusPutts * 4,
      frontTotal,
      backTotal,
      frontToPar,
      backToPar,
      backMinusFront,
      grossStableford,
      netStableford,
      hcpBonus,
      hcpShotsUsed,
      pointsPerHcpShot: hcpShotsUsed ? Number((netStableford / hcpShotsUsed).toFixed(2)) : 0,
    };
  });
}

function buildFunHoleStats(players, holes, scores) {
  return (holes || []).map((hole) => {
    const holeScores = (scores || []).filter((score) => Number(score.hole_number) === Number(hole.hole_number) && score.strokes !== "" && score.strokes != null);
    const played = holeScores.length;
    const totalStrokes = holeScores.reduce((sum, score) => sum + Number(score.strokes || 0), 0);
    const avgScore = played ? totalStrokes / played : 0;
    const avgToPar = played ? avgScore - Number(hole.par || 0) : 0;
    const birdies = holeScores.filter((score) => getScoreDiffToPar(score, hole) === -1 && !normalizeBoolean(score.picked_up)).length;
    const pars = holeScores.filter((score) => getScoreDiffToPar(score, hole) === 0 && !normalizeBoolean(score.picked_up)).length;
    const pickedUpCount = holeScores.filter((score) => normalizeBoolean(score.picked_up)).length;
    const ladies = holeScores.filter((score) => normalizeBoolean(score.lady)).length;
    const snakes = holeScores.filter((score) => normalizeBoolean(score.over_two_putts)).length;
    return {
      hole_number: hole.hole_number,
      par: hole.par,
      hcp: hole.hcp,
      played,
      avgScore,
      avgToPar,
      birdies,
      pars,
      pickedUpCount,
      ladies,
      snakes,
    };
  }).filter((item) => item.played > 0);
}

function buildScorerMismatchStats(mismatches, players) {
  const playerMap = new Map((players || []).map((player) => [String(player.id), withFallbackAlias(player)]));
  const stats = new Map();

  (players || []).forEach((player) => {
    stats.set(String(player.id), {
      ...withFallbackAlias(player),
      asPlayer: 0,
      asScorer: 0,
      total: 0,
    });
  });

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
  return (rounds?.length ? rounds : fallbackRounds)
    .filter((round) => String(round.stage || "qualification") === "qualification")
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .slice(0, 3);
}

function getPuttKasseRounds(rounds) {
  return (rounds?.length ? rounds : fallbackRounds).sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)).slice(0, 4);
}

function getFinalRound(rounds) {
  return (rounds?.length ? rounds : fallbackRounds).find((round) => String(round.round_id) === "r4") || (rounds?.length ? rounds : fallbackRounds).find((round) => String(round.stage) === "final") || fallbackRounds[3];
}

function buildTournamentNetStandings(players, rounds, holes, scores) {
  const qualificationRounds = getQualificationRounds(rounds);
  return (players || [])
    .map((player) => {
      const roundResults = qualificationRounds.map((round) => {
        const roundHoles = getRoundHoles(round, holes);
        const roundScores = (scores || []).filter((score) => String(score.round_id) === String(round.round_id) && String(score.player_id) === String(player.id));
        const playerForRound = getPlayerForCourse(player, round.course_id || "goethe");
        const netStableford = roundScores.reduce((sum, score) => {
          const hole = roundHoles.find((h) => Number(h.hole_number) === Number(score.hole_number));
          const shots = getShotsOnHole(playerForRound.course_hcp, hole?.hcp);
          return sum + getScoreStablefordPoints(score, hole?.par, shots);
        }, 0);
        return { round_id: round.round_id, round_name: round.round_name, points: netStableford, played: roundScores.filter((score) => score.strokes !== "" && score.strokes != null).length };
      });
      const playedResults = roundResults.filter((result) => result.played > 0);
      const sortedPlayed = [...playedResults].sort((a, b) => Number(b.points || 0) - Number(a.points || 0));
      const counted = sortedPlayed.slice(0, 2);
      const dropped = sortedPlayed.slice(2, 3)[0] || null;
      return { ...withFallbackAlias(player), roundResults, countedRoundIds: counted.map((result) => result.round_id), droppedRoundId: dropped?.round_id || "", totalBestTwo: counted.reduce((sum, result) => sum + Number(result.points || 0), 0), roundsPlayed: playedResults.length };
    })
    .sort((a, b) => Number(b.totalBestTwo || 0) - Number(a.totalBestTwo || 0) || Number(b.roundsPlayed || 0) - Number(a.roundsPlayed || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function buildTournamentPuttStandings(players, rounds, scores) {
  const puttRounds = getPuttKasseRounds(rounds);
  return (players || [])
    .map((player) => {
      const roundResults = puttRounds.map((round) => {
        const roundScores = (scores || []).filter((score) => String(score.round_id) === String(round.round_id) && String(score.player_id) === String(player.id));
        const buckets = getPuttBuckets(roundScores);
        return { round_id: round.round_id, round_name: round.round_name, threePutts: buckets.threePutts, fourPlusPutts: buckets.fourPlusPutts, amount: buckets.threePutts * 2 + buckets.fourPlusPutts * 4 };
      });
      return { ...withFallbackAlias(player), roundResults, totalThreePutts: roundResults.reduce((sum, r) => sum + r.threePutts, 0), totalFourPlusPutts: roundResults.reduce((sum, r) => sum + r.fourPlusPutts, 0), totalAmount: roundResults.reduce((sum, r) => sum + r.amount, 0) };
    })
    .sort((a, b) => Number(b.totalAmount || 0) - Number(a.totalAmount || 0) || Number(b.totalFourPlusPutts || 0) - Number(a.totalFourPlusPutts || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function buildFinalNetStandings(players, rounds, holes, scores) {
  const qualificationStandings = buildTournamentNetStandings(players, rounds, holes, scores);
  const finalRound = getFinalRound(rounds);
  const finalHoles = getRoundHoles(finalRound, holes);
  const withFinalScores = qualificationStandings.map((player, qualificationIndex) => {
    const finalScores = (scores || []).filter((score) => String(score.round_id) === String(finalRound?.round_id) && String(score.player_id) === String(player.id));
    const playerForRound = getPlayerForCourse(player, finalRound?.course_id || "goethe");
    const finalNetStableford = finalScores.reduce((sum, score) => {
      const hole = finalHoles.find((h) => Number(h.hole_number) === Number(score.hole_number));
      const shots = getShotsOnHole(playerForRound.course_hcp, hole?.hcp);
      return sum + getScoreStablefordPoints(score, hole?.par, shots);
    }, 0);
    return { ...withFallbackAlias(player), qualificationRank: qualificationIndex + 1, finalNetStableford, finalPlayed: finalScores.filter((score) => score.strokes !== "" && score.strokes != null).length, finalGroup: qualificationIndex < 3 ? "championship" : "placement" };
  });
  const championshipGroup = withFinalScores.filter((p) => p.finalGroup === "championship").sort((a, b) => Number(b.finalNetStableford || 0) - Number(a.finalNetStableford || 0) || Number(a.qualificationRank || 0) - Number(b.qualificationRank || 0)).map((p, i) => ({ ...p, finalRank: i + 1 }));
  const placementGroup = withFinalScores.filter((p) => p.finalGroup === "placement").sort((a, b) => Number(b.finalNetStableford || 0) - Number(a.finalNetStableford || 0) || Number(a.qualificationRank || 0) - Number(b.qualificationRank || 0)).map((p, i) => ({ ...p, finalRank: i + 4 }));
  return [...championshipGroup, ...placementGroup];
}

function buildScorecardRows(player, round, holes, scores) {
  const roundHoles = getRoundHoles(round, holes);
  const roundScores = (scores || []).filter((s) => String(s.round_id) === String(round?.round_id) && String(s.player_id) === String(player?.id));
  const playerForRound = getPlayerForCourse(player, round?.course_id || "goethe");
  return roundHoles.map((hole) => {
    const score = roundScores.find((s) => Number(s.hole_number) === Number(hole.hole_number));
    const strokes = score?.strokes === "" || score?.strokes == null ? null : Number(score.strokes);
    const isPickedUp = normalizeBoolean(score?.picked_up);
    const isLady = normalizeBoolean(score?.lady);
    const shots = getShotsOnHole(playerForRound?.course_hcp, hole.hcp);
    const netStableford = getScoreStablefordPoints(score, hole.par, shots);
    const grossStableford = getScoreStablefordPoints(score, hole.par, 0);
    const toPar = strokes == null ? null : strokes - Number(hole.par || 0);
    const puttsCount = score?.putts_count === "" || score?.putts_count == null ? null : Number(score.putts_count);
    const puttLabel = puttsCount == null ? "–" : puttsCount >= 4 ? "4+ Putt" : `${puttsCount} Putt${puttsCount === 1 ? "" : "s"}`;
    return { hole, score, strokes, isPickedUp, isLady, shots, toPar, netStableford, grossStableford, puttLabel };
  });
}

function summarizeScorecard(rows) {
  const playedRows = (rows || []).filter((row) => row.strokes != null);
  return {
    played: playedRows.length,
    totalStrokes: playedRows.reduce((sum, row) => sum + Number(row.strokes || 0), 0),
    toPar: playedRows.reduce((sum, row) => sum + Number(row.strokes || 0), 0) - playedRows.reduce((sum, row) => sum + Number(row.hole.par || 0), 0),
    netStableford: playedRows.reduce((sum, row) => sum + Number(row.netStableford || 0), 0),
    grossStableford: playedRows.reduce((sum, row) => sum + Number(row.grossStableford || 0), 0),
    threePutts: rows.filter((row) => row.puttLabel === "3 Putts" || row.puttLabel === "3 Putt").length,
    fourPlusPutts: rows.filter((row) => row.puttLabel === "4+ Putt").length,
  };
}

function getCourseHcpKey(playerId, courseId) {
  return `${playerId}_${String(courseId || "goethe").toLowerCase().trim()}`;
}

function normalizeScoreRecord(score) {
  return {
    ...score,
    picked_up: normalizeBoolean(score?.picked_up),
    over_two_putts: normalizeBoolean(score?.over_two_putts),
    lady: normalizeBoolean(score?.lady),
  };
}

function isScorerControlScore(score) {
  const playerId = String(score?.player_id || "").trim();
  const scorerPlayerId = String(score?.scorer_player_id || "").trim();
  return Boolean(playerId && scorerPlayerId && playerId === scorerPlayerId);
}

function getScoreIdentityKey(score) {
  return [
    String(score?.round_id || "").trim(),
    String(score?.player_id || "").trim(),
    String(score?.hole_number || "").trim(),
    isScorerControlScore(score) ? "control" : "official",
  ].join("|");
}

function getScoreTimestamp(score) {
  const time = Date.parse(score?.updated_at || "");
  return Number.isNaN(time) ? 0 : time;
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

    if (!existing || isNewerOrEqualScore(score, existing)) {
      map.set(key, normalizeScoreRecord(score));
    }
  });

  return Array.from(map.values());
}

function getOfficialScores(scores) {
  return (scores || []).filter((score) => !isScorerControlScore(score));
}

function findScoreForPlayerHole(scores, roundId, playerId, holeNumber, wantControlScore) {
  return (
    (scores || []).find((score) => {
      const sameRound = String(score.round_id || "") === String(roundId || "");
      const samePlayer = String(score.player_id || "") === String(playerId || "");
      const sameHole = Number(score.hole_number) === Number(holeNumber);
      const isControl = isScorerControlScore(score);
      return sameRound && samePlayer && sameHole && isControl === wantControlScore;
    }) || null
  );
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

  if (
    Number(officialScore.strokes) !== Number(controlScore.strokes) ||
    normalizeBoolean(officialScore.picked_up) !== normalizeBoolean(controlScore.picked_up)
  ) {
    differences.push(`Score: ${formatScoreDiff(officialScore)} ≠ ${formatScoreDiff(controlScore)}`);
  }

  if (normalizeBoolean(officialScore.lady) !== normalizeBoolean(controlScore.lady)) {
    differences.push(`Lady: ${formatBoolDiff(officialScore.lady)} ≠ ${formatBoolDiff(controlScore.lady)}`);
  }

  if (
    normalizeBoolean(officialScore.over_two_putts) !== normalizeBoolean(controlScore.over_two_putts) ||
    Number(officialScore.putts_count || 0) !== Number(controlScore.putts_count || 0)
  ) {
    differences.push(`Putts: ${formatPuttsDiff(officialScore)} ≠ ${formatPuttsDiff(controlScore)}`);
  }

  return differences.join(" · ");
}

function getMismatchesForHole(scores, roundId, holeNumber, players = []) {
  const playerMap = new Map((players || []).map((player) => [String(player.id), player]));
  const playerIds = Array.from(
    new Set(
      (scores || [])
        .filter((score) => String(score.round_id || "") === String(roundId || "") && Number(score.hole_number) === Number(holeNumber))
        .map((score) => String(score.player_id || ""))
        .filter(Boolean)
    )
  );

  return playerIds
    .map((playerId) => {
      const officialScore = findScoreForPlayerHole(scores, roundId, playerId, holeNumber, false);
      const controlScore = findScoreForPlayerHole(scores, roundId, playerId, holeNumber, true);
      const message = getScoreMismatchMessage(officialScore, controlScore);
      return {
        playerId,
        player: playerMap.get(playerId) || { id: playerId, character_name: playerId, display_name: playerId },
        holeNumber,
        officialScore,
        controlScore,
        officialScorerId: String(officialScore?.scorer_player_id || "").trim(),
        message: message ? `Loch ${holeNumber} · ${(playerMap.get(playerId)?.character_name || playerMap.get(playerId)?.display_name || playerId)} · ${message}` : "",
      };
    })
    .filter((item) => Boolean(item.message));
}

function getMismatchesForRound(scores, roundId, players = []) {
  const holeNumbers = Array.from(
    new Set(
      (scores || [])
        .filter((score) => String(score.round_id || "") === String(roundId || ""))
        .map((score) => Number(score.hole_number))
        .filter(Boolean)
    )
  ).sort((a, b) => a - b);

  return holeNumbers.flatMap((holeNumber) => getMismatchesForHole(scores, roundId, holeNumber, players));
}

function runSelfTests() {
  const failures = [];
  const assert = (name, condition) => {
    if (!condition) failures.push(name);
  };

  assert("url string is closed", typeof GOOGLE_SHEETS_API_URL === "string" && GOOGLE_SHEETS_API_URL.endsWith("/exec"));
  assert("fallback courses are available", fallbackCourses.length === 2);
  assert("formatToPar returns dash when no holes played", formatToPar(3, 0) === "–");
  assert("formatToPar returns E for even par", formatToPar(0, 3) === "E");
  assert("cleanNumericInput removes non-digits", cleanNumericInput("a1b2") === "12");
  assert("normalizeBoolean handles German yes", normalizeBoolean("ja") === true);
  assert("score normalization handles lady", normalizeScoreRecord({ lady: "true" }).lady === true);
  assert("scorer control score is detected", isScorerControlScore({ player_id: "florian", scorer_player_id: "florian" }) === true);
  assert("official score keeps external scorer", isScorerControlScore({ player_id: "florian", scorer_player_id: "mucky" }) === false);
  assert("control scores are filtered from official scores", getOfficialScores([{ player_id: "florian", scorer_player_id: "florian" }, { player_id: "florian", scorer_player_id: "mucky" }]).length === 1);
  assert("finds official score by player and hole", findScoreForPlayerHole([{ round_id: "r1", player_id: "florian", scorer_player_id: "mucky", hole_number: 1, strokes: 5 }], "r1", "florian", 1, false)?.strokes === 5);
  assert("finds own control score by player and hole", findScoreForPlayerHole([{ round_id: "r1", player_id: "florian", scorer_player_id: "florian", hole_number: 1, strokes: 6 }], "r1", "florian", 1, true)?.strokes === 6);
  assert("mismatch detects official vs own control", getScoreMismatchMessage({ strokes: 6, lady: false }, { strokes: 5, lady: false }).includes("Score"));
  assert("mismatch list finds player on hole", getMismatchesForHole([{ round_id: "r1", player_id: "florian", scorer_player_id: "mucky", hole_number: 1, strokes: 6 }, { round_id: "r1", player_id: "florian", scorer_player_id: "florian", hole_number: 1, strokes: 5 }], "r1", 1, fallbackPlayers).length === 1);
  assert("stableford par is two points", getStablefordPoints(4, 4, 0) === 2);
  assert("picked up score gives zero net points", getScoreStablefordPoints({ strokes: getPickedUpStrokes({ course_hcp_goethe: 5 }, { par: 4, hcp: 5 }, "goethe"), picked_up: true }, 4, getShotsOnHole(5, 5)) === 0);
  assert("picked up score is double par plus one", getPickedUpStrokes({ course_hcp_goethe: 18 }, { par: 5, hcp: 1 }, "goethe") === 11);
  assert("picked up score stays zero even with many strokes received", getScoreStablefordPoints({ strokes: 10, picked_up: true }, 5, 5) === 0);
  assert("course handicap allocates two strokes above 18", getShotsOnHole(19, 1) === 2);
  assert("shot marks display two strokes", formatShotMarks(2) === "||");
  assert("shot marks display no stroke as dash", formatShotMarks(0) === "–");
  assert("current handicap helper works", getPlayerForCourse({ ...fallbackPlayers[0], handicap_index: "", course_hcp_goethe: 7 }, "goethe")?.course_hcp === 7);
  assert("alias fallback works", getPlayerLabel({ id: "florian", character_name: "Florian" }) === "Sliceron (Florian)");
  assert("explicit alias overrides fallback", getPlayerLabel({ id: "florian", character_name: "Florian", alias_name: "Captain Slice" }) === "Captain Slice (Florian)");
  assert("feininger handicap selected", getPlayerForCourse({ id: "x", handicap_index: "", course_hcp_goethe: 1, course_hcp_feininger: 9 }, "feininger")?.course_hcp === 9);
  assert("goethe DGV HCP 10 gives playing handicap 12", getCourseHandicap({ id: "x", handicap_index: 10 }, "goethe", fallbackCourses) === 12);
  assert("feininger DGV HCP 10 gives playing handicap 10", getCourseHandicap({ id: "x", handicap_index: 10 }, "feininger", fallbackCourses) === 10);

  const stats = buildPlayerStats(fallbackPlayers.slice(0, 2), fallbackHoles.slice(0, 2), [
    { round_id: "r1", player_id: "florian", hole_number: 1, strokes: 4, over_two_putts: false, putts_count: "" },
    { round_id: "r1", player_id: "florian", hole_number: 2, strokes: 6, over_two_putts: true, putts_count: 4 },
    { round_id: "r1", player_id: "mucky", hole_number: 1, strokes: 3, over_two_putts: false, putts_count: "" },
  ]);

  assert("leaderboard sorts best to-par first", sortStrokePlay(stats)[0].id === "mucky");
  assert("putt money calculates", stats.find((p) => p.id === "florian")?.puttPenaltyEuro === 4);
  assert("lady count calculates", buildPlayerStats(fallbackPlayers.slice(0, 1), fallbackHoles.slice(0, 2), [{ round_id: "r1", player_id: "florian", hole_number: 1, strokes: 4, lady: true }, { round_id: "r1", player_id: "florian", hole_number: 2, strokes: 5, lady: "true" }])[0].ladyCount === 2);

  const rows = buildScorecardRows(
    { ...fallbackPlayers[0], course_hcp_goethe: 18 },
    { round_id: "r1", course_id: "goethe" },
    fallbackHoles,
    [{ round_id: "r1", player_id: "florian", hole_number: 1, strokes: 5, picked_up: true, over_two_putts: false, putts_count: "" }]
  );
  assert("scorecard marks picked up", rows[0].isPickedUp === true);

  if (failures.length) console.warn("Lord of the Holes self-tests failed:", failures);
}

if (typeof window !== "undefined") runSelfTests();

function TouchStepper({ label, value, min = 0, max = 12, emptyLabel = "–", helper = "", status = "", defaultValue = null, onChange, formatValue }) {
  const hasValue = value !== "" && value != null;
  const fallbackValue = defaultValue == null ? min : Number(defaultValue);
  const baseValue = Math.max(min, Math.min(max, Number(hasValue ? value : fallbackValue)));
  const shownValue = hasValue || defaultValue != null ? (formatValue ? formatValue(baseValue) : baseValue) : emptyLabel;
  const setValue = (nextValue) => onChange(Math.max(min, Math.min(max, Number(nextValue || 0))));

  return (
    <div className="rounded-2xl border border-amber-700/40 bg-black/25 p-2">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-amber-100">{label}</div>
          {helper ? <div className="text-[11px] text-amber-100/55">{helper}</div> : null}
        </div>
        {status ? <div className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-100/75">{status}</div> : null}
      </div>

      <div className="grid grid-cols-[48px_1fr_48px] items-center gap-2">
        <button
          type="button"
          onClick={() => setValue(baseValue - 1)}
          disabled={baseValue <= min}
          className="h-12 rounded-xl border border-amber-700/50 bg-stone-950 text-2xl font-black leading-none text-amber-100 disabled:opacity-35"
          aria-label={`${label} verringern`}
        >
          −
        </button>

        <button
          type="button"
          onClick={() => setValue(baseValue)}
          className="h-12 rounded-xl border border-amber-700/30 bg-stone-950/70 text-center shadow-inner shadow-black/60"
          aria-label={`${label} auswählen`}
        >
          <div className="font-serif text-3xl font-black leading-none text-amber-200">{shownValue}</div>
          <div className="text-[9px] uppercase tracking-[0.18em] text-amber-100/50">{!hasValue && defaultValue != null ? "tippen" : label}</div>
        </button>

        <button
          type="button"
          onClick={() => setValue(baseValue + 1)}
          disabled={baseValue >= max}
          className="h-12 rounded-xl border border-amber-700/50 bg-stone-950 text-2xl font-black leading-none text-amber-100 disabled:opacity-35"
          aria-label={`${label} erhöhen`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function PuttStepper({ value, onChange }) {
  const hasValue = value !== "" && value != null;
  const selected = hasValue ? Number(value || 0) : 2;
  const snakeLabel = selected >= 4 ? "4+ · 4 €" : selected === 3 ? "3 · 2 €" : "keine Snake";

  return (
    <TouchStepper
      label="Putts"
      value={value === 0 ? 0 : value || ""}
      min={0}
      max={6}
      emptyLabel="2"
      defaultValue={2}
      helper=""
      status={snakeLabel}
      onChange={onChange}
    />
  );
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

function ScoreStepper({ value, par, pickedUpStrokes, onChange }) {
  const displayScore = value === "" || value == null ? Number(par || 4) : value;
  const isPickedValue = Number(displayScore) === 0 || Number(displayScore) >= Number(pickedUpStrokes || 0);
  const relationLabel = getScoreRelationLabel(displayScore, par);
  const effectiveStatus =
    value === "" || value == null
      ? ""
      : isPickedValue
        ? `X · gewertet ${pickedUpStrokes}`
        : relationLabel;

  return (
    <TouchStepper
      label="Score"
      value={value}
      min={0}
      max={30}
      emptyLabel={String(par || 4)}
      defaultValue={Number(par || 4)}
      helper=""
      status={effectiveStatus}
      formatValue={(nextValue) => (Number(nextValue) === 0 ? "X" : nextValue)}
      onChange={onChange}
    />
  );
}

function LeaderboardTable({ title, players, columns }) {
  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-amber-700/30 bg-black/20">
      <div className="border-b border-amber-700/30 bg-amber-500/10 px-2.5 py-1.5 font-serif text-lg text-amber-200">{title}</div>
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full min-w-[360px] border-collapse text-sm text-amber-50 landscape:min-w-[520px] landscape:text-xs">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-amber-100">
              <th className="px-2.5 py-1.5">#</th>
              <th className="px-2.5 py-1.5">Spieler</th>
              {columns.map((column) => (
                <th key={column.label} className="px-2.5 py-1.5 text-right">{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((p, index) => (
              <tr key={p.id} className="border-t border-amber-700/20">
                <td className="px-2.5 py-1.5 text-amber-200/75">{index + 1}</td>
                <td className="px-2.5 py-1.5 font-semibold text-amber-100">{getPlayerLabel(p)}</td>
                {columns.map((column) => (
                  <td key={column.label} className={cls("px-2.5 py-1.5 text-right", column.emphasize && "font-serif text-lg text-amber-300")}>{column.render(p)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FunTable({ title, subtitle = "", players, columns, nameLabel = "Name" }) {
  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-amber-700/30 bg-black/20">
      <div className="border-b border-amber-700/30 bg-amber-500/10 px-2.5 py-1.5">
        <div className="font-serif text-lg text-amber-200">{title}</div>
        {subtitle ? <div className="text-xs text-amber-100/60">{subtitle}</div> : null}
      </div>
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full min-w-[360px] border-collapse text-sm text-amber-50 landscape:min-w-[520px] landscape:text-xs">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-amber-100">
              <th className="px-2.5 py-1.5">#</th>
              <th className="px-2.5 py-1.5">{nameLabel}</th>
              {columns.map((column) => (
                <th key={column.label} className="px-2.5 py-1.5 text-right">{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((item, index) => (
              <tr key={item.id || `${item.hole_number}-${index}` || index} className="border-t border-amber-700/20">
                <td className="px-2.5 py-1.5 text-amber-200/75">{index + 1}</td>
                <td className="px-2.5 py-1.5 font-semibold text-amber-100">{item.hole_number ? `Loch ${item.hole_number}` : (item.character_name || item.display_name || item.id)}</td>
                {columns.map((column) => (
                  <td key={column.label} className={cls("px-2.5 py-1.5 text-right", column.emphasize && "font-serif text-lg text-amber-300")}>{column.render(item, index)}</td>
                ))}
              </tr>
            ))}
          </tbody>
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
  const birdieHunters = [...funPlayers].sort((a, b) => Number((b.birdies || 0) + (b.eaglesOrBetter || 0)) - Number((a.birdies || 0) + (a.eaglesOrBetter || 0)) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const bogeyBunkers = [...funPlayers].sort((a, b) => Number(b.doubleBogeyPlus || 0) - Number(a.doubleBogeyPlus || 0) || Number(b.triplePlus || 0) - Number(a.triplePlus || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const comebackKings = [...funPlayers].filter((p) => p.backMinusFront != null).sort((a, b) => Number(a.backMinusFront) - Number(b.backMinusFront));
  const balrogFalls = [...funPlayers].filter((p) => p.backMinusFront != null).sort((a, b) => Number(b.backMinusFront) - Number(a.backMinusFront));
  const hardestHoles = [...funHoles].sort((a, b) => Number(b.avgToPar || 0) - Number(a.avgToPar || 0));
  const favoriteHoles = [...funHoles].sort((a, b) => Number(a.avgToPar || 0) - Number(b.avgToPar || 0));
  const hcpRaiders = [...funPlayers].sort((a, b) => Number(b.hcpBonus || 0) - Number(a.hcpBonus || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const mithrilMiners = [...funPlayers].sort((a, b) => Number(b.pointsPerHcpShot || 0) - Number(a.pointsPerHcpShot || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));

  return (
    <Card className="mb-3 rounded-2xl border-amber-700/40 bg-[#20170f]/90 shadow-xl landscape:rounded-xl">
      <CardContent className="p-3 landscape:p-2">
        <div className="mb-3">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Mittelerde</p>
          <h2 className="font-serif text-lg text-amber-200">Die Chroniken der Runde</h2>
          <p className="mt-1 text-sm text-amber-100/65">Fun-Tabellen aus den Scores der aktuellen Runde.</p>
        </div>

        <FunTable title="Shelobs Putt-Kammer" subtitle="Snake-König der Runde" players={snakeLords} columns={[{ label: "3P", render: (p) => p.threePutts }, { label: "4+P", render: (p) => p.fourPlusPutts }, { label: "€", render: (p) => `${p.puttPenaltyEuro || 0} €`, emphasize: true }]} />
        <FunTable title="Galadriels Spiegel" subtitle="Lady-Liga" players={ladies} columns={[{ label: "Ladys", render: (p) => p.ladyCount, emphasize: true }, { label: "Quote", render: (p) => p.played ? `${Math.round((p.ladyCount / p.played) * 100)} %` : "–" }]} />
        <FunTable title="Die weißen Fahnen von Gondor" subtitle="Gestrichene Löcher" players={whiteFlags} columns={[{ label: "X", render: (p) => p.pickedUpCount, emphasize: true }, { label: "Quote", render: (p) => p.played ? `${Math.round((p.pickedUpCount / p.played) * 100)} %` : "–" }]} />
        <FunTable title="Die Ents der Fairways" subtitle="Par oder besser" players={parMachines} columns={[{ label: "Par+", render: (p) => p.parOrBetter, emphasize: true }, { label: "Pars", render: (p) => p.pars }, { label: "Birdie+", render: (p) => p.birdies + p.eaglesOrBetter }]} />
        <FunTable title="Die Adler von Manwë" subtitle="Birdie-Jäger" players={birdieHunters} columns={[{ label: "Eagle+", render: (p) => p.eaglesOrBetter }, { label: "Birdies", render: (p) => p.birdies }, { label: "Summe", render: (p) => p.birdies + p.eaglesOrBetter, emphasize: true }]} />
        <FunTable title="Die Minen von Moria" subtitle="Doppelbogey oder schlimmer" players={bogeyBunkers} columns={[{ label: "DB+", render: (p) => p.doubleBogeyPlus, emphasize: true }, { label: "Triple+", render: (p) => p.triplePlus }, { label: "X", render: (p) => p.pickedUpCount }]} />
        <FunTable title="Die Rückkehr des Königs" subtitle="Back Nine besser als Front Nine" players={comebackKings} columns={[{ label: "Front", render: (p) => formatToPar(p.frontToPar, p.frontToPar != null) }, { label: "Back", render: (p) => formatToPar(p.backToPar, p.backToPar != null) }, { label: "Swing", render: (p) => formatToPar(p.backMinusFront, p.backMinusFront != null), emphasize: true }]} />
        <FunTable title="Der Balrog an Loch 10" subtitle="Back Nine schwerer als Front Nine" players={balrogFalls} columns={[{ label: "Front", render: (p) => formatToPar(p.frontToPar, p.frontToPar != null) }, { label: "Back", render: (p) => formatToPar(p.backToPar, p.backToPar != null) }, { label: "Absturz", render: (p) => formatToPar(p.backMinusFront, p.backMinusFront != null), emphasize: true }]} />
        <FunTable title="Der Schicksalsberg" subtitle="Härtestes Loch des Feldes" nameLabel="Platz / Loch" players={hardestHoles} columns={[{ label: "Loch", render: (h) => h.hole_number }, { label: "Par", render: (h) => h.par }, { label: "Ø +/−", render: (h) => formatToPar(Math.round(h.avgToPar * 10) / 10, h.played), emphasize: true }, { label: "X", render: (h) => h.pickedUpCount }, { label: "Snake", render: (h) => h.snakes }]} />
        <FunTable title="Bruchtal" subtitle="Lieblingsloch des Feldes" nameLabel="Platz / Loch" players={favoriteHoles} columns={[{ label: "Loch", render: (h) => h.hole_number }, { label: "Par", render: (h) => h.par }, { label: "Ø +/−", render: (h) => formatToPar(Math.round(h.avgToPar * 10) / 10, h.played), emphasize: true }, { label: "Birdies", render: (h) => h.birdies }, { label: "Pars", render: (h) => h.pars }]} />
        <FunTable title="Gollums Netto-Schatz" subtitle="Netto minus Brutto Stableford" players={hcpRaiders} columns={[{ label: "Netto", render: (p) => p.netStableford }, { label: "Brutto", render: (p) => p.grossStableford }, { label: "Schatz", render: (p) => p.hcpBonus, emphasize: true }]} />
        <FunTable title="Mithril pro Vorgabeschlag" subtitle="Netto-Punkte je erhaltenem Schlag" players={mithrilMiners} columns={[{ label: "SpV genutzt", render: (p) => p.hcpShotsUsed }, { label: "Netto", render: (p) => p.netStableford }, { label: "Quote", render: (p) => p.hcpShotsUsed ? p.pointsPerHcpShot : "–", emphasize: true }]} />
        
      </CardContent>
    </Card>
  );
}

function TournamentStandings({ players, rounds, holes, scores, activeRoundId = "" }) {
  const standings = useMemo(() => buildTournamentNetStandings(players, rounds, holes, scores), [players, rounds, holes, scores]);
  const finalStandings = useMemo(() => buildFinalNetStandings(players, rounds, holes, scores), [players, rounds, holes, scores]);
  const puttStandings = useMemo(() => buildTournamentPuttStandings(players, rounds, scores), [players, rounds, scores]);
  const qualificationRounds = getQualificationRounds(rounds);
  const puttKasseRounds = getPuttKasseRounds(rounds);
  const finalRound = getFinalRound(rounds);
  const isFinalActive = String(activeRoundId) === String(finalRound?.round_id || "r4");

  return (
    <Card className="mb-3 rounded-2xl border-amber-700/40 bg-[#20170f]/90 shadow-xl landscape:rounded-xl">
      <CardContent className="p-3 landscape:p-2">
        <div className="mb-3">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Turnier</p>
          <h2 className="font-serif text-lg text-amber-200">{isFinalActive ? "Finalwertung Netto" : "Gesamtwertung Netto"}</h2>
          <p className="mt-1 text-sm text-amber-100/70">
            {isFinalActive
              ? "Finaltag: Top 3 nach der Qualifikation spielen Plätze 1–3 aus. Die übrigen Spieler spielen Plätze 4–6 aus."
              : "Es zählen die besten zwei Netto-Stableford-Ergebnisse aus den ersten drei Runden. Nach Platz 3 liegt der aktuelle Cut."}
          </p>
        </div>

        {isFinalActive ? (
          <div className="overflow-x-auto rounded-2xl border border-amber-700/30 bg-black/20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full min-w-[760px] border-collapse text-sm text-amber-50">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-amber-100">
                  <th className="px-2.5 py-1.5">Platz</th>
                  <th className="px-2.5 py-1.5">Spieler</th>
                  <th className="px-2.5 py-1.5 text-right">Quali</th>
                  <th className="px-2.5 py-1.5 text-right">Final Netto</th>
                  <th className="px-2.5 py-1.5 text-right">Löcher</th>
                  <th className="px-2.5 py-1.5 text-right">Gruppe</th>
                </tr>
              </thead>
              <tbody>
                {finalStandings.map((player, index) => (
                  <React.Fragment key={player.id}>
                    {index === 3 && (
                      <tr>
                        <td colSpan={6} className="border-y-2 border-amber-400/70 bg-amber-500/10 px-2.5 py-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-amber-200">Platzierungsgruppe · Plätze 4–6</td>
                      </tr>
                    )}
                    <tr className={cls("border-t border-amber-700/20", index < 3 && "bg-emerald-500/5")}>
                      <td className="px-2.5 py-1.5 font-serif text-lg font-bold text-amber-300">{player.finalRank}</td>
                      <td className="px-2.5 py-1.5 font-semibold text-amber-100">{getPlayerLabel(player)}</td>
                      <td className="px-2.5 py-1.5 text-right text-amber-100/75">{player.qualificationRank}</td>
                      <td className="px-2.5 py-1.5 text-right font-serif text-xl font-bold text-amber-300">{player.finalPlayed ? player.finalNetStableford : "–"}</td>
                      <td className="px-2.5 py-1.5 text-right text-amber-100">{player.finalPlayed}/18</td>
                      <td className="px-2.5 py-1.5 text-right text-amber-100/75">{player.finalGroup === "championship" ? "1–3" : "4–6"}</td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-amber-700/30 bg-black/20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full min-w-[760px] border-collapse text-sm text-amber-50">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-amber-100">
                  <th className="px-2.5 py-1.5">#</th>
                  <th className="px-2.5 py-1.5">Spieler</th>
                  {qualificationRounds.map((round) => <th key={round.round_id} className="px-2.5 py-1.5 text-right">{round.round_name}</th>)}
                  <th className="px-2.5 py-1.5 text-right">Gesamt</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((player, index) => (
                  <React.Fragment key={player.id}>
                    {index === 3 && (
                      <tr>
                        <td colSpan={qualificationRounds.length + 4} className="border-y-2 border-amber-400/70 bg-amber-500/10 px-2.5 py-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-amber-200">Cut-Linie · Top 3 spielen den Finaltag</td>
                      </tr>
                    )}
                    <tr className={cls("border-t border-amber-700/20", index < 3 && "bg-emerald-500/5")}>
                      <td className="px-2.5 py-1.5 text-amber-200/75">{index + 1}</td>
                      <td className="px-2.5 py-1.5 font-semibold text-amber-100">
                        {getPlayerLabel(player)}
                        {index < 3 && <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-200">Final</span>}
                      </td>
                      {qualificationRounds.map((round) => {
                        const result = player.roundResults.find((item) => item.round_id === round.round_id);
                        const isCounted = player.countedRoundIds.includes(round.round_id);
                        const isDropped = player.droppedRoundId === round.round_id;
                        return (
                          <td key={round.round_id} className={cls("px-2.5 py-1.5 text-right", isCounted && "font-bold text-amber-300", isDropped && "text-amber-100/50 line-through")}>{result?.played ? result.points : "–"}</td>
                        );
                      })}
                      <td className="px-2.5 py-1.5 text-right font-serif text-xl font-bold text-amber-300">{player.totalBestTwo}</td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Putt-Kasse</p>
          <h3 className="font-serif text-lg text-amber-200">Gesamt über Runde 1–4</h3>
          <p className="mt-1 text-sm text-amber-100/70">3 Putts zählen 2 €, 4+ Putts zählen 4 €.</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-amber-700/30 bg-black/20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full min-w-[760px] border-collapse text-sm text-amber-50">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-amber-100">
                <th className="px-2.5 py-1.5">#</th>
                <th className="px-2.5 py-1.5">Spieler</th>
                {puttKasseRounds.map((round) => <th key={round.round_id} className="px-2.5 py-1.5 text-right">{round.round_name}</th>)}
                <th className="px-2.5 py-1.5 text-right">3 Putts</th>
                <th className="px-2.5 py-1.5 text-right">4+ Putts</th>
                <th className="px-2.5 py-1.5 text-right">Gesamt</th>
              </tr>
            </thead>
            <tbody>
              {puttStandings.map((player, index) => (
                <tr key={player.id} className="border-t border-amber-700/20">
                  <td className="px-2.5 py-1.5 text-amber-200/75">{index + 1}</td>
                  <td className="px-2.5 py-1.5 font-semibold text-amber-100">{getPlayerLabel(player)}</td>
                  {puttKasseRounds.map((round) => {
                    const result = player.roundResults.find((item) => item.round_id === round.round_id);
                    return <td key={round.round_id} className="px-2.5 py-1.5 text-right text-amber-100">{result?.amount ? `${result.amount} €` : "–"}</td>;
                  })}
                  <td className="px-2.5 py-1.5 text-right text-amber-100">{player.totalThreePutts} × 2 €</td>
                  <td className="px-2.5 py-1.5 text-right text-amber-100">{player.totalFourPlusPutts} × 4 €</td>
                  <td className="px-2.5 py-1.5 text-right font-serif text-xl font-bold text-amber-300">{player.totalAmount} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ScorecardArchive({ rounds, courses, players, roundPlayers, holes, scores, selectedCourseId = "" }) {
  const availableRounds = rounds?.length ? rounds : fallbackRounds;
  const [selectedRoundId, setSelectedRoundId] = useState(availableRounds[0]?.round_id || "");
  const rawSelectedRound = availableRounds.find((round) => String(round.round_id) === String(selectedRoundId)) || availableRounds[0] || null;
  const selectedRound = rawSelectedRound
    ? {
        ...rawSelectedRound,
        course_id: rawSelectedRound.course_id || (String(rawSelectedRound.round_id) === String(selectedRoundId) ? selectedCourseId : ""),
      }
    : null;
  const eligiblePlayers = useMemo(() => getRoundPlayers(selectedRound?.round_id, players, roundPlayers), [selectedRound?.round_id, players, roundPlayers]);
  const [selectedPlayerId, setSelectedPlayerId] = useState(eligiblePlayers[0]?.id || "");

  useEffect(() => {
    if (!availableRounds.some((round) => String(round.round_id) === String(selectedRoundId))) setSelectedRoundId(availableRounds[0]?.round_id || "");
  }, [availableRounds, selectedRoundId]);

  useEffect(() => {
    if (!eligiblePlayers.some((p) => p.id === selectedPlayerId)) setSelectedPlayerId(eligiblePlayers[0]?.id || "");
  }, [eligiblePlayers, selectedPlayerId]);

  const selectedPlayer = eligiblePlayers.find((p) => String(p.id) === String(selectedPlayerId)) || eligiblePlayers[0] || null;
  const rows = useMemo(() => buildScorecardRows(selectedPlayer, selectedRound, holes, scores), [selectedPlayer, selectedRound, holes, scores]);
  const summary = useMemo(() => summarizeScorecard(rows), [rows]);

  const archiveRoundLabel = (round) => {
    const effectiveRound = {
      ...round,
      course_id: round.course_id || (String(round.round_id) === String(selectedRoundId) ? selectedCourseId : ""),
    };
    const course = getRoundCourse(effectiveRound, courses);
    return `${round.round_name} · ${course?.course_name || "Kurs offen"}`;
  };

  return (
    <Card className="mb-3 rounded-2xl border-amber-700/40 bg-[#20170f]/90 shadow-xl landscape:rounded-xl">
      <CardContent className="p-3 landscape:p-2">
        <div className="mb-3">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Scorekarten</p>
          <h2 className="font-serif text-lg text-amber-200">Klassische Scorekarte je Spieler</h2>
        </div>
        <div className="mb-3 grid gap-2 rounded-xl border border-amber-700/30 bg-black/25 p-2.5 landscape:grid-cols-4 landscape:items-end landscape:gap-2">
          <label className="block text-sm text-amber-100/80">Runde</label>
          <select value={selectedRoundId} onChange={(e) => setSelectedRoundId(e.target.value)} className="w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2.5 text-amber-50">
            {availableRounds.map((round) => <option key={round.round_id} value={round.round_id}>{archiveRoundLabel(round)}</option>)}
          </select>
          <label className="block text-sm text-amber-100/80">Spieler</label>
          <select value={selectedPlayerId} onChange={(e) => setSelectedPlayerId(e.target.value)} className="w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2.5 text-amber-50">
            {eligiblePlayers.map((p) => <option key={p.id} value={p.id}>{getPlayerLabel(p)}</option>)}
          </select>
        </div>

        {!selectedRound?.course_id ? (
          <div className="rounded-2xl border border-amber-700/30 bg-amber-950/40 p-4 text-sm text-amber-100">Für diese Runde ist noch kein Kurs in den Einstellungen gespeichert.</div>
        ) : !selectedPlayer ? (
          <div className="rounded-2xl border border-amber-700/30 bg-amber-950/40 p-4 text-sm text-amber-100">Für diese Runde ist kein Spieler ausgewählt.</div>
        ) : (
          <>
            <div className="mb-3 grid grid-cols-2 gap-2 text-center text-sm landscape:grid-cols-6 landscape:text-xs">
              {[
                ["Löcher", `${summary.played}/18`],
                ["Schläge", summary.played ? summary.totalStrokes : "–"],
                ["+/− Par", summary.played ? formatToPar(summary.toPar) : "–"],
                ["Netto Stbl", summary.netStableford],
                ["Brutto", summary.grossStableford],
                ["Putts", `3× ${summary.threePutts} · 4+× ${summary.fourPlusPutts}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-amber-50/5 p-2.5 text-amber-50"><div className="text-amber-100">{label}</div><b className="text-amber-200">{value}</b></div>
              ))}
            </div>
            <div className="overflow-x-auto rounded-2xl border border-amber-700/30 bg-black/20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden landscape:rounded-xl">
              <table className="w-full min-w-[760px] border-collapse text-sm text-amber-50 landscape:min-w-[1120px] landscape:text-xs">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-amber-100">
                    <th className="sticky left-0 z-10 bg-[#20170f] px-2.5 py-1.5">Loch</th>
                    <th className="px-2.5 py-1.5 text-right">Meter</th>
                    <th className="px-2.5 py-1.5 text-right">Par</th>
                    <th className="px-2.5 py-1.5 text-right">HCP</th>
                    <th className="px-2.5 py-1.5 text-right">Score</th>
                    <th className="px-2.5 py-1.5 text-right">+/−</th>
                    <th className="px-2.5 py-1.5 text-right">Netto</th>
                    <th className="px-2.5 py-1.5 text-right">Brutto</th>
                    <th className="px-2.5 py-1.5 text-right">Putts</th>
                    <th className="px-2.5 py-1.5 text-right">Lady</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.hole.hole_number} className="border-t border-amber-700/20">
                      <td className="sticky left-0 z-10 bg-[#20170f] px-2.5 py-1.5 font-semibold text-amber-100">{row.hole.hole_number}</td>
                      <td className="px-2.5 py-1.5 text-right">{row.hole.meters}</td>
                      <td className="px-2.5 py-1.5 text-right">{row.hole.par}</td>
                      <td className="px-2.5 py-1.5 text-right">{row.hole.hcp}</td>
                      <td className="px-2.5 py-1.5 text-right font-semibold text-amber-200">{row.strokes == null ? "–" : row.isPickedUp ? "X" : row.strokes}</td>
                      <td className="px-2.5 py-1.5 text-right">{row.toPar == null ? "–" : formatToPar(row.toPar)}</td>
                      <td className="px-2.5 py-1.5 text-right">{row.strokes == null ? "–" : row.netStableford}</td>
                      <td className="px-2.5 py-1.5 text-right">{row.strokes == null ? "–" : row.grossStableford}</td>
                      <td className="px-2.5 py-1.5 text-right">{row.puttLabel}</td>
                      <td className="px-2.5 py-1.5 text-right">{row.isLady ? "✓" : "–"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-amber-500/40 bg-amber-500/10 font-bold text-amber-100">
                    <td className="sticky left-0 z-10 bg-[#2a2117] px-2.5 py-1.5">Total</td>
                    <td className="px-2.5 py-1.5 text-right">–</td>
                    <td className="px-2.5 py-1.5 text-right">{rows.reduce((sum, row) => sum + Number(row.hole.par || 0), 0)}</td>
                    <td className="px-2.5 py-1.5 text-right">–</td>
                    <td className="px-2.5 py-1.5 text-right text-amber-300">{summary.played ? summary.totalStrokes : "–"}</td>
                    <td className="px-2.5 py-1.5 text-right">{summary.played ? formatToPar(summary.toPar) : "–"}</td>
                    <td className="px-2.5 py-1.5 text-right text-amber-300">{summary.netStableford}</td>
                    <td className="px-2.5 py-1.5 text-right text-amber-300">{summary.grossStableford}</td>
                    <td className="px-2.5 py-1.5 text-right">3× {summary.threePutts} · 4+× {summary.fourPlusPutts}</td>
                    <td className="px-2.5 py-1.5 text-right">–</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
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

function LordOfTheHolesApp() {
  const cachedState = readLocalJson("lordOfTheHoles.cachedState", null);
  const [players, setPlayers] = useState(cachedState?.players?.length ? cachedState.players : fallbackPlayers);
  const [allPlayers, setAllPlayers] = useState(cachedState?.allPlayers?.length ? cachedState.allPlayers : fallbackPlayers);
  const [courses, setCourses] = useState(cachedState?.courses?.length ? cachedState.courses : fallbackCourses);
  const [rounds, setRounds] = useState(cachedState?.rounds?.length ? cachedState.rounds : fallbackRounds);
  const [roundPlayers, setRoundPlayers] = useState(cachedState?.roundPlayers || []);
  const [activeRound, setActiveRound] = useState(cachedState?.activeRound || null);
  const [holes, setHoles] = useState(cachedState?.holes?.length ? cachedState.holes : fallbackHoles);
  const [allHoles, setAllHoles] = useState(cachedState?.allHoles?.length ? cachedState.allHoles : fallbackHoles);
  const [scores, setScores] = useState(cachedState?.scores?.length ? cachedState.scores.map(normalizeScoreRecord) : []);
  const [allScores, setAllScores] = useState(cachedState?.allScores?.length ? cachedState.allScores.map(normalizeScoreRecord) : []);
  const [pendingScores, setPendingScores] = useState(() => readLocalJson("lordOfTheHoles.pendingScores", []).map(normalizeScoreRecord));
  const pendingScoresRef = useRef(readLocalJson("lordOfTheHoles.pendingScores", []).map(normalizeScoreRecord));
  const [localHandicaps, setLocalHandicaps] = useState({});
  const [scoredPlayerId, setScoredPlayerId] = useState(() => readLocalJson("lordOfTheHoles.scoredPlayerId", "florian"));
  const [scoreEntryMode, setScoreEntryMode] = useState("player");
  const [activeHole, setActiveHole] = useState(() => readLocalJson("lordOfTheHoles.activeHole", 1));
  const [view, setView] = useState("score");
  const [mainMenu, setMainMenu] = useState("current");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [setupSaving, setSetupSaving] = useState(false);
  const [backupSaving, setBackupSaving] = useState(false);
  const [scoreSaveInFlight, setScoreSaveInFlight] = useState(false);
  const pendingScoreSaveRef = useRef(Promise.resolve(true));
  const scoreSaveSequenceRef = useRef(0);
  const [autoSync] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("offline");
  const [error, setError] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(cachedState?.selectedCourseId || "");
  const [selectedActiveRoundId, setSelectedActiveRoundId] = useState(cachedState?.selectedActiveRoundId || "r1");
  const [myPlayerId, setMyPlayerId] = useState(() => readLocalJson("lordOfTheHoles.myPlayerId", ""));
  const [adminPinInput, setAdminPinInput] = useState("");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminEditing, setAdminEditing] = useState(false);
  const [roundSavedMessage, setRoundSavedMessage] = useState("");
  const [setupSavedMessage, setSetupSavedMessage] = useState("");
  const [backupSavedMessage, setBackupSavedMessage] = useState("");
  const [scoreHintMessage, setScoreHintMessage] = useState("");

  const displayedActiveRound =
    (selectedActiveRoundId && (rounds.length ? rounds : fallbackRounds).find((round) => String(round.round_id) === String(selectedActiveRoundId))) ||
    activeRound ||
    rounds.find((round) => String(round.status).toLowerCase() === "active") ||
    fallbackRounds[0];
  const displayCourseId = displayedActiveRound?.course_id || selectedCourseId || "";
  const activeCourse = (courses.length ? courses : fallbackCourses).find((course) => String(course.course_id) === String(displayCourseId));
  const visiblePlayers = useMemo(() => getRoundPlayers(displayedActiveRound?.round_id, allPlayers, roundPlayers), [displayedActiveRound?.round_id, allPlayers, roundPlayers]);
  const scoreablePlayers = useMemo(() => {
    const filteredPlayers = myPlayerId ? visiblePlayers.filter((p) => String(p.id) !== String(myPlayerId)) : visiblePlayers;
    return filteredPlayers.length ? filteredPlayers : visiblePlayers;
  }, [visiblePlayers, myPlayerId]);
  const playersWithCurrentHandicaps = useMemo(() => getPlayersForCourse(visiblePlayers, displayCourseId, courses), [visiblePlayers, displayCourseId, courses]);
  const activeHoleData = holes.find((h) => Number(h.hole_number) === Number(activeHole)) || holes[Number(activeHole) - 1] || fallbackHoles[Number(activeHole) - 1] || fallbackHoles[0];
  const scoredPlayerBase = scoreablePlayers.find((p) => p.id === scoredPlayerId);
  const scoredPlayer = getPlayerForCourse(scoredPlayerBase, displayCourseId, courses);
  const myCurrentPlayer = myPlayerId ? getPlayerForCourse(visiblePlayers.find((player) => String(player.id) === String(myPlayerId)), displayCourseId, courses) : null;
  const isScorerEntryMode = scoreEntryMode === "scorer" && Boolean(myCurrentPlayer);
  const entryPlayerId = isScorerEntryMode ? myPlayerId : scoredPlayerId;
  const entryPlayer = isScorerEntryMode ? myCurrentPlayer : scoredPlayer;
  const pickedUpStrokes = getPickedUpStrokes(entryPlayer, activeHoleData, displayCourseId);
  const entryPlayerShotsOnActiveHole = getShotsOnHole(entryPlayer?.course_hcp, activeHoleData?.hcp);
  const currentScore = useMemo(
    () =>
      scores.find((s) => {
        const sameHole = String(s.round_id || "") === String(displayedActiveRound?.round_id || "r1") && Number(s.hole_number) === Number(activeHole);
        if (!sameHole) return false;
        if (isScorerEntryMode) return String(s.player_id) === String(entryPlayerId) && isScorerControlScore(s);
        return String(s.player_id) === String(entryPlayerId) && !isScorerControlScore(s);
      }) ||
      { strokes: "", picked_up: false, over_two_putts: false, putts_count: "", lady: false },
    [scores, entryPlayerId, activeHole, displayedActiveRound?.round_id, isScorerEntryMode]
  );
  const hasCurrentScore = currentScore.strokes !== "" && currentScore.strokes != null;
  const officialScores = useMemo(() => getOfficialScores(scores), [scores]);
  const officialAllScores = useMemo(() => getOfficialScores(allScores), [allScores]);
  const roundMismatches = useMemo(
    () => getMismatchesForRound(scores, displayedActiveRound?.round_id || "r1", visiblePlayers),
    [scores, displayedActiveRound?.round_id, visiblePlayers]
  );
  const responsibleHoleMismatches = useMemo(
    () =>
      myPlayerId
        ? roundMismatches.filter((item) => {
            const isAffectedPlayer = String(item.playerId) === String(myPlayerId);
            const isOfficialScorer = String(item.officialScorerId) === String(myPlayerId);
            return isAffectedPlayer || isOfficialScorer;
          })
        : [],
    [roundMismatches, myPlayerId]
  );
  const selectedPlayerMismatch = useMemo(
    () =>
      responsibleHoleMismatches.find((item) => String(item.playerId) === String(scoredPlayerId) && Number(item.holeNumber) === Number(activeHole)) ||
      responsibleHoleMismatches.find((item) => String(item.playerId) === String(scoredPlayerId)) ||
      null,
    [responsibleHoleMismatches, scoredPlayerId, activeHole]
  );
  const ownPlayerMismatch = useMemo(
    () => myPlayerId ? responsibleHoleMismatches.find((item) => String(item.playerId) === String(myPlayerId)) || null : null,
    [responsibleHoleMismatches, myPlayerId]
  );
  const scoreMismatchMessage = selectedPlayerMismatch?.message || "";
  const ownScoreMismatchMessage = ownPlayerMismatch?.message || "";
  const visibleScoreMismatchMessages = responsibleHoleMismatches.map((item) => item.message);
  const visibleScoreMismatchMessage = visibleScoreMismatchMessages[0] || "";
  const hasScoreMismatch = responsibleHoleMismatches.length > 0;
  const hasSelectedPlayerScoreMismatch = Boolean(scoreMismatchMessage);
  const hasOwnScoreMismatch = Boolean(ownScoreMismatchMessage);
  const scoredPlayerButtonLabel = getPlayerLabel(scoredPlayer) || "Spieler";
  const playerStats = useMemo(() => buildPlayerStats(playersWithCurrentHandicaps, holes, officialScores), [playersWithCurrentHandicaps, holes, officialScores]);
  const myCurrentStats = useMemo(() => (myPlayerId ? playerStats.find((player) => String(player.id) === String(myPlayerId)) || null : null), [playerStats, myPlayerId]);
  const strokePlayLeaderboard = useMemo(() => sortStrokePlay(playerStats), [playerStats]);
  const netStablefordLeaderboard = useMemo(() => sortStableford(playerStats, "netStableford"), [playerStats]);
  const grossStablefordLeaderboard = useMemo(() => sortStableford(playerStats, "grossStableford"), [playerStats]);
  const hcpAdjustedStrokeLeaderboard = useMemo(() => sortHcpAdjustedStrokePlay(playerStats), [playerStats]);
  const puttPenaltyLeaderboard = useMemo(() => sortPuttPenalties(playerStats), [playerStats]);
  const ladyLeaderboard = useMemo(() => sortLadyCounts(playerStats), [playerStats]);
  const myHcpAdjustedStrokeRank = useMemo(() => {
    const index = hcpAdjustedStrokeLeaderboard.findIndex((player) => String(player.id) === String(myPlayerId));
    return index >= 0 ? index + 1 : null;
  }, [hcpAdjustedStrokeLeaderboard, myPlayerId]);
  const myNetStablefordRank = useMemo(() => {
    const index = netStablefordLeaderboard.findIndex((player) => String(player.id) === String(myPlayerId));
    return index >= 0 ? index + 1 : null;
  }, [netStablefordLeaderboard, myPlayerId]);

  useEffect(() => {
    if (!scoreablePlayers.some((p) => String(p.id) === String(scoredPlayerId))) setScoredPlayerId(scoreablePlayers[0]?.id || "");
    if (!myPlayerId && scoreEntryMode === "scorer") setScoreEntryMode("player");
    if (Number(activeHole) < 1 || Number(activeHole) > 18) setActiveHole(1);
  }, [scoreablePlayers, scoredPlayerId, myPlayerId, scoreEntryMode, activeHole]);

  useEffect(() => {
    writeLocalJson("lordOfTheHoles.myPlayerId", myPlayerId);
  }, [myPlayerId]);

  useEffect(() => {
    writeLocalJson("lordOfTheHoles.activeHole", activeHole);
  }, [activeHole]);

  useEffect(() => {
    writeLocalJson("lordOfTheHoles.scoredPlayerId", scoredPlayerId);
  }, [scoredPlayerId]);

  useEffect(() => {
    pendingScoresRef.current = pendingScores;
    writeLocalJson("lordOfTheHoles.pendingScores", pendingScores);
  }, [pendingScores]);

  useEffect(() => {
    if (!selectedActiveRoundId) return;
    const selectedRoundScores = allScores.filter((score) => String(score.round_id || "") === String(selectedActiveRoundId));
    const selectedPendingScores = pendingScoresRef.current.filter((score) => String(score.round_id || "") === String(selectedActiveRoundId));
    setScores(mergeScoresPreservingPending(selectedRoundScores, selectedPendingScores));
  }, [selectedActiveRoundId, allScores]);

  useEffect(() => {
    writeLocalJson("lordOfTheHoles.cachedState", {
      players,
      allPlayers,
      courses,
      rounds,
      roundPlayers,
      activeRound,
      holes,
      allHoles,
      scores,
      allScores,
      pendingScores,
      selectedCourseId,
      selectedActiveRoundId,
      cachedAt: new Date().toISOString(),
    });
  }, [players, allPlayers, courses, rounds, roundPlayers, activeRound, holes, allHoles, scores, allScores, pendingScores, selectedCourseId, selectedActiveRoundId]);

  useEffect(() => {
    if (!autoSync) return undefined;
    loadData({ silent: true });
    const timer = setInterval(() => loadData({ silent: true }), 30000);
    return () => clearInterval(timer);
  }, [autoSync]);

  useEffect(() => {
    if (!autoSync || !pendingScores.length) return undefined;
    const timer = setInterval(() => flushPendingScores(), 10000);
    return () => clearInterval(timer);
  }, [autoSync, pendingScores]);

  function applyPlayers(nextActivePlayers, nextAllPlayers = nextActivePlayers, courseList = courses) {
    setPlayers(nextActivePlayers.map(withFallbackAlias));
    setAllPlayers(nextAllPlayers.map(withFallbackAlias));
    if (adminEditing) return;
    const nextHandicaps = {};
    nextAllPlayers.forEach((player) => {
      nextHandicaps[`hcp_index_${player.id}`] = String(player.handicap_index ?? player.dgv_hcp ?? player.hcp_index ?? "");
      nextHandicaps[getCourseHcpKey(player.id, "goethe")] = String(getCourseHandicap(player, "goethe", courseList));
      nextHandicaps[getCourseHcpKey(player.id, "feininger")] = String(getCourseHandicap(player, "feininger", courseList));
    });
    setLocalHandicaps(nextHandicaps);
  }

  async function loadData({ silent = false } = {}) {
    if (!silent) setLoading(true);
    try {
      const data = await callSheetApi({ action: "getState" });
      const nextAllPlayers = (data.players?.length ? data.players : fallbackPlayers).map(withFallbackAlias);
      const nextRounds = data.rounds?.length ? data.rounds : fallbackRounds;
      const nextCourses = data.courses?.length ? data.courses : fallbackCourses;
      const nextActiveRound = data.activeRound || nextRounds.find((round) => String(round.status).toLowerCase() === "active") || nextRounds[0] || fallbackRounds[0];
      const nextActivePlayers = data.activePlayers?.length ? data.activePlayers.map(withFallbackAlias) : getRoundPlayers(nextActiveRound?.round_id, nextAllPlayers, data.roundPlayers || []);
      setCourses(nextCourses);
      setRounds(nextRounds);
      setRoundPlayers(data.roundPlayers || []);
      setActiveRound(nextActiveRound);
      if (!adminEditing) {
        setSelectedCourseId(nextActiveRound?.course_id || "");
        setSelectedActiveRoundId(nextActiveRound?.round_id || fallbackRounds[0].round_id);
      }
      applyPlayers(nextActivePlayers, nextAllPlayers, nextCourses);
      setHoles(normalizeHoles(data.activeHoles?.length ? data.activeHoles : data.holes));
      setAllHoles(normalizeHoles(data.holes));
      const sheetAllScores = (data.scores || []).map(normalizeScoreRecord);
      const sheetActiveScores = (data.activeScores || []).map(normalizeScoreRecord);
      const livePendingScores = pendingScoresRef.current;
      const nextAllScores = mergeScoresPreservingPending(sheetAllScores, livePendingScores);
      const nextActiveScores = mergeScoresPreservingPending(
        sheetActiveScores,
        livePendingScores.filter((score) => String(score.round_id || "") === String(nextActiveRound?.round_id || ""))
      );
      setAllScores(nextAllScores);
      setScores(nextActiveScores);
      setConnectionStatus("online");
      setError("");
    } catch (err) {
      setConnectionStatus("offline");
      setError(err.message || "Datenbank konnte nicht geladen werden.");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  function optimisticUpdate(patch) {
    const next = normalizeScoreRecord({
      round_id: displayedActiveRound?.round_id || "r1",
      player_id: entryPlayerId,
      hole_number: activeHole,
      strokes: currentScore.strokes ?? "",
      picked_up: normalizeBoolean(currentScore.picked_up),
      over_two_putts: normalizeBoolean(currentScore.over_two_putts),
      putts_count: currentScore.putts_count ?? "",
      lady: normalizeBoolean(currentScore.lady),
      scorer_player_id: isScorerEntryMode ? entryPlayerId : (myPlayerId || ""),
      updated_at: new Date().toISOString(),
      ...patch,
    });

    const sameScore = (score) =>
      String(score.round_id) === String(next.round_id) &&
      String(score.player_id) === String(next.player_id) &&
      Number(score.hole_number) === Number(next.hole_number) &&
      isScorerControlScore(score) === isScorerControlScore(next);
    const updateList = (current) => (current.some(sameScore) ? current.map((s) => (sameScore(s) ? next : s)) : [...current, next]);
    setScores(updateList);
    setAllScores(updateList);
    return next;
  }

  function addPendingScore(score) {
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
      const nextPendingScores = current.filter((item) => {
        if (getScoreIdentityKey(item) !== targetKey) return true;

        // Wichtig: Wenn inzwischen ein neuerer lokaler Score existiert,
        // darf ein älterer erfolgreicher Speichervorgang ihn nicht entfernen.
        return getScoreTimestamp(item) > targetTimestamp;
      });
      pendingScoresRef.current = nextPendingScores;
      writeLocalJson("lordOfTheHoles.pendingScores", nextPendingScores);
      return nextPendingScores;
    });
  }

  async function savePendingScore(score) {
    try {
      await callSheetApi({ action: "upsertScore", score });
      removePendingScore(score);
      setConnectionStatus("online");
      setError("");
      return true;
    } catch (err) {
      setConnectionStatus("offline");
      setError(err.message || "Score ist lokal gesichert und wird später synchronisiert.");
      return false;
    }
  }

  async function flushPendingScores() {
    const livePendingScores = [...pendingScoresRef.current];
    if (!livePendingScores.length) return true;

    let allSaved = true;
    for (const pendingScore of livePendingScores) {
      const saved = await savePendingScore(pendingScore);
      if (!saved) allSaved = false;
    }

    return allSaved;
  }

  async function saveScore(patch) {
    const next = optimisticUpdate(patch);
    const saveId = scoreSaveSequenceRef.current + 1;
    scoreSaveSequenceRef.current = saveId;
    addPendingScore(next);
    setSaving(true);
    setScoreSaveInFlight(true);

    const savePromise = callSheetApi({ action: "upsertScore", score: next })
      .then(() => {
        removePendingScore(next);
        if (scoreSaveSequenceRef.current === saveId) {
          setConnectionStatus("online");
          setError("");
        }
        return true;
      })
      .catch((err) => {
        addPendingScore(next);
        if (scoreSaveSequenceRef.current === saveId) {
          setConnectionStatus("offline");
          setError("Score lokal gesichert. Wird automatisch synchronisiert, sobald die Datenbank erreichbar ist.");
        }
        return false;
      })
      .finally(() => {
        if (scoreSaveSequenceRef.current === saveId) {
          setSaving(false);
          setScoreSaveInFlight(false);
        }
      });

    pendingScoreSaveRef.current = savePromise;
    return savePromise;
  }

  function goToNextHole() {
    if (activeHole === 18) return;

    if (!hasCurrentScore) {
      setScoreHintMessage("Erst Score eintragen, dann weiter.");
      window.setTimeout(() => setScoreHintMessage(""), 1800);
      return;
    }

    setScoreHintMessage("");
    setActiveHole((h) => Math.min(18, h + 1));
  }

  async function createRoundBackup() {
    setSetupSavedMessage("");
    setBackupSavedMessage("");
    const roundToBackup = displayedActiveRound || { round_id: selectedActiveRoundId || "r1", round_name: "Runde" };
    setBackupSaving(true);
    try {
      const result = await callSheetApi({ action: "createRoundBackup", round_id: roundToBackup.round_id });
      setConnectionStatus("online");
      setError("");
      setBackupSavedMessage(result?.backup_sheet_name ? `Backup erstellt: ${result.backup_sheet_name}` : `${roundToBackup.round_name || "Runde"} wurde gesichert.`);
    } catch (err) {
      setConnectionStatus("offline");
      setError(err.message || "Backup konnte nicht erstellt werden.");
    } finally {
      setBackupSaving(false);
    }
  }

  async function saveFullSetup() {
    setBackupSavedMessage("");
    setSetupSavedMessage("");
    const nextAllPlayers = allPlayers.map((p) => {
      const hcpIndexKey = `hcp_index_${p.id}`;
      const hcpIndexInput = cleanHandicapInput(localHandicaps[hcpIndexKey] ?? p.handicap_index ?? p.dgv_hcp ?? p.hcp_index ?? "");
      const handicapIndex = hcpIndexInput === "" || hcpIndexInput === "-" ? 0 : Number(hcpIndexInput);
      const nextPlayer = {
        ...p,
        handicap_index: handicapIndex,
      };

      return {
        ...nextPlayer,
        course_hcp_goethe: getCourseHandicap(nextPlayer, "goethe", courses),
        course_hcp_feininger: getCourseHandicap(nextPlayer, "feininger", courses),
      };
    });

    if (!selectedActiveRoundId) {
      setError("Bitte zuerst eine Runde auswählen.");
      return;
    }

    setSetupSaving(true);
    try {
      await callSheetApi({
        action: "saveSetup",
        round_id: selectedActiveRoundId,
        course_id: selectedCourseId || "",
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
      setRounds((currentRounds) =>
        (currentRounds.length ? currentRounds : fallbackRounds).map((round) => ({
          ...round,
          course_id: String(round.round_id) === String(selectedActiveRoundId) ? selectedCourseId || round.course_id || "" : round.course_id,
          status: String(round.round_id) === String(selectedActiveRoundId) ? "active" : String(round.status).toLowerCase() === "completed" ? "completed" : "upcoming",
        }))
      );
      setConnectionStatus("online");
      setError("");
      setSetupSavedMessage("Setup wurde erfolgreich in der Datenbank gespeichert.");
      setAdminEditing(false);
      await loadData({ silent: true });
    } catch (err) {
      setConnectionStatus("offline");
      setError(err.message || "Setup konnte nicht gespeichert werden.");
    } finally {
      setSetupSaving(false);
    }
  }

  function setMainMenuAndView(value) {
    setMainMenu(value);
    setMenuOpen(false);
    if (value === "current") setView("score");
    if (value === "tournament") setView("tournament");
    if (value === "archive") setView("archive");
    if (value === "fun") setView("fun");
    if (value === "settings") setView("handicaps");
    if (value === "admin") setView("admin");
  }

  function renderStatusMessages() {
    return (
      <>
        {error && <Card className="mb-3 rounded-2xl border-amber-700/40 bg-amber-950/50"><CardContent className="p-3 text-sm text-amber-100">{error}</CardContent></Card>}
        {roundSavedMessage && <Card className="mb-3 rounded-2xl border-emerald-700/40 bg-emerald-950/40"><CardContent className="p-3 text-sm text-emerald-100">{roundSavedMessage}</CardContent></Card>}
      </>
    );
  }

  function renderHeader() {
    const subtitle = mainMenu === "current" ? displayedActiveRound?.round_name || "Aktive Runde" : mainMenu === "tournament" ? "Turnier" : mainMenu === "archive" ? "Scorekarten" : mainMenu === "fun" ? "Mittelerde" : mainMenu === "admin" ? "Admin" : "Einstellungen";
    return (
      <motion.header initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-3">
        <div className="mb-1 flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-black/35 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-200">Weimarer Land</div>
          <button type="button" onClick={() => setMenuOpen((value) => !value)} className="rounded-xl border border-amber-700/40 bg-black/25 px-3 py-1.5 text-lg leading-none text-amber-100" aria-label="Menü öffnen">☰</button>
        </div>
        <div className="relative text-center">
          <h1 className="font-serif text-3xl font-black tracking-wide text-amber-300 drop-shadow">Lord of the Holes</h1>
          <p className="mt-0.5 text-xs text-amber-100/75">{subtitle}</p>
          {menuOpen && (
            <div className="absolute right-0 top-[58px] z-30 w-64 overflow-hidden rounded-2xl border border-amber-700/40 bg-stone-950/95 text-left shadow-2xl shadow-black/70 backdrop-blur">
              {[
                ["current", "Aktuelle Runde"],
                ["tournament", "Turnier"],
                ["archive", "Scorekarten"],
                ["fun", "Mittelerde"],
                ["settings", "Einstellungen"],
                ["admin", "Admin"],
              ].map(([value, label]) => (
                <button key={value} type="button" onClick={() => setMainMenuAndView(value)} className={cls("block w-full border-b border-amber-700/20 px-4 py-4 text-left text-sm last:border-b-0", mainMenu === value ? "bg-amber-600 text-amber-50" : "bg-transparent text-amber-100")}>{label}</button>
              ))}
            </div>
          )}
        </div>
        <div className="mt-2 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-700/40 bg-black/35 px-2.5 py-1 text-[11px] text-amber-100/75">
            <Icon size={14} className={connectionStatus === "online" ? "text-emerald-300" : "text-red-300"}>{connectionStatus === "online" ? "●" : "○"}</Icon>
            {pendingScores.length ? `${pendingScores.length} Score${pendingScores.length === 1 ? "" : "s"} offen` : connectionStatus === "online" ? "Datenbank verbunden" : "Datenbank nicht verbunden"}
          </div>
        </div>
      </motion.header>
    );
  }

  function renderCurrentTabs() {
    if (mainMenu !== "current") return null;
    return (
      <div className="mb-3 grid grid-cols-2 gap-2">
        <Button onClick={() => setView("score")} className={cls("rounded-xl px-1 py-2.5 text-sm font-bold", view === "score" ? "bg-amber-600 text-amber-50" : "bg-stone-800 text-amber-100")}>Score</Button>
        <Button onClick={() => setView("leaderboard")} className={cls("rounded-xl px-1 py-2.5 text-sm font-bold", view === "leaderboard" ? "bg-amber-600 text-amber-50" : "bg-stone-800 text-amber-100")}>Board</Button>
      </div>
    );
  }

  function renderTournamentView() {
    return (
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <TournamentStandings players={allPlayers} rounds={rounds} holes={allHoles} scores={officialAllScores} activeRoundId={displayedActiveRound?.round_id} />
      </motion.section>
    );
  }

  function renderAdminView() {
    return (
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="mb-3 rounded-2xl border-amber-700/40 bg-[#20170f]/90 shadow-xl">
          <CardContent className="p-3">
            <div className="mb-3">
              <p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Admin</p>
              <h2 className="font-serif text-lg text-amber-200">Turnierverwaltung</h2>
              <p className="mt-1 text-sm text-amber-100/65">Aktive Runde und Spielvorgaben sind sichtbar, aber erst nach Passworteingabe bearbeitbar.</p>
            </div>
            {!isAdminUnlocked ? (
              <div className="mb-3 rounded-2xl border border-amber-700/30 bg-black/25 p-2.5">
                <label className="mb-1 block text-sm text-amber-100/80">Admin-Passwort</label>
                <input type="password" value={adminPinInput} onChange={(e) => setAdminPinInput(e.target.value)} placeholder="Passwort eingeben" className="mb-3 w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2.5 text-amber-50 placeholder:text-amber-100/30" />
                <Button onClick={() => { if (adminPinInput === ADMIN_PASSWORD) { setIsAdminUnlocked(true); setError(""); } else { setError("Admin-Passwort ist falsch."); } }} className="w-full rounded-2xl bg-amber-600 text-amber-50">Admin entsperren</Button>
              </div>
            ) : (
              <div className="mb-3 rounded-2xl border border-emerald-700/30 bg-emerald-950/30 p-3 text-sm text-emerald-100">Admin entsperrt. Änderungen können gespeichert werden.</div>
            )}
            <div className="mb-3 rounded-2xl border border-amber-700/30 bg-black/25 p-2.5">
              <label className="mb-1 block text-sm text-amber-100/80">Aktive Runde</label>
              <select value={selectedActiveRoundId} onChange={(e) => { setAdminEditing(true); setSelectedActiveRoundId(e.target.value); }} disabled={!isAdminUnlocked} className="w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2.5 text-amber-50 disabled:opacity-60">
                <option value="">Runde auswählen</option>
                {(rounds.length ? rounds : fallbackRounds).map((round) => <option key={round.round_id} value={round.round_id}>{round.round_name}</option>)}
              </select>
            </div>
            <div className="mb-3 rounded-2xl border border-amber-700/30 bg-black/25 p-2.5">
              <label className="mb-1 block text-sm text-amber-100/80">Kurs für aktive Runde</label>
              <select value={selectedCourseId} onChange={(e) => { setAdminEditing(true); setSelectedCourseId(e.target.value); }} disabled={!isAdminUnlocked} className="w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2.5 text-amber-50 disabled:opacity-60">
                <option value="">Kurs auswählen</option>
                {(courses.length ? courses : fallbackCourses).map((course) => <option key={course.course_id} value={course.course_id}>{course.course_name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              {allPlayers.map((p) => {
                const hcpIndexKey = `hcp_index_${p.id}`;
                const hcpIndexValue = localHandicaps[hcpIndexKey] ?? String(p.handicap_index ?? p.dgv_hcp ?? p.hcp_index ?? "");
                const previewPlayer = {
                  ...p,
                  handicap_index: hcpIndexValue === "" || hcpIndexValue === "-" ? 0 : Number(String(hcpIndexValue).replace(",", ".")),
                };
                const goetheSpv = getCourseHandicap(previewPlayer, "goethe", courses);
                const feiningerSpv = getCourseHandicap(previewPlayer, "feininger", courses);

                return (
                  <div key={p.id} className="rounded-xl border border-amber-700/30 bg-black/25 p-2.5">
                    <div className="mb-2 font-semibold text-amber-100">{getPlayerLabel(p)}<div className="text-xs font-normal text-amber-100/70">DGV-HCP eintragen · Spielvorgabe wird automatisch berechnet</div></div>
                    <div className="rounded-xl border border-amber-700/20 bg-black/20 p-2">
                      <label className="mb-1 block text-xs font-bold uppercase tracking-[0.16em] text-amber-300/80">DGV HCP / Handicap Index</label>
                      <input inputMode="decimal" disabled={!isAdminUnlocked} value={hcpIndexValue} onChange={(e) => { setAdminEditing(true); setLocalHandicaps((current) => ({ ...current, [hcpIndexKey]: cleanHandicapInput(e.target.value) })); }} className="w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2.5 text-center text-amber-50 disabled:opacity-60" />
                      <div className="mt-2 grid grid-cols-2 gap-2 text-center text-xs text-amber-100/75">
                        <div className="rounded-xl bg-amber-50/5 p-2"><div>Goethe SpV</div><b className="text-lg text-amber-200">{goetheSpv}</b></div>
                        <div className="rounded-xl bg-amber-50/5 p-2"><div>Feininger SpV</div><b className="text-lg text-amber-200">{feiningerSpv}</b></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button disabled={!isAdminUnlocked || setupSaving} onClick={saveFullSetup} className="mt-3 w-full rounded-2xl bg-amber-600 text-amber-50 disabled:opacity-50">{setupSaving ? "Speichere ..." : "Admin-Einstellungen speichern"}</Button>
            <Button disabled={!isAdminUnlocked || backupSaving} onClick={createRoundBackup} className="mt-2 w-full rounded-2xl border border-emerald-500/40 bg-emerald-700/80 text-emerald-50 disabled:opacity-50">{backupSaving ? "Erstelle Backup ..." : "Backup für aktive Runde erstellen"}</Button>
          </CardContent>
        </Card>
      </motion.section>
    );
  }

  function renderSettingsView() {
    return (
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="mb-3 rounded-2xl border-amber-700/40 bg-[#20170f]/90 shadow-xl">
          <CardContent className="p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Einstellungen</p>
            <h2 className="font-serif text-lg text-amber-200">Mein Handy</h2>
            <p className="mt-1 text-sm text-amber-100/65">Diese Einstellung wird nur lokal auf diesem Handy gespeichert.</p>
            <div className="mt-3 rounded-2xl border border-amber-700/30 bg-black/25 p-2.5">
              <label className="mb-1 block text-sm text-amber-100/80">Wer bin ich auf diesem Handy?</label>
              <select value={myPlayerId} onChange={(e) => setMyPlayerId(e.target.value)} className="w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2.5 text-amber-50">
                <option value="">Spieler auswählen</option>
                {allPlayers.map((player) => <option key={player.id} value={player.id}>{getPlayerLabel(player)}</option>)}
              </select>
              <p className="mt-2 text-xs text-amber-100/60">Dieser Spieler wird auf diesem Handy beim Score-Zählen ausgeblendet, damit man sich nicht selbst zählt.</p>
            </div>

            <div className="mt-3 rounded-2xl border border-amber-700/30 bg-black/25 p-2.5">
              <label className="mb-1 block text-sm text-amber-100/80">Wen zähle ich?</label>
              <select value={scoredPlayerId} onChange={(e) => setScoredPlayerId(e.target.value)} className="w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2.5 text-amber-50">
                <option value="">Spieler auswählen</option>
                {scoreablePlayers.map((player) => <option key={player.id} value={player.id}>{getPlayerLabel(player)}</option>)}
              </select>
              <p className="mt-2 text-xs text-amber-100/60">Dieser Spieler ist links im Score-Bereich vorausgewählt.</p>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    );
  }

  function goToBoardTable(tableId) {
    setMainMenu("current");
    setView("leaderboard");
    window.setTimeout(() => {
      document.getElementById(tableId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

  function goToHcpAdjustedBoard() {
    goToBoardTable("hcp-adjusted-board");
  }

  function goToNetStablefordBoard() {
    goToBoardTable("net-stableford-board");
  }

  function renderScoreView() {
    return (
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="mb-3 rounded-2xl border-amber-700/40 bg-[#20170f]/90 shadow-xl">
          <CardContent className="p-3">
            <div className={cls("mb-3 rounded-xl border bg-black/25 p-2.5", hasScoreMismatch ? "border-red-500/60" : "border-amber-700/30")}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Aktuell gespielt</div>
                  <div className="mt-0.5 font-serif text-lg text-amber-200">{displayedActiveRound?.round_name || "Runde 1"}</div>
                  <div className="text-xs text-amber-100/65">{activeCourse?.course_name || "Kein Kurs ausgewählt"}</div>
                </div>
                {hasScoreMismatch && <div className="rounded-full border border-red-400/50 bg-red-950/50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-red-100">{hasSelectedPlayerScoreMismatch ? "Abweichung" : "Dein Score"}</div>}
              </div>
            </div>
            <div className="mb-3 flex items-center justify-between">
              <div><p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Aktives Loch</p><h2 className="font-serif text-4xl font-black text-amber-200">{activeHole}</h2></div>
              <div className="rounded-2xl border border-amber-700/50 bg-black/30 p-3 text-right text-sm text-amber-50"><div className="text-amber-100">Par <b className="text-amber-200">{activeHoleData.par}</b></div><div className="text-amber-100">HCP <b className="text-amber-200">{activeHoleData.hcp}</b></div><div className="text-amber-100">{activeHoleData.meters} m</div></div>
            </div>
            {myCurrentStats ? (
              <div className="mb-3 w-full rounded-xl border border-amber-700/30 bg-black/25 p-2.5 text-left">
                <div className="mb-2 flex items-center justify-between gap-2"><div className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Mein aktueller Stand</div><div className="font-serif text-sm text-amber-200">{getPlayerLabel(myCurrentStats)}</div></div>
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <button type="button" onClick={goToHcpAdjustedBoard} className="rounded-xl bg-amber-50/5 p-2 text-amber-50 transition active:scale-[0.99]"><div className="text-amber-100">Strokes</div><b className="text-xl text-amber-200">{myCurrentStats.played ? myCurrentStats.hcpAdjustedTotal : "–"}</b><div className="mt-0.5 text-[11px] text-amber-100/70">Tatsächlich {myCurrentStats.played ? myCurrentStats.total : "–"} · Platz {myHcpAdjustedStrokeRank || "–"}</div></button>
                  <button type="button" onClick={goToNetStablefordBoard} className="rounded-xl bg-amber-50/5 p-2 text-amber-50 transition active:scale-[0.99]"><div className="text-amber-100">Netto Stbl</div><b className="text-xl text-amber-200">{myCurrentStats.netStableford}</b><div className="mt-0.5 text-[11px] text-amber-100/70">SpV {Number(myCurrentStats.course_hcp || 0)} · Platz {myNetStablefordRank || "–"}</div></button>
                </div>
              </div>
            ) : (
              <div className="mb-3 rounded-xl border border-amber-700/30 bg-black/20 p-2.5 text-xs text-amber-100/75">Unter Einstellungen kannst du festlegen, wer du bist. Danach erscheint hier dein aktueller Score.</div>
            )}
            <div className={cls("rounded-2xl border bg-amber-50/5 p-4", hasScoreMismatch ? "border-red-500/70 ring-1 ring-red-500/40" : "border-amber-700/40")}>
              {myCurrentPlayer && (
                <div className="mb-3 grid grid-cols-2 gap-2 rounded-2xl border border-amber-700/30 bg-black/25 p-1.5">
                  <button type="button" onClick={() => setScoreEntryMode("player")} className={cls("rounded-xl px-2 py-2 text-sm font-bold", !isScorerEntryMode ? "bg-amber-600 text-amber-50" : "text-amber-100", hasSelectedPlayerScoreMismatch && "ring-1 ring-red-400/60")}>{scoredPlayerButtonLabel} {hasSelectedPlayerScoreMismatch ? "⚠" : ""}</button>
                  <button type="button" onClick={() => setScoreEntryMode("scorer")} className={cls("rounded-xl px-2 py-2 text-sm font-bold", isScorerEntryMode ? "bg-amber-600 text-amber-50" : "text-amber-100", hasOwnScoreMismatch && "ring-1 ring-red-400/60")}>Mein Score {hasOwnScoreMismatch ? "⚠" : ""}</button>
                </div>
              )}
              {visibleScoreMismatchMessage && (
                <div className="mb-3 rounded-2xl border border-red-500/50 bg-red-950/40 p-2.5 text-sm text-red-100">
                  <span className="underline underline-offset-4">Abweichung</span>
                  <div className="mt-1 space-y-0.5">
                    {visibleScoreMismatchMessages.map((message) => (
                      <div key={message}>{message}</div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mb-3 flex items-center justify-between gap-2"><span className="font-serif text-lg text-amber-200">{getPlayerLabel(entryPlayer)} · Loch {activeHole}</span><span className="text-[11px] text-amber-100/65">Vorgabe <b className="text-amber-200 tracking-[0.18em]">{formatShotMarks(entryPlayerShotsOnActiveHole)}</b></span></div>
              <div className="mb-3">
                <ScoreStepper
                  value={normalizeBoolean(currentScore.picked_up) ? 0 : (currentScore.strokes ?? "")}
                  par={activeHoleData?.par || 4}
                  pickedUpStrokes={pickedUpStrokes}
                  onChange={(scoreValue) => {
                    if (Number(scoreValue) === 0 || Number(scoreValue) >= Number(pickedUpStrokes || 0)) {
                      saveScore({ strokes: pickedUpStrokes, picked_up: true });
                    } else {
                      saveScore({ strokes: scoreValue, picked_up: false });
                    }
                  }}
                />
              </div>
              <div className="mb-3 rounded-2xl border border-amber-700/40 bg-black/25 p-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-amber-100">Lady</div>
                    <div className="text-xs text-amber-100/65">Markiert eine Lady für dieses Loch.</div>
                  </div>
                  <input type="checkbox" checked={normalizeBoolean(currentScore.lady)} onChange={(e) => saveScore({ lady: e.target.checked })} className="h-5 w-5 accent-amber-500" />
                </div>
              </div>
              <div className="mb-3">
                <PuttStepper
                  value={currentScore.putts_count}
                  onChange={(putts) => saveScore({ putts_count: putts, over_two_putts: Number(putts) >= 3 })}
                />
              </div>
              {scoreHintMessage ? <div className="mb-2 rounded-xl border border-amber-500/40 bg-amber-950/50 p-2 text-center text-xs font-semibold text-amber-100">{scoreHintMessage}</div> : null}
              <div className="grid grid-cols-2 gap-2"><Button disabled={activeHole === 1} onClick={() => setActiveHole((h) => Math.max(1, h - 1))} className="rounded-2xl bg-stone-800 text-amber-100">Zurück</Button><Button disabled={activeHole === 18} onClick={goToNextHole} className={cls("rounded-2xl text-amber-50 disabled:opacity-50", hasCurrentScore ? "bg-amber-600" : "bg-amber-700/60 ring-1 ring-amber-500/30")}>Loch {Math.min(18, Number(activeHole || 1) + 1)}</Button></div>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    );
  }

  function renderLeaderboardView() {
    return (
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="landscape:fixed landscape:inset-0 landscape:z-40 landscape:overflow-auto landscape:bg-stone-950 landscape:p-3">
        <div className="landscape:mx-auto landscape:max-w-none">
          <Card className="mb-3 rounded-2xl border-amber-700/40 bg-black/35 landscape:rounded-xl"><CardContent className="p-3 text-sm text-amber-100 landscape:p-2"><div className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Aktuell gespielt</div><div className="mt-1 font-serif text-lg text-amber-200">{displayedActiveRound?.round_name || "Runde 1"}</div><div className="text-amber-100/65">{activeCourse?.course_name || "Kein Kurs ausgewählt"}</div></CardContent></Card>
          <Card className="mb-3 rounded-2xl border-amber-700/40 bg-[#20170f]/90 shadow-xl"><CardContent className="p-3"><div className="mb-3"><p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Leaderboard</p><h2 className="font-serif text-lg text-amber-200">Die Gefährten</h2></div>
            <LeaderboardTable title="Klassisches Zählspiel" players={strokePlayLeaderboard} columns={[{ label: "+/−", render: (p) => formatToPar(p.toPar, p.played), emphasize: true }, { label: "Schläge", render: (p) => (p.played ? p.total : "–") }, { label: "Löcher", render: (p) => String(p.played) + "/18" }]} />
            <div id="net-stableford-board" className="scroll-mt-3">
              <LeaderboardTable title="Netto Stableford" players={netStablefordLeaderboard} columns={[{ label: "Punkte", render: (p) => p.netStableford, emphasize: true }, { label: "Löcher", render: (p) => String(p.played) + "/18" }]} />
            </div>
            <div id="hcp-adjusted-board" className="scroll-mt-3">
              <LeaderboardTable title="Zählspiel HCP adjusted" players={hcpAdjustedStrokeLeaderboard} columns={[{ label: "+/−", render: (p) => formatToPar(p.hcpAdjustedToPar, p.played), emphasize: true }, { label: "Netto", render: (p) => (p.played ? p.hcpAdjustedTotal : "–") }, { label: "Löcher", render: (p) => String(p.played) + "/18" }]} />
            </div>
            <LeaderboardTable title="Brutto Punkte" players={grossStablefordLeaderboard} columns={[{ label: "Punkte", render: (p) => p.grossStableford, emphasize: true }, { label: "Schläge", render: (p) => (p.played ? p.total : "–") }, { label: "Löcher", render: (p) => String(p.played) + "/18" }]} />
            <LeaderboardTable title="Putt-Kasse" players={puttPenaltyLeaderboard} columns={[{ label: "3 Putts", render: (p) => `${p.threePutts} × 2 €` }, { label: "4+ Putts", render: (p) => `${p.fourPlusPutts} × 4 €` }, { label: "Gesamt", render: (p) => `${p.puttPenaltyEuro || 0} €`, emphasize: true }]} />
            <LeaderboardTable title="Ladys" players={ladyLeaderboard} columns={[{ label: "Anzahl", render: (p) => Number(p.ladyCount || 0), emphasize: true }, { label: "Löcher", render: (p) => String(p.played) + "/18" }]} />
          </CardContent></Card>
        </div>
      </motion.section>
    );
  }

  function renderFunView() {
    return (
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="landscape:fixed landscape:inset-0 landscape:z-40 landscape:overflow-auto landscape:bg-stone-950 landscape:p-3">
        <div className="landscape:mx-auto landscape:max-w-none">
          <MiddleEarthTables players={playersWithCurrentHandicaps} holes={holes} scores={officialScores} mismatches={roundMismatches} />
        </div>
      </motion.section>
    );
  }

  function renderArchiveView() {
    return (
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="landscape:fixed landscape:inset-0 landscape:z-40 landscape:overflow-auto landscape:bg-stone-950 landscape:p-3">
        <div className="landscape:mx-auto landscape:max-w-none">
          <ScorecardArchive rounds={rounds} courses={courses} players={allPlayers} roundPlayers={roundPlayers} holes={allHoles} scores={officialAllScores} selectedCourseId={selectedCourseId} />
        </div>
      </motion.section>
    );
  }

  function renderActiveView() {
    if (loading) {
      return <Card className="rounded-2xl border-amber-700/40 bg-[#20170f]/90 shadow-xl"><CardContent className="flex items-center gap-2 p-3 text-amber-100"><Icon spin>⟳</Icon> Lade Datenbank ...</CardContent></Card>;
    }
    if (view === "tournament") return renderTournamentView();
    if (view === "admin") return renderAdminView();
    if (view === "handicaps") return renderSettingsView();
    if (view === "score") return renderScoreView();
    if (view === "leaderboard") return renderLeaderboardView();
    if (view === "fun") return renderFunView();
    return renderArchiveView();
  }

  return (
    <div className="min-h-screen bg-stone-950 text-amber-50">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(245,158,11,0.22),transparent_35%),radial-gradient(circle_at_80%_15%,rgba(220,38,38,0.18),transparent_30%),linear-gradient(180deg,rgba(0,0,0,0.25),rgba(0,0,0,0.9))]" />
      <main className="relative mx-auto max-w-md px-3 py-3">
        {renderHeader()}
        {renderStatusMessages()}
        {renderCurrentTabs()}
        {renderActiveView()}
        <footer className="pb-4 pt-2 text-center text-[10px] uppercase tracking-[0.18em] text-amber-100/35">
          © Lord of the Holes Association
        </footer>
      </main>
      {setupSavedMessage ? (
        <div className="fixed inset-x-3 top-4 z-50 mx-auto max-w-md rounded-2xl border border-emerald-500/50 bg-emerald-950/95 p-3 text-emerald-50 shadow-2xl shadow-black/60 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-serif text-lg text-emerald-100">Gespeichert</div>
              <div className="mt-0.5 text-sm text-emerald-100/85">{setupSavedMessage}</div>
            </div>
            <button
              type="button"
              onClick={() => setSetupSavedMessage("")}
              className="rounded-xl border border-emerald-400/40 bg-black/20 px-3 py-1 text-sm font-bold text-emerald-50"
              aria-label="Meldung schließen"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
      {backupSavedMessage ? (
        <div className="fixed inset-x-3 top-4 z-50 mx-auto max-w-md rounded-2xl border border-emerald-500/50 bg-emerald-950/95 p-3 text-emerald-50 shadow-2xl shadow-black/60 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-serif text-lg text-emerald-100">Backup erstellt</div>
              <div className="mt-0.5 text-sm text-emerald-100/85">{backupSavedMessage}</div>
            </div>
            <button
              type="button"
              onClick={() => setBackupSavedMessage("")}
              className="rounded-xl border border-emerald-400/40 bg-black/20 px-3 py-1 text-sm font-bold text-emerald-50"
              aria-label="Backup-Meldung schließen"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
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
