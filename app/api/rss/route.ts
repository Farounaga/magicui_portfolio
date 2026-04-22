import { NextResponse } from "next/server";

export const revalidate = 1800;

type FeedLanguage = "en" | "fr" | "ru";

type FeedSource = {
  id: string;
  label: string;
  topic: "tech" | "cyber";
  language: FeedLanguage;
  url: string;
};

type FeedEntry = {
  id: string;
  sourceId: string;
  source: string;
  topic: "tech" | "cyber";
  language: FeedLanguage;
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
    language: "en",
    url: "https://techcrunch.com/feed/",
  },
  {
    id: "theverge",
    label: "The Verge",
    topic: "tech",
    language: "en",
    url: "https://www.theverge.com/rss/index.xml",
  },
  {
    id: "arstechnica",
    label: "Ars Technica",
    topic: "tech",
    language: "en",
    url: "https://feeds.arstechnica.com/arstechnica/index",
  },
  {
    id: "engadget",
    label: "Engadget",
    topic: "tech",
    language: "en",
    url: "https://www.engadget.com/rss.xml",
  },
  {
    id: "hackersnews",
    label: "The Hacker News",
    topic: "cyber",
    language: "en",
    url: "https://feeds.feedburner.com/TheHackersNews",
  },
  {
    id: "bleepingcomputer",
    label: "BleepingComputer",
    topic: "cyber",
    language: "en",
    url: "https://www.bleepingcomputer.com/feed/",
  },
  {
    id: "krebsonsecurity",
    label: "KrebsOnSecurity",
    topic: "cyber",
    language: "en",
    url: "https://krebsonsecurity.com/feed/",
  },
  {
    id: "zdnetfr",
    label: "ZDNet France",
    topic: "tech",
    language: "fr",
    url: "https://www.zdnet.fr/feeds/rss/actualites/",
  },
  {
    id: "frandroid",
    label: "Frandroid",
    topic: "tech",
    language: "fr",
    url: "https://www.frandroid.com/feed",
  },
  {
    id: "journaldugeek",
    label: "Journal du Geek",
    topic: "tech",
    language: "fr",
    url: "https://www.journaldugeek.com/feed/",
  },
  {
    id: "zero1net",
    label: "01net",
    topic: "tech",
    language: "fr",
    url: "https://www.01net.com/rss/actualites/",
  },
  {
    id: "certfr",
    label: "CERT-FR",
    topic: "cyber",
    language: "fr",
    url: "https://www.cert.ssi.gouv.fr/feed/",
  },
  {
    id: "lmi-securite",
    label: "Le Monde Informatique (Sécu)",
    topic: "cyber",
    language: "fr",
    url: "https://www.lemondeinformatique.fr/flux-rss/thematique/securite/rss.xml",
  },
  {
    id: "habr",
    label: "Habr",
    topic: "tech",
    language: "ru",
    url: "https://habr.com/ru/rss/hubs/all/",
  },
  {
    id: "xakep",
    label: "Xakep",
    topic: "cyber",
    language: "ru",
    url: "https://xakep.ru/feed/",
  },
  {
    id: "vcru",
    label: "VC.ru",
    topic: "tech",
    language: "ru",
    url: "https://vc.ru/rss/all",
  },
  {
    id: "3dnews",
    label: "3DNews",
    topic: "tech",
    language: "ru",
    url: "https://www.3dnews.ru/news/rss/",
  },
];

const SUPPORTED_LANGUAGES: FeedLanguage[] = ["en", "fr", "ru"];
const SOURCE_IDS = new Set(SOURCES.map((source) => source.id));

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
      const pubDate = stripTags(extractTag(item, "pubDate") || extractTag(item, "dc:date"));

      return {
        id: `${source.id}-${index}-${title.slice(0, 24)}`,
        sourceId: source.id,
        source: source.label,
        topic: source.topic,
        language: source.language,
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

function parseLanguages(rawLang: string | null): FeedLanguage[] {
  if (!rawLang || rawLang === "all") {
    return SUPPORTED_LANGUAGES;
  }

  const parts = rawLang
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);

  const set = new Set<FeedLanguage>();
  for (const part of parts) {
    if (SUPPORTED_LANGUAGES.includes(part as FeedLanguage)) {
      set.add(part as FeedLanguage);
    }
  }

  return set.size > 0 ? Array.from(set) : SUPPORTED_LANGUAGES;
}

function parseSourceIds(rawSource: string | null): Set<string> | null {
  if (!rawSource || rawSource === "all") {
    return null;
  }

  const parts = rawSource
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const selected = new Set<string>();
  for (const id of parts) {
    if (SOURCE_IDS.has(id)) {
      selected.add(id);
    }
  }

  return selected.size > 0 ? selected : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const languages = parseLanguages(searchParams.get("lang"));
  const selectedSourceIds = parseSourceIds(searchParams.get("source"));
  const allowedLanguages = new Set<FeedLanguage>(languages);
  const scopedSources = SOURCES.filter((source) => {
    if (!allowedLanguages.has(source.language)) {
      return false;
    }
    if (!selectedSourceIds) {
      return true;
    }
    return selectedSourceIds.has(source.id);
  });

  const results = await Promise.allSettled(scopedSources.map((source) => fetchSource(source)));

  const items = results
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .sort((a, b) => {
      const aDate = Date.parse(a.publishedAt || "");
      const bDate = Date.parse(b.publishedAt || "");
      return (Number.isNaN(bDate) ? 0 : bDate) - (Number.isNaN(aDate) ? 0 : aDate);
    })
    .slice(0, 36);

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    languages,
    sources: scopedSources.map((source) => ({
      id: source.id,
      label: source.label,
      topic: source.topic,
      language: source.language,
    })),
    items,
  });
}
