<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { usePosts } from "vitepress-theme-teek";
import { topics } from "../data/topics";
import PostList from "./PostList.vue";

const posts = usePosts();
const selectedTopic = ref("all");
const search = ref("");
const allPosts = computed(() => posts.value.sortPostsByDate);
const filteredPosts = computed(() => {
  const topic = topics.find(item => item.id === selectedTopic.value);
  const query = search.value.trim().toLocaleLowerCase();
  return allPosts.value.filter(post => {
    const categories: string[] = post.frontmatter.categories || [];
    const matchesTopic = !topic || categories.some(category => topic.categories.includes(category));
    const text = [post.title, post.frontmatter.description, ...categories, ...(post.frontmatter.tags || [])].join(" ").toLocaleLowerCase();
    return matchesTopic && (!query || text.includes(query));
  });
});

function selectTopic(id: string) {
  if (id === "frontend") id = "development";
  selectedTopic.value = topics.some(topic => topic.id === id) ? id : "all";
}
function changeTopic(id: string) {
  selectTopic(id);
  const url = new URL(window.location.href);
  if (id === "all") url.searchParams.delete("topic");
  else url.searchParams.set("topic", id);
  window.history.replaceState({}, "", url);
}
const syncTopic = () => selectTopic(new URLSearchParams(window.location.search).get("topic") || "all");
onMounted(() => {
  syncTopic();
  window.addEventListener("popstate", syncTopic);
});
onBeforeUnmount(() => window.removeEventListener("popstate", syncTopic));
</script>

<template>
  <section class="mashu-directory" aria-labelledby="directory-title">
    <header class="mashu-directory__header">
      <p class="mashu-eyebrow">麻薯的知识库</p>
      <h1 id="directory-title">文章总览<span class="mashu-hero__dot">。</span></h1>
      <p>从问题出发，按专题积累。这里收录了 {{ allPosts.length }} 篇技术与实践笔记。</p>
    </header>
    <div class="mashu-directory__toolbar">
      <div class="mashu-filters" role="group" aria-label="按专题筛选文章">
        <button :aria-pressed="selectedTopic === 'all'" @click="changeTopic('all')">全部文章</button>
        <button v-for="topic in topics" :key="topic.id" :aria-pressed="selectedTopic === topic.id" @click="changeTopic(topic.id)">{{ topic.title }}</button>
      </div>
      <label class="mashu-directory__search"><span class="visually-hidden">筛选文章</span><input v-model="search" type="search" placeholder="搜索标题、摘要或标签…" /></label>
    </div>
    <p class="mashu-directory__results" role="status">共 {{ filteredPosts.length }} 篇笔记</p>
    <PostList v-if="filteredPosts.length" :posts="filteredPosts" :heading-level="2" />
    <div v-else class="mashu-empty"><h2>还没有找到这篇笔记</h2><p>试试其他关键词，或清除筛选看看全部文章。</p><button class="mashu-button" @click="search = ''; changeTopic('all')">查看全部文章</button></div>
  </section>
</template>
