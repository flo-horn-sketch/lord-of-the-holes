async function resetFlightDrawAfterFullReset() {
    window.localStorage.removeItem(FLIGHT_DRAW_STORAGE_KEY);
    setFlightDraw(null);
    setFlightDrawLoadedFromServer(false);
    setFlightRevealRunning(false);
    setFlightAutoRevealStarted(false);
    setFlightDrawCeremonyCompleted(false);
    setFlightSummaryOpen(false);
    setFlightRevealRoundIndex(0);
    setFlightRevealCount(0);
    setFlightRevealIntroStep(0);
    setFlightRevealOutroStep(0);
    setExpandedFlightKeys({});

    try {
      await callSheetApi({ action: "clearFlightDraw" });
    } catch (err) {
      console.warn("clearFlightDraw fehlt vermutlich noch im Apps Script:", err);
    }
  }

  function redrawFlightsFromAdmin() {
    saveFlightDrawFromAdmin();
  }

  async function startRoundWithFullResetAndFlightDraw() {
    setError("Die Flight-Ziehung darf nur über den Admin-Button „Flights neu bestimmen“ erstellt werden.");
  }

  /***************************************
   * Ladebildschirm / Flight-Zeremonie
   * Alle abgeleiteten Werte bewusst direkt vor dem Rendering,
   * damit der Splash-Screen keine fehlenden Variablen wirft.
   ***************************************/

  const safeFlightDrawRounds = Array.isArray(flightDraw?.rounds) ? flightDraw.rounds : [];
  const currentRevealRound = safeFlightDrawRounds[flightRevealRoundIndex] || null;

  const currentRevealPlayers = currentRevealRound?.flights?.flatMap((flight) =>
    (flight.players || []).map((playerId) => ({
      player_id: playerId,
      flight_number: flight.flight_number,
    }))
  ) || [];

  const flightRevealIntroLinesByRound = [
    [
      "Die Türen von Bruchtal schließen sich. Kein Hobbit raschelt mehr mit der Scorekarte.",
      "Elrond hebt die Hand. Das erste Pergament wird in den Kreis getragen.",
      "Runde 1 wird ohne Gangolf beschritten. Sein Pfad beginnt erst später.",
      "Möge das erste Kapitel die Gemeinschaft nicht schon am Tee 1 entzweien.",
    ],
    [
      "Das erste Pergament ist gesprochen. Manche Blicke sagen: Das war bestimmt kein Zufall.",
      "Nun tritt Gangolf aus dem Schatten hinzu. Die Gemeinschaft ist vollständig.",
      "Das zweite Pergament wird geöffnet — und irgendwo lacht ein Ork über die Startzeiten.",
      "Runde 2 führt durch die Minen von Moria. Wer hier zittert, sollte wenigstens gerade putten.",
    ],
    [
      "Zwei Kapitel sind besiegelt. Noch atmet die Gemeinschaft, wenn auch hörbar schwerer.",
      "Das dritte Pergament liegt bereit. Vor den Toren Mordors zählt jede Allianz doppelt.",
      "Die letzten Flights vor dem Schicksalsberg werden offenbart.",
      "Mögen die Drives lang, die Ausreden kurz und die Zähler gnädig sein.",
    ],
  ];

  const flightRevealOutroLines = [
    "Die Pergamente sinken. Der Rat schweigt. Selbst Golfum sagt kurz nichts.",
    "Die Flights der ersten drei Kapitel sind besiegelt.",
    "Was am Schicksalsberg geschieht, entscheidet allein die Tabelle.",
  ];

  const currentIntroLines = flightRevealIntroLinesByRound[flightRevealRoundIndex] || flightRevealIntroLinesByRound[0];
  const currentRevealLine = currentIntroLines[flightRevealIntroStep] || currentIntroLines[currentIntroLines.length - 1] || "Die Pergamente werden geöffnet.";
  const currentOutroLine = flightRevealOutroLines[flightRevealOutroStep] || flightRevealOutroLines[flightRevealOutroLines.length - 1] || "Die Flights sind besiegelt.";

  const flightDrawCountdown = useMemo(() => {
    const diffMs = Math.max(0, FLIGHT_DRAW_TARGET.getTime() - lockCountdownNow.getTime());
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds };
  }, [lockCountdownNow]);

  useEffect(() => {
    if (!flightRevealRunning || !flightDrawLoadedFromServer || !safeFlightDrawRounds.length || !currentRevealRound) return undefined;

    const introDone = flightRevealIntroStep >= currentIntroLines.length;
    const allPlayersVisible = introDone && flightRevealCount >= currentRevealPlayers.length;
    const roundPlayersDone = introDone && flightRevealCount > currentRevealPlayers.length;
    const isLastRound = flightRevealRoundIndex >= safeFlightDrawRounds.length - 1;
    const finalOutroRunning = roundPlayersDone && isLastRound;
    const outroDone = !finalOutroRunning || flightRevealOutroStep >= flightRevealOutroLines.length;

    const delay = !introDone
      ? 4300
      : !allPlayersVisible
        ? 2500
        : !roundPlayersDone
          ? 3900
          : finalOutroRunning && !outroDone
            ? 4300
            : 3400;

    const timer = window.setTimeout(() => {
      if (!introDone) {
        setFlightRevealIntroStep((step) => step + 1);
        return;
      }

      if (!roundPlayersDone) {
        setFlightRevealCount((count) => count + 1);
        return;
      }

      if (finalOutroRunning && !outroDone) {
        if (flightRevealOutroStep >= flightRevealOutroLines.length - 1) {
          setFlightRevealRunning(false);
          setFlightDrawCeremonyCompleted(true);
          setFlightSummaryOpen(false);
          return;
        }

        setFlightRevealOutroStep((step) => step + 1);
        return;
      }

      if (!isLastRound) {
        setFlightRevealRoundIndex((index) => index + 1);
        setFlightRevealCount(0);
        setFlightRevealIntroStep(0);
        setFlightRevealOutroStep(0);
        return;
      }

      setFlightRevealRunning(false);
      setFlightDrawCeremonyCompleted(true);
      setFlightSummaryOpen(false);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [
    flightRevealRunning,
    flightDrawLoadedFromServer,
    safeFlightDrawRounds.length,
    currentRevealRound,
    currentIntroLines.length,
    currentRevealPlayers.length,
    flightRevealRoundIndex,
    flightRevealCount,
    flightRevealIntroStep,
    flightRevealOutroStep,
  ]);

  function resetFlightRevealState() {
    setFlightRevealRoundIndex(0);
    setFlightRevealCount(0);
    setFlightRevealIntroStep(0);
    setFlightRevealOutroStep(0);
    setExpandedFlightKeys({});
  }

  function startFlightReveal(drawToReveal = null) {
    const nextDraw = drawToReveal || flightDraw;

    if (!flightDrawLoadedFromServer || !nextDraw?.rounds?.length) {
      setError("Keine Flight-Ziehung aus der Datenbank übertragen. Bitte im Admin-Bereich zuerst „Flights neu bestimmen“ ausführen und danach die Datenbank neu laden.");
      return false;
    }

    setFlightDraw(nextDraw);
    resetFlightRevealState();
    setFlightSummaryOpen(false);
    setFlightDrawCeremonyCompleted(false);
    setFlightRevealRunning(true);
    setError("");
    return true;
  }

  async function enterLockedAppAsAdmin() {
    if (lockPasswordInput !== ADMIN_PASSWORD) {
      setError("Passwort ist falsch.");
      return;
    }

    if (splashEntering || flightDrawSaving) return;

    setSplashEntering(true);
    const loadedData = await loadData({ silent: true });
    setSplashEntering(false);

    const serverDraw = loadedData?.flight_draw || loadedData?.flightDraw || null;

    if (!serverDraw?.rounds?.length) {
      setFlightDraw(null);
      setFlightDrawLoadedFromServer(false);
      setError("Keine Flight-Ziehung aus der Datenbank übertragen. Bitte zuerst im Admin-Bereich „Flights neu bestimmen“ ausführen und danach erneut starten.");
      return;
    }

    setFlightDraw(serverDraw);
    setFlightDrawLoadedFromServer(true);

    setIsAdminUnlocked(true);
    setLockAdminBypass(false);
    setShowSplash(true);
    setLockUnlockOpen(false);
    setLockPasswordInput("");
    startFlightReveal(serverDraw);
  }

  async function enterAppWithoutFlightDraw() {
    if (lockPasswordInput !== ADMIN_PASSWORD && !isAdminUnlocked) {
      setError("Passwort ist falsch.");
      return;
    }

    if (splashEntering || flightDrawSaving) return;

    setSplashEntering(true);
    await loadData({ silent: true });
    setSplashEntering(false);
    setIsAdminUnlocked(true);
    setLockAdminBypass(true);
    setShowSplash(false);
    setLockUnlockOpen(false);
    setLockPasswordInput("");
    setFlightRevealRunning(false);
    setError("");
  }

  function renderFlightDrawPanel() {

  function renderFlightDrawPanel() {
    const playerMap = new Map((allPlayers?.length ? allPlayers : fallbackPlayers).map((player) => [String(player.id), withFallbackAlias(player)]));
    if (flightDraw && flightRevealRunning && currentRevealRound) {
      const introDone = flightRevealIntroStep >= currentIntroLines.length;
      const roundPlayersDone = introDone && flightRevealCount > currentRevealPlayers.length;
      const finalOutroRunning = roundPlayersDone && flightRevealRoundIndex >= flightDraw.rounds.length - 1 && flightRevealOutroStep < flightRevealOutroLines.length;
      const visiblePlayers = currentRevealPlayers.slice(0, Math.min(flightRevealCount, currentRevealPlayers.length));
      return (
        <div className="flex min-h-[78vh] flex-col justify-center rounded-3xl border border-amber-300/55 bg-black/75 p-4 text-center text-amber-50 shadow-2xl shadow-black/80 backdrop-blur-sm">
          <style>{`@keyframes lotrSoftReveal { 0% { opacity: 0; transform: translateY(10px) scale(.985); filter: blur(3px); } 18% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } 78% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } 100% { opacity: .18; transform: translateY(-5px) scale(.995); filter: blur(2px); } } @keyframes lotrPlayerReveal { 0% { opacity: 0; transform: translateY(12px) scale(.96); filter: blur(4px); } 26% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } 100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } } .lotr-soft-reveal { animation: lotrSoftReveal 5.3s ease-in-out both; } .lotr-player-reveal { animation: lotrPlayerReveal 1.6s ease-out both; }`}</style>
          <div className="text-[10px] uppercase tracking-[0.32em] text-amber-300/75">Der Rat von Bruchtal</div>
          {!introDone || finalOutroRunning ? (
            <div className="mx-auto mt-5 max-w-sm">
              <div className="font-serif text-2xl font-black leading-tight text-amber-200">{finalOutroRunning ? "Der Rat hat gesprochen" : "Flight-Ziehung der Pergamente"}</div>
              <div key={finalOutroRunning ? `outro-${flightRevealOutroStep}` : `intro-${flightRevealRoundIndex}-${flightRevealIntroStep}`} className="lotr-soft-reveal mt-6 rounded-3xl border border-amber-500/30 bg-stone-950/60 p-5 font-serif text-xl font-bold leading-snug text-amber-50 shadow-lg shadow-black/40">
                {finalOutroRunning ? currentOutroLine : currentRevealLine}
              </div>
              <div className="mt-5 text-xs uppercase tracking-[0.22em] text-amber-100/45">{finalOutroRunning ? "Die Chronik wird geschlossen ..." : "Die Gemeinschaft wartet ..."}</div>
            </div>
          ) : (
            <>
              <div className="mt-2 font-serif text-2xl font-black leading-tight text-amber-200">{currentRevealRound.round_name}</div>
              <div className="mt-5 grid gap-3 text-left">
                {currentRevealRound.flights.map((flight) => {
                  const flightVisiblePlayers = visiblePlayers.filter((entry) => entry.flight_number === flight.flight_number);
                  return (
                    <div key={`${currentRevealRound.round_id}-${flight.flight_number}`} className="rounded-3xl border border-amber-500/30 bg-stone-950/60 p-3 shadow-lg shadow-black/35">
                      <div className="text-center font-serif text-lg font-black text-amber-200">Flight {flight.flight_number}</div>
                      <div className="mt-3 grid gap-2">
                        {flightVisiblePlayers.length ? flightVisiblePlayers.map((entry) => {
                          const player = playerMap.get(String(entry.player_id));
                          const normalized = withFallbackAlias(player || { id: entry.player_id });
                          return (
                            <div key={`${entry.flight_number}-${entry.player_id}`} className="lotr-player-reveal rounded-2xl border border-amber-400/30 bg-amber-500/15 px-3 py-3 text-center shadow-md shadow-black/30">
                              <div className="font-serif text-3xl font-black leading-none text-amber-100">{normalized.alias_name || normalized.character_name || entry.player_id}</div>
                              <div className="mt-1 text-xs uppercase tracking-[0.18em] text-amber-100/55">{normalized.character_name || normalized.display_name || entry.player_id}</div>
                            </div>
                          );
                        }) : <div className="rounded-2xl border border-dashed border-amber-500/25 px-3 py-4 text-center text-sm text-amber-100/45">Das Pergament bleibt noch verschlossen ...</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 text-xs uppercase tracking-[0.22em] text-amber-100/55">Kapitel {flightRevealRoundIndex + 1} von {flightDraw.rounds.length}</div>
            </>
          )}
        </div>
      );
    }
    return (
      <div className="rounded-3xl border border-amber-400/45 bg-black/62 p-2.5 text-left text-amber-50 shadow-2xl shadow-black/70 backdrop-blur-sm">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.28em] text-amber-300/80">Der Rat von Bruchtal</div>
          <div className="mt-1 font-serif text-xl font-black text-amber-200">Flight-Ziehung der Pergamente</div>
          <div className="mt-1.5 rounded-2xl border border-amber-400/35 bg-amber-500/10 p-2 text-center">
            <div className="text-[10px] uppercase tracking-[0.24em] text-amber-300/80">Flight-Ziehung</div>
            <div className="mt-1 font-serif text-xl font-black leading-none text-amber-200">21.05.26</div>
            <div className="mt-0.5 font-serif text-lg font-black leading-none text-amber-100">20:00 Uhr</div>
          </div>
          <div className="mt-1.5 rounded-2xl border border-amber-400/30 bg-black/35 p-1.5 text-center">
            <div className="font-serif text-lg font-black text-amber-100">Hier live</div>
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-amber-100/75">Bitte öffnet die App 1–2 Minuten vorher, damit die Pergamente rechtzeitig geladen sind.</p>
        </div>
        {!flightDraw ? (
          <div className="mt-2 rounded-2xl border border-amber-500/25 bg-black/35 p-2 text-center">
            {!flightDrawAvailable ? (
              <>
                <div className="font-serif text-base font-bold text-amber-200">Die Pergamente sind noch versiegelt.</div>
                <div className="mt-1 text-xs text-amber-100/65">Die Pforten sind noch verschlossen. Gandalf selbst würde jetzt sagen: „Du kommst hier noch nicht rein.“</div>
                <div className="mt-1.5 grid grid-cols-4 gap-1 rounded-2xl border border-amber-500/20 bg-black/30 p-1.5 text-center">
                  <div><div className="font-serif text-base font-black text-amber-200">{flightDrawCountdown.days}</div><div className="text-[8px] uppercase tracking-[0.14em] text-amber-100/55">Tage</div></div>
                  <div><div className="font-serif text-base font-black text-amber-200">{String(flightDrawCountdown.hours).padStart(2, "0")}</div><div className="text-[8px] uppercase tracking-[0.14em] text-amber-100/55">Std</div></div>
                  <div><div className="font-serif text-base font-black text-amber-200">{String(flightDrawCountdown.minutes).padStart(2, "0")}</div><div className="text-[8px] uppercase tracking-[0.14em] text-amber-100/55">Min</div></div>
                  <div><div className="font-serif text-base font-black text-amber-200">{String(flightDrawCountdown.seconds).padStart(2, "0")}</div><div className="text-[8px] uppercase tracking-[0.14em] text-amber-100/55">Sek</div></div>
                </div>
              </>
            ) : (
              <>
                <div className="font-serif text-base font-bold text-amber-200">Keine gespeicherte Flight-Ziehung gefunden.</div>
                <div className="mt-1 text-xs text-amber-100/65">Die Ziehung wird ausschließlich im Admin-Bereich über „Flights neu bestimmen“ erstellt. Der Ladebildschirm zeigt danach nur die gespeicherten Pergamente an.</div>
              </>
            )}
          </div>
        ) : !flightDrawCeremonyCompleted ? null : (
          <div className="mt-3">
            <button type="button" onClick={() => setFlightSummaryOpen((open) => !open)} className="flex w-full items-center justify-between rounded-2xl border border-amber-500/30 bg-stone-950/75 px-4 py-3 font-serif text-lg font-black text-amber-200 shadow-lg shadow-black/35">
              <span>Flights</span>
              <span className="text-xs uppercase tracking-[0.18em] text-amber-100/55">{flightSummaryOpen ? "schließen" : "öffnen"}</span>
            </button>
            {flightSummaryOpen ? <div className="mt-3 max-h-[54vh] overflow-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {flightDraw.rounds.map((roundPlan) => (
                <div key={roundPlan.round_id} className="mb-3 rounded-2xl border border-amber-500/25 bg-black/30 p-3 last:mb-0">
                  <div className="font-serif text-base font-black text-amber-200">{roundPlan.round_name}</div>
                  <div className="mt-2 grid gap-2">
                    {roundPlan.flights.map((flight) => (
                      <div key={`${roundPlan.round_id}-${flight.flight_number}`} className="rounded-2xl border border-amber-700/30 bg-stone-950/55 p-2">
                        <div className="mb-2 text-center font-serif text-sm font-bold text-amber-200">Flight {flight.flight_number}</div>
                        <div className="grid gap-1.5">
                          {flight.players.map((playerId) => {
                            const player = withFallbackAlias(playerMap.get(String(playerId)) || { id: playerId });
                            return (
                              <div key={playerId} className="rounded-xl bg-amber-500/10 px-3 py-2 text-center">
                                <div className="font-serif text-xl font-black text-amber-100">{player.alias_name || player.character_name || playerId}</div>
                                <div className="text-[10px] uppercase tracking-[0.16em] text-amber-100/50">{player.character_name || player.display_name || playerId}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3 text-center font-serif text-sm font-bold text-amber-100">Die Flights der ersten drei Kapitel sind besiegelt. Was am Schicksalsberg geschieht, entscheidet allein die Tabelle.</div>
            </div> : null}
          </div>
        )}
      </div>
    );
  }

  function renderHeader() {
    const subtitle = mainMenu === "current" ? getRoundChapterLabel(displayedActiveRound) : mainMenu === "roundTables" ? "Tabellen Runde" : mainMenu === "tournament" ? "Turnier" : mainMenu === "archive" ? "Scorekarten" : mainMenu === "fun" ? "Mittelerde" : mainMenu === "flights" ? "Flights" : mainMenu === "admin" ? "Admin" : "Einstellungen";
    return (
      <motion.header initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-1 pt-1">
        <div className="relative flex h-8 items-center justify-center">
          <div className="pointer-events-none absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-amber-500/35 bg-black/40 px-2.5 py-0.5 text-[10px] text-amber-100/80 shadow-[inset_0_1px_0_rgba(251,191,36,0.12),0_8px_18px_rgba(0,0,0,0.28)]">
            <span className={connectionStatus === "online" ? "animate-pulse text-emerald-300" : "text-red-300"}>{connectionStatus === "online" ? "●" : "○"}</span>
            <span>{pendingScores.length ? `${pendingScores.length} offen` : connectionStatus === "online" ? "Datenbank verbunden" : "Datenbank offline"}</span>
          </div>
          <button type="button" onClick={() => setMenuOpen((value) => !value)} className="ml-auto rounded-xl border border-amber-500/35 bg-[linear-gradient(180deg,rgba(48,35,22,0.82),rgba(12,10,9,0.82))] px-2.5 py-1 text-base leading-none text-amber-100 shadow-[inset_0_1px_0_rgba(251,191,36,0.12),0_8px_18px_rgba(0,0,0,0.35)] backdrop-blur-sm transition active:scale-[0.96]" aria-label="Menü öffnen">☰</button>
          {menuOpen ? (
            <div className="absolute right-0 top-[34px] z-30 w-64 overflow-hidden rounded-2xl border border-amber-700/40 bg-stone-950/95 text-left shadow-2xl shadow-black/70 backdrop-blur">
              {[["current", "Scoring"], ["roundTables", "Tabellen Runde"], ["tournament", "Turnier"], ["archive", "Scorekarten"], ["fun", "Mittelerde"], ["flights", "Flights"], ["settings", "Einstellungen"], ["admin", "Admin"]].map(([value, label]) => (
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
              ))}
            </div>
          ) : null}
        </div>
      </motion.header>
    );
  }

  function renderStatusMessages() {
    const isDatabaseStatusOnly = /Datenbank|offline|nicht erreichbar|nicht geladen|lokal gesichert/i.test(String(error || ""));
    if (!error || isDatabaseStatusOnly) return null;
    return <Card className="mb-2 rounded-2xl border-amber-700/40 bg-amber-950/50"><CardContent className="p-3 text-sm text-amber-100">{error}</CardContent></Card>;
  }

  function renderScoreView() {
    const scoringTintClass = isScorerEntryMode ? "[--score-accent:56_189_248]" : "[--score-accent:245_158_11]";
    return (
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="mb-2 rounded-2xl bg-transparent shadow-none">
          <CardContent className="p-2">
            <div className="mb-2 rounded-2xl border border-amber-500/30 bg-[linear-gradient(180deg,rgba(48,35,22,0.70),rgba(12,10,9,0.62))] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(251,191,36,0.10),0_10px_28px_rgba(0,0,0,0.30)]">
              <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                  <div className="font-serif text-[1.7rem] font-black leading-none text-amber-200">{displayedActiveRound?.round_name || "Runde 1"}</div>
                  <div className="text-right leading-snug">
                    <div className="text-xs font-semibold text-amber-100/85">{getRoundChapterLabel(displayedActiveRound).replace(`${displayedActiveRound?.round_name || ""} · `, "")}</div>
                    <div className="text-[11px] text-amber-100/65">{activeCourse?.course_name || "Kein Kurs ausgewählt"}</div>
                  </div>
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
                  <button type="button" onClick={() => setStandingsPopup("strokePlay")} className="rounded-xl border border-amber-500/20 bg-[linear-gradient(180deg,rgba(251,191,36,0.08),rgba(0,0,0,0.18))] p-1.5 text-amber-50 shadow-[inset_0_1px_0_rgba(251,191,36,0.10)] transition active:scale-[0.98]"><div className="text-amber-100">Tats. Strokes</div><b className="text-base text-amber-200">{myCurrentStats.played ? myCurrentStats.total : "–"}</b><div className="mt-0.5 text-[9px] text-amber-100/70">Platz {strokePlayLeaderboard.findIndex((player) => String(player.id) === String(myPlayerId)) >= 0 ? strokePlayLeaderboard.findIndex((player) => String(player.id) === String(myPlayerId)) + 1 : "–"}</div></button>
                  <button type="button" onClick={() => setStandingsPopup("hcpAdjusted")} className="rounded-xl border border-amber-500/20 bg-[linear-gradient(180deg,rgba(251,191,36,0.08),rgba(0,0,0,0.18))] p-1.5 text-amber-50 shadow-[inset_0_1px_0_rgba(251,191,36,0.10)] transition active:scale-[0.98]"><div className="text-amber-100">HCP +/−</div><b className="text-base text-amber-200">{myCurrentStats.played ? formatToPar(myCurrentStats.hcpAdjustedToPar, true) : "–"}</b><div className="mt-0.5 text-[9px] text-amber-100/70">Platz {myHcpAdjustedStrokeRank || "–"}</div></button>
                  <button type="button" onClick={() => setStandingsPopup("netStableford")} className="rounded-xl border border-amber-500/20 bg-[linear-gradient(180deg,rgba(251,191,36,0.08),rgba(0,0,0,0.18))] p-1.5 text-amber-50 shadow-[inset_0_1px_0_rgba(251,191,36,0.10)] transition active:scale-[0.98]"><div className="text-amber-100">Netto Stbl</div><b className="text-base text-amber-200">{myCurrentStats.netStableford}</b><div className="mt-0.5 text-[9px] text-amber-100/70">Platz {myNetStablefordRank || "–"}</div></button>
                </div>
              </div>
            ) : <div className="mb-2 rounded-xl border border-amber-700/30 bg-black/25 p-1.5 text-[10px] text-amber-100/75">Wähle zuerst im Start-Popup deinen Spieler aus.</div>}
            {myPlayerId && !scoredPlayerId ? (
              isFlightDrawRound ? (
                <div className="mb-2 rounded-2xl border border-amber-500/45 bg-stone-950/75 p-3 text-center shadow-xl shadow-black/30 backdrop-blur-sm">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/75">Automatische Zähler-Zuordnung</div>
                  <div className="mt-1 font-serif text-lg font-black text-amber-200">Noch keine Zuordnung aus der Flight-Ziehung.</div>
                  <div className="mt-1 text-xs text-amber-100/65">Dieses Handy gehört {getPlayerLabel(myCurrentPlayer) || "dem gewählten Spieler"}. Der zu zählende Spieler wird automatisch aus der gespeicherten Flight-Ziehung gesetzt; eine manuelle Auswahl ist nur am Finaltag möglich.</div>
                  {myFlightFromDraw ? <div className="mt-2 rounded-xl bg-amber-500/10 p-2 text-xs text-amber-100/70">Du bist in Flight {myFlightFromDraw.flight_number} eingeteilt.</div> : null}
                </div>
              ) : (
                <div className="mb-2 rounded-2xl border border-amber-500/45 bg-stone-950/75 p-2 shadow-xl shadow-black/30 backdrop-blur-sm">
                  <div className="mb-2 text-center"><div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/75">Finaltag-Zählung</div><div className="font-serif text-lg font-black text-amber-200">Wen zählst du?</div><div className="mt-1 text-xs text-amber-100/65">Für Runde 4 gibt es keine Flight-Ziehung. Wähle den zu zählenden Spieler manuell aus.</div></div>
                  <div className="grid grid-cols-2 gap-2">{scoreablePlayers.map((player) => <button key={player.id} type="button" onClick={() => { setScoredPlayerId(player.id); saveLocalScoredPlayerForRound(displayedActiveRound?.round_id || "", player.id); }} className="rounded-2xl bg-stone-800 px-2 py-3 font-serif text-sm font-bold text-amber-100 active:scale-[0.98]">{getPlayerLabel(player)}</button>)}</div>
                </div>
              )
            ) : (
              <div className={cls("rounded-3xl transition-colors", scoringTintClass, hasScoreMismatch && "rounded-3xl ring-1 ring-red-500/40")}>
                {myCurrentPlayer ? (
                  <div className="mb-2 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setScoreEntryMode("player")} className={cls("rounded-2xl border px-2 py-3 text-sm font-bold transition-colors", !isScorerEntryMode ? "border-[rgb(var(--score-accent)/0.45)] bg-amber-600 text-amber-50" : "border-amber-700/25 bg-stone-800 text-amber-100", hasSelectedPlayerScoreMismatch && "ring-1 ring-red-400/70")}><span className="block truncate font-serif text-sm leading-none">{getPlayerLabel(scoredPlayer) || "Spieler"}{hasSelectedPlayerScoreMismatch ? " ⚠" : ""}</span></button>
                    <button type="button" onClick={() => setScoreEntryMode("scorer")} className={cls("rounded-xl border px-2 py-1.5 text-xs font-bold transition-colors", isScorerEntryMode ? "border-[rgb(var(--score-accent)/0.45)] bg-sky-900/65 text-sky-50" : "border-amber-700/25 bg-stone-800 text-amber-100", hasOwnScoreMismatch && "ring-1 ring-red-400/70")}><span className="block truncate font-serif text-sm leading-none">Mein Score{hasOwnScoreMismatch ? " ⚠" : ""}</span></button>
                  </div>
                ) : null}
                {visibleScoreMismatchMessages.length ? (
                  <div className="mb-2 rounded-2xl border border-red-500/50 bg-red-950/45 p-2 text-xs text-red-100 shadow-[0_10px_24px_rgba(0,0,0,0.32)]">
                    <div className="font-serif text-sm font-bold text-red-100">Palantír meldet Abweichung</div>
                    <div className="mt-1 space-y-1 text-red-100/90">
                      {visibleScoreMismatchMessages.map((message) => (
                        <div key={message} className="rounded-xl bg-black/25 px-2 py-1">{message}</div>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="mb-1.5 grid grid-cols-[auto_1fr] items-center gap-2 rounded-2xl border border-[rgb(var(--score-accent)/0.30)] bg-black/25 px-3 py-2 text-[10px] text-amber-100/70"><div className="font-serif text-xl font-black leading-none text-amber-200">Loch {activeHole}</div><div className="flex items-center justify-end gap-2.5 text-right text-[11px]"><span>Par <b className="text-amber-200">{activeHoleData.par}</b></span><span>HCP <b className="text-amber-200">{activeHoleData.hcp}</b></span><span>{activeHoleData.meters} m</span><span>Vorgabe <b className="text-amber-200 tracking-[0.18em]">{formatShotMarks(entryPlayerShotsOnActiveHole)}</b></span></div></div>
                <div className="mb-3"><ScoreStepper value={normalizeBoolean(currentScore.picked_up) ? 0 : currentScore.strokes ?? ""} par={activeHoleData?.par || 4} pickedUpStrokes={pickedUpStrokes} disabled={!canEnterScores} onChange={(scoreValue) => Number(scoreValue) === 0 || Number(scoreValue) >= Number(pickedUpStrokes || 0) ? saveScore({ strokes: pickedUpStrokes, picked_up: true }) : saveScore({ strokes: scoreValue, picked_up: false })} /></div>
                <div className="mb-3"><PuttStepper value={currentScore.putts_count} disabled={!canEnterScores || currentEffectiveStrokes <= 1} max={maxPuttsForCurrentScore} onChange={(putts) => saveScore({ putts_count: putts, over_two_putts: Number(putts) >= 3 })} /></div>
                <div className="mb-3 rounded-2xl border border-[rgb(var(--score-accent)/0.30)] bg-black/25 p-2"><div className="flex items-center justify-between gap-2"><div><div className="text-xs font-semibold text-amber-100">Lady</div><div className="text-[10px] text-amber-100/65">Markiert eine Lady.</div></div><input type="checkbox" disabled={!canEnterScores} checked={normalizeBoolean(currentScore.lady)} onChange={(e) => saveScore({ lady: e.target.checked })} className="h-6 w-6 accent-amber-500 disabled:opacity-40" /></div></div>
                {scoreHintMessage ? <div className="mb-2 rounded-xl border border-amber-500/40 bg-amber-950/50 p-1.5 text-center text-xs font-semibold text-amber-100">{scoreHintMessage}</div> : null}
                <div className="grid grid-cols-2 gap-2"><Button disabled={activeHole === 1} onClick={() => setActiveHole((h) => Math.max(1, h - 1))} className="rounded-2xl bg-stone-800 py-3 text-base font-bold text-amber-100">Zurück</Button><Button disabled={activeHole === 18 || !canEnterScores} onClick={goToNextHole} className={cls("rounded-2xl py-3 text-base font-bold text-amber-50 disabled:opacity-50", hasRequiredScoresForNext ? "bg-amber-600" : "bg-amber-700/60 ring-1 ring-amber-500/30")}>Loch {Math.min(18, Number(activeHole || 1) + 1)}</Button></div>
              </div>
            )}
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
    const tableHoles = (allHoles.length ? allHoles : fallbackHoles).filter((hole) => String(hole.course_id) === String(tableCourseId)).sort((a, b) => Number(a.hole_number) - Number(b.hole_number));
    const tablePlayers = getPlayersForCourse(getRoundPlayers(tableRound?.round_id, allPlayers, roundPlayers), tableCourseId, courses);
    const tableScores = officialAllScores.filter((score) => String(score.round_id || "") === String(tableRound?.round_id || ""));
    const tableStats = buildPlayerStats(tablePlayers, tableHoles, tableScores);
    return (
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="landscape:fixed landscape:inset-0 landscape:z-40 landscape:overflow-auto landscape:bg-stone-950 landscape:p-3">
        <div className="landscape:mx-auto landscape:max-w-none landscape:pb-6">
          <Card className="mb-2 rounded-2xl border border-amber-500/30 bg-[linear-gradient(180deg,rgba(48,35,22,0.86),rgba(18,13,9,0.82))] shadow-[inset_0_1px_0_rgba(251,191,36,0.10),0_18px_46px_rgba(0,0,0,0.38)] backdrop-blur-sm">
            <CardContent className="p-3 text-sm text-amber-100"><div className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Tabellen Runde</div><div className="mt-1 font-serif text-lg text-amber-200">{tableRound?.round_name || "Runde"}</div><div className="text-amber-100/65">{tableCourse?.course_name || "Kurs"}</div><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{availableRounds.map((round) => <button key={round.round_id} type="button" onClick={() => setRoundTableRoundId(round.round_id)} className={cls("rounded-xl border px-2 py-2 text-xs font-bold", String(tableRound?.round_id) === String(round.round_id) ? "border-amber-400/60 bg-amber-600 text-amber-50" : "border-amber-700/35 bg-black/25 text-amber-100")}>{round.round_name || round.round_id}</button>)}</div></CardContent>
          </Card>
          <Card className="mb-2 rounded-2xl border border-amber-500/30 bg-[linear-gradient(180deg,rgba(48,35,22,0.86),rgba(18,13,9,0.82))] shadow-[inset_0_1px_0_rgba(251,191,36,0.10),0_18px_46px_rgba(0,0,0,0.38)] backdrop-blur-sm">
            <CardContent className="p-3"><div className="mb-2"><p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Leaderboard</p></div><LeaderboardTable title="Strokes HCP adjusted" players={sortHcpAdjustedStrokePlay(tableStats)} columns={[{ label: "+/−", render: (p) => formatToPar(p.hcpAdjustedToPar, p.played), emphasize: true }, { label: "Netto", render: (p) => p.played ? p.hcpAdjustedTotal : "–" }, { label: "Löcher", render: (p) => `${p.played}/18` }]} /><LeaderboardTable title="Strokes" players={sortStrokePlay(tableStats)} columns={[{ label: "+/−", render: (p) => formatToPar(p.toPar, p.played), emphasize: true }, { label: "Schläge", render: (p) => p.played ? p.total : "–" }, { label: "Löcher", render: (p) => `${p.played}/18` }]} /><LeaderboardTable title="Netto Stableford" players={sortStableford(tableStats, "netStableford")} columns={[{ label: "Punkte", render: (p) => p.netStableford, emphasize: true }, { label: "Löcher", render: (p) => `${p.played}/18` }]} /><LeaderboardTable title="Brutto Punkte" players={sortStableford(tableStats, "grossStableford")} columns={[{ label: "Punkte", render: (p) => p.grossStableford, emphasize: true }, { label: "Schläge", render: (p) => p.played ? p.total : "–" }, { label: "Löcher", render: (p) => `${p.played}/18` }]} /><LeaderboardTable title="Putt-Kasse" players={[...tableStats].sort((a, b) => Number(b.puttPenaltyEuro || 0) - Number(a.puttPenaltyEuro || 0) || Number(a.sort_order || 0) - Number(b.sort_order || 0))} columns={[{ label: "3 Putts", render: (p) => `${p.threePutts} × 2 €` }, { label: "4+ Putts", render: (p) => `${p.fourPlusPutts} × 4 €` }, { label: "Gesamt", render: (p) => `${p.puttPenaltyEuro || 0} €`, emphasize: true }]} /></CardContent>
          </Card>
        </div>
      </motion.section>
    );
  }

  function renderFlightsView() {
    const playerMap = new Map((allPlayers?.length ? allPlayers : fallbackPlayers).map((player) => [String(player.id), withFallbackAlias(player)]));
    const drawRounds = (flightDraw?.rounds || []).filter((roundPlan) => String(roundPlan.round_id || "") !== "r4");

    return (
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="mb-2 rounded-2xl border border-amber-500/30 bg-[linear-gradient(180deg,rgba(48,35,22,0.86),rgba(18,13,9,0.82))] shadow-xl backdrop-blur-sm">
          <CardContent className="p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Flights</p>
            <h2 className="font-serif text-lg text-amber-200">Flight-Ziehung & Zähler</h2>
            <p className="mt-1 text-sm text-amber-100/65">Übersicht der ausgelosten Flights für Runde 1–3. Runde 4 wird manuell nach Tabellenstand gesetzt.</p>

            {!drawRounds.length ? (
              <div className="mt-3 rounded-2xl border border-amber-700/35 bg-black/25 p-3 text-sm text-amber-100/75">
                Noch keine Flight-Ziehung geladen. Sobald die Pergamente gespeichert sind, erscheint hier die vollständige Übersicht.
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {drawRounds.map((roundPlan) => (
                  <div key={roundPlan.round_id} className="rounded-2xl border border-amber-700/35 bg-black/25 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-serif text-lg font-black text-amber-200">{roundPlan.round_name || roundPlan.round_id}</div>
                        {roundPlan.note ? <div className="mt-0.5 text-xs text-amber-100/60">{roundPlan.note}</div> : null}
                      </div>
                      <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-100/70">
                        {roundPlan.flights?.length || 0} Flights
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2">
                      {(roundPlan.flights || []).map((flight) => (
                        <div key={`${roundPlan.round_id}-${flight.flight_number}`} className="rounded-2xl border border-amber-700/30 bg-stone-950/55 p-2">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <div className="font-serif text-base font-black text-amber-200">Flight {flight.flight_number}</div>
                            <div className="text-xs text-amber-100/55">{(flight.players || []).length} Gefährten</div>
                          </div>

                          <div className="grid gap-1.5">
                            {(flight.players || []).map((playerId) => {
                              const player = withFallbackAlias(playerMap.get(String(playerId)) || { id: playerId });
                              return (
                                <div key={playerId} className="rounded-xl bg-amber-500/10 px-3 py-2">
                                  <div className="font-serif text-lg font-black text-amber-100">{player.alias_name || player.character_name || playerId}</div>
                                  <div className="text-[10px] uppercase tracking-[0.16em] text-amber-100/50">{player.character_name || player.display_name || playerId}</div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="mt-2 rounded-xl border border-sky-400/25 bg-sky-950/25 p-2">
                            <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-sky-200/70">Zähl-Zuordnung</div>
                            <div className="grid gap-1.5">
                              {(flight.scorers || []).map((assignment) => {
                                const scorer = withFallbackAlias(playerMap.get(String(assignment.scorer_player_id)) || { id: assignment.scorer_player_id });
                                const scoredPlayerId = assignment.player_id || assignment.scored_player_id || assignment.scoredPlayerId;
                                const scored = withFallbackAlias(playerMap.get(String(scoredPlayerId)) || { id: scoredPlayerId });
                                return (
                                  <div key={`${assignment.scorer_player_id || assignment.scorerPlayerId}-${assignment.player_id || assignment.scored_player_id || assignment.scoredPlayerId}`} className="rounded-lg bg-black/25 px-2 py-1.5 text-xs text-sky-50/90">
                                    <b className="text-sky-100">{getPlayerLabel(scorer)}</b> zählt <b className="text-amber-100">{getPlayerLabel(scored)}</b>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>
    );
  }

  function renderSettingsView() {
    return (
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="mb-2 rounded-2xl border border-amber-500/30 bg-[linear-gradient(180deg,rgba(48,35,22,0.86),rgba(18,13,9,0.82))] shadow-xl backdrop-blur-sm">
          <CardContent className="p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Einstellungen</p>
            <h2 className="font-serif text-lg text-amber-200">Mein Handy</h2>
            <p className="mt-1 text-sm text-amber-100/65">Diese Einstellung wird nur lokal auf diesem Handy gespeichert.</p>
            <div className="mt-2 rounded-2xl border border-amber-700/30 bg-black/25 p-2">
              <label className="mb-1 block text-sm text-amber-100/80">Zähler auf diesem Gerät</label>
              <select value={myPlayerId} onChange={(e) => { const nextMyPlayerId = e.target.value; setMyPlayerId(nextMyPlayerId); setScoreEntryMode("player"); if (displayedActiveRound?.round_id && nextMyPlayerId && String(scoredPlayerId) === String(nextMyPlayerId)) { setScoredPlayerId(""); removeLocalScoredPlayerForRound(displayedActiveRound.round_id); } }} className="w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2 text-amber-50">
                <option value="">Spieler auswählen</option>
                {allPlayers.map((player) => <option key={player.id} value={player.id}>{getPlayerLabel(player)}</option>)}
              </select>
            </div>
            <div className="mt-2 rounded-2xl border border-amber-700/30 bg-black/25 p-2">
              <label className="mb-1 block text-sm text-amber-100/80">Spieler für die aktive Runde</label>
              {isFlightDrawRound ? (
                <>
                  <div className="rounded-2xl border border-amber-700/40 bg-stone-950 p-2 text-amber-50">
                    {assignedScoredPlayerId ? getPlayerLabel(automaticScoredPlayerBase || scoredPlayer) : "Noch keine Zuordnung aus der Flight-Ziehung"}
                  </div>
                  <p className="mt-1 text-xs text-amber-100/60">Die Zuordnung ist in Runde 1–3 gesperrt und kommt automatisch aus der gespeicherten Flight-Ziehung.</p>
                </>
              ) : (
                <>
                  <select value={scoredPlayerId} onChange={(e) => { const nextPlayerId = e.target.value; setScoredPlayerId(nextPlayerId); if (displayedActiveRound?.round_id) { if (nextPlayerId) saveLocalScoredPlayerForRound(displayedActiveRound.round_id, nextPlayerId); else removeLocalScoredPlayerForRound(displayedActiveRound.round_id); } }} className="w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2 text-amber-50">
                    <option value="">Spieler auswählen</option>
                    {scoreablePlayers.map((player) => <option key={player.id} value={player.id}>{getPlayerLabel(player)}</option>)}
                  </select>
                  <p className="mt-1 text-xs text-amber-100/60">Am Finaltag wird manuell ausgewählt, weil keine Flight-Ziehung hinterlegt ist.</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.section>
    );
  }

  function renderAdminView() {
    return (
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="mb-2 rounded-2xl border border-amber-500/30 bg-[linear-gradient(180deg,rgba(48,35,22,0.86),rgba(18,13,9,0.82))] shadow-[inset_0_1px_0_rgba(251,191,36,0.10),0_18px_46px_rgba(0,0,0,0.38)] backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="mb-2"><p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Admin</p><h2 className="font-serif text-lg text-amber-200">Turnierverwaltung</h2></div>
            {!isAdminUnlocked ? <div className="mb-2 rounded-2xl border border-amber-700/30 bg-black/25 p-2"><label className="mb-1 block text-sm text-amber-100/80">Admin-Passwort</label><input type="password" value={adminPinInput} onChange={(e) => setAdminPinInput(e.target.value)} placeholder="Passwort eingeben" className="mb-3 w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2 text-amber-50 placeholder:text-amber-100/30" /><Button onClick={() => { if (adminPinInput === ADMIN_PASSWORD) { setIsAdminUnlocked(true); setError(""); } else { setError("Admin-Passwort ist falsch."); } }} className="w-full rounded-2xl bg-amber-600 py-2 text-amber-50">Admin entsperren</Button></div> : <div className="mb-2 rounded-2xl border border-emerald-700/30 bg-emerald-950/30 p-3 text-sm text-emerald-100">Admin entsperrt. Änderungen können gespeichert werden.</div>}
            <div className="mb-2 rounded-2xl border border-amber-700/30 bg-black/25 p-2"><label className="mb-1 block text-sm text-amber-100/80">Aktive Runde</label><select value={selectedActiveRoundId} onChange={(e) => { const nextRoundId = e.target.value; const nextRound = (rounds.length ? rounds : fallbackRounds).find((round) => String(round.round_id) === String(nextRoundId)); const nextCourseId = nextRound?.course_id || selectedCourseId || ""; setAdminEditing(true); setSelectedActiveRoundId(nextRoundId); setSelectedCourseId(nextCourseId); setScoredPlayerId(""); lastLoadedRoundRef.current = ""; setScoreEntryMode("player"); saveAdminRoundCourse(nextRoundId, nextCourseId); }} disabled={!isAdminUnlocked} className="w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2 text-amber-50 disabled:opacity-60"><option value="">Runde auswählen</option>{(rounds.length ? rounds : fallbackRounds).map((round) => <option key={round.round_id} value={round.round_id}>{round.round_name}</option>)}</select></div>
            <div className="mb-2 rounded-2xl border border-amber-700/30 bg-black/25 p-2"><label className="mb-1 block text-sm text-amber-100/80">Kurs für aktive Runde</label><select value={selectedCourseId} onChange={(e) => { const nextCourseId = e.target.value; setAdminEditing(true); setSelectedCourseId(nextCourseId); saveAdminRoundCourse(selectedActiveRoundId, nextCourseId); }} disabled={!isAdminUnlocked} className="w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2 text-amber-50 disabled:opacity-60"><option value="">Kurs auswählen</option>{(courses.length ? courses : fallbackCourses).map((course) => <option key={course.course_id} value={course.course_id}>{course.course_name}</option>)}</select></div>
            <div className="space-y-2">{allPlayers.map((p) => { const hcpIndexKey = `hcp_index_${p.id}`; const hcpIndexValue = localHandicaps[hcpIndexKey] ?? String(p.handicap_index ?? p.dgv_hcp ?? p.hcp_index ?? ""); const previewPlayer = { ...p, handicap_index: hcpIndexValue === "" || hcpIndexValue === "-" ? 0 : Number(String(hcpIndexValue).replace(",", ".")) }; const goetheSpv = getCourseHandicap(previewPlayer, "goethe", courses); const feiningerSpv = getCourseHandicap(previewPlayer, "feininger", courses); return <div key={p.id} className="rounded-xl border border-amber-700/30 bg-black/25 p-2"><div className="mb-2 font-semibold text-amber-100">{getPlayerLabel(p)}</div><input inputMode="decimal" disabled={!isAdminUnlocked} value={hcpIndexValue} onChange={(e) => { setAdminEditing(true); setLocalHandicaps((current) => ({ ...current, [hcpIndexKey]: cleanHandicapInput(e.target.value) })); }} className="w-full rounded-2xl border border-amber-700/40 bg-stone-950 p-2 text-center text-amber-50 disabled:opacity-60" /><div className="mt-2 grid grid-cols-2 gap-2 text-center text-xs text-amber-100/75"><div className="rounded-xl bg-amber-50/5 p-2"><div>Goethe SpV</div><b className="text-lg text-amber-200">{goetheSpv}</b></div><div className="rounded-xl bg-amber-50/5 p-2"><div>Feininger SpV</div><b className="text-lg text-amber-200">{feiningerSpv}</b></div></div></div>; })}</div>
            <Button disabled={!isAdminUnlocked} onClick={saveFullSetup} className="mt-2 w-full rounded-2xl bg-amber-600 py-2 text-amber-50 disabled:opacity-50">HCP-Werte speichern</Button>
            <Button disabled={!isAdminUnlocked} onClick={createRoundBackup} className="mt-2 w-full rounded-2xl border border-emerald-500/40 bg-emerald-700/80 py-2 text-emerald-50 disabled:opacity-50">Backup für aktive Runde erstellen</Button>
            {appLocked ? <Button disabled={!isAdminUnlocked} onClick={() => { setGlobalAppLock(false); setLockAdminBypass(false); }} className="mt-2 w-full rounded-2xl border border-emerald-500/40 bg-emerald-800/70 py-2 text-emerald-50 disabled:opacity-50">App für alle freigeben</Button> : <Button disabled={!isAdminUnlocked} onClick={() => { setMenuOpen(false); setLockAdminBypass(false); setGlobalAppLock(true); }} className="mt-2 w-full rounded-2xl border border-amber-500/40 bg-stone-950/70 py-2 text-amber-100 disabled:opacity-50">App für alle sperren</Button>}
            <Button disabled={!isAdminUnlocked || clearScoresSaving || connectionStatus !== "online"} onClick={() => setClearScoresConfirmOpen(true)} className="mt-2 w-full rounded-2xl border border-red-500/50 bg-red-950/60 py-2 text-red-100 disabled:opacity-50">Scores löschen</Button>
            <Button disabled={!isAdminUnlocked || flightDrawSaving || connectionStatus !== "online"} onClick={saveFlightDrawFromAdmin} className="mt-2 w-full rounded-2xl border border-amber-500/40 bg-amber-800/70 py-2 text-amber-50 disabled:opacity-50">{flightDrawSaving ? "Flights werden bestimmt ..." : "Flights neu bestimmen"}</Button>
            <Button disabled={!isAdminUnlocked || connectionStatus !== "online"} onClick={resetDeviceAssignmentsForAll} className="mt-2 w-full rounded-2xl border border-amber-500/40 bg-stone-950/70 py-2 text-amber-100 disabled:opacity-50">Spieler-/Zähler-Zuordnungen zurücksetzen</Button>
            <Button disabled={!isAdminUnlocked} onClick={clearLocalCache} className="mt-2 w-full rounded-2xl border border-sky-500/40 bg-sky-950/60 py-2 text-sky-100 disabled:opacity-50">Lokalen Cache dieses Geräts löschen</Button>
            <Button disabled={!isAdminUnlocked || connectionStatus !== "online"} onClick={fullResetForAllDevices} className="mt-2 w-full rounded-2xl border border-red-400/60 bg-red-950/80 py-2 text-red-100 disabled:opacity-50">Script-Cache löschen + Komplett-Reset für alle</Button>
          </CardContent>
        </Card>
      </motion.section>
    );
  }

  function renderTournamentView() {
    return <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="landscape:fixed landscape:inset-0 landscape:z-40 landscape:overflow-auto landscape:bg-stone-950 landscape:p-3"><div className="landscape:mx-auto landscape:max-w-none landscape:pb-6"><TournamentStandings players={allPlayers} rounds={rounds} holes={allHoles} scores={officialAllScores} courses={courses} activeRoundId={displayedActiveRound?.round_id} /></div></motion.section>;
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
    const scorecardHoles = (allHoles.length ? allHoles : fallbackHoles).filter((hole) => String(hole.course_id) === String(archiveCourseId)).sort((a, b) => Number(a.hole_number) - Number(b.hole_number));
    const scorecardPlayers = getPlayersForCourse(getRoundPlayers(archiveRound?.round_id, allPlayers, roundPlayers), archiveCourseId, courses);
    const scorecardScores = officialAllScores.filter((score) => String(score.round_id || "") === String(archiveRound?.round_id || ""));

    return (
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="landscape:fixed landscape:inset-0 landscape:z-40 landscape:overflow-auto landscape:bg-stone-950 landscape:p-3">
        <div className="landscape:mx-auto landscape:max-w-none landscape:pb-6">
          <Card className="mb-2 rounded-2xl border-amber-700/40 bg-[#20170f]/82 shadow-xl backdrop-blur-sm">
            <CardContent className="p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Scorekarten</p>
              <div className="mt-0.5 text-sm font-semibold text-amber-300/85">Chroniken der Runde</div>
              <h2 className="font-serif text-lg text-amber-200">{archiveRound?.round_name || "Aktive Runde"}</h2>
              <p className="mt-1 text-sm text-amber-100/70">{archiveCourse?.course_name || "Kurs"} · klassische Scorekarte je Spieler</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {availableRounds.map((round) => (
                  <button key={round.round_id} type="button" onClick={() => setScorecardRoundId(round.round_id)} className={cls("rounded-xl border px-2 py-2 text-xs font-bold", String(archiveRound?.round_id) === String(round.round_id) ? "border-amber-400/60 bg-amber-600 text-amber-50" : "border-amber-700/35 bg-black/25 text-amber-100")}>{round.round_name || round.round_id}</button>
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
              const score = scorecardScores.find((item) => String(item.player_id || "") === String(player.id) && Number(item.hole_number) === Number(hole.hole_number));
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
                  <div className="mb-3 flex items-start justify-between gap-2"><div><div className="font-serif text-lg font-bold text-amber-200">{getPlayerLabel(player)}</div><div className="text-xs text-amber-100/65">SpV {Number(player.course_hcp || 0)} · {playedRows.length}/18 Löcher</div></div><div className="rounded-2xl border border-amber-700/30 bg-black/25 px-3 py-2 text-right text-xs text-amber-100/80"><div>Strokes HCP adjusted</div><b className="font-serif text-lg text-amber-300">{playedRows.length ? totalHcpAdjustedStrokes : "–"}</b></div></div>
                  <div className="overflow-x-auto rounded-2xl border border-amber-700/30 bg-black/20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <table className="w-full min-w-[760px] border-collapse text-xs text-amber-50 landscape:min-w-0 landscape:text-[11px]">
                      <thead><tr className="text-left uppercase tracking-wider text-amber-100/80"><th className="px-2 py-1.5">Loch</th>{scorecardHoles.map((hole) => <th key={hole.hole_number} className="px-1.5 py-1.5 text-center">{hole.hole_number}</th>)}<th className="px-2 py-1.5 text-center">Σ</th></tr></thead>
                      <tbody>
                        <tr className="border-t border-amber-700/20"><td className="px-2 py-1.5 font-semibold text-amber-100">Par</td>{scorecardHoles.map((hole) => <td key={hole.hole_number} className="px-1.5 py-1.5 text-center">{hole.par}</td>)}<td className="px-2 py-1.5 text-center font-bold text-amber-200">{scorecardHoles.reduce((sum, hole) => sum + Number(hole.par || 0), 0)}</td></tr>
                        <tr className="border-t border-amber-700/20"><td className="px-2 py-1.5 font-semibold text-amber-100">Vorgabe</td>{playerScores.map(({ hole, shots }) => <td key={hole.hole_number} className="px-1.5 py-1.5 text-center font-bold tracking-[0.18em] text-amber-300">{Number(shots || 0) > 0 ? "|".repeat(Number(shots || 0)) : ""}</td>)}<td className="px-2 py-1.5 text-center font-bold text-amber-300">{playedRows.length ? playedRows.reduce((sum, row) => sum + Number(row.shots || 0), 0) : ""}</td></tr>
                        <tr className="border-t border-amber-700/20"><td className="px-2 py-1.5 font-semibold text-amber-100">Strokes</td>{playerScores.map(({ hole, score }) => <td key={hole.hole_number} className="px-1 py-1.5 text-center"><span className={cls("inline-flex min-w-[26px] justify-center rounded-lg px-1.5 py-0.5 font-bold", getStrokesCellClass(score, hole))}>{score ? normalizeBoolean(score.picked_up) ? "X" : score.strokes || "–" : "–"}</span></td>)}<td className="px-2 py-1.5 text-center font-bold text-amber-300">{playedRows.length ? totalStrokes : "–"}</td></tr>
                        <tr className="border-t border-amber-700/20"><td className="px-2 py-1.5 font-semibold text-amber-100">Strokes HCP adjusted</td>{playerScores.map(({ hole, hcpAdjustedStrokes }) => <td key={hole.hole_number} className="px-1.5 py-1.5 text-center">{hcpAdjustedStrokes ?? "–"}</td>)}<td className="px-2 py-1.5 text-center font-bold text-amber-300">{playedRows.length ? totalHcpAdjustedStrokes : "–"}</td></tr>
                        <tr className="border-t border-amber-700/20"><td className="px-2 py-1.5 font-semibold text-amber-100">+/− HCP adjusted</td>{playerScores.map(({ hole, hcpAdjustedToPar }) => <td key={hole.hole_number} className="px-1.5 py-1.5 text-center">{hcpAdjustedToPar == null ? "–" : formatToPar(hcpAdjustedToPar, true)}</td>)}<td className="px-2 py-1.5 text-center font-bold text-amber-300">{totalHcpAdjustedToPar == null ? "–" : formatToPar(totalHcpAdjustedToPar, true)}</td></tr>
                        <tr className="border-t border-amber-700/20"><td className="px-2 py-1.5 font-semibold text-amber-100">Netto Stblf.</td>{playerScores.map(({ hole, score, netStableford }) => <td key={hole.hole_number} className="px-1.5 py-1.5 text-center">{score ? netStableford : "–"}</td>)}<td className="px-2 py-1.5 text-center font-bold text-amber-300">{playedRows.length ? totalNetStableford : "–"}</td></tr>
                        <tr className="border-t border-amber-700/20"><td className="px-2 py-1.5 font-semibold text-amber-100">Brutto</td>{playerScores.map(({ hole, score, grossStableford }) => <td key={hole.hole_number} className="px-1.5 py-1.5 text-center">{score ? grossStableford : "–"}</td>)}<td className="px-2 py-1.5 text-center font-bold text-amber-300">{playedRows.length ? totalGrossStableford : "–"}</td></tr>
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

  function renderFunView() {
    return <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="landscape:fixed landscape:inset-0 landscape:z-40 landscape:overflow-auto landscape:bg-stone-950 landscape:p-3"><div className="landscape:mx-auto landscape:max-w-none landscape:pb-6"><MiddleEarthTables players={playersWithCurrentHandicaps} holes={holes} scores={officialScores} mismatches={roundMismatches} /></div></motion.section>;
  }

  function renderActiveView() {
    if (loading) return <Card className="rounded-2xl border-amber-700/40 bg-[#20170f]/82 shadow-xl backdrop-blur-sm"><CardContent className="flex items-center gap-2 p-3 text-amber-100">⟳ Lade Datenbank ...</CardContent></Card>;
    if (view === "admin") return renderAdminView();
    if (view === "handicaps") return renderSettingsView();
    if (view === "leaderboard") return renderLeaderboardView();
    if (view === "tournament") return renderTournamentView();
    if (view === "archive") return renderArchiveView();
    if (view === "fun") return renderFunView();
    if (view === "flights") return renderFlightsView();
    return renderScoreView();
  }

  function renderSplashOverlay() {
    if (!((showSplash || appLocked) && !lockAdminBypass)) return null;

    return (
      <div className="fixed inset-0 z-[100] bg-black">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/lord-bg.webp')" }} />
        <div className="absolute inset-0 bg-black/25" />

        {!appLocked ? (
          <div className="absolute inset-x-0 bottom-8 flex justify-center px-6 pb-[env(safe-area-inset-bottom)]">
            <button
              type="button"
              disabled={splashEntering}
              onClick={enterRoundFromSplash}
              className="w-full max-w-xs rounded-2xl border border-amber-300/55 bg-black/55 px-5 py-2.5 font-serif text-lg font-black tracking-wide text-amber-200 shadow-2xl shadow-black/70 backdrop-blur-sm active:scale-[0.98] disabled:opacity-60"
            >
              {splashEntering ? "Datenbank wird geladen ..." : "Die Saga beginnt"}
            </button>
          </div>
        ) : flightRevealRunning ? (
          <div className="absolute inset-x-3 bottom-5 top-5 mx-auto flex max-w-md items-center justify-center pb-[env(safe-area-inset-bottom)]">
            <div className="w-full">{renderFlightDrawPanel()}</div>
          </div>
        ) : (
          <div className="absolute inset-x-4 bottom-6 mx-auto max-w-sm pb-[env(safe-area-inset-bottom)]">
            {renderFlightDrawPanel()}
          </div>
        )}

        {appLocked ? (
          <button
            type="button"
            onClick={() => setLockUnlockOpen(true)}
            className="absolute bottom-3 left-3 h-8 w-8 rounded-full text-[10px] text-amber-100/10"
            aria-label="Admin-Zugang"
          >
            •
          </button>
        ) : null}

        {appLocked && lockUnlockOpen ? (
          <div className="absolute inset-x-4 bottom-8 mx-auto max-w-xs rounded-2xl border border-amber-700/35 bg-black/70 p-3 text-amber-50 shadow-2xl shadow-black/70 backdrop-blur-sm">
            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-amber-300/70">Admin</div>
            <input
              type="password"
              value={lockPasswordInput}
              onChange={(e) => setLockPasswordInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") enterLockedAppAsAdmin(); }}
              placeholder="Passwort"
              className="mb-2 w-full rounded-xl border border-amber-700/40 bg-stone-950 p-2 text-amber-50 placeholder:text-amber-100/30"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setLockUnlockOpen(false); setLockPasswordInput(""); }}
                className="rounded-xl bg-stone-800 py-2 text-sm font-bold text-amber-100"
              >
                Abbrechen
              </button>
              <button
                type="button"
                disabled={splashEntering || flightDrawSaving}
                onClick={enterLockedAppAsAdmin}
                className="rounded-xl bg-amber-600 py-2 text-sm font-bold text-amber-50 disabled:opacity-60"
              >
                {splashEntering || flightDrawSaving ? "Öffne ..." : "Zeremonienmeister"}
              </button>
            </div>
            <button
              type="button"
              disabled={splashEntering || flightDrawSaving}
              onClick={enterAppWithoutFlightDraw}
              className="mt-2 w-full rounded-xl border border-amber-500/35 bg-stone-950/85 py-2 text-sm font-bold text-amber-100 disabled:opacity-60"
            >
              Direkt in die App
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  function renderPopupStandingsTable() {
    if (!standingsPopup) return null;
    const isNetStableford = standingsPopup === "netStableford";
    const isStrokePlay = standingsPopup === "strokePlay";
    const title = isStrokePlay ? "Klassisches Zählspiel" : isNetStableford ? "Netto Stableford" : "Strokes HCP adjusted";
    const tablePlayers = isStrokePlay ? strokePlayLeaderboard : isNetStableford ? netStablefordLeaderboard : hcpAdjustedStrokeLeaderboard;
    return <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 px-3 backdrop-blur-sm"><div className="max-h-[82vh] w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/45 bg-stone-950 text-amber-50 shadow-2xl shadow-black/80"><div className="flex items-start justify-between gap-2 border-b border-amber-700/35 bg-amber-500/10 p-3"><div><div className="text-xs uppercase tracking-[0.2em] text-amber-300/75">Tabelle</div><div className="font-serif text-lg text-amber-200">{title}</div></div><button type="button" onClick={() => setStandingsPopup(null)} className="rounded-xl border border-amber-500/40 bg-black/25 px-3 py-1 text-lg font-bold leading-none text-amber-100">×</button></div><div className="max-h-[68vh] overflow-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><table className="w-full border-collapse text-sm text-amber-50"><thead><tr className="text-left text-xs uppercase tracking-wider text-amber-100/80"><th className="px-2 py-2">#</th><th className="px-2 py-2">Spieler</th><th className="px-2 py-2 text-right">{isNetStableford ? "Punkte" : "+/−"}</th><th className="px-2 py-2 text-right">Löcher</th></tr></thead><tbody>{tablePlayers.map((player, index) => <tr key={player.id} className={cls("border-t border-amber-700/20", myPlayerId && String(player.id) === String(myPlayerId) && "bg-amber-500/15")}><td className="px-2 py-2 text-amber-200/80">{index + 1}</td><td className="px-2 py-2 font-semibold text-amber-100">{getPlayerLabel(player)}</td><td className="px-2 py-2 text-right font-serif text-lg font-bold text-amber-300">{isStrokePlay ? formatToPar(player.toPar, player.played) : isNetStableford ? player.netStableford : formatToPar(player.hcpAdjustedToPar, player.played)}</td><td className="px-2 py-2 text-right text-amber-100/80">{player.played}/18</td></tr>)}</tbody></table></div></div></div>;
  }

  return (
    <div className="min-h-screen bg-black text-amber-50">
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/lord-bg.webp')" }} />
      <div className="fixed inset-0 bg-black/45" />
      <div className="fixed inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.58)_38%,rgba(0,0,0,0.86)_100%)]" />
      {renderSplashOverlay()}
      <main className="relative z-10 mx-auto max-w-md px-2 py-1.5">
        {renderHeader()}
        {renderStatusMessages()}
        {renderActiveView()}
        <footer className="pb-2 pt-1 text-center text-[9px] uppercase tracking-[0.16em] text-amber-100/35">© Lord of the Holes Association</footer>
      </main>
      {setupSavedMessage ? <div className="fixed inset-x-3 top-4 z-50 mx-auto max-w-md rounded-2xl border border-emerald-500/50 bg-emerald-950/95 p-3 text-emerald-50 shadow-2xl shadow-black/60 backdrop-blur"><div className="flex items-start justify-between gap-2"><div><div className="font-serif text-lg text-emerald-100">Gespeichert</div><div className="mt-0.5 text-sm text-emerald-100/85">{setupSavedMessage}</div></div><button type="button" onClick={() => setSetupSavedMessage("")} className="rounded-xl border border-emerald-400/40 bg-black/25 px-3 py-1 text-sm font-bold text-emerald-50">×</button></div></div> : null}
      {backupSavedMessage ? <div className="fixed inset-x-3 top-4 z-50 mx-auto max-w-md rounded-2xl border border-emerald-500/50 bg-emerald-950/95 p-3 text-emerald-50 shadow-2xl shadow-black/60 backdrop-blur"><div className="flex items-start justify-between gap-2"><div><div className="font-serif text-lg text-emerald-100">Backup erstellt</div><div className="mt-0.5 text-sm text-emerald-100/85">{backupSavedMessage}</div></div><button type="button" onClick={() => setBackupSavedMessage("")} className="rounded-xl border border-emerald-400/40 bg-black/25 px-3 py-1 text-sm font-bold text-emerald-50">×</button></div></div> : null}
      {renderPopupStandingsTable()}
      {roundSummaryPopup ? (
        <div className="fixed inset-0 z-[94] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-amber-400/60 bg-stone-950 text-center text-amber-50 shadow-2xl shadow-black/80">
            <div className="bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.25),transparent_45%),linear-gradient(180deg,rgba(41,37,36,0.92),rgba(12,10,9,1))] p-5">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-amber-300/50 bg-black/30 text-3xl shadow-xl shadow-amber-950/40">📜</div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-amber-100/70">{roundSummaryPopup.subtitle}</div>
              <div className="mt-2 font-serif text-2xl font-black text-amber-200">{roundSummaryPopup.title}</div>
              <div className="mt-1 text-sm font-semibold text-amber-100/80">{roundSummaryPopup.playerName}</div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-left text-sm">
                <div className="rounded-2xl border border-amber-500/30 bg-black/25 p-3"><div className="text-xs uppercase tracking-[0.18em] text-amber-300/70">Strokes</div><div className="font-serif text-2xl font-black text-amber-200">{roundSummaryPopup.strokes}</div><div className="text-xs text-amber-100/65">{formatToPar(roundSummaryPopup.toPar, true)} zu Par</div></div>
                <div className="rounded-2xl border border-amber-500/30 bg-black/25 p-3"><div className="text-xs uppercase tracking-[0.18em] text-amber-300/70">HCP adjusted</div><div className="font-serif text-2xl font-black text-amber-200">{roundSummaryPopup.hcpAdjustedStrokes}</div><div className="text-xs text-amber-100/65">Strokes HCP</div></div>
                <div className="rounded-2xl border border-amber-500/30 bg-black/25 p-3"><div className="text-xs uppercase tracking-[0.18em] text-amber-300/70">Netto Stblf.</div><div className="font-serif text-2xl font-black text-amber-200">{roundSummaryPopup.netStableford}</div><div className="text-xs text-amber-100/65">Punkte</div></div>
                <div className="rounded-2xl border border-amber-500/30 bg-black/25 p-3"><div className="text-xs uppercase tracking-[0.18em] text-amber-300/70">Brutto</div><div className="font-serif text-2xl font-black text-amber-200">{roundSummaryPopup.grossStableford}</div><div className="text-xs text-amber-100/65">Punkte</div></div>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-1.5 text-xs text-amber-100/80">
                <div className="rounded-xl bg-amber-500/10 p-2"><b className="block text-amber-200">{roundSummaryPopup.putts}</b>Putts</div>
                <div className="rounded-xl bg-emerald-500/10 p-2"><b className="block text-emerald-200">{roundSummaryPopup.girCount}</b>GIR</div>
                <div className="rounded-xl bg-amber-500/10 p-2"><b className="block text-amber-200">{roundSummaryPopup.birdiesOrBetter}</b>Birdie+</div>
                <div className="rounded-xl bg-red-500/10 p-2"><b className="block text-red-100">{roundSummaryPopup.pickedUp}</b>X</div>
              </div>
            </div>
            <div className="p-3">
              <button type="button" onClick={() => setRoundSummaryDismissedKeys((current) => Array.from(new Set([...(current || []), roundSummaryPopup.key])))} className="w-full rounded-2xl border border-amber-500/45 bg-amber-600 px-4 py-2.5 text-sm font-bold text-amber-50">Chronik schließen ×</button>
            </div>
          </div>
        </div>
      ) : null}
      {showDevicePlayerGate ? <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"><div className="w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/45 bg-stone-950 text-amber-50 shadow-2xl shadow-black/80"><div className="bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.20),transparent_45%),linear-gradient(180deg,rgba(41,37,36,0.94),rgba(12,10,9,1))] p-4 text-center"><div className="text-[10px] uppercase tracking-[0.24em] text-amber-300/75">Dieses Handy</div><div className="mt-1 font-serif text-2xl font-black text-amber-200">Wer bist du?</div><div className="mt-1 text-sm text-amber-100/70">Wähle deinen eigenen Spieler. Diese Auswahl bleibt auf diesem Handy gespeichert.</div><div className="mt-4 grid gap-2">{visiblePlayers.map((player) => <button key={player.id} type="button" onClick={() => { setMyPlayerId(player.id); writeLocalJson("lordOfTheHoles.myPlayerId", player.id); setForceMyPlayerPromptOpen(false); setScoreEntryMode("player"); }} className="rounded-2xl border border-amber-700/35 bg-stone-900 px-3 py-3 font-serif text-base font-bold text-amber-100 transition active:scale-[0.98]">{getPlayerLabel(player)}</button>)}</div></div></div></div> : null}
      {showRoundHonorPopup ? (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-amber-400/60 bg-stone-950 text-center text-amber-50 shadow-2xl shadow-black/80">
            <div className="bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.28),transparent_45%),linear-gradient(180deg,rgba(120,53,15,0.55),rgba(12,10,9,1))] p-5">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-amber-300/50 bg-black/30 text-3xl shadow-xl shadow-amber-950/40">⚜</div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-amber-100/70">{displayedRoundHonorCelebration.roundName} beendet</div>
              <div className="mt-2 font-serif text-lg font-black text-amber-200">Gondors Erlass</div>
              <div className="mt-1 text-sm text-amber-100/70">Die Runde ist gespielt. Den Herren von Gondor werden ihre Schildträger zur Seite gestellt — der Hofstaat wird neu geordnet.</div>
              <div className="mt-2 rounded-2xl border border-amber-300/40 bg-amber-500/10 p-3 text-sm font-semibold text-amber-50">{roundHonorPersonalMessage}</div>
              <div className="mt-2 rounded-2xl border border-amber-500/35 bg-black/25 p-3 text-left">
                <div className="text-xs uppercase tracking-[0.22em] text-amber-300/75">{displayedRoundHonorCelebration.lords.length === 1 ? "Herr von Gondor" : "Herren von Gondor"}</div>
                <div className="mt-2 space-y-1">{displayedRoundHonorCelebration.lords.map((player, index) => <div key={player.id} className="flex items-center justify-between gap-2 rounded-xl bg-amber-500/10 px-2 py-1.5"><span className="font-serif text-lg font-black text-amber-200">{index + 1}. {getPlayerLabel(player)}</span><span className="text-xs text-amber-100/70">{player.hcpAdjustedStrokes}</span></div>)}</div>
              </div>
              {displayedRoundHonorCelebration.lordPlayoff?.length ? <div className="mt-2 rounded-2xl border border-amber-400/45 bg-amber-500/10 p-3 text-left"><div className="text-xs uppercase tracking-[0.22em] text-amber-300/80">Entscheidungsputten um {displayedRoundHonorCelebration.lordPlayoffSlots} Herr{displayedRoundHonorCelebration.lordPlayoffSlots === 1 ? "enplatz" : "enplätze"}</div><div className="mt-2 space-y-1">{displayedRoundHonorCelebration.lordPlayoff.map((player) => <div key={player.id} className="flex items-center justify-between gap-2 rounded-xl bg-amber-500/10 px-2 py-1.5"><span className="font-serif text-lg font-black text-amber-200">{getPlayerLabel(player)}</span><span className="text-xs text-amber-100/70">{player.hcpAdjustedStrokes}</span></div>)}</div><div className="mt-2 text-xs text-amber-100/75">Diese Spieler müssen ins Entscheidungsputten, bis die offenen Herrenplätze geklärt sind.</div></div> : null}
              <div className="mt-2 rounded-2xl border border-red-500/35 bg-black/25 p-3 text-left">
                <div className="text-xs uppercase tracking-[0.22em] text-red-200/80">Schildträger im Dienst der Herren</div>
                <div className="mt-2 space-y-1">{displayedRoundHonorCelebration.butlers.map((player) => <div key={player.id} className="flex items-center justify-between gap-2 rounded-xl bg-red-500/10 px-2 py-1.5"><span className="font-serif text-lg font-black text-red-100">{getPlayerLabel(player)}</span><span className="text-xs text-red-100/70">{player.hcpAdjustedStrokes}</span></div>)}</div>
              </div>
              {displayedRoundHonorCelebration.butlerPlayoff?.length ? <div className="mt-2 rounded-2xl border border-red-400/45 bg-red-500/10 p-3 text-left"><div className="text-xs uppercase tracking-[0.22em] text-red-200/80">Entscheidungsputten um {displayedRoundHonorCelebration.butlerPlayoffSlots} Schildträgerplatz{displayedRoundHonorCelebration.butlerPlayoffSlots === 1 ? "" : "plätze"}</div><div className="mt-2 space-y-1">{displayedRoundHonorCelebration.butlerPlayoff.map((player) => <div key={player.id} className="flex items-center justify-between gap-2 rounded-xl bg-red-500/10 px-2 py-1.5"><span className="font-serif text-lg font-black text-red-100">{getPlayerLabel(player)}</span><span className="text-xs text-red-100/70">{player.hcpAdjustedStrokes}</span></div>)}</div><div className="mt-2 text-xs text-red-100/75">Nur diese punktgleichen Spieler müssen ins Entscheidungsputten um den offenen Schildträgerdienst. Bereits eindeutig feststehende Schildträger müssen nicht antreten.</div></div> : null}
              <div className="mt-2 rounded-2xl border border-amber-500/25 bg-black/20 p-2 text-sm text-amber-100/75">{displayedRoundHonorCelebration.hasPlayoff ? "Gondor wartet auf das Entscheidungsputten. Erst danach ist geklärt, wer Krone trägt und wer Schild hält." : displayedRoundHonorCelebration.roundOrder === 1 ? "Der Herr von Gondor steht fest. Sein Schildträger ebenso. Der Dienst ist ehrenvoll — und vermutlich leicht erniedrigend." : "Die Herren von Gondor und ihre Schildträger stehen fest. Der Hofstaat ist informiert, die Eide sind gesprochen, die Knie zittern."}</div>
            </div>
            <div className="p-3"><button type="button" onClick={() => setRoundHonorDismissedKeys((current) => Array.from(new Set([...(current || []), displayedRoundHonorCelebration.key])))} className="w-full rounded-2xl border border-amber-500/45 bg-amber-600 px-4 py-2.5 text-sm font-bold text-amber-50">{roundHonorCloseLabel}</button></div>
          </div>
        </div>
      ) : null}
      {showFinalWinnerPopup && !roundSummaryPopup ? (
        <div className="fixed inset-0 z-[96] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-amber-400/60 bg-stone-950 text-center text-amber-50 shadow-2xl shadow-black/80">
            <div className="bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.28),transparent_45%),linear-gradient(180deg,rgba(120,53,15,0.55),rgba(12,10,9,1))] p-5">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-amber-300/50 bg-black/30 text-3xl shadow-xl shadow-amber-950/40">♛</div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-amber-100/70">Finale beendet</div>
              <div className="mt-2 font-serif text-lg font-black text-amber-200">Lord of the Holes 2026 ist</div>
              <div className="mt-2 font-serif text-4xl font-black text-amber-300 drop-shadow">{finalWinnerCelebration?.winnerName}</div>
              <div className="mt-2 text-sm text-amber-100/70">{finalWinnerCelebration?.winnerLabel}</div>
              <div className="mt-2 rounded-2xl border border-amber-500/35 bg-black/25 p-2 text-sm text-amber-100">Final Strokes HCP: <b className="text-amber-200">{finalWinnerCelebration?.finalHcpAdjustedStrokes ?? "–"}</b></div>
            </div>
            <div className="p-3"><button type="button" onClick={() => setWinnerPopupDismissedKey(finalWinnerPopupKey)} className="w-full rounded-2xl border border-amber-500/45 bg-amber-600 px-4 py-2.5 text-sm font-bold text-amber-50">Krone anerkennen ×</button></div>
          </div>
        </div>
      ) : null}
      {clearScoresConfirmOpen ? <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-3xl border border-red-500/60 bg-stone-950 p-4 text-red-50 shadow-2xl shadow-black/70"><div className="font-serif text-lg text-red-100">Alle Scores löschen?</div><p className="mt-2 text-sm text-red-100/80">Dadurch werden alle Einträge im Tab Scores gelöscht. Vorher wird automatisch ein Backup erstellt. Backup-Tabs bleiben erhalten.</p><div className="mt-2 grid grid-cols-2 gap-2"><button type="button" disabled={clearScoresSaving} onClick={() => setClearScoresConfirmOpen(false)} className="rounded-2xl border border-amber-700/40 bg-stone-900 px-3 py-2.5 text-sm font-bold text-amber-100 disabled:opacity-50">Abbrechen</button><button type="button" disabled={clearScoresSaving} onClick={clearAllScores} className="rounded-2xl border border-red-400/60 bg-red-700 px-3 py-2.5 text-sm font-bold text-red-50 disabled:opacity-50">{clearScoresSaving ? "Lösche ..." : "Ja, Scores löschen"}</button></div></div></div> : null}
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
