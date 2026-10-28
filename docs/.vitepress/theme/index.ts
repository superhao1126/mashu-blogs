import Teek from "vitepress-theme-teek";
// import TeekLayoutProvider from "./components/TeekLayoutProvider.vue";
import MyNoticeContent from "./components/MyNoticeContent.vue";
import HomeIntro from "./components/HomeIntro.vue";
import LatestHeading from "./components/LatestHeading.vue";
import PostList from "./components/PostList.vue";
import ArticleViews from "./components/ArticleViews.vue";

// Teek 在线主题包引用（需安装 Teek 在线版本）
import "vitepress-theme-teek/index.css";
import "vitepress-theme-teek/theme-chalk/tk-code-block-mobile.css"; // 移动端代码块样式优化
import "vitepress-theme-teek/theme-chalk/tk-sidebar.css"; // 侧边栏优化
import "vitepress-theme-teek/theme-chalk/tk-nav.css"; // 导航栏优化
import "vitepress-theme-teek/theme-chalk/tk-aside.css"; // 右侧目栏录文字悬停和激活样式
import "vitepress-theme-teek/theme-chalk/tk-table.css"; // 表格样式调整，去掉单元格之间的线条
import "vitepress-theme-teek/theme-chalk/tk-mark.css"; // <mark></mark> 样式
import "vitepress-theme-teek/theme-chalk/tk-blockquote.css"; // > 引用块样式

import "./styles/code-bg.scss";
import "./styles/iframe.scss";
import "./styles/minimal.scss";

import { h } from "vue";
import { nextTick, onMounted, watch } from "vue";
import { useData } from "vitepress";

export default {
  extends: Teek,
  Layout() {
    return h(Teek.Layout, null, {
      "teek-notice-content": () => h(MyNoticeContent),
      "teek-home-before": () => h(HomeIntro),
      "teek-home-post-before": () => h(LatestHeading),
      "teek-home-post": ({ currentPosts }) => h(PostList, { posts: currentPosts }),
      "teek-article-analyze-after": () => h(ArticleViews),
    });
  },
  enhanceApp() {},
  setup() {
    if (typeof window !== "undefined") {
      const { page } = useData();
      const renderMathJax = () => {
        nextTick(() => {
          setTimeout(() => {
            const mathJax = (window as any).MathJax;
            if (typeof mathJax?.typesetPromise === "function") {
              mathJax.typesetPromise().catch((err: any) =>
                console.error("MathJax渲染错误:", err)
              );
            }
          }, 100);
        });
      };

      // 初始渲染
      onMounted(() => {
        renderMathJax();
      });

      // 监听页面变化
      watch(
        () => page.value.relativePath,
        () => {
          renderMathJax();
        },
        { flush: "post" }
      );
    }
  },
};
