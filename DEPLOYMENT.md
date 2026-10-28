# 构建与部署

本项目统一使用 Node.js 24 和 pnpm 12.10.1。Node 主版本在 `.node-version` 和 `package.json#engines` 中声明，pnpm 的确切版本由 `packageManager` 固定。

## 本地开发

```bash
fnm use
corepack pnpm install --frozen-lockfile
corepack pnpm docs:dev
```

生产验证：

```bash
corepack pnpm docs:typecheck
corepack pnpm docs:build
corepack pnpm docs:check
corepack pnpm docs:preview
```

`docs:typecheck` 严格检查全部配置、主题 TS、Vue 组件和构建脚本；`docs:check` 核对生成页面、canonical、sitemap、robots、分享图以及旧地址跳转。

## Vercel

根目录使用仓库根目录，Node.js 使用 24.x。仓库的 `vercel.json` 明确声明 VitePress、输出目录和构建命令，安装和构建均调用固定版本的 pnpm，无需依赖 Vercel 自动选择 pnpm 的版本。

永久链接通过 VitePress rewrites 在构建时生成静态 HTML。`vercel.json` 中的永久跳转保留旧的文件路径，避免历史链接失效。新增或变更文章永久链接后，应同步检查相应跳转和 `docs:check` 的结果。

生产域名统一为 `https://www.rungos.cn`，共享配置位于 `docs/.vitepress/seo.ts`。修改域名时同步更新 `docs/public/robots.txt` 的 Sitemap 地址。分享图源文件和发布图片分别为 `docs/public/og/mashu-card.svg` 和 `mashu-card.png`。

仓库变更需提交并推送后，Vercel 才会应用新配置。域名 DNS 仍由域名服务商管理。

## 搜索与 AI 检索

`robots.txt` 允许通用搜索爬虫及 OAI-SearchBot 抓取公开页面。上线后，应在 Google Search Console 和 Bing Webmaster Tools 验证域名并提交 `https://www.rungos.cn/sitemap.xml`，再用 URL 检查确认重点文章可被索引。Vercel 的访问保护、防火墙或验证码也不能拦住公开文章的爬虫请求。

构建会输出带正式域名的 `llms.txt`、`llms-full.txt` 和各文章 Markdown 文本，供支持这些入口的工具读取。它们是辅助材料，不保证搜索收录或 AI 引用。优先持续维护原创问题解法、适用版本、可复现步骤及参考来源。
