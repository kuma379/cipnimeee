import axios from "axios";
import * as cheerio from "cheerio";

export const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function fetchHtml(url: string): Promise<cheerio.CheerioAPI> {
  const response = await axios.get(url, {
    headers: {
      "User-Agent": userAgent,
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      "Accept-Encoding": "gzip, deflate, br",
      Referer: new URL(url).origin + "/",
    },
    timeout: 15000,
  });
  return cheerio.load(response.data);
}

export function cleanText(text: string | undefined): string {
  return (text ?? "").replace(/\s+/g, " ").trim();
}
