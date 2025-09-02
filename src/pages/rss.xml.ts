import rss from "@astrojs/rss";
import * as cheerio from "cheerio";

type Image = {
  path: string;
  alt: string | null;
  width: number;
  height: number;
  focus: string;
};

type NewsItem = {
  title: string;
  site: string;
  slug: string;
  excerpt: string;
  image: Image;
  collection: string;
  game_system: {
    light: Image;
    dark: Image;
  };
  topics: { title: string; slug: string }[];
  date: string;
  hide_date: boolean;
  hide_read_time: boolean;
  interaction_time: string;
  uri: string;
  id: string;
  uuid: string;
};

type ResponseData = {
  news: NewsItem[];
  paginate: {
    total_items: number;
    items_per_page: number;
    total_pages: number;
    current_page: number;
  };
};

const baseUrl = "https://www.warhammer-community.com";

const body = {
  sortBy: "date_desc",
  category: "",
  collections: ["articles"],
  game_systems: [],
  index: "news",
  locale: "en-gb",
  page: 0,
  perPage: 25,
  topics: [],
};

export async function GET(context: { site: { origin: string } }) {
  try {
    const response = await fetch(`${baseUrl}/api/search/news/`, {
      body: JSON.stringify(body),
      method: "POST",
    });
    const data = (await response.json()) as ResponseData;

    if (data && data.news && data.news.length > 0) {
      const items = data.news.map(async (item) => {
        const title = item.title || "No title";
        const linkUrl = item.uri ? `${baseUrl}/en-gb/${item.uri}` : undefined;
        const link = linkUrl || `${baseUrl}/en-gb/all-news-and-features/`;

        let fullContent = "";

        if (linkUrl) {
          const response = await fetch(linkUrl);
          const html = await response.text();
          const $ = cheerio.load(html);

          fullContent = $(".article-content").text();
        }

        return {
          title,
          description: item.excerpt || "No description",
          link,
          pubDate: new Date(item.date) || new Date("1970-01-01"),
          content: fullContent || item.excerpt || "No content",
          categories: item.topics.map((topic) => topic.title) || [],
          source: { title, url: link },
        };
      });

      return rss({
        title: "Warhammer RSS",
        description: "RSS feed for Warhammer news",
        site: context.site as any,
        items: await Promise.all(items),
        customData: `<language>en-gb</language>`,
        stylesheet: `${context.site.origin}/public/styles.xsl`,
      });
    }

    return new Response("No data found", { status: 404 });
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return new Response("Error generating RSS feed", { status: 500 });
  }
}
