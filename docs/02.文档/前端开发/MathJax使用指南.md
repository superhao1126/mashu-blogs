---
description: 记录在技术文档中使用 MathJax 渲染数学公式的方法，介绍行内与独立公式、常用 LaTeX 写法和配置要点。结合页面内容更新时的重新渲染，让公式在博客与文档中稳定展示。
title: MathJax使用指南
sidebarSort: 3
date: 2025-11-11 10:30:00
permalink: /frontend/mathjax-guide
categories:
  - 前端开发
tags:
  - 前端
  - MathJax
  - 数学公式
  - Markdown
---

# MathJax使用指南


## 背景

在技术文档、学术博客、教程等内容中，经常需要展示数学公式。传统的做法是使用图片或者 HTML 标签来模拟公式，但这种方式不仅制作复杂，而且不够灵活。MathJax 是一个开源的 JavaScript 显示引擎，它可以在所有现代浏览器中优美地显示数学公式。

## 什么是 MathJax

MathJax 是一个 JavaScript 库，用于在网页中显示数学符号和公式。它支持多种数学标记语言：

- **LaTeX**：最流行的数学排版系统
- **MathML**：W3C 推荐的数学标记语言
- **AsciiMath**：易于输入的 ASCII 数学标记法

## 核心优势

- **高质量渲染**：生成美观的数学公式，支持多种显示模式
- **跨浏览器兼容**：在所有现代浏览器中都能正常工作
- **响应式设计**：公式可以适应不同的屏幕尺寸
- **可访问性**：支持屏幕阅读器，符合无障碍标准
- **易于集成**：可以轻松集成到各种 Web 框架中

## 前端项目集成 MathJax

### 方法一：CDN 直接引入

在 HTML 文件的 `<head>` 标签中添加：

```html
<!DOCTYPE html>
<html>
<head>
  <!-- MathJax 配置 -->
  <script>
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true
      },
      options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
        ignoreHtmlClass: 'tex2jax_ignore',
        processHtmlClass: 'tex2jax_process'
      }
    };
  </script>
  
  <!-- 加载 MathJax 库 -->
  <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
  <script id="MathJax-script" async 
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js">
  </script>
</head>
<body>
  <!-- 你的内容 -->
</body>
</html>
```

### 方法二：npm 安装

```bash
npm install mathjax@3
# 或
yarn add mathjax@3
```

在 JavaScript 中使用：

```javascript
import { MathJax } from 'mathjax3/es5/startup.js';

// 配置 MathJax
MathJax.config.tex = {
  inlineMath: [['$', '$'], ['\\(', '\\)']],
  displayMath: [['$$', '$$'], ['\\[', '\\]']],
  processEscapes: true
};

// 启动 MathJax
MathJax.startup.getComponents();
MathJax.startup.ready();
```

### 方法三：在 React 项目中使用

创建一个 MathJax 组件：

```jsx
import React, { useEffect, useRef } from 'react';

const MathJaxComponent = ({ formula, isBlock = false }) => {
  const mathRef = useRef();

  useEffect(() => {
    // 确保 MathJax 已加载
    if (window.MathJax) {
      // 渲染公式
      window.MathJax.typesetPromise([mathRef.current]).catch((err) => {
        console.error('MathJax 渲染错误:', err);
      });
    }
  }, [formula]);

  return (
    <div 
      ref={mathRef} 
      className={isBlock ? 'math-block' : 'math-inline'}
    >
      {isBlock ? `$$${formula}$$` : `$${formula}$`}
    </div>
  );
};

export default MathJaxComponent;
```

使用组件：

```jsx
function App() {
  return (
    <div>
      <h1>数学公式示例</h1>
      <p>
        内联公式：
        <MathJaxComponent formula="x^2 + y^2 = z^2" />
      </p>
      <p>
        块级公式：
        <MathJaxComponent 
          formula="\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}" 
          isBlock={true} 
        />
      </p>
    </div>
  );
}
```

### 方法四：在 Vue.js 项目中使用

首先创建一个 MathJax 组件：

```vue
<!-- components/MathJax.vue -->
<template>
  <div ref="mathJaxContainer" class="mathjax-container">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'MathJax',
  props: {
    formula: {
      type: String,
      required: true
    },
    displayMode: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    this.renderMath();
  },
  updated() {
    this.renderMath();
  },
  methods: {
    renderMath() {
      if (window.MathJax) {
        // 配置 MathJax
        window.MathJax = {
          tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
            processEscapes: true
          },
          options: {
            skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
          },
          startup: {
            typeset: false
          }
        };

        // 等待 MathJax 加载完成
        if (window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([this.$refs.mathJaxContainer]);
        }
      }
    }
  }
}
</script>

<style scoped>
.mathjax-container {
  display: inline-block;
}
</style>
```

使用组件：

```vue
<template>
  <div>
    <h1>数学公式示例</h1>
    <p>
      内联公式：
      <MathJax formula="x^2 + y^2 = z^2" />
    </p>
    <p>
      块级公式：
      <MathJax formula="\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}" :display-mode="true" />
    </p>
  </div>
</template>

<script>
import MathJax from './components/MathJax.vue';

export default {
  components: {
    MathJax
  }
};
</script>
```

### 方法五：在其他框架中集成

#### Angular 集成

```typescript
// math.component.ts
import { Component, Input, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-math',
  template: '<div [innerHTML]="mathContent"></div>'
})
export class MathComponent implements AfterViewInit {
  @Input() formula: string = '';
  @Input() isBlock: boolean = false;
  
  mathContent: string = '';
  
  constructor(private el: ElementRef) {}
  
  ngAfterViewInit() {
    this.mathContent = this.isBlock ? `$$${this.formula}$$` : `$${this.formula}$`;
    
    if ((window as any).MathJax) {
      (window as any).MathJax.typesetPromise([this.el.nativeElement]);
    }
  }
}
```

#### Svelte 集成

```svelte
<!-- Math.svelte -->
<script>
  import { onMount } from 'svelte';
  
  export let formula = '';
  export let isBlock = false;
  
  let mathElement;
  
  onMount(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise([mathElement]);
    }
  });
</script>

<div bind:this={mathElement}>
  {#if isBlock}
    $$${formula}$$
  {:else}
    ${formula}$
  {/if}
</div>
```

## 基础使用语法

### LaTeX 数学符号语法

### 内联公式

使用 `$...$` 包裹内联公式：

```markdown
欧拉公式是 $e^{i\pi} + 1 = 0$，被称为最优美的数学公式。
```

效果：欧拉公式是 $e^{i\pi} + 1 = 0$，被称为最优美的数学公式。

### 块级公式

使用 `$$...$$` 包裹块级公式：

```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

效果：
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

::: info 故障排除
如果公式没有正确显示，请尝试：

1. 刷新页面重新加载
2. 检查浏览器控制台是否有错误信息
3. 确认公式语法正确无误
:::

## 常用数学符号和公式

### 基础符号

| 符号 | LaTeX 代码 | 说明 |
|------|------------|------|
| α, β, γ | `\alpha, \beta, \gamma` | 希腊字母 |
| Σ, Π, Δ | `\Sigma, \Pi, \Delta` | 大写希腊字母 |
| ≤, ≥, ≠ | `\le, \ge, \neq` | 关系符号 |
| ∈, ∉, ⊂ | `\in, \notin, \subset` | 集合符号 |
| ∀, ∃, ∅ | `\forall, \exists, \emptyset` | 逻辑符号 |

### 分数和根式

```latex
分数：$\frac{a}{b}$

根式：$\sqrt{x}$，$\sqrt[3]{x}$

复杂分数：$\frac{\partial^2 u}{\partial x^2} + \frac{\partial^2 u}{\partial y^2} = 0$
```

**渲染效果：**

- 分数：$\frac{a}{b}$
- 根式：$\sqrt{x}$，$\sqrt[3]{x}$
- 复杂分数：$\frac{\partial^2 u}{\partial x^2} + \frac{\partial^2 u}{\partial y^2} = 0$

### 求和与积分

```latex
求和：$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$

积分：$\int_{a}^{b} f(x) dx$

极限：$\lim_{x \to \infty} \left(1 + \frac{1}{x}\right)^x = e$
```

**渲染效果：**

- 求和：$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$
- 积分：$\int_{a}^{b} f(x) dx$
- 极限：$\lim_{x \to \infty} \left(1 + \frac{1}{x}\right)^x = e$

### 矩阵和向量

```markdown
矩阵：
$$
\begin{pmatrix}
a_{11} & a_{12} & a_{13} \\
a_{21} & a_{22} & a_{23} \\
a_{31} & a_{32} & a_{33}
\end{pmatrix}
$$

向量：$\vec{v} = (v_x, v_y, v_z)$

点积：$\vec{a} \cdot \vec{b} = |\vec{a}| |\vec{b}| \cos\theta$
```

效果：
矩阵：
$$
\begin{pmatrix}
a_{11} & a_{12} & a_{13} \\
a_{21} & a_{22} & a_{23} \\
a_{31} & a_{32} & a_{33}
\end{pmatrix}
$$

向量：$\vec{v} = (v_x, v_y, v_z)$

点积：$\vec{a} \cdot \vec{b} = |\vec{a}| |\vec{b}| \cos\theta$

## 高级应用示例

### 物理学公式

```latex
牛顿第二定律：
$$
\vec{F} = m\vec{a} = m\frac{d^2\vec{x}}{dt^2}
$$

麦克斯韦方程组：
$$
\begin{aligned}
\nabla \cdot \vec{E} &= \frac{\rho}{\epsilon_0} \\
\nabla \cdot \vec{B} &= 0 \\
\nabla \times \vec{E} &= -\frac{\partial \vec{B}}{\partial t} \\
\nabla \times \vec{B} &= \mu_0 \vec{J} + \mu_0 \epsilon_0 \frac{\partial \vec{E}}{\partial t}
\end{aligned}
$$
```

**渲染效果：**

牛顿第二定律：
$$
\vec{F} = m\vec{a} = m\frac{d^2\vec{x}}{dt^2}
$$

麦克斯韦方程组：
$$
\begin{aligned}
\nabla \cdot \vec{E} &= \frac{\rho}{\epsilon_0} \\
\nabla \cdot \vec{B} &= 0 \\
\nabla \times \vec{E} &= -\frac{\partial \vec{B}}{\partial t} \\
\nabla \times \vec{B} &= \mu_0 \vec{J} + \mu_0 \epsilon_0 \frac{\partial \vec{E}}{\partial t}
\end{aligned}
$$

### 统计学公式

```latex
正态分布概率密度函数：
$$
f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}
$$

贝叶斯定理：
$$
P(A|B) = \frac{P(B|A)P(A)}{P(B)}
$$
```

**渲染效果：**

正态分布概率密度函数：
$$
f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}
$$

贝叶斯定理：
$$
P(A|B) = \frac{P(B|A)P(A)}{P(B)}
$$

## 动态公式渲染

### JavaScript 手动渲染

当你需要动态添加公式内容时，可以手动触发 MathJax 渲染：

```javascript
// 渲染指定元素中的公式
function renderMath(element) {
  if (window.MathJax) {
    MathJax.typesetPromise([element]).catch((err) => {
      console.error('MathJax 渲染失败:', err);
    });
  }
}

// 渲染整个文档
function renderAllMath() {
  if (window.MathJax) {
    MathJax.typesetPromise().catch((err) => {
      console.error('MathJax 渲染失败:', err);
    });
  }
}

// 动态添加公式示例
function addFormula(containerId, formula, isBlock = false) {
  const container = document.getElementById(containerId);
  const mathDiv = document.createElement('div');
  
  if (isBlock) {
    mathDiv.innerHTML = `$$${formula}$$`;
    mathDiv.className = 'math-block';
  } else {
    mathDiv.innerHTML = `$${formula}$`;
    mathDiv.className = 'math-inline';
  }
  
  container.appendChild(mathDiv);
  
  // 渲染新添加的公式
  renderMath(mathDiv);
}

// 使用示例
addFormula('formula-container', 'x^2 + y^2 = z^2', false);
addFormula('formula-container', '\\int_{0}^{1} x^2 dx = \\frac{1}{3}', true);
```

### 配置选项详解

```javascript
window.MathJax = {
  // TeX 输入处理器配置
  tex: {
    // 内联数学分隔符
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    
    // 显示数学分隔符
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    
    // 处理反斜杠转义
    processEscapes: true,
    
    // 处理环境
    processEnvironments: true,
    
    // 自动换行
    processRefs: true,
    
    // 扩展包
    packages: {
      '[+]': ['ams', 'newcommand', 'configmacros']
    }
  },
  
  // 输出处理器配置
  chtml: {
    // 字体缩放
    scale: 1,
    
    // 最小缩放
    minScale: .5,
    
    // 匹配字体大小
    matchFontHeight: false
  },
  
  // 一般选项
  options: {
    // 跳过的 HTML 标签
    skipHtmlTags: [
      'script', 'noscript', 'style', 'textarea', 
      'pre', 'code', 'annotation', 'annotation-xml'
    ],
    
    // 忽略的 CSS 类
    ignoreHtmlClass: 'tex2jax_ignore',
    
    // 处理的 CSS 类
    processHtmlClass: 'tex2jax_process'
  },
  
  // 启动配置
  startup: {
    // 页面加载后是否自动排版
    typeset: true,
    
    // 就绪回调
    ready() {
      console.log('MathJax 已准备就绪');
      MathJax.startup.defaultReady();
    }
  }
};
```
## 常见问题与解决方案

### 1. MathJax 加载失败

**问题症状：** 页面中的公式显示为原始的 LaTeX 代码。

**解决方案：**

```javascript
// 检查 MathJax 是否已加载
function checkMathJax() {
  if (typeof window.MathJax === 'undefined') {
    console.error('MathJax 未加载，请检查网络连接或 CDN 地址');
    return false;
  }
  console.log('MathJax 版本:', window.MathJax.version);
  return true;
}

// 等待 MathJax 加载完成
function waitForMathJax(callback, maxAttempts = 50) {
  let attempts = 0;
  
  const checkInterval = setInterval(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      clearInterval(checkInterval);
      callback();
    } else if (++attempts >= maxAttempts) {
      clearInterval(checkInterval);
      console.error('MathJax 加载超时');
    }
  }, 100);
}
```

### 2. 动态内容渲染问题

**问题症状：** 动态添加的内容中的公式不会自动渲染。

**解决方案：**

```javascript
// 处理动态内容的通用函数
function handleDynamicContent() {
  // 使用 MutationObserver 监听 DOM 变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        // 检查新添加的节点是否包含数学公式
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const hasFormula = node.textContent.includes('$') || 
                              node.textContent.includes('\\(') ||
                              node.textContent.includes('\\[');
            
            if (hasFormula && window.MathJax) {
              // 延迟渲染，确保 DOM 更新完成
              setTimeout(() => {
                window.MathJax.typesetPromise([node]);
              }, 10);
            }
          }
        });
      }
    });
  });

  // 开始观察
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
}

// 启用动态内容监听
const mathObserver = handleDynamicContent();
```

### 3. 性能优化策略

**问题症状：** 大量公式导致页面渲染缓慢。

**解决方案：**

```javascript
// 批量渲染优化
class MathRenderer {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }
  
  // 添加渲染任务到队列
  addToQueue(elements) {
    if (Array.isArray(elements)) {
      this.queue.push(...elements);
    } else {
      this.queue.push(elements);
    }
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }
  
  // 处理渲染队列
  async processQueue() {
    if (this.queue.length === 0 || this.isProcessing) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      // 分批处理，避免阻塞 UI
      while (this.queue.length > 0) {
        const batch = this.queue.splice(0, 5); // 每批处理 5 个元素
        
        if (window.MathJax) {
          await window.MathJax.typesetPromise(batch);
        }
        
        // 让出执行权，避免阻塞 UI
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    } catch (error) {
      console.error('批量渲染失败:', error);
    }
    
    this.isProcessing = false;
  }
}

// 使用示例
const mathRenderer = new MathRenderer();

// 添加多个元素进行渲染
const formulaElements = document.querySelectorAll('.math-formula');
mathRenderer.addToQueue(Array.from(formulaElements));
```

### 4. 移动端适配

**问题症状：** 公式在移动设备上显示异常。

**解决方案：**

```javascript
// 移动端优化配置
window.MathJax = {
  tex: {
    inlineMath: [['$', '$']],
    displayMath: [['$$', '$$']]
  },
  chtml: {
    // 适应移动设备屏幕
    scale: 0.9,
    minScale: 0.5,
    // 字体匹配
    matchFontHeight: false
  },
  options: {
    // 启用响应式处理
    processHtmlClass: 'tex2jax_process'
  }
};

// CSS 样式优化
const mobileStyles = `
  .MathJax {
    font-size: 16px !important;
    max-width: 100% !important;
    overflow-x: auto !important;
  }
  
  @media (max-width: 768px) {
    .MathJax {
      font-size: 14px !important;
    }
    
    .MathJax_Display {
      text-align: left !important;
      margin: 1em 0 !important;
    }
  }
`;

// 动态添加样式
const styleSheet = document.createElement('style');
styleSheet.textContent = mobileStyles;
document.head.appendChild(styleSheet);
```

## 最佳实践建议

### 1. 性能优化

- **延迟加载**：只在需要显示公式的页面才加载 MathJax
- **批量渲染**：避免频繁的单个公式渲染
- **缓存策略**：对重复使用的公式进行缓存

```javascript
// 延迟加载示例
function loadMathJaxOnDemand() {
  if (document.querySelector('.math-formula') && !window.MathJax) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    script.async = true;
    document.head.appendChild(script);
  }
}

// 页面加载完成后检查
document.addEventListener('DOMContentLoaded', loadMathJaxOnDemand);
```

### 2. 错误处理

- **优雅降级**：当 MathJax 加载失败时提供备选方案
- **错误监控**：记录和处理渲染错误
- **用户反馈**：在公式渲染失败时给出明确提示

```javascript
// 错误处理示例
function renderWithFallback(element, formula) {
  if (window.MathJax) {
    window.MathJax.typesetPromise([element]).catch((error) => {
      console.error('公式渲染失败:', error);
      // 显示错误提示
      element.innerHTML = `
        <span style="color: red; font-style: italic;">
          [公式渲染失败: ${formula}]
        </span>
      `;
    });
  } else {
    // MathJax 未加载的备选方案
    element.innerHTML = `
      <code style="background: #f5f5f5; padding: 2px 4px;">
        ${formula}
      </code>
    `;
  }
}
```

### 3. 可访问性支持

```javascript
// 配置无障碍访问
window.MathJax = {
  a11y: {
    assistiveMml: true,  // 启用辅助 MathML
    braille: true,       // 支持盲文显示
    speech: true,        // 支持语音朗读
    locale: 'zh'         // 设置语言
  }
};
```

## 总结

MathJax 是一个功能强大的数学公式渲染引擎，适用于各种前端项目：

### 主要优势

1. **广泛兼容**：支持所有现代浏览器和移动设备
2. **高质量渲染**：生成美观、清晰的数学公式
3. **易于集成**：可以轻松集成到 React、Vue、Angular 等框架
4. **丰富功能**：支持 LaTeX、MathML、AsciiMath 多种输入格式
5. **可访问性**：支持屏幕阅读器和无障碍访问

### 适用场景

- **技术文档**：API 文档、技术教程中的数学说明
- **教育平台**：在线课程、练习系统、考试平台
- **科研网站**：学术论文、研究报告展示
- **博客网站**：技术博客中的公式展示
- **数据分析**：可视化报告中的数学模型

通过合理配置和优化，MathJax 可以为您的项目提供专业级的数学公式显示效果。

## 故障排除指南

### 如果公式不显示，请按以下步骤检查：

1. **检查浏览器控制台**
   - 按 F12 打开开发者工具
   - 查看 Console 面板是否有 MathJax 相关错误
   - 常见错误：网络加载失败、语法错误等

2. **验证 MathJax 是否加载**
   ```javascript
   // 在浏览器控制台运行
   console.log(window.MathJax ? '✅ MathJax 已加载' : '❌ MathJax 未加载');
   ```

3. **手动触发渲染**
   ```javascript
   // 在浏览器控制台运行
   if (window.MathJax) {
     window.MathJax.typesetPromise().then(() => {
       console.log('✅ 公式渲染完成');
     });
   }
   ```

4. **检查公式语法**
   - 确保所有 LaTeX 命令正确
   - 检查括号是否匹配
   - 确认转义字符使用正确

5. **清除缓存并重新加载**
   - 按 Ctrl+F5 (或 Cmd+Shift+R) 强制刷新
   - 清除浏览器缓存

### 性能优化建议

- 避免在同一页面使用过多复杂公式
- 考虑将长公式分解为多个简单部分
- 使用图片替代极其复杂的公式（如需要）

如果以上方法都无法解决问题，请检查 VitePress 配置文件中的 MathJax 设置。
