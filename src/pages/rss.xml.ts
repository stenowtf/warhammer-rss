import rss from "@astrojs/rss";

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

const body = {
  sortBy: "date_desc",
  category: "",
  collections: ["articles"],
  game_systems: [],
  index: "news",
  locale: "en-gb",
  page: 0,
  perPage: 100,
  topics: [],
};

export async function GET(context: { site: string }) {
  try {
    const response = await fetch(
      "https://www.warhammer-community.com/api/search/news/",
      { body: JSON.stringify(body), method: "POST" }
    );
    const data = (await response.json()) as ResponseData;

    if (data && data.news && data.news.length > 0) {
      const items = data.news.map((item) => ({
        title: item.title,
        description: item.excerpt,
        link: `https://www.warhammer-community.com/en-gb/${item.uri}`,
        pubDate: new Date(item.date),
        content: item.excerpt, // fetch the full content
      }));

      return rss({
        title: "Warhammer RSS",
        description: "RSS feed for Warhammer news",
        site: context.site,
        items,
        customData: `<language>en-gb</language>`,
      });
    }

    return new Response("No data found", { status: 404 });
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return new Response("Error generating RSS feed", { status: 500 });
  }
}
