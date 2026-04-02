import { NextResponse } from "next/server";

export const revalidate = 1800;

type FeedSource = {
  id: string;
  label: string;
  topic: "tech" | "cyber";
  url: string;
};

type FeedEntry = {
  id: string;
  source: string;
  topic: "tech" | "cyber";
  title: string;
  link: string;
  description: string;
  publishedAt: string;
};

const SOURCES: FeedSource[] = [
  {
    id: "techcrunch",
    label: "TechCrunch",
    topic: "tech",
    url: "https://techcrunch.com/feed/",
  },
  {
    id: "theverge",
    label: "The Verge",
    topic: "tech",
    url: "https://www.theverge.com/rss/index.xml",
  },
  {
    id: "hackersnews",
    label: "The Hacker News",
    topic: "cyber",
    url: "https://feeds.feedburner.com/TheHackersNews",
  },
  {
    id: "bleepingcomputer",
    label: "BleepingComputer",
    topic: "cyber",
    url: "https://www.bleepingcomputer.com/feed/",
  },
];

function decodeEntities(input: string): string {
  return input
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&#8217;", "'")
    .replaceAll("&#8211;", "-");
}

function stripTags(input: string): string {
  return decodeEntities(
    input
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1]?.trim() ?? "";
}

function parseFeedItems(source: FeedSource, xml: string): FeedEntry[] {
  const itemBlocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];

  return itemBlocks
    .slice(0, 6)
    .map((item, index) => {
      const title = stripTags(extractTag(item, "title"));
      const link = stripTags(extractTag(item, "link"));
      const description = stripTags(extractTag(item, "description"));
      const pubDate = stripTags(extractTag(item, "pubDate"));

      return {
        id: `${source.id}-${index}-${title.slice(0, 24)}`,
        source: source.label,
        topic: source.topic,
        title,
        link,
        description,
        publishedAt: pubDate,
      } satisfies FeedEntry;
    })
    .filter((entry) => entry.title && entry.link);
}

async function fetchSource(source: FeedSource): Promise<FeedEntry[]> {
  try {
    const response = await fetch(source.url, {
      next: { revalidate },
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PortfolioVeilleBot/1.0)",
      },
    });

    if (!response.ok) {
      return [];
    }

    const xml = await response.text();
    return parseFeedItems(source, xml);
  } catch {
    return [];
  }
}

export async function GET() {
  const results = await Promise.allSettled(SOURCES.map((source) => fetchSource(source)));

  const items = results
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .sort((a, b) => {
      const aDate = Date.parse(a.publishedAt || "");
      const bDate = Date.parse(b.publishedAt || "");
      return (Number.isNaN(bDate) ? 0 : bDate) - (Number.isNaN(aDate) ? 0 : aDate);
    })
    .slice(0, 18);

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    items,
  });
}
