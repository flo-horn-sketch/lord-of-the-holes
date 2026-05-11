import React, { useEffect, useMemo, useState } from "react";

const GOOGLE_SHEETS_API_URL =
  "https://script.google.com/macros/s/AKfycbyoX_2zEXgmO7uccOc7itjNXGXmO64Z8h5I_nf3tX0Gp7GdgVz5yJyI5nHvqpdr5lkV/exec";

const fallbackPlayers = [
  { id: "florian", character_name: "Florian", display_name: "Florian", sort_order: 1, course_hcp: 0 },
  { id: "mucky", character_name: "Mucky", display_name: "Mucky", sort_order: 2, course_hcp: 0 },
  { id: "kio", character_name: "Kio", display_name: "Kio", sort_order: 3, course_hcp: 0 },
  { id: "andreas", character_name: "Andreas", display_name: "Andreas", sort_order: 4, course_hcp: 0 },
  { id: "achim", character_name: "Achim", display_name: "Achim", sort_order: 5, course_hcp: 0 },
  { id: "phillip", character_name: "Phillip", display_name: "Phillip", sort_order: 6, course_hcp: 0 },
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

function normalizeBoolean(value) {
  return value === true || String(value).toLowerCase().trim() === "true" || String(value).toLowerCase().trim() === "ja";
}

function cleanNumericInput(value) {
  return String(value ?? "").replace(/[^0-9]/g, "");
}

function scoreKey(score) {
  return `${score.round_id || ""}|${score.player_id || ""}|${score.hole_number || ""}`;
}

function mergeScores(sheetScores = [], localScores = [], roundId = "") {
  const map = new Map();
  [...sheetScores, ...localScores].forEach((score) => {
    if (!score || !score.player_id || !score.hole_number) return;
    if (roundId && String(score.round_id || "") !== String(roundId)) return;
    map.set(scoreKey(score), score);
  });
  return Array.from(map.values());
}

function normalizeHoles(rawHoles) {
  const validHoles = Array.isArray(rawHoles)
    ? rawHoles.filter((h) => Number(h.hole_number) > 0 && Number(h.par) > 0 && Number(h.hcp) > 0)
    : [];
  return validHoles.length ? validHoles : fallbackHoles;
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

function formatToPar(value, played = true) {
  if (!played) return "–";
  if (value === 0) return "E";
  return value > 0 ? `+${value}` : String(value);
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

  if (String(roundId).trim() === "r1") {
    return allPlayers.filter((p) => String(p.id).trim() !== "achim");
  }

  return allPlayers;
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

function getPuttBuckets(playerScores) {
  const threePutts = playerScores.filter((s) => normalizeBoolean(s.over_two_putts) && Number(s.putts_count) === 3).length;
  const fourPlusPutts = playerScores.filter((s) => normalizeBoolean(s.over_two_putts) && Number(s.putts_count) >= 4).length;
  return { threePutts, fourPlusPutts, overTwoPutts: threePutts + fourPlusPutts };
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
    const netStableford = playerScores.reduce((sum, s) => {
      const hole = holes.find((h) => Number(h.hole_number) === Number(s.hole_number));
      const shots = getShotsOnHole(p.course_hcp, hole?.hcp);
      return sum + getStablefordPoints(s.strokes, hole?.par, shots);
    }, 0);
    const grossStableford = playerScores.reduce((sum, s) => {
      const hole = holes.find((h) => Number(h.hole_number) === Number(s.hole_number));
      return sum + getStablefordPoints(s.strokes, hole?.par, 0);
    }, 0);

    return {
      ...p,
      played,
      total,
      toPar: total - parPlayed,
      overTwoPutts,
      threePutts,
      fourPlusPutts,
      puttPenaltyEuro: threePutts * 2 + fourPlusPutts * 4,
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

function sortPuttPenalties(stats) {
  return [...stats].sort((a, b) => {
    return Number(b.puttPenaltyEuro || 0) - Number(a.puttPenaltyEuro || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0);
  });
}

function buildScorecardRows(player, round, holes, scores) {
  const roundHoles = getRoundHoles(round, holes);
  const roundScores = scores.filter((s) => String(s.round_id) === String(round?.round_id) && String(s.player_id) === String(player?.id));

  return roundHoles.map((hole) => {
    const score = roundScores.find((s) => Number(s.hole_number) === Number(hole.hole_number));
    const strokes = score?.strokes === "" || score?.strokes == null ? null : Number(score.strokes);
    const shots = getShotsOnHole(player?.course_hcp, hole.hcp);
    const netStableford = getStablefordPoints(strokes, hole.par, shots);
    const grossStableford = getStablefordPoints(strokes, hole.par, 0);
    const toPar = strokes == null ? null : strokes - Number(hole.par || 0);
    const puttLabel = !normalizeBoolean(score?.over_two_putts)
      ? "–"
      : Number(score?.putts_count) >= 4
        ? "4+ Putt"
        : "3 Putt";

    return { hole, score, strokes, shots, toPar, netStableford, grossStableford, puttLabel };
  });
}

function summarizeScorecard(rows) {
  const playedRows = rows.filter((row) => row.strokes != null);
  const totalStrokes = playedRows.reduce((sum, row) => sum + Number(row.strokes || 0), 0);
  const totalPar = playedRows.reduce((sum, row) => sum + Number(row.hole.par || 0), 0);
  const netStableford = playedRows.reduce((sum, row) => sum + Number(row.netStableford || 0), 0);
  const grossStableford = playedRows.reduce((sum, row) => sum + Number(row.grossStableford || 0), 0);
  const threePutts = rows.filter((row) => row.puttLabel === "3 Putt").length;
  const fourPlusPutts = rows.filter((row) => row.puttLabel === "4+ Putt").length;

  return { played: playedRows.length, totalStrokes, toPar: totalStrokes - totalPar, netStableford, grossStableford, threePutts, fourPlusPutts };
}

async function callSheetApi(payload) {
  const url = new URL(GOOGLE_SHEETS_API_URL);
  url.searchParams.set("payload", JSON.stringify(payload));
  url.searchParams.set("cacheBust", String(Date.now()));

  const response = await fetch(url.toString(), { method: "GET" });
  if (!response.ok) throw new Error("Google-Sheets-API nicht erreichbar.");

  const data = await response.json();
  if (data && data.ok === false) throw new Error(data.error || "Google-Sheets-API meldet einen Fehler.");
  return data;
}

function BoardTable({ title, players, columns }) {
  return (
    <div className="table-box">
      <div className="table-title">{title}</div>
      <div className="scroll-x">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Spieler</th>
              {columns.map((column) => <th key={column.label}>{column.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {players.map((p, index) => (
              <tr key={p.id}>
                <td>{index + 1}</td>
                <td className="name-cell">{p.character_name}</td>
                {columns.map((column) => (
                  <td key={column.label} className={column.emphasize ? "emphasis" : ""}>{column.render(p)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScorecardArchive({ rounds, courses, players, roundPlayers, holes, scores }) {
  const availableRounds = rounds?.length ? rounds : fallbackRounds;
  const [selectedRoundId, setSelectedRoundId] = useState(availableRounds[0]?.round_id || "");
  const selectedRound = availableRounds.find((round) => String(round.round_id) === String(selectedRoundId)) || availableRounds[0] || null;
  const eligiblePlayers = useMemo(
    () => getRoundPlayers(selectedRound?.round_id, players, roundPlayers),
    [selectedRound?.round_id, players, roundPlayers]
  );
  const [selectedPlayerId, setSelectedPlayerId] = useState(eligiblePlayers[0]?.id || "");

  useEffect(() => {
    if (!eligiblePlayers.some((p) => p.id === selectedPlayerId)) {
      setSelectedPlayerId(eligiblePlayers[0]?.id || "");
    }
  }, [eligiblePlayers, selectedPlayerId]);

  const selectedPlayer = eligiblePlayers.find((p) => String(p.id) === String(selectedPlayerId)) || eligiblePlayers[0] || null;
  const selectedCourse = getRoundCourse(selectedRound, courses);
  const rows = useMemo(() => buildScorecardRows(selectedPlayer, selectedRound, holes, scores), [selectedPlayer, selectedRound, holes, scores]);
  const summary = useMemo(() => summarizeScorecard(rows), [rows]);

  return (
    <section className="card">
      <h2>Archiv · Scorekarte je Spieler</h2>

      <div className="setup-box">
        <label>Runde</label>
        <select value={selectedRoundId} onChange={(e) => setSelectedRoundId(e.target.value)}>
          {availableRounds.map((round) => (
            <option key={round.round_id} value={round.round_id}>{round.round_name} · {round.status}</option>
          ))}
        </select>

        <label>Spieler</label>
        <select value={selectedPlayerId} onChange={(e) => setSelectedPlayerId(e.target.value)}>
          {eligiblePlayers.map((p) => <option key={p.id} value={p.id}>{p.character_name}</option>)}
        </select>

        <p className="muted">Kurs: <b>{selectedCourse?.course_name || "noch nicht gesetzt"}</b></p>
      </div>

      {!selectedRound?.course_id ? (
        <p className="notice">Für diese Runde ist noch kein Kurs gesetzt.</p>
      ) : !selectedPlayer ? (
        <p className="notice">Für diese Runde ist kein Spieler ausgewählt.</p>
      ) : (
        <>
          <div className="stats-grid">
            <div><span>Löcher</span><b>{summary.played}/18</b></div>
            <div><span>Schläge</span><b>{summary.played ? summary.totalStrokes : "–"}</b></div>
            <div><span>+/− Par</span><b>{summary.played ? formatToPar(summary.toPar) : "–"}</b></div>
            <div><span>Netto</span><b>{summary.netStableford}</b></div>
            <div><span>Brutto</span><b>{summary.grossStableford}</b></div>
            <div><span>Putts</span><b>3× {summary.threePutts} · 4+× {summary.fourPlusPutts}</b></div>
          </div>

          <div className="scroll-x scorecard-table">
            <table>
              <thead>
                <tr>
                  <th className="sticky-col">Loch</th>
                  <th>Meter</th>
                  <th>Par</th>
                  <th>HCP</th>
                  <th>Score</th>
                  <th>+/−</th>
                  <th>Netto</th>
                  <th>Brutto</th>
                  <th>Putts</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.hole.hole_number}>
                    <td className="sticky-col name-cell">{row.hole.hole_number}</td>
                    <td>{row.hole.meters}</td>
                    <td>{row.hole.par}</td>
                    <td>{row.hole.hcp}</td>
                    <td className="emphasis">{row.strokes ?? "–"}</td>
                    <td>{row.toPar == null ? "–" : formatToPar(row.toPar)}</td>
                    <td>{row.strokes == null ? "–" : row.netStableford}</td>
                    <td>{row.strokes == null ? "–" : row.grossStableford}</td>
                    <td>{row.puttLabel}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="sticky-col name-cell">Total</td>
                  <td>–</td>
                  <td>{rows.reduce((sum, row) => sum + Number(row.hole.par || 0), 0)}</td>
                  <td>–</td>
                  <td>{summary.played ? summary.totalStrokes : "–"}</td>
                  <td>{summary.played ? formatToPar(summary.toPar) : "–"}</td>
                  <td>{summary.netStableford}</td>
                  <td>{summary.grossStableford}</td>
                  <td>3× {summary.threePutts} · 4+× {summary.fourPlusPutts}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="hint">Die Scorekarte lässt sich seitlich scrollen; die Loch-Spalte bleibt links fixiert.</p>
        </>
      )}
    </section>
  );
}

export default function App() {
  const [players, setPlayers] = useState(fallbackPlayers);
  const [allPlayers, setAllPlayers] = useState(fallbackPlayers);
  const [courses, setCourses] = useState(fallbackCourses);
  const [rounds, setRounds] = useState(fallbackRounds);
  const [roundPlayers, setRoundPlayers] = useState([]);
  const [activeRound, setActiveRound] = useState(null);
  const [holes, setHoles] = useState(fallbackHoles);
  const [allHoles, setAllHoles] = useState(fallbackHoles);
  const [scores, setScores] = useState(() => readLocalJson("lordOfTheHoles.activeScores", []));
  const [allScores, setAllScores] = useState(() => readLocalJson("lordOfTheHoles.allScores", []));
  const [localHandicaps, setLocalHandicaps] = useState(() => {
    const fallback = Object.fromEntries(fallbackPlayers.map((p) => [p.id, String(p.course_hcp || 0)]));
    const saved = readLocalJson("lordOfTheHoles.localHandicaps", null);
    return saved ? { ...fallback, ...saved } : fallback;
  });

  const [scoredPlayerId, setScoredPlayerId] = useState("florian");
  const [activeHole, setActiveHole] = useState(1);
  const [view, setView] = useState("score");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("offline");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [autoSync, setAutoSync] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(() => readLocalJson("lordOfTheHoles.selectedCourseId", ""));
  const [selectedActiveRoundId, setSelectedActiveRoundId] = useState(() => readLocalJson("lordOfTheHoles.selectedActiveRoundId", "r1"));

  const displayedActiveRound =
    (selectedActiveRoundId && (rounds.length ? rounds : fallbackRounds).find((round) => String(round.round_id) === String(selectedActiveRoundId))) ||
    activeRound ||
    rounds.find((round) => String(round.status).toLowerCase() === "active") ||
    fallbackRounds[0];

  const displayCourseId = displayedActiveRound?.course_id || selectedCourseId || "";
  const activeCourse = (courses.length ? courses : fallbackCourses).find((course) => String(course.course_id) === String(displayCourseId));

  const visiblePlayers = useMemo(
    () => getRoundPlayers(displayedActiveRound?.round_id, allPlayers, roundPlayers),
    [displayedActiveRound?.round_id, allPlayers, roundPlayers]
  );

  useEffect(() => {
    if (!visiblePlayers.some((p) => String(p.id) === String(scoredPlayerId))) {
      setScoredPlayerId(visiblePlayers[0]?.id || "");
    }
  }, [visiblePlayers, scoredPlayerId]);

  function applyPlayers(nextActivePlayers, nextAllPlayers = nextActivePlayers) {
    setPlayers(nextActivePlayers);
    setAllPlayers(nextAllPlayers);
    setLocalHandicaps(() => {
      const fromSheet = Object.fromEntries(nextAllPlayers.map((p) => [p.id, String(p.course_hcp ?? 0)]));
      writeLocalJson("lordOfTheHoles.localHandicaps", fromSheet);
      return fromSheet;
    });
  }

  async function loadData({ silent = false } = {}) {
    if (!silent) setLoading(true);
    try {
      const data = await callSheetApi({ action: "getState" });
      const nextAllPlayers = data.players?.length ? data.players : fallbackPlayers;
      const nextActiveRound = data.activeRound || data.rounds?.find((round) => String(round.status).toLowerCase() === "active") || data.rounds?.[0] || fallbackRounds[0];
      const nextActivePlayers = data.activePlayers?.length ? data.activePlayers : getRoundPlayers(nextActiveRound?.round_id, nextAllPlayers, data.roundPlayers || []);

      setCourses(data.courses?.length ? data.courses : fallbackCourses);
      setRounds(data.rounds?.length ? data.rounds : fallbackRounds);
      setRoundPlayers(data.roundPlayers || []);
      setActiveRound(nextActiveRound);

      const nextSelectedCourseId = nextActiveRound?.course_id || readLocalJson("lordOfTheHoles.selectedCourseId", "");
      const nextSelectedRoundId = nextActiveRound?.round_id || readLocalJson("lordOfTheHoles.selectedActiveRoundId", "r1");
      setSelectedCourseId(nextSelectedCourseId);
      setSelectedActiveRoundId(nextSelectedRoundId);
      writeLocalJson("lordOfTheHoles.selectedCourseId", nextSelectedCourseId);
      writeLocalJson("lordOfTheHoles.selectedActiveRoundId", nextSelectedRoundId);

      applyPlayers(nextActivePlayers, nextAllPlayers);
      setHoles(normalizeHoles(data.activeHoles?.length ? data.activeHoles : data.holes));
      setAllHoles(normalizeHoles(data.holes));

      const activeRoundId = nextActiveRound?.round_id || "";
      const mergedActiveScores = mergeScores(data.activeScores || [], [], activeRoundId);
      const mergedAllScores = mergeScores(data.scores || [], readLocalJson("lordOfTheHoles.allScores", []));
      setScores(mergedActiveScores);
      setAllScores(mergedAllScores);
      writeLocalJson("lordOfTheHoles.activeScores", mergedActiveScores);
      writeLocalJson("lordOfTheHoles.allScores", mergedAllScores);

      setConnectionStatus("online");
      setError("");
    } catch (err) {
      setConnectionStatus("offline");
      setError(err.message || "Google Sheet konnte nicht geladen werden.");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    writeLocalJson("lordOfTheHoles.localHandicaps", localHandicaps);
  }, [localHandicaps]);

  useEffect(() => {
    writeLocalJson("lordOfTheHoles.selectedCourseId", selectedCourseId);
  }, [selectedCourseId]);

  useEffect(() => {
    writeLocalJson("lordOfTheHoles.selectedActiveRoundId", selectedActiveRoundId);
    if (!selectedActiveRoundId) return;
    const selectedRoundScores = allScores.filter((score) => String(score.round_id || "") === String(selectedActiveRoundId));
    setScores(selectedRoundScores);
    writeLocalJson("lordOfTheHoles.activeScores", selectedRoundScores);
  }, [selectedActiveRoundId, allScores]);

  useEffect(() => {
    if (!autoSync) return undefined;
    loadData({ silent: true });
    const timer = setInterval(() => loadData({ silent: true }), 30000);
    return () => clearInterval(timer);
  }, [autoSync]);

  const activeHoleData = holes.find((h) => Number(h.hole_number) === activeHole) || holes[activeHole - 1] || fallbackHoles[activeHole - 1];
  const scoredPlayer = visiblePlayers.find((p) => p.id === scoredPlayerId);

  const currentScore = useMemo(() => {
    return scores.find((s) => String(s.round_id || "") === String(displayedActiveRound?.round_id || "r1") && s.player_id === scoredPlayerId && Number(s.hole_number) === activeHole) || {
      strokes: "",
      over_two_putts: false,
      putts_count: "",
    };
  }, [scores, scoredPlayerId, activeHole, displayedActiveRound?.round_id]);

  const totalPar = useMemo(() => holes.reduce((sum, h) => sum + Number(h.par || 0), 0), [holes]);

  const playersWithCurrentHandicaps = useMemo(() => {
    return visiblePlayers.map((player) => {
      const sheetPlayer = allPlayers.find((p) => String(p.id) === String(player.id));
      const hcpFromInput = localHandicaps[player.id];
      const courseHcp = hcpFromInput !== "" && hcpFromInput != null
        ? Number(hcpFromInput || 0)
        : Number(sheetPlayer?.course_hcp ?? player.course_hcp ?? 0);
      return { ...player, course_hcp: courseHcp };
    });
  }, [visiblePlayers, allPlayers, localHandicaps]);

  const playerStats = useMemo(() => buildPlayerStats(playersWithCurrentHandicaps, holes, scores), [playersWithCurrentHandicaps, holes, scores]);
  const strokePlayLeaderboard = useMemo(() => sortStrokePlay(playerStats), [playerStats]);
  const netStablefordLeaderboard = useMemo(() => sortStableford(playerStats, "netStableford"), [playerStats]);
  const grossStablefordLeaderboard = useMemo(() => sortStableford(playerStats, "grossStableford"), [playerStats]);
  const puttPenaltyLeaderboard = useMemo(() => sortPuttPenalties(playerStats), [playerStats]);

  function optimisticUpdate(patch) {
    const next = {
      round_id: displayedActiveRound?.round_id || "r1",
      player_id: scoredPlayerId,
      hole_number: activeHole,
      strokes: currentScore.strokes ?? "",
      over_two_putts: normalizeBoolean(currentScore.over_two_putts),
      putts_count: currentScore.putts_count ?? "",
      scorer_player_id: "",
      updated_at: new Date().toISOString(),
      ...patch,
    };

    setScores((current) => {
      const exists = current.some((s) => String(s.round_id) === String(next.round_id) && s.player_id === scoredPlayerId && Number(s.hole_number) === activeHole);
      if (exists) return current.map((s) => (String(s.round_id) === String(next.round_id) && s.player_id === scoredPlayerId && Number(s.hole_number) === activeHole ? next : s));
      return [...current, next];
    });

    setAllScores((current) => {
      const exists = current.some((s) => String(s.round_id) === String(next.round_id) && String(s.player_id) === String(next.player_id) && Number(s.hole_number) === Number(next.hole_number));
      if (exists) return current.map((s) => (String(s.round_id) === String(next.round_id) && String(s.player_id) === String(next.player_id) && Number(s.hole_number) === Number(next.hole_number) ? next : s));
      return [...current, next];
    });

    return next;
  }

  async function saveScore(patch) {
    const next = optimisticUpdate(patch);
    setSaving(true);
    try {
      await callSheetApi({ action: "upsertScore", score: next });
      setConnectionStatus("online");
      setError("");
      await loadData({ silent: true });
    } catch (err) {
      setConnectionStatus("offline");
      setError(err.message || "Score konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  async function saveFullSetup() {
    setSuccess("");
    const nextAllPlayers = allPlayers.map((p) => ({ ...p, course_hcp: Number(cleanNumericInput(localHandicaps[p.id]) || 0) }));

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
        players: nextAllPlayers.map((p) => ({ id: p.id, course_hcp: p.course_hcp })),
      });

      const selectedRoundTemplate = (rounds.length ? rounds : fallbackRounds).find((round) => String(round.round_id) === String(selectedActiveRoundId)) || fallbackRounds[0];
      const optimisticActiveRound = { ...selectedRoundTemplate, course_id: selectedCourseId || selectedRoundTemplate.course_id || "", status: "active" };
      setActiveRound(optimisticActiveRound);
      setRounds((currentRounds) => (currentRounds.length ? currentRounds : fallbackRounds).map((round) => ({
        ...round,
        course_id: String(round.round_id) === String(selectedActiveRoundId) ? (selectedCourseId || round.course_id || "") : round.course_id,
        status: String(round.round_id) === String(selectedActiveRoundId) ? "active" : (String(round.status).toLowerCase() === "completed" ? "completed" : "upcoming"),
      })));
      setAllPlayers(nextAllPlayers);
      setPlayers(getRoundPlayers(selectedActiveRoundId, nextAllPlayers, roundPlayers));
      const selectedRoundScores = allScores.filter((score) => String(score.round_id || "") === String(selectedActiveRoundId));
      setScores(selectedRoundScores);
      writeLocalJson("lordOfTheHoles.activeScores", selectedRoundScores);

      setConnectionStatus("online");
      setError("");
      setSuccess("Setup wurde erfolgreich im Google Sheet gespeichert.");
      await loadData({ silent: true });
    } catch (err) {
      setConnectionStatus("offline");
      setError(err.message || "Setup konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  async function saveRoundToArchive() {
    const roundToSave = displayedActiveRound || fallbackRounds[0];

    if (!roundToSave?.round_id) {
      setError("Keine aktive Runde gefunden. Bitte einmal Sheet laden und erneut versuchen.");
      return;
    }

    setSaving(true);
    setSuccess("");
    try {
      await callSheetApi({
        action: "completeRoundAndStartNext",
        round_id: roundToSave.round_id,
      });
      setConnectionStatus("online");
      setError("");
      setSuccess(`${roundToSave.round_name || "Runde"} wurde gespeichert und ins Archiv übernommen.`);
      await loadData({ silent: true });
      setView("archive");
    } catch (err) {
      setConnectionStatus("offline");
      setError(err.message || "Runde konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  const quickScores = useMemo(() => {
    const par = Number(activeHoleData?.par || 4);
    return Array.from(new Set([par - 1, par, par + 1, par + 2, par + 3, par + 4].filter((v) => v > 0)));
  }, [activeHoleData?.par]);

  return (
    <div className="app-shell">
      <main className="container">
        <header className="hero">
          <div className="tagline">{activeCourse?.course_name || "Kurs offen"} · Weimarer Land</div>
          <h1>Lord of the Holes</h1>
          <p>{displayedActiveRound?.round_name || "Aktive Runde"} · Google-Sheets-Scoring</p>
          <span className={cls("status-pill", connectionStatus === "online" ? "online" : "offline")}>
            {connectionStatus === "online" ? "Sheet verbunden" : "Sheet nicht verbunden"}
          </span>
        </header>

        {error ? <div className="message error">{error}</div> : null}
        {success ? <div className="message success">{success}</div> : null}

        <section className="top-actions">
          <button type="button" onClick={() => loadData()}>{loading ? "Lade..." : "Sheet laden"}</button>
          <button type="button" onClick={() => setAutoSync((value) => !value)}>{autoSync ? "Auto-Sync an" : "Auto-Sync aus"}</button>
        </section>

        <nav className="main-nav">
          <button type="button" onClick={() => setView("score")} className={view === "score" ? "active" : ""}>Score</button>
          <button type="button" onClick={() => setView("leaderboard")} className={view === "leaderboard" ? "active" : ""}>Board</button>
        </nav>

        {view === "handicaps" ? (
          <section className="card">
            <h2>Setup · Runde & Spielvorgaben</h2>
            <p className="muted">Aktive Runde: {displayedActiveRound?.round_name || "Runde 1"}. Aktueller Kurs: {activeCourse?.course_name || "noch nicht gesetzt"}.</p>

            <div className="setup-box">
              <label>Welche Runde spielen wir gerade?</label>
              <select value={selectedActiveRoundId} onChange={(e) => setSelectedActiveRoundId(e.target.value)}>
                <option value="">Runde auswählen</option>
                {(rounds.length ? rounds : fallbackRounds).map((round) => (
                  <option key={round.round_id} value={round.round_id}>{round.round_name}</option>
                ))}
              </select>

              <label>Kurs für aktive Runde</label>
              <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
                <option value="">Kurs auswählen</option>
                {(courses.length ? courses : fallbackCourses).map((course) => (
                  <option key={course.course_id} value={course.course_id}>{course.course_name}</option>
                ))}
              </select>
            </div>

            <div className="player-hcp-list">
              {allPlayers.map((p) => (
                <div key={p.id} className="hcp-row">
                  <div>
                    <b>{p.character_name}</b>
                    <span>Spielvorgabe / Course HCP</span>
                  </div>
                  <input
                    inputMode="numeric"
                    value={localHandicaps[p.id] ?? "0"}
                    onChange={(e) => setLocalHandicaps((current) => ({ ...current, [p.id]: cleanNumericInput(e.target.value) }))}
                  />
                </div>
              ))}
            </div>

            <button type="button" className="primary wide" onClick={saveFullSetup}>
              {saving ? "Speichere ..." : "Setup speichern"}
            </button>
          </section>
        ) : view === "score" ? (
          <section>
            <div className="round-card">
              <span>Aktuell gespielt</span>
              <b>{displayedActiveRound?.round_name || "Runde 1"}</b>
              <p>{activeCourse?.course_name || "Kein Kurs ausgewählt"}</p>
              <small>Es werden nur Scores für {displayedActiveRound?.round_name || "diese Runde"} angezeigt.</small>
            </div>

            <section className="card">
              <div className="hole-header">
                <div>
                  <span>Aktives Loch</span>
                  <strong>{activeHole}</strong>
                </div>
                <div className="hole-meta">
                  <div>Par <b>{activeHoleData.par}</b></div>
                  <div>HCP <b>{activeHoleData.hcp}</b></div>
                  <div>{activeHoleData.meters} m</div>
                </div>
              </div>

              <label>Ich zähle für</label>
              <select value={scoredPlayerId} onChange={(e) => setScoredPlayerId(e.target.value)}>
                {visiblePlayers.map((p) => <option key={p.id} value={p.id}>{p.character_name}</option>)}
              </select>

              <div className="score-panel">
                <h3>{scoredPlayer?.character_name} · Loch {activeHole}</h3>

                <label>Score</label>
                <div className="score-buttons">
                  {quickScores.map((value) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => saveScore({ strokes: value })}
                      className={Number(currentScore.strokes) === value ? "selected" : ""}
                    >
                      {value}
                    </button>
                  ))}
                </div>

                <label>Oder Score manuell</label>
                <input
                  inputMode="numeric"
                  value={currentScore.strokes ?? ""}
                  onChange={(e) => saveScore({ strokes: cleanNumericInput(e.target.value) === "" ? "" : Number(cleanNumericInput(e.target.value)) })}
                  placeholder="z. B. 5"
                />

                <div className="putt-box">
                  <div className="putt-checkbox">
                    <span>&gt;2 Putts?</span>
                    <input
                      type="checkbox"
                      checked={normalizeBoolean(currentScore.over_two_putts)}
                      onChange={(e) => saveScore({ over_two_putts: e.target.checked, putts_count: e.target.checked ? (currentScore.putts_count || 3) : "" })}
                    />
                  </div>

                  {normalizeBoolean(currentScore.over_two_putts) ? (
                    <div className="putt-choice">
                      <button
                        type="button"
                        onClick={() => saveScore({ over_two_putts: true, putts_count: 3 })}
                        className={Number(currentScore.putts_count) === 3 ? "selected" : ""}
                      >
                        3 Putt
                      </button>
                      <button
                        type="button"
                        onClick={() => saveScore({ over_two_putts: true, putts_count: 4 })}
                        className={Number(currentScore.putts_count) >= 4 ? "selected" : ""}
                      >
                        4+ Putt
                      </button>
                    </div>
                  ) : null}
                </div>

                <p className="hint">{saving ? "Speichere ins Sheet ..." : ">2 Putts = Auswahl zwischen 3 Putt und 4+ Putt"}</p>

                <div className="two-buttons">
                  <button type="button" disabled={activeHole === 1} onClick={() => setActiveHole((h) => Math.max(1, h - 1))}>Zurück</button>
                  <button type="button" disabled={activeHole === 18} onClick={() => setActiveHole((h) => Math.min(18, h + 1))}>Nächstes Loch</button>
                </div>

                {activeHole === 18 && currentScore.strokes !== "" && currentScore.strokes != null ? (
                  <button type="button" className="primary wide green" onClick={saveRoundToArchive}>
                    {saving ? "Speichere Runde ..." : "Runde speichern & ins Archiv"}
                  </button>
                ) : null}
              </div>
            </section>
          </section>
        ) : view === "leaderboard" ? (
          <section>
            <div className="round-card">
              <span>Aktuell gespielt</span>
              <b>{displayedActiveRound?.round_name || "Runde 1"}</b>
              <p>{activeCourse?.course_name || "Kein Kurs ausgewählt"}</p>
            </div>

            <section className="card">
              <h2>Board · Die Gefährten</h2>

              <BoardTable title="Klassisches Zählspiel" players={strokePlayLeaderboard} columns={[
                { label: "+/−", render: (p) => formatToPar(p.toPar, p.played), emphasize: true },
                { label: "Schläge", render: (p) => (p.played ? p.total : "–") },
                { label: "Löcher", render: (p) => `${p.played}/18` },
              ]} />

              <BoardTable title="Netto Stableford" players={netStablefordLeaderboard} columns={[
                { label: "Punkte", render: (p) => p.netStableford, emphasize: true },
                { label: "SpV", render: (p) => Number(p.course_hcp || 0) },
                { label: "Löcher", render: (p) => `${p.played}/18` },
              ]} />

              <BoardTable title="Brutto Punkte" players={grossStablefordLeaderboard} columns={[
                { label: "Punkte", render: (p) => p.grossStableford, emphasize: true },
                { label: "Schläge", render: (p) => (p.played ? p.total : "–") },
                { label: "Löcher", render: (p) => `${p.played}/18` },
              ]} />

              <BoardTable title="Putt-Kasse" players={puttPenaltyLeaderboard} columns={[
                { label: "3 Putts", render: (p) => `${p.threePutts} × 2 €` },
                { label: "4+ Putts", render: (p) => `${p.fourPlusPutts} × 4 €` },
                { label: "Gesamt", render: (p) => `${p.puttPenaltyEuro || 0} €`, emphasize: true },
              ]} />

              <div className="stats-grid">
                <div><span>Par</span><b>{totalPar}</b></div>
                <div><span>Spieler</span><b>{visiblePlayers.length}</b></div>
                <div><span>Sync</span><b>{autoSync ? "30 s" : "manuell"}</b></div>
              </div>
            </section>
          </section>
        ) : (
          <ScorecardArchive rounds={rounds} courses={courses} players={allPlayers} roundPlayers={roundPlayers} holes={allHoles} scores={allScores} />
        )}

        <section className="secondary-nav">
          <span>Weitere Bereiche</span>
          <div>
            <button type="button" onClick={() => setView("archive")} className={view === "archive" ? "active-sub" : ""}>Archiv</button>
            <button type="button" onClick={() => setView("handicaps")} className={view === "handicaps" ? "active-sub" : ""}>Setup</button>
          </div>
        </section>
      </main>
    </div>
  );
}
