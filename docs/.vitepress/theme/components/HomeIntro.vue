<script setup lang="ts">
import { computed } from "vue";
import { withBase } from "vitepress";
import { usePageState, usePosts } from "vitepress-theme-teek";
import { topics } from "../data/topics";

const { isHomePage } = usePageState();
const posts = usePosts();
const articleCount = computed(() => posts.value.originPosts.length);
const countTopic = (categories: string[]) => posts.value.originPosts.filter(
  post => post.frontmatter.categories?.some((category: string) => categories.includes(category))
).length;
</script>

<template>
  <div v-if="isHomePage" class="mashu-home-intro">
    <section class="mashu-hero" aria-labelledby="home-title">
      <div class="mashu-hero__copy">
        <p class="mashu-eyebrow"><span aria-hidden="true"></span> 麻薯 · MaShu</p>
        <h1 id="home-title">麻薯的技术笔记<span class="mashu-hero__dot"></span></h1>
        <p class="mashu-hero__description">把解决过的问题，整理成下次用得上的笔记<br />记录软件开发、工程实践与日常探索</p>
        <div class="mashu-hero__actions">
          <a class="mashu-button mashu-button--primary" :href="withBase('/articleOverview.html')">浏览全部文章 <span aria-hidden="true">↗</span></a>
          <a class="mashu-button" href="#topics">查看专题 <span aria-hidden="true">↓</span></a>
        </div>
      </div>
      <div class="mashu-hero__note" aria-hidden="true">
        <div class="mashu-note__top"><span>一份持续更新的技术手记</span><span>✳</span></div>
        <img :src="withBase('/mashu.svg')" alt="" width="64" height="64" />
        <p>写下来<br />下次就有答案</p>
        <div class="mashu-note__bottom"><span>{{ articleCount }} 篇笔记</span><span>持续积累中 ↗</span></div>
      </div>
    </section>
    <section id="topics" class="mashu-topics" aria-labelledby="topics-title">
      <div class="mashu-section-heading">
        <h2 id="topics-title">按专题探索</h2>
        <span>从一个问题，找到一组答案</span>
      </div>
      <div class="mashu-topic-grid">
        <a v-for="topic in topics" :key="topic.id" class="mashu-topic" :href="withBase(`/articleOverview.html?topic=${topic.id}`)">
          <span class="mashu-topic__mark" aria-hidden="true">{{ topic.mark }}</span>
          <div><h3>{{ topic.title }}</h3><p>{{ topic.caption }}</p></div>
          <span class="mashu-topic__count">{{ countTopic(topic.categories) }} 篇 <span aria-hidden="true">↗</span></span>
        </a>
      </div>
    </section>
  </div>
</template>
