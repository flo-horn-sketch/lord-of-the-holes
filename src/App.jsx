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

const GOOGLE_SHEETS_API_URL =
  "https://script.google.com/macros/s/AKfycbyAs9jsDaeQn8LHqcvibV5GKqywzMKVZ5y1F1-DJuUYiuLyrQSS_aXb6SLb3LtAUp6n/exec";

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
  { id: "florian", character_name: "Florian", display_name: "Florian", alias_name: "Sliceron", sort_order: 1, course_hcp_goethe: 0, course_hcp_feininger: 0 },
  { id: "mucky", character_name: "Mucky", display_name: "Mucky", alias_name: "Gimme", sort_order: 2, course_hcp_goethe: 0, course_hcp_feininger: 0 },
  { id: "kio", character_name: "Kio", display_name: "Kio", alias_name: "Foredo", sort_order: 3, course_hcp_goethe: 0, course_hcp_feininger: 0 },
  { id: "andreas", character_name: "Andreas", display_name: "Andreas", alias_name: "Bogeymir", sort_order: 4, course_hcp_goethe: 0, course_hcp_feininger: 0 },
  { id: "achim", character_name: "Achim", display_name: "Achim", alias_name: "Gangolf", sort_order: 5, course_hcp_goethe: 0, course_hcp_feininger: 0 },
  { id: "phillip", character_name: "Phillip", display_name: "Phillip", alias_name: "Golfum", sort_order: 6, course_hcp_goethe: 0, course_hcp_feininger: 0 },
];

const fallbackCourses = [
  { course_id: "goethe", course_name: "Goethe Kurs" },
  { course_id: "feininger", course_name: "Feininger Kurs" },
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
  return value === true || String(value).toLowerCase().trim() === "true" || String(value).toLowerCase().trim() === "ja";
}

function cleanNumericInput(value) {
  return String(value ?? "").replace(/[^0-9]/g, "");
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

function normalizeScoreRecord(score) {
  return {
    ...score,
    picked_up: normalizeBoolean(score?.picked_up),
    over_two_putts: normalizeBoolean(score?.over_two_putts),
    lady: normalizeBoolean(score?.lady),
  };
}

function withFallbackAlias(player) {
  if (!player) return player;
  return {
    ...player,
    alias_name: player.alias_name || fallbackAliases[String(player.id || "").trim()] || "",
  };
}

function getPlayerLabel(player) {
  const playerWithAlias = withFallbackAlias(player);
  const alias = String(playerWithAlias?.alias_name || "").trim();
  const name = String(playerWithAlias?.character_name || playerWithAlias?.display_name || playerWithAlias?.id || "").trim();
  return alias ? `${alias} (${name})` : name;
}

function formatToPar(value, played = true) {
  if (!played) return "–";
  if (value === 0) return "E";
  return value > 0 ? `+${value}` : String(value);
}

function normalizeHoles(rawHoles) {
  const validHoles = Array.isArray(rawHoles)
    ? rawHoles.filter((h) => Number(h.hole_number) > 0 && Number(h.par) > 0 && Number(h.hcp) > 0)
    : [];
  return validHoles.length ? validHoles : fallbackHoles;
}

function getCourseHcpKey(playerId, courseId) {
  return `${playerId}_${String(courseId || "goethe").toLowerCase().trim()}`;
}

function getCourseHandicap(player, courseId = "goethe") {
  const normalizedCourseId = String(courseId || "goethe").toLowerCase().trim();
  if (normalizedCourseId === "feininger") return Number(player?.course_hcp_feininger ?? 0);
  return Number(player?.course_hcp_goethe ?? 0);
}

function getPlayerForCourse(player, courseId = "goethe") {
  if (!player) return null;
  return {
    ...withFallbackAlias(player),
    course_hcp: getCourseHandicap(player, courseId),
  };
}

function getPlayersForCourse(players, courseId = "goethe") {
  return players.map((player) => getPlayerForCourse(player, courseId)).filter(Boolean);
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
  if (normalizeBoolean(score?.picked_up)) return 0;
  return getStablefordPoints(score?.strokes, par, shots);
}

function getPickedUpStrokes(player, hole, courseId = "goethe") {
  return Number(hole?.par || 0) * 2;
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
  return courses.find((course) => String(course.course_id) === String(round?.course_id));
}

function getRoundHoles(round, holes) {
  if (!round?.course_id) return [];
  return holes
    .filter((hole) => String(hole.course_id) === String(round.course_id))
    .sort((a, b) => Number(a.hole_number) - Number(b.hole_number));
}

function getRoundPlayers(roundId, allPlayers, roundPlayers) {
  const rowsForRound = Array.isArray(roundPlayers)
    ? roundPlayers.filter((rp) => String(rp.round_id).trim() === String(roundId).trim())
    : [];

  if (rowsForRound.length) {
    const allowedIds = rowsForRound
      .filter((rp) => normalizeBoolean(rp.is_playing))
      .map((rp) => String(rp.player_id).trim());
    return allPlayers.filter((p) => allowedIds.includes(String(p.id).trim()));
  }

  if (String(roundId).trim() === "r1") return allPlayers.filter((p) => String(p.id).trim() !== "achim");
  return allPlayers;
}

function buildPlayerStats(players, holes, scores) {
  return players.map((p) => {
    const playerScores = scores.filter((s) => s.player_id === p.id && s.strokes !== "" && s.strokes != null);
    const played = playerScores.length;
    const total = playerScores.reduce((sum, s) => sum + Number(s.strokes || 0), 0);
    const parPlayed = playerScores.reduce((sum, s) => {
      const hole = holes.find((h) => Number(h.hole_number) === Number(s.hole_number));
      return sum + Number(hole?.par || 0);
    }, 0);
    const { threePutts, fourPlusPutts, overTwoPutts } = getPuttBuckets(playerScores);
    const ladyCount = playerScores.filter((s) => normalizeBoolean(s.lady)).length;
    const netStableford = playerScores.reduce((sum, s) => {
      const hole = holes.find((h) => Number(h.hole_number) === Number(s.hole_number));
      const shots = getShotsOnHole(p.course_hcp, hole?.hcp);
      return sum + getScoreStablefordPoints(s, hole?.par, shots);
    }, 0);
    const grossStableford = playerScores.reduce((sum, s) => {
      const hole = holes.find((h) => Number(h.hole_number) === Number(s.hole_number));
      return sum + getScoreStablefordPoints(s, hole?.par, 0);
    }, 0);
    const hcpShotsUsed = playerScores.reduce((sum, s) => {
      const hole = holes.find((h) => Number(h.hole_number) === Number(s.hole_number));
      return sum + getShotsOnHole(p.course_hcp, hole?.hcp);
    }, 0);
    const hcpAdjustedTotal = total - hcpShotsUsed;
    const hcpAdjustedToPar = hcpAdjustedTotal - parPlayed;

    return {
      ...p,
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
  return [...stats].sort((a, b) => {
    if (a.played === 0 && b.played > 0) return 1;
    if (b.played === 0 && a.played > 0) return -1;
    return a.toPar - b.toPar || b.played - a.played || Number(a.sort_order || 0) - Number(b.sort_order || 0);
  });
}

function sortStableford(stats, fieldName) {
  return [...stats].sort((a, b) => {
    if (a.played === 0 && b.played > 0) return 1;
    if (b.played === 0 && a.played > 0) return -1;
    return Number(b[fieldName] || 0) - Number(a[fieldName] || 0) || b.played - a.played || Number(a.sort_order || 0) - Number(b.sort_order || 0);
  });
}

function sortHcpAdjustedStrokePlay(stats) {
  return [...stats].sort((a, b) => {
    if (a.played === 0 && b.played > 0) return 1;
    if (b.played === 0 && a.played > 0) return -1;
    return Number(a.hcpAdjustedToPar || 0) - Number(b.hcpAdjustedToPar || 0) || Number(a.hcpAdjustedTotal || 0) - Number(b.hcpAdjustedTotal || 0) || b.played - a.played || Number(a.sort_order || 0) - Number(b.sort_order || 0);
  });
}

function sortPuttPenalties(stats) {
  return [...stats].sort((a, b) => Number(b.puttPenaltyEuro || 0) - Number(a.puttPenaltyEuro || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function sortLadyCounts(stats) {
  return [...stats].sort((a, b) => Number(b.ladyCount || 0) - Number(a.ladyCount || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function getQualificationRounds(rounds) {
  return (rounds?.length ? rounds : fallbackRounds)
    .filter((round) => String(round.stage || "qualification") === "qualification")
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .slice(0, 3);
}

function getPuttKasseRounds(rounds) {
  return (rounds?.length ? rounds : fallbackRounds)
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
    .slice(0, 4);
}

function getFinalRound(rounds) {
  return (
    (rounds?.length ? rounds : fallbackRounds).find((round) => String(round.round_id) === "r4") ||
    (rounds?.length ? rounds : fallbackRounds).find((round) => String(round.stage) === "final") ||
    fallbackRounds[3]
  );
}

function buildTournamentNetStandings(players, rounds, holes, scores) {
  const qualificationRounds = getQualificationRounds(rounds);
  return players
    .map((player) => {
      const roundResults = qualificationRounds.map((round) => {
        const roundHoles = getRoundHoles(round, holes);
        const coursePlayer = getPlayerForCourse(player, round.course_id);
        const roundScores = scores.filter((score) => String(score.round_id) === String(round.round_id) && String(score.player_id) === String(player.id));
        const playedScores = roundScores.filter((score) => score.strokes !== "" && score.strokes != null);
        const netStableford = playedScores.reduce((sum, score) => {
          const hole = roundHoles.find((h) => Number(h.hole_number) === Number(score.hole_number));
          const shots = getShotsOnHole(coursePlayer?.course_hcp, hole?.hcp);
          return sum + getScoreStablefordPoints(score, hole?.par, shots);
        }, 0);
        return { round_id: round.round_id, round_name: round.round_name, points: netStableford, played: playedScores.length };
      });

      const playedResults = roundResults.filter((result) => result.played > 0);
      const sortedPlayed = [...playedResults].sort((a, b) => Number(b.points || 0) - Number(a.points || 0));
      const counted = sortedPlayed.slice(0, 2);
      const dropped = sortedPlayed.slice(2, 3)[0] || null;

      return {
        ...withFallbackAlias(player),
        roundResults,
        countedRoundIds: counted.map((result) => result.round_id),
        droppedRoundId: dropped?.round_id || "",
        totalBestTwo: counted.reduce((sum, result) => sum + Number(result.points || 0), 0),
        roundsPlayed: playedResults.length,
      };
    })
    .sort((a, b) => Number(b.totalBestTwo || 0) - Number(a.totalBestTwo || 0) || Number(b.roundsPlayed || 0) - Number(a.roundsPlayed || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function buildTournamentPuttStandings(players, rounds, scores) {
  const puttRounds = getPuttKasseRounds(rounds);
  return players
    .map((player) => {
      const roundResults = puttRounds.map((round) => {
        const roundScores = scores.filter((score) => String(score.round_id) === String(round.round_id) && String(score.player_id) === String(player.id));
        const buckets = getPuttBuckets(roundScores);
        return { round_id: round.round_id, round_name: round.round_name, threePutts: buckets.threePutts, fourPlusPutts: buckets.fourPlusPutts, amount: buckets.threePutts * 2 + buckets.fourPlusPutts * 4 };
      });
      return {
        ...withFallbackAlias(player),
        roundResults,
        totalThreePutts: roundResults.reduce((sum, r) => sum + r.threePutts, 0),
        totalFourPlusPutts: roundResults.reduce((sum, r) => sum + r.fourPlusPutts, 0),
        totalAmount: roundResults.reduce((sum, r) => sum + r.amount, 0),
      };
    })
    .sort((a, b) => Number(b.totalAmount || 0) - Number(a.totalAmount || 0) || Number(b.totalFourPlusPutts || 0) - Number(a.totalFourPlusPutts || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function buildFinalNetStandings(players, rounds, holes, scores) {
  const qualificationStandings = buildTournamentNetStandings(players, rounds, holes, scores);
  const finalRound = getFinalRound(rounds);
  const finalHoles = getRoundHoles(finalRound, holes);
  const withFinalScores = qualificationStandings.map((player, qualificationIndex) => {
    const finalPlayer = getPlayerForCourse(player, finalRound?.course_id);
    const finalScores = scores.filter((score) => String(score.round_id) === String(finalRound?.round_id) && String(score.player_id) === String(player.id));
    const playedFinalScores = finalScores.filter((score) => score.strokes !== "" && score.strokes != null);
    const finalNetStableford = playedFinalScores.reduce((sum, score) => {
      const hole = finalHoles.find((h) => Number(h.hole_number) === Number(score.hole_number));
      const shots = getShotsOnHole(finalPlayer?.course_hcp, hole?.hcp);
      return sum + getScoreStablefordPoints(score, hole?.par, shots);
    }, 0);
    return {
      ...withFallbackAlias(player),
      qualificationRank: qualificationIndex + 1,
      finalNetStableford,
      finalPlayed: playedFinalScores.length,
      finalGroup: qualificationIndex < 3 ? "championship" : "placement",
    };
  });

  const championshipGroup = withFinalScores
    .filter((p) => p.finalGroup === "championship")
    .sort((a, b) => Number(b.finalNetStableford || 0) - Number(a.finalNetStableford || 0) || Number(a.qualificationRank || 0) - Number(b.qualificationRank || 0))
    .map((p, i) => ({ ...p, finalRank: i + 1 }));
  const placementGroup = withFinalScores
    .filter((p) => p.finalGroup === "placement")
    .sort((a, b) => Number(b.finalNetStableford || 0) - Number(a.finalNetStableford || 0) || Number(a.qualificationRank || 0) - Number(b.qualificationRank || 0))
    .map((p, i) => ({ ...p, finalRank: i + 4 }));
  return [...championshipGroup, ...placementGroup];
}

function buildScorecardRows(player, round, holes, scores) {
  const roundHoles = getRoundHoles(round, holes);
  const coursePlayer = getPlayerForCourse(player, round?.course_id);
  const roundScores = scores.filter((s) => String(s.round_id) === String(round?.round_id) && String(s.player_id) === String(player?.id));

  return roundHoles.map((hole) => {
    const score = roundScores.find((s) => Number(s.hole_number) === Number(hole.hole_number));
    const strokes = score?.strokes === "" || score?.strokes == null ? null : Number(score.strokes);
    const isPickedUp = normalizeBoolean(score?.picked_up);
    const shots = getShotsOnHole(coursePlayer?.course_hcp, hole.hcp);
    const netStableford = getScoreStablefordPoints(score, hole.par, shots);
    const grossStableford = getScoreStablefordPoints(score, hole.par, 0);
    const toPar = strokes == null ? null : strokes - Number(hole.par || 0);
    const puttLabel = !normalizeBoolean(score?.over_two_putts) ? "–" : Number(score?.putts_count) >= 4 ? "4+ Putt" : "3 Putt";
    return { hole, score, strokes, isPickedUp, isLady: normalizeBoolean(score?.lady), shots, toPar, netStableford, grossStableford, puttLabel };
  });
}

function summarizeScorecard(rows) {
  const playedRows = rows.filter((row) => row.strokes != null);
  return {
    played: playedRows.length,
    totalStrokes: playedRows.reduce((sum, row) => sum + Number(row.strokes || 0), 0),
    toPar: playedRows.reduce((sum, row) => sum + Number(row.strokes || 0), 0) - playedRows.reduce((sum, row) => sum + Number(row.hole.par || 0), 0),
    netStableford: playedRows.reduce((sum, row) => sum + Number(row.netStableford || 0), 0),
    grossStableford: playedRows.reduce((sum, row) => sum + Number(row.grossStableford || 0), 0),
    threePutts: rows.filter((row) => row.puttLabel === "3 Putt").length,
    fourPlusPutts: rows.filter((row) => row.puttLabel === "4+ Putt").length,
  };
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
  assert("stableford par is two points", getStablefordPoints(4, 4, 0) === 2);
  assert("picked up score gives zero net points", getScoreStablefordPoints({ strokes: getPickedUpStrokes({ course_hcp_goethe: 5 }, { par: 4, hcp: 5 }, "goethe"), picked_up: true }, 4, getShotsOnHole(5, 5)) === 0);
  assert("picked up score is double par", getPickedUpStrokes({ course_hcp_goethe: 18 }, { par: 5, hcp: 1 }, "goethe") === 10);
  assert("picked up score stays zero even with many strokes received", getScoreStablefordPoints({ strokes: 10, picked_up: true }, 5, 5) === 0);
  assert("course handicap allocates two strokes above 18", getShotsOnHole(19, 1) === 2);
  assert("shot marks display two strokes", formatShotMarks(2) === "||");
  assert("shot marks display no stroke as dash", formatShotMarks(0) === "–");
  assert("current handicap helper works", getPlayerForCourse({ ...fallbackPlayers[0], course_hcp_goethe: 7 }, "goethe")?.course_hcp === 7);
  assert("alias fallback works", getPlayerLabel({ id: "florian", character_name: "Florian" }) === "Sliceron (Florian)");
  assert("explicit alias overrides fallback", getPlayerLabel({ id: "florian", character_name: "Florian", alias_name: "Captain Slice" }) === "Captain Slice (Florian)");
  assert("feininger handicap selected", getPlayerForCourse({ id: "x", course_hcp_goethe: 1, course_hcp_feininger: 9 }, "feininger")?.course_hcp === 9);

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

function LeaderboardTable({ title, players, columns }) {
  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-amber-700/30 bg-black/20">
      <div className="border-b border-amber-700/30 bg-amber-500/10 px-2.5 py-1.5 font-serif text-lg text-amber-200">{title}</div>
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full min-w-[360px] border-collapse text-sm text-amber-50">
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

function TournamentStandings({ players, rounds, holes, scores, activeRoundId = "" }) {
  const standings = useMemo(() => buildTournamentNetStandings(players, rounds, holes, scores), [players, rounds, holes, scores]);
  const finalStandings = useMemo(() => buildFinalNetStandings(players, rounds, holes, scores), [players, rounds, holes, scores]);
  const puttStandings = useMemo(() => buildTournamentPuttStandings(players, rounds, scores), [players, rounds, scores]);
  const qualificationRounds = getQualificationRounds(rounds);
  const puttKasseRounds = getPuttKasseRounds(rounds);
  const finalRound = getFinalRound(rounds);
  const isFinalActive = String(activeRoundId) === String(finalRound?.round_id || "r4");

  return (
    <Card className="mb-3 rounded-2xl border-amber-700/40 bg-[#20170f]/90 shadow-xl">
      <CardContent className="p-3">
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
    <Card className="mb-3 rounded-2xl border-amber-700/40 bg-[#20170f]/90 shadow-xl">
      <CardContent className="p-3">
        <div className="mb-3">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Archiv</p>
          <h2 className="font-serif text-lg text-amber-200">Scorekarte je Spieler</h2>
        </div>
        <div className="mb-3 grid gap-2 rounded-xl border border-amber-700/30 bg-black/25 p-2.5">
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
            <div className="mb-3 grid grid-cols-2 gap-2 text-center text-sm">
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
            <div className="overflow-x-auto rounded-2xl border border-amber-700/30 bg-black/20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <table className="w-full min-w-[760px] border-collapse text-sm text-amber-50">
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
                      <td className="px-2.5 py-1.5 text-right font-semibold text-amber-200">{row.strokes == null ? "–" : row.isPickedUp ? `${row.strokes} gestr.` : row.strokes}</td>
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

export default function LordOfTheHolesPWA() {
  const [players, setPlayers] = useState(fallbackPlayers);
  const [allPlayers, setAllPlayers] = useState(fallbackPlayers);
  const [courses, setCourses] = useState(fallbackCourses);
  const [rounds, setRounds] = useState(fallbackRounds);
  const [roundPlayers, setRoundPlayers] = useState([]);
  const [activeRound, setActiveRound] = useState(null);
  const [holes, setHoles] = useState(fallbackHoles);
  const [allHoles, setAllHoles] = useState(fallbackHoles);
  const [scores, setScores] = useState([]);
  const [allScores, setAllScores] = useState([]);
  const [localHandicaps, setLocalHandicaps] = useState({});
  const [scoredPlayerId, setScoredPlayerId] = useState(() => readLocalJson("lordOfTheHoles.scoredPlayerId", "florian"));
  const [activeHole, setActiveHole] = useState(() => readLocalJson("lordOfTheHoles.activeHole", 1));
  const [view, setView] = useState("score");
  const [mainMenu, setMainMenu] = useState("current");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scoreSaveInFlight, setScoreSaveInFlight] = useState(false);
  const pendingScoreSaveRef = useRef(Promise.resolve(true));
  const scoreSaveSequenceRef = useRef(0);
  const [autoSync] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("offline");
  const [error, setError] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedActiveRoundId, setSelectedActiveRoundId] = useState("r1");
  const [myPlayerId, setMyPlayerId] = useState(() => readLocalJson("lordOfTheHoles.myPlayerId", ""));
  const [adminPinInput, setAdminPinInput] = useState("");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminEditing, setAdminEditing] = useState(false);
  const [roundSavedMessage, setRoundSavedMessage] = useState("");
  const [setupSavedMessage, setSetupSavedMessage] = useState("");

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
  const playersWithCurrentHandicaps = useMemo(() => getPlayersForCourse(visiblePlayers, displayCourseId), [visiblePlayers, displayCourseId]);
  const activeHoleData = holes.find((h) => Number(h.hole_number) === activeHole) || holes[activeHole - 1] || fallbackHoles[activeHole - 1];
  const scoredPlayerBase = scoreablePlayers.find((p) => p.id === scoredPlayerId);
  const scoredPlayer = getPlayerForCourse(scoredPlayerBase, displayCourseId);
  const pickedUpStrokes = getPickedUpStrokes(scoredPlayer, activeHoleData, displayCourseId);
  const myCurrentPlayer = myPlayerId ? getPlayerForCourse(visiblePlayers.find((player) => String(player.id) === String(myPlayerId)), displayCourseId) : null;
  const myShotsOnActiveHole = getShotsOnHole(myCurrentPlayer?.course_hcp, activeHoleData?.hcp);
  const scoredPlayerShotsOnActiveHole = getShotsOnHole(scoredPlayer?.course_hcp, activeHoleData?.hcp);
  const currentScore = useMemo(
    () =>
      scores.find((s) => String(s.round_id || "") === String(displayedActiveRound?.round_id || "r1") && s.player_id === scoredPlayerId && Number(s.hole_number) === activeHole) ||
      { strokes: "", picked_up: false, over_two_putts: false, putts_count: "", lady: false },
    [scores, scoredPlayerId, activeHole, displayedActiveRound?.round_id]
  );
  const hasCurrentScore = currentScore.strokes !== "" && currentScore.strokes != null;
  const playerStats = useMemo(() => buildPlayerStats(playersWithCurrentHandicaps, holes, scores), [playersWithCurrentHandicaps, holes, scores]);
  const myCurrentStats = useMemo(() => (myPlayerId ? playerStats.find((player) => String(player.id) === String(myPlayerId)) || null : null), [playerStats, myPlayerId]);
  const strokePlayLeaderboard = useMemo(() => sortStrokePlay(playerStats), [playerStats]);
  const netStablefordLeaderboard = useMemo(() => sortStableford(playerStats, "netStableford"), [playerStats]);
  const grossStablefordLeaderboard = useMemo(() => sortStableford(playerStats, "grossStableford"), [playerStats]);
  const hcpAdjustedStrokeLeaderboard = useMemo(() => sortHcpAdjustedStrokePlay(playerStats), [playerStats]);
  const puttPenaltyLeaderboard = useMemo(() => sortPuttPenalties(playerStats), [playerStats]);
  const ladyLeaderboard = useMemo(() => sortLadyCounts(playerStats), [playerStats]);
  const myStrokeRank = useMemo(() => {
    const index = strokePlayLeaderboard.findIndex((player) => String(player.id) === String(myPlayerId));
    return index >= 0 ? index + 1 : null;
  }, [strokePlayLeaderboard, myPlayerId]);
  const myNetStablefordRank = useMemo(() => {
    const index = netStablefordLeaderboard.findIndex((player) => String(player.id) === String(myPlayerId));
    return index >= 0 ? index + 1 : null;
  }, [netStablefordLeaderboard, myPlayerId]);
  const quickScores = useMemo(() => {
    const par = Number(activeHoleData?.par || 4);
    return Array.from(new Set([par - 1, par, par + 1, par + 2, par + 3, par + 4].filter((v) => v > 0)));
  }, [activeHoleData?.par]);

  useEffect(() => {
    if (!scoreablePlayers.some((p) => String(p.id) === String(scoredPlayerId))) setScoredPlayerId(scoreablePlayers[0]?.id || "");
    if (Number(activeHole) < 1 || Number(activeHole) > 18) setActiveHole(1);
  }, [scoreablePlayers, scoredPlayerId]);

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
    if (!selectedActiveRoundId) return;
    const selectedRoundScores = allScores.filter((score) => String(score.round_id || "") === String(selectedActiveRoundId));
    setScores(selectedRoundScores);
  }, [selectedActiveRoundId, allScores]);

  useEffect(() => {
    if (!autoSync) return undefined;
    loadData({ silent: true });
    const timer = setInterval(() => loadData({ silent: true }), 30000);
    return () => clearInterval(timer);
  }, [autoSync]);

  function applyPlayers(nextActivePlayers, nextAllPlayers = nextActivePlayers) {
    setPlayers(nextActivePlayers.map(withFallbackAlias));
    setAllPlayers(nextAllPlayers.map(withFallbackAlias));
    if (adminEditing) return;
    const nextHandicaps = {};
    nextAllPlayers.forEach((player) => {
      nextHandicaps[getCourseHcpKey(player.id, "goethe")] = String(player.course_hcp_goethe ?? 0);
      nextHandicaps[getCourseHcpKey(player.id, "feininger")] = String(player.course_hcp_feininger ?? 0);
    });
    setLocalHandicaps(nextHandicaps);
  }

  async function loadData({ silent = false } = {}) {
    if (!silent) setLoading(true);
    try {
      const data = await callSheetApi({ action: "getState" });
      const nextAllPlayers = (data.players?.length ? data.players : fallbackPlayers).map(withFallbackAlias);
      const nextRounds = data.rounds?.length ? data.rounds : fallbackRounds;
      const nextActiveRound = data.activeRound || nextRounds.find((round) => String(round.status).toLowerCase() === "active") || nextRounds[0] || fallbackRounds[0];
      const nextActivePlayers = data.activePlayers?.length ? data.activePlayers.map(withFallbackAlias) : getRoundPlayers(nextActiveRound?.round_id, nextAllPlayers, data.roundPlayers || []);
      setCourses(data.courses?.length ? data.courses : fallbackCourses);
      setRounds(nextRounds);
      setRoundPlayers(data.roundPlayers || []);
      setActiveRound(nextActiveRound);
      if (!adminEditing) {
        setSelectedCourseId(nextActiveRound?.course_id || "");
        setSelectedActiveRoundId(nextActiveRound?.round_id || fallbackRounds[0].round_id);
      }
      applyPlayers(nextActivePlayers, nextAllPlayers);
      setHoles(normalizeHoles(data.activeHoles?.length ? data.activeHoles : data.holes));
      setAllHoles(normalizeHoles(data.holes));
      const nextAllScores = (data.scores || []).map(normalizeScoreRecord);
      const nextActiveScores = (data.activeScores || []).map(normalizeScoreRecord);
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
      player_id: scoredPlayerId,
      hole_number: activeHole,
      strokes: currentScore.strokes ?? "",
      picked_up: normalizeBoolean(currentScore.picked_up),
      over_two_putts: normalizeBoolean(currentScore.over_two_putts),
      putts_count: currentScore.putts_count ?? "",
      lady: normalizeBoolean(currentScore.lady),
      scorer_player_id: myPlayerId || "",
      updated_at: new Date().toISOString(),
      ...patch,
    });

    const sameScore = (score) => String(score.round_id) === String(next.round_id) && String(score.player_id) === String(next.player_id) && Number(score.hole_number) === Number(next.hole_number);
    const updateList = (current) => (current.some(sameScore) ? current.map((s) => (sameScore(s) ? next : s)) : [...current, next]);
    setScores(updateList);
    setAllScores(updateList);
    return next;
  }

  async function saveScore(patch) {
    const next = optimisticUpdate(patch);
    const saveId = scoreSaveSequenceRef.current + 1;
    scoreSaveSequenceRef.current = saveId;
    setSaving(true);
    setScoreSaveInFlight(true);

    const savePromise = callSheetApi({ action: "upsertScore", score: next })
      .then(() => {
        if (scoreSaveSequenceRef.current === saveId) {
          setConnectionStatus("online");
          setError("");
        }
        return true;
      })
      .catch((err) => {
        if (scoreSaveSequenceRef.current === saveId) {
          setConnectionStatus("offline");
          setError(err.message || "Score konnte nicht gespeichert werden.");
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

  async function goToNextHole() {
    if (activeHole === 18 || !hasCurrentScore || scoreSaveInFlight) return;

    const wasSaved = await pendingScoreSaveRef.current;
    if (!wasSaved) return;

    setActiveHole((h) => Math.min(18, h + 1));
  }

  async function saveFullSetup() {
    setSetupSavedMessage("");
    const nextAllPlayers = allPlayers.map((p) => {
      const goetheKey = getCourseHcpKey(p.id, "goethe");
      const feiningerKey = getCourseHcpKey(p.id, "feininger");
      const goetheValue = cleanNumericInput(localHandicaps[goetheKey]);
      const feiningerValue = cleanNumericInput(localHandicaps[feiningerKey]);
      return {
        ...p,
        course_hcp_goethe: goetheValue !== "" ? Number(goetheValue) : Number(p.course_hcp_goethe ?? 0),
        course_hcp_feininger: feiningerValue !== "" ? Number(feiningerValue) : Number(p.course_hcp_feininger ?? 0),
      };
    });

    if (!selectedActiveRoundId) {
      setError("Bitte zuerst eine Runde auswählen.");
      return;
    }

    setSaving(true);
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
      setSaving(false);
    }
  }

  async function saveRoundToArchive() {
    const roundToSave = displayedActiveRound || { round_id: "r1", round_name: "Runde 1" };
    setSaving(true);
    setRoundSavedMessage("");
    try {
      await callSheetApi({ action: "completeRoundAndStartNext", round_id: roundToSave.round_id });
      setConnectionStatus("online");
      setError("");
      setRoundSavedMessage(`${roundToSave.round_name || "Runde"} wurde gespeichert und ins Archiv übernommen.`);
      await loadData({ silent: true });
      setView("archive");
    } catch (err) {
      setConnectionStatus("offline");
      setError(err.message || "Runde konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  function setMainMenuAndView(value) {
    setMainMenu(value);
    setMenuOpen(false);
    if (value === "current") setView("score");
    if (value === "tournament") setView("tournament");
    if (value === "archive") setView("archive");
    if (value === "settings") setView("handicaps");
    if (value === "admin") setView("admin");
  }

  function renderStatusMessages() {
    return (
      <>
        {error && <Card className="mb-3 rounded-2xl border-amber-700/40 bg-amber-950/50"><CardContent className="p-3 text-sm text-amber-100">{error}</CardContent></Card>}
        {roundSavedMessage && <Card className="mb-3 rounded-2xl border-emerald-700/40 bg-emerald-950/40"><CardContent className="p-3 text-sm text-emerald-100">{roundSavedMessage}</CardContent></Card>}
        {setupSavedMessage && <Card className="mb-3 rounded-2xl border-emerald-700/40 bg-emerald-950/40"><CardContent className="p-3 text-sm text-emerald-100">{setupSavedMessage}</CardContent></Card>}
      </>
    );
  }

  function renderHeader() {
    const subtitle = mainMenu === "current" ? displayedActiveRound?.round_name || "Aktive Runde" : mainMenu === "tournament" ? "Turnier" : mainMenu === "archive" ? "Archiv" : mainMenu === "admin" ? "Admin" : "Einstellungen";
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
                ["archive", "Archiv"],
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
            {connectionStatus === "online" ? "Datenbank verbunden" : "Datenbank nicht verbunden"}
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
        <TournamentStandings players={allPlayers} rounds={rounds} holes={allHoles} scores={allScores} activeRoundId={displayedActiveRound?.round_id} />
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
                const goetheKey = getCourseHcpKey(p.id, "goethe");
                const feiningerKey = getCourseHcpKey(p.id, "feininger");
                return (
                  <div key={p.id} className="rounded-xl border border-amber-700/30 bg-black/25 p-2.5">
                    <div className="mb-2 font-semibold text-amber-100">{getPlayerLabel(p)}<div className="text-xs font-normal text-amber-100/70">2 Kurs-Spielvorgaben</div></div>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="rounded-xl border border-amber-700/20 bg-black/20 p-2">
                        <label className="mb-1 block text-xs font-bold uppercase tracking-[0.16em] text-amber-300/80">Goethe Spielvorgabe</label>
                        <input inputMode="numeric" disabled={!isAdminUnlocked} value={localHandicaps[goetheKey] ?? String(p.course_hcp_goethe ?? 0)} onChange={(e) => { setAdminEditing(true); setLocalHandicaps((current) => ({ ...current, [goetheKey]: cleanNumericInput(e.target.value) })); }} className="w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2.5 text-center text-amber-50 disabled:opacity-60" />
                      </div>
                      <div className="rounded-xl border border-amber-700/20 bg-black/20 p-2">
                        <label className="mb-1 block text-xs font-bold uppercase tracking-[0.16em] text-amber-300/80">Feininger Spielvorgabe</label>
                        <input inputMode="numeric" disabled={!isAdminUnlocked} value={localHandicaps[feiningerKey] ?? String(p.course_hcp_feininger ?? 0)} onChange={(e) => { setAdminEditing(true); setLocalHandicaps((current) => ({ ...current, [feiningerKey]: cleanNumericInput(e.target.value) })); }} className="w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2.5 text-center text-amber-50 disabled:opacity-60" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button disabled={!isAdminUnlocked} onClick={saveFullSetup} className="mt-3 w-full rounded-2xl bg-amber-600 text-amber-50 disabled:opacity-50">{saving ? "Speichere ..." : "Admin-Einstellungen speichern"}</Button>
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
          </CardContent>
        </Card>
      </motion.section>
    );
  }

  function renderScoreView() {
    return (
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="mb-3 rounded-2xl border-amber-700/40 bg-[#20170f]/90 shadow-xl">
          <CardContent className="p-3">
            <div className="mb-3 rounded-xl border border-amber-700/30 bg-black/25 p-2.5">
              <div className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Aktuell gespielt</div>
              <div className="mt-0.5 font-serif text-lg text-amber-200">{displayedActiveRound?.round_name || "Runde 1"}</div>
              <div className="text-xs text-amber-100/65">{activeCourse?.course_name || "Kein Kurs ausgewählt"}</div>
            </div>
            <div className="mb-3 flex items-center justify-between">
              <div><p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Aktives Loch</p><h2 className="font-serif text-4xl font-black text-amber-200">{activeHole}</h2></div>
              <div className="rounded-2xl border border-amber-700/50 bg-black/30 p-3 text-right text-sm text-amber-50"><div className="text-amber-100">Par <b className="text-amber-200">{activeHoleData.par}</b></div><div className="text-amber-100">HCP <b className="text-amber-200">{activeHoleData.hcp}</b></div><div className="text-amber-100">{activeHoleData.meters} m</div></div>
            </div>
            {myCurrentStats ? (
              <div className="mb-3 rounded-xl border border-amber-700/30 bg-black/25 p-2.5">
                <div className="mb-2 flex items-center justify-between gap-2"><div className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Mein aktueller Stand</div><div className="font-serif text-sm text-amber-200">{getPlayerLabel(myCurrentStats)}</div></div>
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div className="rounded-xl bg-amber-50/5 p-2 text-amber-50"><div className="text-amber-100">Schläge</div><b className="text-xl text-amber-200">{myCurrentStats.played ? myCurrentStats.total : "–"}</b><div className="mt-0.5 text-[11px] text-amber-100/70">{myCurrentStats.played}/18 · Platz {myStrokeRank || "–"}</div></div>
                  <div className="rounded-xl bg-amber-50/5 p-2 text-amber-50"><div className="text-amber-100">Netto Stbl</div><b className="text-xl text-amber-200">{myCurrentStats.netStableford}</b><div className="mt-0.5 text-[11px] text-amber-100/70">SpV {Number(myCurrentStats.course_hcp || 0)} · Platz {myNetStablefordRank || "–"}</div></div>
                  <div className="col-span-2 text-center text-[11px] text-amber-100/65">Vorgabe Loch {activeHole}: <b className="text-amber-200 tracking-[0.18em]">{formatShotMarks(myShotsOnActiveHole)}</b></div>
                </div>
              </div>
            ) : (
              <div className="mb-3 rounded-xl border border-amber-700/30 bg-black/20 p-2.5 text-xs text-amber-100/75">Unter Einstellungen kannst du festlegen, wer du bist. Danach erscheint hier dein aktueller Score.</div>
            )}
            <div className="rounded-2xl border border-amber-700/40 bg-amber-50/5 p-4">
              <div className="mb-3 flex items-center justify-between gap-2"><span className="font-serif text-lg text-amber-200">{getPlayerLabel(scoredPlayer)} · Loch {activeHole}</span><span className="text-[11px] text-amber-100/65">Vorgabe <b className="text-amber-200 tracking-[0.18em]">{formatShotMarks(scoredPlayerShotsOnActiveHole)}</b></span></div>
              <label className="mb-1 block text-sm text-amber-100/80">Score</label>
              <div className="mb-3 grid grid-cols-6 gap-2">
                {quickScores.map((value) => <button key={value} onClick={() => saveScore({ strokes: value, picked_up: false })} className={cls("rounded-2xl border py-2.5 text-base font-bold", Number(currentScore.strokes) === value && !normalizeBoolean(currentScore.picked_up) ? "border-amber-300 bg-amber-500 text-amber-50" : "border-amber-700/40 bg-black/25 text-amber-100")}>{value}</button>)}
              </div>
              <label className="mb-1 block text-sm text-amber-100/80">Oder Score manuell</label>
              <input inputMode="numeric" value={currentScore.strokes ?? ""} onChange={(e) => saveScore({ strokes: cleanNumericInput(e.target.value) === "" ? "" : Number(cleanNumericInput(e.target.value)), picked_up: false })} placeholder="z. B. 5" className="mb-3 w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2.5 text-amber-50 placeholder:text-amber-100/30" />
              <div className="mb-3 rounded-2xl border border-amber-700/40 bg-black/25 p-2.5"><div className="flex items-center justify-between gap-3"><div><div className="text-sm font-semibold text-amber-100">Loch gestrichen?</div><div className="text-xs text-amber-100/65">Wertet automatisch {pickedUpStrokes} Schläge und 0 Netto-Punkte.</div></div><input type="checkbox" checked={normalizeBoolean(currentScore.picked_up)} onChange={(e) => saveScore(e.target.checked ? { picked_up: true, strokes: pickedUpStrokes } : { picked_up: false })} className="h-5 w-5 accent-amber-500" /></div></div>
              <div className="mb-3 rounded-2xl border border-amber-700/40 bg-black/25 p-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-amber-100">Lady</div>
                    <div className="text-xs text-amber-100/65">Markiert eine Lady für dieses Loch.</div>
                  </div>
                  <input type="checkbox" checked={normalizeBoolean(currentScore.lady)} onChange={(e) => saveScore({ lady: e.target.checked })} className="h-5 w-5 accent-amber-500" />
                </div>
              </div>
              <div className="mb-3 rounded-2xl border border-amber-700/40 bg-black/25 p-2.5">
                <div className="mb-3 flex items-center justify-between"><span className="text-sm font-semibold text-amber-100">Snake</span><input type="checkbox" checked={normalizeBoolean(currentScore.over_two_putts)} onChange={(e) => saveScore({ over_two_putts: e.target.checked, putts_count: e.target.checked ? currentScore.putts_count || 3 : "" })} className="h-5 w-5 accent-amber-500" /></div>
                {normalizeBoolean(currentScore.over_two_putts) && <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => saveScore({ over_two_putts: true, putts_count: 3 })} className={cls("rounded-2xl border py-2.5 text-sm font-bold", Number(currentScore.putts_count) === 3 ? "border-amber-300 bg-amber-500 text-amber-50" : "border-amber-700/40 bg-stone-950 text-amber-100")}>3 Putt</button><button type="button" onClick={() => saveScore({ over_two_putts: true, putts_count: 4 })} className={cls("rounded-2xl border py-2.5 text-sm font-bold", Number(currentScore.putts_count) >= 4 ? "border-amber-300 bg-amber-500 text-amber-50" : "border-amber-700/40 bg-stone-950 text-amber-100")}>4+ Putt</button></div>}
              </div>
              <div className="grid grid-cols-2 gap-2"><Button disabled={activeHole === 1} onClick={() => setActiveHole((h) => Math.max(1, h - 1))} className="rounded-2xl bg-stone-800 text-amber-100">Zurück</Button><Button disabled={activeHole === 18 || !hasCurrentScore || scoreSaveInFlight} onClick={goToNextHole} className="rounded-2xl bg-amber-600 text-amber-50 disabled:opacity-50">{scoreSaveInFlight ? "Speichere ..." : "Nächstes Loch"}</Button></div>
              <div className="mt-3 rounded-2xl border border-amber-700/30 bg-black/25 p-2.5"><label className="mb-1 block text-sm text-amber-100/80">Spieler</label><select value={scoredPlayerId} onChange={(e) => setScoredPlayerId(e.target.value)} className="w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2.5 text-amber-50">{scoreablePlayers.map((p) => <option key={p.id} value={p.id}>{getPlayerLabel(p)}</option>)}</select></div>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    );
  }

  function renderLeaderboardView() {
    return (
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="mb-3 rounded-2xl border-amber-700/40 bg-black/35"><CardContent className="p-3 text-sm text-amber-100"><div className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Aktuell gespielt</div><div className="mt-1 font-serif text-lg text-amber-200">{displayedActiveRound?.round_name || "Runde 1"}</div><div className="text-amber-100/65">{activeCourse?.course_name || "Kein Kurs ausgewählt"}</div></CardContent></Card>
        <Card className="mb-3 rounded-2xl border-amber-700/40 bg-[#20170f]/90 shadow-xl"><CardContent className="p-3"><div className="mb-3"><p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Leaderboard</p><h2 className="font-serif text-lg text-amber-200">Die Gefährten</h2></div>
          <LeaderboardTable title="Klassisches Zählspiel" players={strokePlayLeaderboard} columns={[{ label: "+/−", render: (p) => formatToPar(p.toPar, p.played), emphasize: true }, { label: "Schläge", render: (p) => (p.played ? p.total : "–") }, { label: "Löcher", render: (p) => String(p.played) + "/18" }]} />
          <LeaderboardTable title="Netto Stableford" players={netStablefordLeaderboard} columns={[{ label: "Punkte", render: (p) => p.netStableford, emphasize: true }, { label: "SpV", render: (p) => Number(p.course_hcp || 0) }, { label: "Löcher", render: (p) => String(p.played) + "/18" }]} />
          <LeaderboardTable title="Zählspiel HCP adjusted" players={hcpAdjustedStrokeLeaderboard} columns={[{ label: "+/−", render: (p) => formatToPar(p.hcpAdjustedToPar, p.played), emphasize: true }, { label: "Netto", render: (p) => (p.played ? p.hcpAdjustedTotal : "–") }, { label: "HCP", render: (p) => p.hcpShotsUsed }, { label: "Löcher", render: (p) => String(p.played) + "/18" }]} />
          <LeaderboardTable title="Brutto Punkte" players={grossStablefordLeaderboard} columns={[{ label: "Punkte", render: (p) => p.grossStableford, emphasize: true }, { label: "Schläge", render: (p) => (p.played ? p.total : "–") }, { label: "Löcher", render: (p) => String(p.played) + "/18" }]} />
          <LeaderboardTable title="Putt-Kasse" players={puttPenaltyLeaderboard} columns={[{ label: "3 Putts", render: (p) => `${p.threePutts} × 2 €` }, { label: "4+ Putts", render: (p) => `${p.fourPlusPutts} × 4 €` }, { label: "Gesamt", render: (p) => `${p.puttPenaltyEuro || 0} €`, emphasize: true }]} />
          <LeaderboardTable title="Ladys" players={ladyLeaderboard} columns={[{ label: "Anzahl", render: (p) => Number(p.ladyCount || 0), emphasize: true }, { label: "Löcher", render: (p) => String(p.played) + "/18" }]} />
        </CardContent></Card>
      </motion.section>
    );
  }

  function renderArchiveView() {
    return (
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <ScorecardArchive rounds={rounds} courses={courses} players={allPlayers} roundPlayers={roundPlayers} holes={allHoles} scores={allScores} selectedCourseId={selectedCourseId} />
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
      </main>
    </div>
  );
}
