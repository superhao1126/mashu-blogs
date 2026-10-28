export const topics = [
  {
    id: "development",
    title: "软件与应用开发",
    caption: "从代码到可用的应用",
    categories: ["前端开发", "后端开发", "移动开发", "移动端开发", "全栈开发", "Android", "iOS", "项目实践"],
    mark: "</>",
  },
  {
    id: "deployment",
    title: "数据库与基础设施",
    caption: "让数据和服务稳定运行",
    categories: ["Docker", "Nginx", "Redis", "数据库", "MySQL", "PostgreSQL", "Linux", "服务器", "部署"],
    mark: ">_",
  },
  {
    id: "tooling",
    title: "开发环境与工具",
    caption: "让日常开发更顺手",
    categories: ["Java", "Python"],
    mark: "{ }",
  },
];

// 保留内容中的日期，避免浏览器时区改变纯日期文章的显示。
export const formatPostDate = (date?: string) => date?.slice(0, 10) || "";

export const articleHref = (post: { url: string; frontmatter: Record<string, any> }) => {
  // 与 Teek 一致：链接指向实际构建文件，由主题在导航时保留永久链接。
  const path = post.url || post.frontmatter.permalink;
  return /\.html$/.test(path) ? path : `${path}.html`;
};
