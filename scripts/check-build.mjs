import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "docs/.vitepress/dist");
const origin = "https://blog.rungos.cn";
const excluded = new Set(["/404.html", "/login.html", "/risk-link.html"]);
/** @param {string} path */
const read = path => readFileSync(resolve(root, path), "utf8");
const pkg = JSON.parse(read("package.json"));
/** @type {{ installCommand: string, buildCommand: string, outputDirectory: string, redirects: { source: string, destination: string, permanent: boolean }[] }} */
const vercel = JSON.parse(read("vercel.json"));
const pnpmVersion = pkg.packageManager.match(/^pnpm@([^+]+)/)?.[1];
assert(pnpmVersion, "缺少固定的 pnpm 版本");
assert.equal(pkg.engines.node, "24.x");
assert.equal(read(".node-version").trim(), "24");
assert.equal(process.versions.node.split(".")[0], "24", "请使用 Node.js 24 运行检查");
assert(vercel.installCommand.includes(`pnpm@${pnpmVersion} install --frozen-lockfile`));
assert(vercel.buildCommand.includes(`pnpm@${pnpmVersion} run docs:build`));
assert.equal(vercel.outputDirectory, "docs/.vitepress/dist");

const redirects = new Map(vercel.redirects.map(rule => [rule.source, rule.destination]));
for (const rule of vercel.redirects) {
  assert(rule.permanent, `旧地址需要永久跳转：${rule.source}`);
  assert.notEqual(rule.source, rule.destination);
  assert(existsSync(resolve(out, `.${rule.destination}`)), `跳转目标不存在：${rule.destination}`);
}

/** @param {string} tag */
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(match => [match[1], match[2]]));
}
/**
 * @param {string} html
 * @param {string} name
 */
function meta(html, name) {
  return [...html.matchAll(/<meta\b[^>]*>/g)].map(match => attributes(match[0]))
    .filter(item => item.name === name || item.property === name).map(item => item.content);
}
/** @param {string} html */
function canonical(html) {
  return [...html.matchAll(/<link\b[^>]*>/g)].map(match => attributes(match[0]))
    .filter(item => item.rel === "canonical").map(item => item.href);
}

const pages = readdirSync(out, { recursive: true, encoding: "utf8" }).filter(path => path.endsWith(".html"));
assert(pages.length > 0, "请先运行 docs:build");
assert(read("docs/.vitepress/dist/index.html").includes('<article class="mashu-post">'), "首页文章列表未静态渲染");
assert(read("docs/.vitepress/dist/frontend/virtual-list.html").includes("版权：此文章版权归"), "文章版权信息未静态渲染");
for (const name of pages) {
  const path = `/${name.replaceAll("\\", "/")}`;
  const html = readFileSync(resolve(out, name), "utf8");
  if (excluded.has(path)) {
    assert(meta(html, "robots").some(value => value.includes("noindex")), `辅助页面未设置 noindex：${path}`);
    assert.equal(canonical(html).length, 0, `辅助页面不应声明 canonical：${path}`);
    continue;
  }
  const url = new URL(path === "/index.html" ? "/" : path, origin).href;
  assert.deepEqual(canonical(html), [url], `canonical 不一致或重复：${path}`);
  assert.deepEqual(meta(html, "og:url"), [url]);
  for (const key of ["og:title", "og:description", "og:image", "twitter:card", "twitter:image"]) {
    assert.equal(meta(html, key).length, 1, `${key} 缺失或重复：${path}`);
  }
  assert.equal(meta(html, "og:image")[0], `${origin}/og/mashu-card.png`);
  for (const match of html.matchAll(/\bhref="([^"]+)"/g)) {
    const href = match[1].replaceAll("&amp;", "&");
    if (!href || href.startsWith("#") || /^(?:[a-z][\w+.-]*:|\/\/)/i.test(href)) continue;
    const target = decodeURIComponent(new URL(href, `${origin}${path}`).pathname);
    if (redirects.has(target)) continue;
    const file = resolve(out, `.${target === "/" ? "/index.html" : target}`);
    // 预览服务和 Vercel 均支持将无扩展名的地址解析到同名 HTML。
    assert(file.startsWith(`${out}/`) && (existsSync(file) || existsSync(`${file}.html`)), `站内链接目标不存在：${path} → ${href}`);
  }
}

const sitemap = read("docs/.vitepress/dist/sitemap.xml");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert(urls.length > 0);
assert.equal(new Set(urls).size, urls.length, "sitemap 中有重复链接");
for (const url of urls) {
  const target = new URL(url);
  assert.equal(target.origin, origin);
  const path = decodeURIComponent(target.pathname);
  assert(!excluded.has(path), `sitemap 不应包含辅助页面：${path}`);
  const file = resolve(out, `.${path === "/" ? "/index.html" : path}`);
  assert(existsSync(file), `sitemap 指向不存在的页面：${url}`);
  assert.deepEqual(canonical(readFileSync(file, "utf8")), [target.href]);
}
assert(read("docs/.vitepress/dist/robots.txt").includes(`Sitemap: ${origin}/sitemap.xml`));
const llms = read("docs/.vitepress/dist/llms.txt");
const llmLinks = [...llms.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map(match => new URL(match[1]));
assert(llmLinks.length > 0, "llms.txt 缺少正式域名的内容链接");
assert(!llms.includes("loginPage") && !llms.includes("riskLinkPage"), "llms.txt 不应包含辅助页面");
for (const url of llmLinks) {
  assert.equal(url.origin, origin);
  assert(existsSync(resolve(out, `.${decodeURIComponent(url.pathname)}`)), `LLM 文本链接不存在：${url.href}`);
}
const png = readFileSync(resolve(out, "og/mashu-card.png"));
assert.equal(png.readUInt32BE(16), 1200);
assert.equal(png.readUInt32BE(20), 630);
console.log(`检查通过：${pages.length} 个静态页面、${urls.length} 个 sitemap 链接、${redirects.size} 条兼容跳转，以及构建版本和分享图。`);
