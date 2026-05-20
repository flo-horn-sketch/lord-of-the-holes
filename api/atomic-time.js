export default async function handler(req, res) {
  try {
    const response = await fetch("https://itime.live/api/time", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: `itime.live HTTP ${response.status}`,
      });
    }

    const data = await response.json();

    res.setHeader("Cache-Control", "no-store, max-age=0");

    return res.status(200).json({
      ok: true,
      timestamp: data.timestamp,
      utc: data.utc,
      time: data.time,
      source: "itime.live",
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err?.message || String(err),
    });
  }
}
