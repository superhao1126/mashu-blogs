<script setup lang="ts">
import { withBase } from "vitepress";
import { usePageState, usePosts } from "vitepress-theme-teek";
const { isHomePage } = usePageState();
const posts = usePosts();
</script>

<template>
  <div v-if="isHomePage" class="mashu-section-heading mashu-latest-heading">
    <h2>最新笔记 <span class="mashu-count">{{ posts.originPosts.length }}</span></h2>
    <a :href="withBase('/articleOverview.html')">全部文章 <span aria-hidden="true">↗</span></a>
  </div>
</template>
