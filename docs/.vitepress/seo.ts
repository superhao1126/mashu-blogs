import type { HeadConfig, PageData } from "vitepress";

export const siteOrigin = "https://blog.rungos.cn";
export const siteName = "麻薯的技术笔记";
export const siteDescription = "麻薯（MaShu）的个人技术与实践笔记，记录软件开发、数据库、服务器、日常工具与持续探索，把解决过的问题整理成可查阅的经验。";
export const shareImage = `${siteOrigin}/og/mashu-card.png`;

export function canonicalPath(page: Pick<PageData, "relativePath" | "frontmatter">) {
  const permalink = page.frontmatter.permalink;
  let path = typeof permalink === "string" ? permalink : page.relativePath.replace(/\.md$/, ".html");
  path = path.split(/[?#]/)[0];
  if (!path || path === "/" || path === "index.html") return "/";
  path = `/${path.replace(/^\/+/, "")}`;
  return path.endsWith(".html") ? path : `${path}.html`;
}

export function pageHead(page: PageData): HeadConfig[] {
  const path = canonicalPath(page);
  if (page.isNotFound || ["/404.html", "/login.html", "/risk-link.html"].includes(path)) {
    return [["meta", { name: "robots", content: "noindex, follow" }]];
  }
  const url = new URL(path, siteOrigin).href;
  const title = page.title && page.title !== siteName ? `${page.title} | ${siteName}` : siteName;
  const description = page.description || siteDescription;
  const article = page.frontmatter.article !== false && !page.frontmatter.layout;
  return [
    ["link", { rel: "canonical", href: url }],
    ["meta", { property: "og:type", content: article ? "article" : "website" }],
    ["meta", { property: "og:url", content: url }],
    ["meta", { property: "og:title", content: title }],
    ["meta", { property: "og:description", content: description }],
    ["meta", { property: "og:image", content: shareImage }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    ["meta", { property: "og:image:alt", content: "麻薯 · MaShu 的个人技术与实践笔记" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:title", content: title }],
    ["meta", { name: "twitter:description", content: description }],
    ["meta", { name: "twitter:image", content: shareImage }],
  ];
}
