import type { DefaultTheme } from "vitepress";

// llms 插件扫描源 Markdown；Teek 侧边栏使用 rewrites 后的网址，需还原再匹配。
export function sourceSidebar(sidebar: DefaultTheme.Sidebar | undefined, rewrites: Record<string, string>): DefaultTheme.SidebarItem[] {
  const sourceByLink = new Map(Object.entries(rewrites)
    .filter(([source]) => source !== "__create__")
    .map(([source, target]) => [`/${target.replace(/^\/+/, "")}`, `/${source.replace(/^\/+/, "")}`]));
  const restore = (item: DefaultTheme.SidebarItem): DefaultTheme.SidebarItem => ({
    ...item,
    ...(item.link ? { link: sourceByLink.get(decodeURI(item.link)) ?? item.link } : {}),
    ...(item.items ? { items: item.items.map(restore) } : {}),
  });
  const sections = !sidebar ? [] : Array.isArray(sidebar) ? sidebar : Object.values(sidebar).flatMap(value =>
    Array.isArray(value) ? value : value.items
  );
  // 多个路由可共享同一组侧边栏，LLM 目录只需收录一次。
  return [...new Map(sections.map(restore).map(item => [JSON.stringify(item), item])).values()];
}
