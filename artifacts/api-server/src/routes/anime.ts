import { Router, type IRouter } from "express";
import { otakudesu, samehadaku, kusonime, anoboy, SOURCES, type Source } from "../lib/scrapers/index.js";

const router: IRouter = Router();

type ScraperModule = typeof otakudesu;

function getScrapers(source: string): ScraperModule[] {
  if (source === "all") {
    return [otakudesu, samehadaku, kusonime, anoboy];
  }
  const map: Record<string, ScraperModule> = { otakudesu, samehadaku, kusonime, anoboy };
  const s = map[source];
  return s ? [s] : [];
}

function getSourceNames(source: string): string[] {
  if (source === "all") return SOURCES as string[];
  if (SOURCES.includes(source as Source)) return [source];
  return [];
}

router.get("/anime/latest", async (req, res): Promise<void> => {
  const source = (req.query.source as string) || "all";
  const page = parseInt(req.query.page as string) || 1;

  const scrapers = getScrapers(source);
  if (scrapers.length === 0) {
    res.status(400).json({ error: "Invalid source" });
    return;
  }

  const results = await Promise.allSettled(
    scrapers.map((s) => s.getLatest(page))
  );

  const items = results
    .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<ScraperModule["getLatest"]>>> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  res.json({
    items,
    total: items.length,
    sources: getSourceNames(source),
  });
});

router.get("/anime/popular", async (req, res): Promise<void> => {
  const source = (req.query.source as string) || "all";

  const scrapers = getScrapers(source);
  if (scrapers.length === 0) {
    res.status(400).json({ error: "Invalid source" });
    return;
  }

  const results = await Promise.allSettled(
    scrapers.map((s) => s.getPopular())
  );

  const items = results
    .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<ScraperModule["getPopular"]>>> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  res.json({
    items,
    total: items.length,
    sources: getSourceNames(source),
  });
});

router.get("/anime/search", async (req, res): Promise<void> => {
  const q = req.query.q as string;
  const source = (req.query.source as string) || "all";

  if (!q || q.trim() === "") {
    res.status(400).json({ error: "Query parameter 'q' is required" });
    return;
  }

  const scrapers = getScrapers(source);
  if (scrapers.length === 0) {
    res.status(400).json({ error: "Invalid source" });
    return;
  }

  const results = await Promise.allSettled(
    scrapers.map((s) => s.search(q))
  );

  const items = results
    .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<ScraperModule["search"]>>> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  res.json({
    items,
    total: items.length,
    sources: getSourceNames(source),
  });
});

router.get("/anime/detail", async (req, res): Promise<void> => {
  const url = req.query.url as string;
  const source = req.query.source as string;

  if (!url) {
    res.status(400).json({ error: "Query parameter 'url' is required" });
    return;
  }
  if (!source || !SOURCES.includes(source as Source)) {
    res.status(400).json({ error: "Valid 'source' parameter is required (otakudesu, samehadaku, kusonime, anoboy)" });
    return;
  }

  const scraperMap: Record<string, ScraperModule> = { otakudesu, samehadaku, kusonime, anoboy };
  const scraper = scraperMap[source];

  const detail = await scraper.getDetail(url);
  res.json(detail);
});

router.get("/anime/episode", async (req, res): Promise<void> => {
  const url = req.query.url as string;
  const source = req.query.source as string;

  if (!url) {
    res.status(400).json({ error: "Query parameter 'url' is required" });
    return;
  }
  if (!source || !SOURCES.includes(source as Source)) {
    res.status(400).json({ error: "Valid 'source' parameter is required (otakudesu, samehadaku, kusonime, anoboy)" });
    return;
  }

  const scraperMap: Record<string, ScraperModule> = { otakudesu, samehadaku, kusonime, anoboy };
  const scraper = scraperMap[source];

  const episode = await scraper.getEpisode(url);
  res.json(episode);
});

export default router;
