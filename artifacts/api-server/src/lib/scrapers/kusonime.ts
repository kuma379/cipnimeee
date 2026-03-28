import { fetchHtml, cleanText } from "./utils.js";

const BASE_URL = "https://kusonime.com";

export interface AnimeItem {
  title: string;
  url: string;
  thumbnail: string | null;
  episode: string | null;
  genre: string | null;
  source: "kusonime";
  rating: string | null;
  status: string | null;
  type: string | null;
}

export interface AnimeDetail {
  title: string;
  thumbnail: string | null;
  synopsis: string | null;
  genre: string[];
  status: string | null;
  episodes: number | null;
  rating: string | null;
  type: string | null;
  studio: string | null;
  source: "kusonime";
}

export interface EpisodeLink {
  label: string;
  url: string;
  quality: string | null;
  server: string | null;
}

export interface EpisodeDetail {
  title: string;
  animeTitle: string | null;
  episode: string | null;
  thumbnail: string | null;
  streamingLinks: EpisodeLink[];
  downloadLinks: EpisodeLink[];
  source: "kusonime";
}

function parseItems($: ReturnType<typeof import("cheerio").load>): AnimeItem[] {
  const items: AnimeItem[] = [];
  $(".venz .kover").each((_, el) => {
    const linkEl = $(el).find(".thumb a").first();
    const href = linkEl.attr("href") || "";
    const title =
      cleanText($(el).find(".content h2.episodeye a").first().text()) ||
      cleanText(linkEl.attr("title") || "");
    const thumbnail =
      $(el).find(".thumbz img").attr("src") ||
      $(el).find("img").first().attr("src") ||
      null;
    const genreLinks = $(el).find('a[href*="/genres/"]');
    const genre =
      genreLinks
        .map((_, a) => cleanText($(a).text()))
        .get()
        .filter(Boolean)
        .join(", ") || null;

    if (title && href) {
      items.push({
        title,
        url: href,
        thumbnail,
        episode: null,
        genre,
        source: "kusonime",
        rating: null,
        status: null,
        type: null,
      });
    }
  });
  return items;
}

export async function getLatest(page = 1): Promise<AnimeItem[]> {
  const url =
    page > 1
      ? `${BASE_URL}/category/ongoing-anime/page/${page}/`
      : `${BASE_URL}/category/ongoing-anime/`;
  const $ = await fetchHtml(url);
  return parseItems($);
}

export async function getPopular(): Promise<AnimeItem[]> {
  const $ = await fetchHtml(`${BASE_URL}/`);
  return parseItems($);
}

export async function search(query: string): Promise<AnimeItem[]> {
  const $ = await fetchHtml(`${BASE_URL}/?s=${encodeURIComponent(query)}`);
  return parseItems($);
}

export async function getDetail(animeUrl: string): Promise<AnimeDetail | null> {
  try {
    const $ = await fetchHtml(animeUrl);
    const title = cleanText($("h1.episodetitle, h1.entry-title, h1").first().text());
    const thumbnail =
      $(".fotoanime img, .thumb img, .wp-post-image").first().attr("src") || null;
    const synopsis = cleanText(
      $(".sinoat, .sinopsis p, .entry-content p").first().text()
    );

    const genreLinks = $('a[href*="/genres/"], a[rel="tag"]');
    const genre = genreLinks
      .map((_, a) => cleanText($(a).text()))
      .get()
      .filter(Boolean);

    let status: string | null = null;
    let episodes: number | null = null;
    let rating: string | null = null;
    let type: string | null = null;
    let studio: string | null = null;

    $(".infozingle p, .spe span").each((_, el) => {
      const text = cleanText($(el).text());
      const value = text.replace(/^[^:]+:\s*/, "");
      if (/status/i.test(text)) status = value;
      if (/episode/i.test(text)) {
        const ep = text.match(/\d+/)?.[0];
        if (ep) episodes = parseInt(ep, 10);
      }
      if (/score|rating/i.test(text)) rating = value;
      if (/^type|^tipe/i.test(text)) type = value;
      if (/studio/i.test(text)) studio = value;
    });

    if (!title) return null;

    return {
      title,
      thumbnail,
      synopsis: synopsis || null,
      genre,
      status,
      episodes,
      rating,
      type,
      studio,
      source: "kusonime",
    };
  } catch {
    return null;
  }
}

export async function getEpisode(
  episodeUrl: string
): Promise<EpisodeDetail | null> {
  try {
    const $ = await fetchHtml(episodeUrl);
    const title = cleanText(
      $("h1.episodetitle, h1.entry-title, h1").first().text()
    );
    const thumbnail =
      $(".wp-post-image, .thumb img").first().attr("src") || null;
    const downloadLinks: EpisodeLink[] = [];

    $(".download-eps a, .episodedl a").each((_, el) => {
      const href = $(el).attr("href") || "";
      const label = cleanText($(el).text());
      if (href && label) {
        downloadLinks.push({ label, url: href, quality: null, server: null });
      }
    });

    if (!title) return null;

    return {
      title,
      animeTitle: null,
      episode: null,
      thumbnail,
      streamingLinks: [],
      downloadLinks,
      source: "kusonime",
    };
  } catch {
    return null;
  }
}
