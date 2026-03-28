import { fetchHtml, cleanText } from "./utils.js";

const BASE_URL = "https://anoboy.li";

export interface AnimeItem {
  title: string;
  url: string;
  thumbnail: string | null;
  episode: string | null;
  genre: string | null;
  source: "anoboy";
  rating: string | null;
  status: string | null;
  type: string | null;
}

export interface EpisodeLink {
  label: string;
  url: string;
  quality: string | null;
  server: string | null;
}

export interface AnimeEpisodeItem {
  episode: string;
  url: string;
  date: string | null;
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
  episodeList: AnimeEpisodeItem[];
  source: "anoboy";
}

export interface EpisodeDetail {
  title: string;
  animeTitle: string | null;
  episode: string | null;
  thumbnail: string | null;
  streamingLinks: EpisodeLink[];
  downloadLinks: EpisodeLink[];
  source: "anoboy";
}

export async function getLatest(page = 1): Promise<AnimeItem[]> {
  const url = page > 1 ? `${BASE_URL}/page/${page}/` : `${BASE_URL}/`;
  const $ = await fetchHtml(url);
  const items: AnimeItem[] = [];

  $(".post, article, .animepost").each((_, el) => {
    const titleEl = $(el).find("h2 a, .title a, .entry-title a");
    const title = cleanText(titleEl.first().text());
    const href = titleEl.first().attr("href") || "";
    const thumbnail =
      $(el).find("img").attr("data-src") ||
      $(el).find("img").attr("src") ||
      null;
    const episode = cleanText($(el).find(".epz, .ep").text()) || null;
    const genres = cleanText($(el).find(".genre, .genres").text()) || null;

    if (title && href) {
      items.push({
        title,
        url: href,
        thumbnail,
        episode,
        genre: genres,
        source: "anoboy",
        rating: null,
        status: null,
        type: null,
      });
    }
  });

  return items;
}

export async function getPopular(): Promise<AnimeItem[]> {
  const $ = await fetchHtml(`${BASE_URL}/`);
  const items: AnimeItem[] = [];

  $(".sidebar .popular li, .widget-popular li, .popular-posts li").each((_, el) => {
    const titleEl = $(el).find("a");
    const title = cleanText(titleEl.first().text());
    const href = titleEl.first().attr("href") || "";
    const thumbnail = $(el).find("img").attr("src") || null;

    if (title && href) {
      items.push({
        title,
        url: href,
        thumbnail,
        episode: null,
        genre: null,
        source: "anoboy",
        rating: null,
        status: null,
        type: null,
      });
    }
  });

  if (items.length === 0) {
    return getLatest();
  }

  return items;
}

export async function search(query: string): Promise<AnimeItem[]> {
  const $ = await fetchHtml(`${BASE_URL}/?s=${encodeURIComponent(query)}`);
  const items: AnimeItem[] = [];

  $(".post, article, .animepost").each((_, el) => {
    const titleEl = $(el).find("h2 a, .entry-title a");
    const title = cleanText(titleEl.first().text());
    const href = titleEl.first().attr("href") || "";
    const thumbnail =
      $(el).find("img").attr("data-src") ||
      $(el).find("img").attr("src") ||
      null;
    const genres = cleanText($(el).find(".genre, .genres").text()) || null;

    if (title && href) {
      items.push({
        title,
        url: href,
        thumbnail,
        episode: null,
        genre: genres,
        source: "anoboy",
        rating: null,
        status: null,
        type: null,
      });
    }
  });

  return items;
}

export async function getDetail(url: string): Promise<AnimeDetail> {
  const $ = await fetchHtml(url);

  const title =
    cleanText($("h1.entry-title, h1.title").text()) ||
    cleanText($("h1").first().text());
  const thumbnail =
    $(".entry-content img, .thumbnail img").attr("src") ||
    $(".entry-content img, .thumbnail img").attr("data-src") ||
    null;
  const synopsis =
    cleanText($(".entry-content p, .sinopsis p").first().text()) || null;

  const genre: string[] = [];
  $(".genre a, .genres a, .tag a").each((_, a) => {
    const g = cleanText($(a).text());
    if (g) genre.push(g);
  });

  let status: string | null = null;
  let episodes: number | null = null;
  let rating: string | null = null;
  let type: string | null = null;
  let studio: string | null = null;

  $(".entry-content table tr, .info tr").each((_, el) => {
    const label = cleanText($(el).find("td").first().text()).toLowerCase();
    const value = cleanText($(el).find("td").last().text());
    if (label.includes("status")) status = value;
    if (label.includes("episode")) episodes = parseInt(value) || null;
    if (label.includes("studio")) studio = value;
    if (label.includes("type") || label.includes("tipe")) type = value;
    if (label.includes("rating") || label.includes("score")) rating = value;
  });

  const episodeList: AnimeEpisodeItem[] = [];
  $(".episodelist li, .eps li").each((_, el) => {
    const epHref = $(el).find("a").attr("href") || "";
    const epTitle = cleanText($(el).find("a").text());
    const epDate = cleanText($(el).find(".date").text()) || null;
    if (epHref) {
      episodeList.push({ episode: epTitle, url: epHref, date: epDate });
    }
  });

  return { title, thumbnail, synopsis, genre, status, episodes, rating, type, studio, episodeList, source: "anoboy" };
}

export async function getEpisode(url: string): Promise<EpisodeDetail> {
  const $ = await fetchHtml(url);

  const title = cleanText($("h1.entry-title, h1.title").text());
  const animeTitle = cleanText($(".breadcrumb a").eq(-2).text()) || null;
  const thumbnail = $(".entry-content img").first().attr("src") || null;

  const streamingLinks: EpisodeLink[] = [];
  $("iframe[src]").each((_, el) => {
    const src = $(el).attr("src") || "";
    if (src && !src.includes("ads")) {
      streamingLinks.push({ label: "Stream", url: src, quality: null, server: null });
    }
  });

  const downloadLinks: EpisodeLink[] = [];
  $(".download a, .dl-link a, .entry-content a[href*='drive'], .entry-content a[href*='mega'], .entry-content a[href*='zippyshare']").each((_, el) => {
    const href = $(el).attr("href") || "";
    const label = cleanText($(el).text());
    if (href && label && !href.includes("javascript")) {
      downloadLinks.push({ label, url: href, quality: null, server: null });
    }
  });

  return { title, animeTitle, episode: null, thumbnail, streamingLinks, downloadLinks, source: "anoboy" };
}
