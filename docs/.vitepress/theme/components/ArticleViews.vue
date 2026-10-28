<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { onContentUpdated, useData } from "vitepress";

const { page } = useData();
const views = ref<number | null>(null);
const target = ref<Element | null>(null);
let cancelRequest = () => {};

async function findTarget() {
  await nextTick();
  target.value = document.querySelector("#VPContent .tk-article-analyze__wrapper");
}
onContentUpdated(findTarget);

onMounted(() => {
  watch(() => page.value.relativePath, () => {
    cancelRequest();
    views.value = null;
    findTarget();
    // 本地预览不计入正式站点的访问量。
    if (["localhost", "127.0.0.1", "::1", "[::1]"].includes(window.location.hostname)) return;
    const callbackName = `mashuViews_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const callbacks = window as unknown as Record<string, any>;
    const script = document.createElement("script");
    let finished = false;
    const timer = window.setTimeout(cleanup, 5000);
    function cleanup() {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      script.remove();
      delete callbacks[callbackName];
    }
    callbacks[callbackName] = (data: { page_pv?: number }) => {
      if (Number.isFinite(data?.page_pv) && Number(data.page_pv) >= 0) views.value = Number(data.page_pv);
      cleanup();
    };
    script.onerror = cleanup;
    script.onload = cleanup;
    script.referrerPolicy = "no-referrer-when-downgrade";
    script.src = `https://busuanzi.ibruce.info/busuanzi?jsonpCallback=${callbackName}`;
    document.body.append(script);
    cancelRequest = cleanup;
  }, { immediate: true });
});
onBeforeUnmount(() => cancelRequest());
</script>

<template>
  <Teleport v-if="target && views !== null" :to="target"><span class="mashu-views">{{ views.toLocaleString('zh-CN') }} 次阅读</span></Teleport>
</template>
