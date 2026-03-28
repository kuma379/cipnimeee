import { fetchHtml, cleanText } from "./utils.js";

const BASE_URL = "https://otakudesu.cloud";

export interface AnimeItem {
  title: string;
  url: string;
  thumbnail: string | null;
  episode: string | null;
  genre: string | null;
  source: "otakudesu";
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
  source: "otakudesu";
}

export interface EpisodeDetail {
  title: string;
  animeTitle: string | null;
  episode: string | null;
  thumbnail: string | null;
  streamingLinks: EpisodeLink[];
  downloadLinks: EpisodeLink[];
  source: "otakudesu";
}

export async function getLatest(page = 1): Promise<AnimeItem[]> {
  const url = page > 1 ? `${BASE_URL}/ongoing-anime/page/${page}/` : `${BASE_URL}/ongoing-anime/`;
  const $ = await fetchHtml(url);
  const items: AnimeItem[] = [];

  $(".venz ul li").each((_, el) => {
    const titleEl = $(el).find(".jdlflm");
    const title = cleanText(titleEl.text());
    const href = $(el).find("a").first().attr("href") || "";
    const thumbnail = $(el).find("img").attr("src") || null;
    const episode = cleanText($(el).find(".epz").text()) || null;
    const genres = cleanText($(el).find(".epztipe").text()) || null;

    if (title && href) {
      items.push({
        title,
        url: href,
        thumbnail,
        episode,
        genre: genres,
        source: "otakudesu",
        rating: null,
        status: "Ongoing",
        type: null,
      });
    }
  });

  return items;
}

export async function getPopular(): Promise<AnimeItem[]> {
  const $ = await fetchHtml(`${BASE_URL}/complete-anime/`);
  const items: AnimeItem[] = [];

  $(".venz ul li").each((_, el) => {
    const title = cleanText($(el).find(".jdlflm").text());
    const href = $(el).find("a").first().attr("href") || "";
    const thumbnail = $(el).find("img").attr("src") || null;
    const episode = cleanText($(el).find(".epz").text()) || null;
    const genres = cleanText($(el).find(".epztipe").text()) || null;

    if (title && href) {
      items.push({
        title,
        url: href,
        thumbnail,
        episode,
        genre: genres,
        source: "otakudesu",
        rating: null,
        status: "Complete",
        type: null,
      });
    }
  });

  return items;
}

export async function search(query: string): Promise<AnimeItem[]> {
  const $ = await fetchHtml(`${BASE_URL}/?s=${encodeURIComponent(query)}&post_type=anime`);
  const items: AnimeItem[] = [];

  $(".chivsrc li").each((_, el) => {
    const titleEl = $(el).find("h2 a");
    const title = cleanText(titleEl.text());
    const href = titleEl.attr("href") || "";
    const thumbnail = $(el).find("img").attr("src") || null;
    const genres = cleanText($(el).find(".set b").first().text()) || null;
    const status = cleanText($(el).find(".set").last().find("a").first().text()) || null;

    if (title && href) {
      items.push({
        title,
        url: href,
        thumbnail,
        episode: null,
        genre: genres,
        source: "otakudesu",
        rating: null,
        status,
        type: null,
      });
    }
  });

  return items;
}

export async function getDetail(url: string): Promise<AnimeDetail> {
  const $ = await fetchHtml(url);

  const title = cleanText($(".jdlrx h1").text()) || cleanText($("h1.entry-title").text());
  const thumbnail = $(".fotoanime img").attr("src") || null;
  const synopsis = cleanText($(".sinopc p").first().text()) || null;

  const genre: string[] = [];
  $(".infozingle p").each((_, el) => {
    const label = cleanText($(el).find("b").text()).toLowerCase();
    const value = cleanText($(el).find("span").text());
    if (label.includes("genre")) {
      $(el).find("a").each((_, a) => genre.push(cleanText($(a).text())));
    }
  });

  let status: string | null = null;
  let episodes: number | null = null;
  let rating: string | null = null;
  let type: string | null = null;
  let studio: string | null = null;

  $(".infozingle p").each((_, el) => {
    const label = cleanText($(el).find("b").text()).toLowerCase();
    const value = cleanText($(el).find("span").text());
    if (label.includes("status")) status = value;
    if (label.includes("total episode")) episodes = parseInt(value) || null;
    if (label.includes("skor")) rating = value;
    if (label.includes("tipe")) type = value;
    if (label.includes("studio")) studio = value;
  });

  const episodeList: AnimeEpisodeItem[] = [];
  $(".episodelist ul li").each((_, el) => {
    const epHref = $(el).find("a").attr("href") || "";
    const epTitle = cleanText($(el).find("a").text());
    const epDate = cleanText($(el).find(".zeebr").text()) || null;
    if (epHref) {
      episodeList.push({ episode: epTitle, url: epHref, date: epDate });
    }
  });

  return { title, thumbnail, synopsis, genre, status, episodes, rating, type, studio, episodeList, source: "otakudesu" };
}

export async function getEpisode(url: string): Promise<EpisodeDetail> {
  const $ = await fetchHtml(url);

  const title = cleanText($("h1.entry-title").text());
  const animeTitle = cleanText($(".episodeboxid h2").text()) || null;
  const thumbnail = $(".episodebox img").attr("src") || null;

  const streamingLinks: EpisodeLink[] = [];
  $(".responsive-embed-stream iframe").each((_, el) => {
    const src = $(el).attr("src") || "";
    if (src) {
      streamingLinks.push({ label: "Stream", url: src, quality: null, server: null });
    }
  });

  const downloadLinks: EpisodeLink[] = [];
  $(".download ul li").each((_, el) => {
    const quality = cleanText($(el).find("strong").text()) || null;
    $(el).find("a").each((_, a) => {
      const href = $(a).attr("href") || "";
      const server = cleanText($(a).text());
      if (href) {
        downloadLinks.push({ label: server, url: href, quality, server });
      }
    });
  });

  return { title, animeTitle, episode: null, thumbnail, streamingLinks, downloadLinks, source: "otakudesu" };
}
