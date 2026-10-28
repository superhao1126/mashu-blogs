<script setup lang="ts">
import { withBase } from "vitepress";
import { articleHref, formatPostDate } from "../data/topics";

withDefaults(defineProps<{
  posts: { title?: string; url: string; date?: string; frontmatter: Record<string, any> }[];
  headingLevel?: 2 | 3;
}>(), { headingLevel: 3 });
</script>

<template>
  <div class="mashu-post-list">
    <article v-for="post in posts" :key="post.url" class="mashu-post">
      <div class="mashu-post__meta">
        <a v-if="post.frontmatter.categories?.length" class="mashu-post__category" :href="withBase(`/categories.html?category=${encodeURIComponent(post.frontmatter.categories[0])}`)">{{ post.frontmatter.categories[0] }}</a>
        <time :datetime="formatPostDate(post.date)">{{ formatPostDate(post.date) }}</time>
      </div>
      <component :is="`h${headingLevel}`"><a :href="withBase(articleHref(post))">{{ post.title }}</a></component>
      <p>{{ post.frontmatter.description }}</p>
      <a class="mashu-post__read" :href="withBase(articleHref(post))" :aria-label="`阅读：${post.title}`">阅读文章 <span aria-hidden="true">↗</span></a>
    </article>
  </div>
</template>
