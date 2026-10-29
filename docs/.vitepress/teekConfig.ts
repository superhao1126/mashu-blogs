import { defineTeekConfig } from "vitepress-theme-teek/config";
import { version } from "vitepress-theme-teek/es/version";

export const teekConfig = defineTeekConfig({
  teekHome: true, // 是否开启博客首页
  vpHome: false, // 是否隐藏 VP 首页
  sidebarTrigger: true, // 是否开启侧边栏折叠功能
  author: { name: "麻薯 · MaShu", link: "https://github.com/superhao1126" },
  topArticle: { enabled: false },
  windowTransition: { card: false, post: false },
  friendLink: { enabled: false },
  category: { enabled: true, homeTitle: "文章分类", limit: 6, autoPage: false },
  tag: { enabled: true, homeTitle: "常用标签", limit: 6, autoPage: false },
  backTop: {
    enabled: true, // 是否启用返回顶部按钮
    content: "icon", // 回到顶部按钮的显示内容，可选配置 progress | icon
  },
  // 滚动到评论区配置
  toComment: {
    enabled: false, // 是否启动滚动到评论区功能
    done: (TkMessage) => TkMessage.success("滚动到评论区成功"), // 滚动到评论区后的回调
  },
  footerInfo: {
    theme: {
      show: true, // 是否显示主题版权，建议显示
      name: `Theme By Teek@${version}`,
    },
    copyright: {
      show: true, // 是否显示博客版权
      createYear: 2025,
      suffix: "麻薯 · MaShu. 写下来，慢慢积累",
    },
    // ICP 备案信息配置
    // icpRecord: {
    //   name: "赣ICP备2025076242号",
    //   link: "http://beian.miit.gov.cn/",
    // },
  },
  themeEnhance: {
    enabled: false, // 隐藏主题增强面板和右下角主题色切换入口
    position: "top", // 位置，top 为导航栏右侧，bottom 为右下角
    // 布局切换配置
    layoutSwitch: {
      disabled: false, // 禁用布局切换
      defaultMode: "original", // 布局切换的默认模式
      disableHelp: false, // 禁用帮助提示
      disableAnimation: false, // 禁用布局切换动画
      defaultDocMaxWidth: 90, // 内容布局最大宽度的默认百分比，仅限 0-100
      disableDocMaxWidthHelp: false, // 禁用帮助提示
      defaultPageMaxWidth: 95, // 页面布局最大宽度的默认百分比，仅限 0-100
      disablePageMaxWidthHelp: false, // 禁用帮助提示
    },
    // 布局主题色配置
    themeColor: {
      disabled: false, // 禁用布局主题色切换
      defaultColorName: "vp-default", // 布局默认主题色
      defaultSpread: false, // 是否将主题色扩散到其他元素（根据主题色计算其他元素需要的颜色）
      disableHelp: false, // 禁用帮助提示
      disabledInMobile: false, // 是否在移动端禁用
    },
    // 聚光灯配置
    spotlight: {
      disabled: false, // 禁用聚光灯
      defaultStyle: "aside", //  聚光灯默认样式
      disableHelp: false, // 禁用帮助提示
      defaultValue: true, // 聚光灯默认开关状态
    },
  },
  // 公告配置
  notice: {
    enabled: false, // 是否启用公告功能
    title: "公告", // 公告标题，支持函数式：需要和国际化搭配使用，根据不同语言环境返回不同标题
    initOpen: true,
    duration: 5000, // 弹框定时自动关闭，0 不自动消失
    mobileMinify: false, // 移动端自动最小化
    reopen: true,
    useStorage: false, // 是是否使用 localStorage 存储公告状态，如：当打开公告弹框后，下次进来则自动打开弹框
    twinkle: false, // 公告图标是否打开闪烁提示
    position: "top", // 公告弹框出现位置
    // ...
  },
  articleAnalyze: {
    showIcon: true, // 作者、日期、分类、标签、字数、阅读时长、浏览量等文章信息的图标是否显示
    dateFormat: "yyyy-MM-dd",
    showInfo: true, // 是否展示作者、日期、分类、标签、字数、阅读时长、浏览量等文章信息，分别作用于首页和文章页
    showAuthor: false,
    showCreateDate: ["post"],
    showUpdateDate: true, // 是否展示更新日期，仅在文章页显示
    showCategory: true, // 是否展示分类
    showTag: false,
    teleport: { selector: ".vp-doc h1", position: "after", className: "mashu-article-meta" },
  },
  breadcrumb: {
    enabled: true, // 是否启用面包屑
    showCurrentName: false, // 面包屑最后一列是否显示当前文章的文件名
    separator: "/", // 面包屑分隔符
    homeLabel: "首页", // 鼠标悬停首页图标的提示文案
  },
  siteAnalytics: [
    {
      provider: "baidu",
      options: {
        id: "c4b5b5e56d2faf7416454d129fcb70c0",
      },
    },
    { provider: "google", options: { id: "G-C480B0LRMT" } },
  ],
  // 站点信息卡片配置
  docAnalysis: {
    enabled: true, // 首页显示站点信息，包括运行时间和访问统计
    createTime: "2025-11-13", // 站点创建时间
    wordCount: true, // 是否开启文章页的字数统计
    readingTime: true, // 是否开启文章页的阅读时长统计
    // 访问量、访客数统计配置
    statistics: {
      provider: "busuanzi", // 网站流量统计提供商
      siteView: true, // 显示首页访问量和访客数
      pageView: false, // 浏览量交由支持超时和失败隐藏的 ArticleViews 展示
      tryRequest: false, // 如果请求网站流量统计接口失败，是否重试
      tryCount: 5, // 重试次数，仅当 tryRequest 为 true 时有效
      tryIterationTime: 2000, // 重试间隔时间，单位：毫秒，仅当 tryRequest 为 true 时有效
      permalink: true, // 是否只统计永久链接的浏览量，如果为 false，则统计 VitePress 默认的文档目录链接
    },
    // 自定义现有信息
    overrideInfo: [
      {
        key: "lastActiveTime",
        label: "活跃时间",
        value: (_, currentValue) => (currentValue + "").replace("前", ""),
        show: true,
      },
    ],
    // 自定义额外信息
    appendInfo: [{ key: "index", label: "站点作者", value: "MaShu" }],
  },
  social: [
    {
      icon: "mdi:github",
      name: "GitHub",
      link: "https://github.com/superhao1126",
    },
    {
      icon: "mdi:email",
      name: "邮箱",
      link: "mailto:superhao0126@gmail.com",
    },
    {
      icon: "mdi:rss",
      name: "RSS 订阅",
      link: "/rss.xml",
    },
    {
      icon: "mdi:home",
      name: "个人主页",
      link: "/about.html",
    },
  ],
  banner: {
    enabled: false, // 使用首页插槽中的个人介绍和专题入口
    name: "MaShu Blog",
    bgStyle: "pure",
    pureBgColor: "var(--vp-c-bg-alt)",
    textColor: "var(--vp-c-text-1)",
    titleFontSize: "2rem",
    descFontSize: "1rem",
    descStyle: "default",
    description: "记录开发实践，整理技术笔记。",
    imgWaves: false,
  },
  blogger: {
    name: "麻薯 · MaShu",
    slogan: "记录实践，慢慢积累",
    shape: "circle",
    avatar: "/mashu.svg",
    circleSize: 72,
    color: "var(--vp-c-text-1)",
  },
  codeBlock: {
    enabled: true, // 是否启用新版代码块
    copiedDone: (TkMessage) => TkMessage.success("复制成功！"),
  },

  articleShare: {
    enabled: true, // 是否开启文章链接分享功能
    text: "分享此页面", // 分享按钮文本
    copiedText: "链接已复制", // 复制成功文本
    query: false, // 是否包含查询参数
    hash: false, // 是否包含哈希值
  },
  articleTopTip: (frontmatter, localeIndex, page) => {
    // Teek 会序列化配置函数，因此日期判断保持在回调内，不引用外部闭包。
    if (frontmatter.outdated === false) return;
    const timestamps = [frontmatter.reviewedAt, frontmatter.lastUpdated, page.lastUpdated, frontmatter.date]
      .filter(value => typeof value === "string" || typeof value === "number" || value instanceof Date)
      .map(value => new Date(value).getTime())
      .filter(Number.isFinite);
    const needsReview = timestamps.length > 0 && Date.now() - Math.max(...timestamps) > 180 * 24 * 60 * 60 * 1000;
    if (frontmatter.outdated === true || needsReview) return {
      type: "info",
      text: "这篇笔记已超过半年未维护，使用前请核对版本和适用环境。",
    };
  },
  // 在每个文章页顶部显示 VitePress 容器添加提示，使用场景如添加文章版权声明。
  articleBottomTip: (frontmatter) => {
    // canonicalUrl 在构建时注入，服务端与浏览器生成相同的版权信息。
    const url = frontmatter.canonicalUrl;
    const author = "麻薯 · MaShu";

    return {
      type: "tip",
      // title: "声明", // 可选
      text: `作者：${author}<br>
             链接：<a href="${decodeURIComponent(
               url
             )}" target="_blank">${decodeURIComponent(url)}</a><br>
             版权：此文章版权归 ${author} 所有，如有转载，请注明出处!
            `,
    };
  },

  articleUpdate: {
    enabled: false, // 是否启用文章最近更新栏
    limit: 3, // 文章最近更新栏显示数量
  },
  comment: {
    provider: "giscus", // 评论区提供者
    // 评论区配置项，根据 provider 不同而不同，具体看对应官网的使用介绍
    options: {
      // twikoo 配置，官网：https://twikoo.js.org/
      // envId: "your envId",

      // waline 配置，官网：https://waline.js.org/
      // serverURL: "your serverURL",
      // jsLink: "https://unpkg.com/@waline/client@v3/dist/waline.js",
      // cssLink: "https://unpkg.com/@waline/client@v3/dist/waline.css",

      // giscus 配置，官网：https://giscus.app/zh-CN
      repo: "superhao1126/mashu-blogs",
      repoId: "R_kgDOQPk90g",
      category: "Announcements",
      categoryId: "DIC_kwDOQPk90s4Cx7HI",

      // artalk 配置，官网：https://artalk.js.org/
      // server: "your server",
      // site: "site",
    },
  },
  vitePlugins: {
    sidebar: true, // 是否启用 sidebar 插件
    permalink: true, // 是否启用 permalink 插件
    permalinkOption: {}, // permalinks 插件配置项
    mdH1: true, // 是否启用 mdH1 插件
    catalogueOption: {}, // catalogues 插件配置项
    docAnalysis: true, // 是否启用 docAnalysis 插件
    docAnalysisOption: {}, // docAnalysis 插件配置项
    fileContentLoaderIgnore: [], // fileContentLoader 插件扫描 markdown 文档时，指定忽略路径，格式为 glob 表达式，如 **/test/**
    autoFrontmatter: true, // 是否启用 autoFrontmatter 插件
    autoFrontmatterOption: {
      categories: true,
      permalink: false,
    },
    sidebarOption: {
      initItems: false,
      resolveRule: "rewrites",
    },
  },
  // 文章配置
  post: {
    postStyle: "list", // 文章列表风格
    excerptPosition: "top", // 文章摘要位置
    showMore: true, // 是否显示更多按钮
    moreLabel: "阅读全文 >", // 更多按钮文字
    emptyLabel: "暂无文章", // 文章列表为空时的标签
    coverImgMode: "small",
    showCapture: false, // 使用每篇文章单独维护的摘要
    splitSeparator: true, // 文章信息（作者、创建时间、分类、标签等信息）是否添加 | 分隔符
    transition: false, // 是否开启过渡动画
    transitionName: "tk-slide-fade", // 自定义过渡动画名称
    listStyleTitleTagPosition: "right", // 列表模式下的标题标签位置（postStyle 为 list）
    cardStyleTitleTagPosition: "left", // 卡片模式下的标题标签位置（postStyle 为 card）
    defaultCoverImg: [], // 默认封面图地址，如果不设置封面图则使用默认封面图地址
  },
});
