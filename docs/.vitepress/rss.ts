import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createContentLoader, type SiteConfig, type UserConfig } from "vitepress";
import { canonicalPath, siteDescription, siteName, siteOrigin } from "./seo";

const escapeXml = (value: unknown) => String(value ?? "").replace(/[<>&"']/g, char => ({
  "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;",
})[char]!);

async function renderRss() {
  const pages = await createContentLoader("**/*.md").load();
  const posts = pages.filter(({ frontmatter: fm }) =>
    fm.article !== false && !fm.layout && fm.title && fm.date
  ).map(({ frontmatter: fm, url }) => {
    // 文档中未标注时区的日期按本站时区（北京时间）处理。
    const rawDate = String(fm.date).trim();
    const date = fm.date instanceof Date ? fm.date : new Date(
      /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/.test(rawDate)
        ? `${rawDate.replace(" ", "T")}${rawDate.length === 10 ? "T00:00:00" : ""}+08:00`
        : rawDate
    );
    if (!Number.isFinite(date.getTime())) throw new Error(`RSS 文章日期无效：${fm.title}`);
    const link = new URL(canonicalPath({ relativePath: url.replace(/^\//, "").replace(/\.html$/, ".md"), frontmatter: fm }), siteOrigin).href;
    return { title: fm.title, description: fm.description, date, link };
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

  const items = posts.map(post => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(post.link)}</link>
      <guid isPermaLink="true">${escapeXml(post.link)}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${post.date.toUTCString()}</pubDate>
    </item>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${siteOrigin}/</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>zh-CN</language>
    <atom:link href="${siteOrigin}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

export async function generateRss(config: SiteConfig) {
  await writeFile(join(config.outDir, "rss.xml"), await renderRss(), "utf8");
}

type VitePlugin = Extract<NonNullable<NonNullable<UserConfig["vite"]>["plugins"]>[number], { name: string }>;

export function rssDevPlugin(): VitePlugin {
  return {
    name: "mashu-rss-dev",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.split("?")[0] !== "/rss.xml") return next();
        try {
          const xml = await renderRss();
          res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
          res.end(xml);
        } catch (error) {
          next(error);
        }
      });
    },
  };
}
