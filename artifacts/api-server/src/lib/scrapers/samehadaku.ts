import { fetchHtml, cleanText } from "./utils.js";

const BASE_URL = "https://samehadaku.email";

export interface AnimeItem {
  title: string;
  url: string;
  thumbnail: string | null;
  episode: string | null;
  genre: string | null;
  source: "samehadaku";
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
  source: "samehadaku";
}

export interface EpisodeDetail {
  title: string;
  animeTitle: string | null;
  episode: string | null;
  thumbnail: string | null;
  streamingLinks: EpisodeLink[];
  downloadLinks: EpisodeLink[];
  source: "samehadaku";
}

export async function getLatest(page = 1): Promise<AnimeItem[]> {
  const url = page > 1 ? `${BASE_URL}/page/${page}/` : `${BASE_URL}/`;
  const $ = await fetchHtml(url);
  const items: AnimeItem[] = [];

  $(".lp .lpl li, .listupd article, .animepost").each((_, el) => {
    const titleEl = $(el).find(".tt, h2, .lpl-animeinfo h3");
    const title = cleanText(titleEl.text());
    const href = $(el).find("a").first().attr("href") || "";
    const thumbnail = $(el).find("img").attr("src") || $(el).find("img").attr("data-src") || null;
    const episode = cleanText($(el).find(".ep, .epz, .epx").text()) || null;
    const genres = cleanText($(el).find(".genre, .genr").text()) || null;

    if (title && href) {
      items.push({
        title,
        url: href,
        thumbnail,
        episode,
        genre: genres,
        source: "samehadaku",
        rating: null,
        status: "Ongoing",
        type: null,
      });
    }
  });

  return items;
}

export async function getPopular(): Promise<AnimeItem[]> {
  const $ = await fetchHtml(`${BASE_URL}/anime-list/`);
  const items: AnimeItem[] = [];

  $(".listupd article, .animepost, li").each((_, el) => {
    const titleEl = $(el).find(".tt, h2, a");
    const title = cleanText(titleEl.first().text());
    const href = $(el).find("a").first().attr("href") || "";
    const thumbnail = $(el).find("img").attr("src") || null;
    const status = cleanText($(el).find(".status").text()) || null;

    if (title && href && href.includes(BASE_URL)) {
      items.push({
        title,
        url: href,
        thumbnail,
        episode: null,
        genre: null,
        source: "samehadaku",
        rating: null,
        status,
        type: null,
      });
    }
  });

  return items;
}

export async function search(query: string): Promise<AnimeItem[]> {
  const $ = await fetchHtml(`${BASE_URL}/?s=${encodeURIComponent(query)}`);
  const items: AnimeItem[] = [];

  $(".listupd article, .animepost").each((_, el) => {
    const titleEl = $(el).find(".tt, h2");
    const title = cleanText(titleEl.text());
    const href = $(el).find("a").first().attr("href") || "";
    const thumbnail = $(el).find("img").attr("src") || $(el).find("img").attr("data-src") || null;
    const genres = cleanText($(el).find(".genre").text()) || null;

    if (title && href) {
      items.push({
        title,
        url: href,
        thumbnail,
        episode: null,
        genre: genres,
        source: "samehadaku",
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

  const title = cleanText($("h1.entry-title, .animesc h1").text());
  const thumbnail = $(".thumb img, .infoanime img").attr("src") || null;
  const synopsis = cleanText($(".entry-content p, .sinopsis p").first().text()) || null;

  const genre: string[] = [];
  $(".genre-info a, .spe span a, .genxed a").each((_, a) => {
    const g = cleanText($(a).text());
    if (g) genre.push(g);
  });

  let status: string | null = null;
  let episodes: number | null = null;
  let rating: string | null = null;
  let type: string | null = null;
  let studio: string | null = null;

  $(".spe span, .info-content .sb").each((_, el) => {
    const text = cleanText($(el).text());
    if (text.toLowerCase().includes("status:")) status = text.replace(/status:/i, "").trim();
    if (text.toLowerCase().includes("episode:")) episodes = parseInt(text.replace(/episode:/i, "")) || null;
    if (text.toLowerCase().includes("studio:")) studio = text.replace(/studio:/i, "").trim();
    if (text.toLowerCase().includes("type:") || text.toLowerCase().includes("tipe:")) type = text.replace(/tipe:|type:/i, "").trim();
  });

  const episodeList: AnimeEpisodeItem[] = [];
  $(".episodelist li, #epslist li").each((_, el) => {
    const epHref = $(el).find("a").attr("href") || "";
    const epTitle = cleanText($(el).find("a").text());
    const epDate = cleanText($(el).find(".date").text()) || null;
    if (epHref) {
      episodeList.push({ episode: epTitle, url: epHref, date: epDate });
    }
  });

  return { title, thumbnail, synopsis, genre, status, episodes, rating, type, studio, episodeList, source: "samehadaku" };
}

export async function getEpisode(url: string): Promise<EpisodeDetail> {
  const $ = await fetchHtml(url);

  const title = cleanText($("h1.entry-title").text());
  const animeTitle = cleanText($(".cat-series a").first().text()) || null;
  const thumbnail = $(".thumb img").attr("src") || null;

  const streamingLinks: EpisodeLink[] = [];
  $("iframe[src]").each((_, el) => {
    const src = $(el).attr("src") || "";
    if (src && !src.includes("ads")) {
      streamingLinks.push({ label: "Stream", url: src, quality: null, server: null });
    }
  });

  const downloadLinks: EpisodeLink[] = [];
  $(".download-eps .mirrorlink, .linkdown").each((_, el) => {
    const quality = cleanText($(el).find("strong, .resolution").text()) || null;
    $(el).find("a").each((_, a) => {
      const href = $(a).attr("href") || "";
      const server = cleanText($(a).text());
      if (href && !href.includes("javascript")) {
        downloadLinks.push({ label: server, url: href, quality, server });
      }
    });
  });

  return { title, animeTitle, episode: null, thumbnail, streamingLinks, downloadLinks, source: "samehadaku" };
}
