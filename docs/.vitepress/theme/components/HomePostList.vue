<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useData } from "vitepress";
import { usePosts, useTeekConfig } from "vitepress-theme-teek";
import PostList from "./PostList.vue";

const props = defineProps<{ posts: any[] }>();
const { frontmatter } = useData();
const posts = usePosts();
const { getTeekConfigRef } = useTeekConfig();
const pageConfig = getTeekConfigRef("page", {});
const mounted = ref(false);
onMounted(() => { mounted.value = true; });

// Teek 的 currentPosts 仅在浏览器初始化；首屏使用同一份静态数据完成 SSR 和 hydration。
const initialPosts = computed(() => posts.value.sortPostsByDateAndSticky.filter(post => {
  if (post.frontmatter.inHomePost === false) return false;
  if (frontmatter.value.categoriesPage) return !!post.frontmatter.categories;
  if (frontmatter.value.tagsPage) return !!post.frontmatter.tags;
  return true;
}).slice(0, pageConfig.value.pageSize ?? 10));
const visiblePosts = computed(() => mounted.value ? props.posts : initialPosts.value);
</script>

<template>
  <PostList :posts="visiblePosts" />
</template>
