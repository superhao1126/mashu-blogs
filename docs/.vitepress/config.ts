import { defineConfig } from "vitepress";
import llmstxt from "vitepress-plugin-llms";
import { teekConfig } from "./teekConfig";

const description = "麻薯（MaShu）的个人技术与实践笔记，记录软件开发、数据库、服务器、日常工具与持续探索，把解决过的问题整理成可查阅的经验。";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  extends: teekConfig,
  title: "麻薯的技术笔记",
  description: description,
  cleanUrls: false,
  lastUpdated: true,
  lang: "zh-CN",
  head: [
    [
      "link",
      { rel: "icon", type: "image/svg+xml", href: "/mashu.svg" },
    ],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:locale", content: "zh-CN" }],
    ["meta", { property: "og:title", content: "麻薯的技术笔记 · MaShu" }],
    ["meta", { property: "og:site_name", content: "麻薯的技术笔记" }],
    ["meta", { property: "og:description", content: description }],
    ["meta", { name: "author", content: "麻薯 · MaShu" }],
    // 禁止浏览器缩放
    // [
    //   "meta",
    //   {
    //     name: "viewport",
    //     content: "width=device-width,initial-scale=1,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no",
    //   },
    // ],
    ["meta", { name: "keywords", content: "麻薯,MaShu,技术笔记,软件开发,工程实践,数据库,服务器,开发工具" }],
    // MathJax 配置脚本
    [
      "script",
      { type: "text/javascript" },
      `
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$']],
          displayMath: [['$$', '$$']],
          processEscapes: true
        }
      };
      `,
    ],
    // 加载 MathJax 库
    [
      "script",
      {
        id: "MathJax-script",
        src: "https://cdn.jsdelivr.net/npm/mathjax@4/tex-mml-chtml.js",
      },
    ],
  ],
  markdown: {
    codeCopyButtonTitle: "复制代码",
    // 开启行号
    lineNumbers: true,
    image: {
      // 默认禁用；设置为 true 可为所有图片启用懒加载。
      lazyLoading: true,
    },
    // 更改容器默认值标题
    container: {
      tipLabel: "提示",
      warningLabel: "警告",
      dangerLabel: "危险",
      infoLabel: "信息",
      detailsLabel: "详细信息",
    },
  },
  sitemap: {
    hostname: "https://www.idoit.icu", // ** 换成你的域名
    transformItems: (items) => {
      // 插件映射的键为不含扩展名的源路径，sitemap 则使用 .html 路径。
      const permalinks = (globalThis as any).VITEPRESS_CONFIG.site.themeConfig
        .permalinks;
      return items.map((item) => {
        const sourcePath = decodeURI(item.url).replace(/^\//, "").replace(/\.html$/, "");
        const permalink = permalinks?.map[sourcePath];
        return permalink ? { ...item, url: permalink.replace(/^\//, "") } : item;
      });
    },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/mashu.svg",
    siteTitle: "麻薯 · MaShu",
    darkModeSwitchTitle: "切换深色模式",
    lightModeSwitchTitle: "切换浅色模式",
    darkModeSwitchLabel: "主题",
    sidebarMenuLabel: "菜单",
    returnToTopLabel: "返回顶部",
    lastUpdatedText: "上次更新时间",
    outline: {
      level: 2,
      label: "本页导航",
    },
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    nav: [
      { text: "首页", link: "/" },
      {
        text: "文章",
        link: "/articleOverview",
        activeMatch: "/articleOverview|/frontend/|/02\\.|/nginx/|/docker/|/pages/",
      },
      { text: "分类", link: "/categories" },
      { text: "关于", link: "/about" },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/superhao1126",
      },
    ],
    search: {
      provider: "local",
      options: {
        detailedView: false,
        translations: {
          button: { buttonText: "搜索", buttonAriaLabel: "搜索笔记" },
          modal: {
            displayDetails: "显示详细内容",
            resetButtonTitle: "清除搜索",
            backButtonTitle: "返回",
            noResultsText: "没有找到相关笔记，试试其他关键词。",
            footer: { selectText: "选择", selectKeyAriaLabel: "回车键", navigateText: "切换", navigateUpKeyAriaLabel: "向上", navigateDownKeyAriaLabel: "向下", closeText: "关闭", closeKeyAriaLabel: "Esc 键" },
          },
        },
        miniSearch: {
          // 整篇正文进入同一条索引，避免每个章节重复列出同一篇文章。
          _splitIntoSections: (_path, html) => {
            const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
            if (!heading) return [];
            const title = heading
              .replace(/<a\b[^>]*class=["']header-anchor["'][^>]*>[\s\S]*?<\/a>/gi, "")
              .replace(/<[^>]+>/g, "")
              .trim();
            if (!title) return [];
            const text = html
              .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim();
            return [{ titles: [title], text }];
          },
          options: {
            tokenize: (text) => Array.from(
              new Intl.Segmenter("zh-CN", { granularity: "word" }).segment(text),
              item => item.segment
            ).filter(term => /[\p{L}\p{N}]/u.test(term)),
          },
          searchOptions: { prefix: true, fuzzy: 0.15 },
        },
      },
    },
    editLink: {
      text: "在 GitHub 上编辑此页",
      pattern:
        "https://github.com/superhao1126/mashu-blogs/edit/main/docs/:path",
    },
  },
  vite: {
    // 该插件的开发中间件会重复调用 next，保留构建产物生成即可。
    plugins: llmstxt().map((plugin) => ({ ...plugin, apply: "build" as const })),
  },
  // transformHtml: (code, id, context) => {
  //   if (context.page !== "404.md") return code;
  //   return code.replace("404 | ", "");
  // },
});
