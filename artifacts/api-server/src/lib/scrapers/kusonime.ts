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
  source: "kusonime";
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

export async function getLatest(page = 1): Promise<AnimeItem[]> {
  const url = page > 1 ? `${BASE_URL}/page/${page}/` : `${BASE_URL}/`;
  const $ = await fetchHtml(url);
  const items: AnimeItem[] = [];

  $(".bxflote .mfmg, article.post, .loop-wrap article").each((_, el) => {
    const titleEl = $(el).find("h2 a, .title a, .entry-title a");
    const title = cleanText(titleEl.first().text());
    const href = titleEl.first().attr("href") || "";
    const thumbnail =
      $(el).find("img").attr("data-src") ||
      $(el).find("img").attr("src") ||
      null;
    const episode =
      cleanText($(el).find(".epz, .ep").text()) || null;
    const genres =
      cleanText($(el).find(".genre, .genres").text()) || null;

    if (title && href) {
      items.push({
        title,
        url: href,
        thumbnail,
        episode,
        genre: genres,
        source: "kusonime",
        rating: null,
        status: "Ongoing",
        type: null,
      });
    }
  });

  if (items.length === 0) {
    $("article").each((_, el) => {
      const titleEl = $(el).find("h2 a, h1 a");
      const title = cleanText(titleEl.first().text());
      const href = titleEl.first().attr("href") || "";
      const thumbnail =
        $(el).find("img").attr("data-src") ||
        $(el).find("img").attr("src") ||
        null;
      if (title && href) {
        items.push({
          title,
          url: href,
          thumbnail,
          episode: null,
          genre: null,
          source: "kusonime",
          rating: null,
          status: null,
          type: null,
        });
      }
    });
  }

  return items;
}

export async function getPopular(): Promise<AnimeItem[]> {
  const $ = await fetchHtml(`${BASE_URL}/?s=&post_type=post`);
  const items: AnimeItem[] = [];

  $("article").each((_, el) => {
    const titleEl = $(el).find("h2 a, .entry-title a");
    const title = cleanText(titleEl.first().text());
    const href = titleEl.first().attr("href") || "";
    const thumbnail =
      $(el).find("img").attr("data-src") ||
      $(el).find("img").attr("src") ||
      null;

    if (title && href) {
      items.push({
        title,
        url: href,
        thumbnail,
        episode: null,
        genre: null,
        source: "kusonime",
        rating: null,
        status: null,
        type: null,
      });
    }
  });

  return items;
}

export async function search(query: string): Promise<AnimeItem[]> {
  const $ = await fetchHtml(`${BASE_URL}/?s=${encodeURIComponent(query)}`);
  const items: AnimeItem[] = [];

  $("article").each((_, el) => {
    const titleEl = $(el).find("h2 a, .entry-title a");
    const title = cleanText(titleEl.first().text());
    const href = titleEl.first().attr("href") || "";
    const thumbnail =
      $(el).find("img").attr("data-src") ||
      $(el).find("img").attr("src") ||
      null;
    const genres = cleanText($(el).find(".genre, .genres, .tag").text()) || null;

    if (title && href) {
      items.push({
        title,
        url: href,
        thumbnail,
        episode: null,
        genre: genres,
        source: "kusonime",
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
    cleanText($(".entry-title, h1.title").text()) ||
    cleanText($("h1").first().text());
  const thumbnail =
    $(".entry-thumb img, .thumb img").attr("src") ||
    $(".entry-thumb img, .thumb img").attr("data-src") ||
    null;
  const synopsis =
    cleanText($(".entry-content p, .sinopsis p").first().text()) || null;

  const genre: string[] = [];
  $(".genre a, .genres a, .tag-links a").each((_, a) => {
    const g = cleanText($(a).text());
    if (g) genre.push(g);
  });

  let status: string | null = null;
  let episodes: number | null = null;
  let rating: string | null = null;
  let type: string | null = null;
  let studio: string | null = null;

  $(".info-content .sb, .data span, .info-table tr").each((_, el) => {
    const text = cleanText($(el).text());
    if (text.toLowerCase().includes("status")) status = $(el).find("td, span").last().text().trim() || null;
    if (text.toLowerCase().includes("episode")) episodes = parseInt($(el).find("td, span").last().text()) || null;
    if (text.toLowerCase().includes("studio")) studio = $(el).find("td, span, a").last().text().trim() || null;
    if (text.toLowerCase().includes("tipe") || text.toLowerCase().includes("type")) type = $(el).find("td, span").last().text().trim() || null;
  });

  const episodeList: AnimeEpisodeItem[] = [];
  $(".episodelist li, .eps-list li, #eps-list li").each((_, el) => {
    const epHref = $(el).find("a").attr("href") || "";
    const epTitle = cleanText($(el).find("a").text());
    const epDate = cleanText($(el).find(".date").text()) || null;
    if (epHref) {
      episodeList.push({ episode: epTitle, url: epHref, date: epDate });
    }
  });

  return { title, thumbnail, synopsis, genre, status, episodes, rating, type, studio, episodeList, source: "kusonime" };
}

export async function getEpisode(url: string): Promise<EpisodeDetail> {
  const $ = await fetchHtml(url);

  const title = cleanText($("h1.entry-title, h1.title").text());
  const animeTitle = cleanText($(".breadcrumb a").eq(-2).text()) || null;
  const thumbnail = $(".entry-thumb img, .thumb img").attr("src") || null;

  const streamingLinks: EpisodeLink[] = [];
  $("iframe[src]").each((_, el) => {
    const src = $(el).attr("src") || "";
    if (src && !src.includes("ads")) {
      streamingLinks.push({ label: "Stream", url: src, quality: null, server: null });
    }
  });

  const downloadLinks: EpisodeLink[] = [];
  $(".download-eps .mirrorlink, .dlb a, .download-link a").each((_, el) => {
    const href = $(el).attr("href") || "";
    const label = cleanText($(el).text());
    const quality = cleanText($(el).closest(".quality").find(".res").text()) || null;
    if (href && !href.includes("javascript")) {
      downloadLinks.push({ label, url: href, quality, server: label });
    }
  });

  return { title, animeTitle, episode: null, thumbnail, streamingLinks, downloadLinks, source: "kusonime" };
}
