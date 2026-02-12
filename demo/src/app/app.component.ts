import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { XMarkdownComponent, MermaidCodeComponent } from 'ngx-x-markdown';
import type { StreamingOption, ComponentMap } from 'ngx-x-markdown';
import mermaid from 'mermaid';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [XMarkdownComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  // ========== State ==========
  theme = signal<'light' | 'dark'>('light');
  streamContent = signal('');
  isStreaming = signal(false);
  speed = signal<'slow' | 'normal' | 'fast'>('normal');

  themeClass = computed(() =>
    this.theme() === 'light' ? 'x-markdown-light' : 'x-markdown-dark'
  );

  streamingConfig = signal<StreamingOption>({
    hasNextChunk: false,
    enableAnimation: true,
    animationConfig: {
      fadeDuration: 200,
      easing: 'ease-in-out',
    },
  });

  private timer: ReturnType<typeof setInterval> | null = null;
  private charIndex = 0;

  // ========== Predefined demo contents ==========
  readonly demoContents: { label: string; value: string }[] = [
    { label: '🤖 AI 对话', value: AI_CHAT_CONTENT },
    { label: '📊 技术文档', value: TECH_DOC_CONTENT },
    { label: '💻 代码讲解', value: CODE_TUTORIAL_CONTENT },
    { label: '📈 Mermaid 图表', value: MERMAID_CONTENT },
    { label: '🖼️ 图片渲染', value: IMAGE_CONTENT },
  ];

  /** Mermaid 自定义组件映射 */
  mermaidComponentMap: ComponentMap = { code: MermaidCodeComponent };

  /** 当前是否为 Mermaid demo */
  isMermaidDemo = computed(() => this.selectedDemo() === 3);

  /** 根据当前 demo 返回自定义组件映射 */
  currentComponentMap = computed(() => this.isMermaidDemo() ? this.mermaidComponentMap : undefined);

  selectedDemo = signal(0);

  readonly speedMap: Record<string, number> = { slow: 80, normal: 30, fast: 8 };

  // ========== Actions ==========

  toggleTheme(): void {
    const next = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(next);
    document.body.classList.toggle('dark-mode', next === 'dark');
  }

  selectDemo(index: number): void {
    this.reset();
    this.selectedDemo.set(index);
  }

  setSpeed(speed: 'slow' | 'normal' | 'fast'): void {
    this.speed.set(speed);
    if (this.isStreaming()) {
      const currentContent = this.streamContent();
      const fullContent = this.getCurrentFullContent();
      this.charIndex = currentContent.length;
      if (this.timer) clearInterval(this.timer);
      this.runStream(fullContent);
    }
  }

  startStreaming(): void {
    this.reset();
    this.isStreaming.set(true);
    this.streamingConfig.set({ ...this.streamingConfig(), hasNextChunk: true });
    this.runStream(this.getCurrentFullContent());
  }

  reset(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.streamContent.set('');
    this.charIndex = 0;
    this.isStreaming.set(false);
    this.streamingConfig.set({ ...this.streamingConfig(), hasNextChunk: false });
  }

  ngOnInit(): void {
    // 全局初始化一次 mermaid 实例
    MermaidCodeComponent.setMermaidInstance(mermaid, { theme: 'default' });
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  // ========== Helpers ==========

  private getCurrentFullContent(): string {
    return this.demoContents[this.selectedDemo()].value;
  }

  private runStream(fullContent: string): void {
    const interval = this.speedMap[this.speed()];
    this.timer = setInterval(() => {
      if (this.charIndex >= fullContent.length) {
        this.streamingConfig.set({ ...this.streamingConfig(), hasNextChunk: false });
        this.isStreaming.set(false);
        if (this.timer) clearInterval(this.timer);
        return;
      }
      const chunkSize = Math.floor(Math.random() * 6) + 1;
      const end = Math.min(this.charIndex + chunkSize, fullContent.length);
      this.streamContent.set(fullContent.slice(0, end));
      this.charIndex = end;
    }, interval);
  }
}

// ===================== Demo Content Constants =====================

const AI_CHAT_CONTENT = `## 👋 你好！我是 AI 助手

很高兴为你介绍 **ngx-x-markdown** —— 一个支持流式渲染的 Angular Markdown 组件。

### ✨ 核心特性

1. **流式渲染** — 支持逐字符输出，完美适配 AI/LLM 聊天场景
2. **智能缓存** — 自动处理未完成的 Markdown 语法，确保渲染结果始终正确
3. **自定义组件** — 可将任意 HTML 标签映射为 Angular 组件
4. **主题支持** — 内置亮色/暗色主题，一行代码切换
5. **LaTeX 公式** — 基于 KaTeX 的数学公式渲染

### 📝 使用方法

只需三步即可开始：

\`\`\`typescript
import { XMarkdownComponent } from 'ngx-x-markdown';

@Component({
  imports: [XMarkdownComponent],
  template: \`
    <x-markdown
      [content]="aiResponse"
      [streaming]="{ hasNextChunk: true, enableAnimation: true }"
      rootClassName="x-markdown-light" />
  \`
})
export class ChatComponent {
  aiResponse = '';
}
\`\`\`

### 🎯 适用场景

| 场景 | 说明 |
|------|------|
| AI 聊天 | 流式输出 + 动画效果 |
| 文档预览 | 实时 Markdown 渲染 |
| 技术博客 | 代码高亮 + 数学公式 |
| 在线编辑器 | 实时预览 |

> 💡 **提示**：流式渲染会智能处理不完整的 Markdown 语法，比如未关闭的代码块或加粗标记，确保任意时刻渲染结果都是正确的。

希望这对你有帮助！如有问题请随时提问 😊`;

const TECH_DOC_CONTENT = `# Angular 信号（Signals）完全指南

Angular 信号是 Angular 16+ 引入的 **响应式原语**，用于管理组件状态。

## 什么是信号？

信号是一个包含值的包装器，当值改变时会通知所有消费者。

\`\`\`typescript
import { signal, computed, effect } from '@angular/core';

// 创建一个可写信号
const count = signal(0);

// 读取值
console.log(count()); // 0

// 更新值
count.set(1);
count.update(v => v + 1);
\`\`\`

## 计算信号（Computed）

计算信号自动追踪依赖并在依赖变化时重新计算：

\`\`\`typescript
const firstName = signal('张');
const lastName = signal('三');

const fullName = computed(() => firstName() + ' ' + lastName());

console.log(fullName()); // "张 三"
firstName.set('李');
console.log(fullName()); // "李 三"
\`\`\`

## Effect

Effect 在信号值变化时执行副作用：

\`\`\`typescript
effect(() => {
  console.log('当前计数:', count());
  // 每次 count 变化时自动执行
});
\`\`\`

## 最佳实践

### ✅ 推荐

- 使用 \`signal()\` 替代简单的组件属性
- 使用 \`computed()\` 替代 getter
- 在组件中优先使用 \`OnPush\` 变更检测策略

### ❌ 避免

- 不要在 \`computed()\` 中执行副作用
- 不要在 \`effect()\` 中修改信号值（可能导致循环）
- 避免过度使用 effect，优先考虑 computed

## 与 RxJS 的互操作

\`\`\`typescript
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

// Observable → Signal
const data = toSignal(this.http.get('/api/data'));

// Signal → Observable
const count$ = toObservable(count);
\`\`\`

> **总结**：Angular Signals 提供了一种简洁高效的状态管理方式，特别适合组件级别的响应式数据流。`;

const CODE_TUTORIAL_CONTENT = `## 实现一个简单的流式 Markdown 渲染器

下面我们一步步实现一个基于 Angular 的流式 Markdown 渲染器。

### 第一步：安装依赖

\`\`\`bash
npm install ngx-x-markdown marked dompurify
\`\`\`

### 第二步：创建组件

\`\`\`typescript
import { Component, OnDestroy } from '@angular/core';
import { XMarkdownComponent } from 'ngx-x-markdown';
import type { StreamingOption } from 'ngx-x-markdown';

@Component({
  selector: 'app-streaming-demo',
  standalone: true,
  imports: [XMarkdownComponent],
  template: \`
    <x-markdown
      [content]="content"
      [streaming]="config"
      rootClassName="x-markdown-light" />
  \`,
})
export class StreamingDemoComponent implements OnDestroy {
  content = '';
  config: StreamingOption = {
    hasNextChunk: true,
    enableAnimation: true,
  };

  private eventSource?: EventSource;

  connect() {
    this.eventSource = new EventSource('/api/chat/stream');
    this.eventSource.onmessage = (event) => {
      this.content += event.data;
    };
    this.eventSource.onerror = () => {
      this.config = { ...this.config, hasNextChunk: false };
      this.eventSource?.close();
    };
  }

  ngOnDestroy() {
    this.eventSource?.close();
  }
}
\`\`\`

### 第三步：连接后端 SSE

在 **NestJS** 后端创建 SSE 端点：

\`\`\`typescript
@Controller('chat')
export class ChatController {
  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return new Observable(subscriber => {
      const chunks = response.split('');
      let i = 0;
      const interval = setInterval(() => {
        if (i >= chunks.length) {
          clearInterval(interval);
          subscriber.complete();
          return;
        }
        subscriber.next({ data: chunks[i++] });
      }, 30);
    });
  }
}
\`\`\`

### 关键点总结

- **hasNextChunk** — 控制流式状态
- **enableAnimation** — 启用逐字淡入动画效果
- **智能缓存** — 组件内部会缓存不完整的 Markdown 片段

### 性能优化建议

1. 使用 \`ChangeDetectionStrategy.OnPush\` 策略
2. 合理设置 \`animationConfig.fadeDuration\`（推荐 150-300ms）
3. 对于大文本，考虑限制渲染频率

> 🚀 就这么简单！现在你已经掌握了流式 Markdown 渲染的核心技术。`;

const MERMAID_CONTENT = `# Mermaid 图表渲染

ngx-x-markdown 支持通过 Mermaid 插件渲染各种图表。

## 流程图

\`\`\`mermaid
graph TD
    A[用户请求] --> B{是否已认证?}
    B -->|是| C[加载数据]
    B -->|否| D[跳转登录]
    C --> E[渲染页面]
    D --> F[输入凭证]
    F --> G{验证通过?}
    G -->|是| C
    G -->|否| H[显示错误]
    H --> F
\`\`\`

## 时序图

\`\`\`mermaid
sequenceDiagram
    participant U as 👤 用户
    participant F as 🖥️ 前端
    participant A as ⚙️ API 网关
    participant S as 🤖 AI 服务

    U->>F: 发送消息
    F->>A: POST /api/chat
    A->>S: 转发请求
    S-->>A: SSE 流式响应
    A-->>F: 逐块返回
    F-->>U: 流式渲染 Markdown
    Note over F,U: 使用 ngx-x-markdown 实时渲染
\`\`\`

## 类图

\`\`\`mermaid
classDiagram
    class XMarkdownComponent {
        +string content
        +StreamingOption streaming
        +ComponentMap components
        +ngOnChanges()
        -processContent()
        -injectDynamicComponents()
    }
    class MarkdownParser {
        +parse(content) string
        -configureLinkRenderer()
        -configureCodeRenderer()
    }
    class MarkdownRenderer {
        +render(html) string
        -configureDOMPurify()
        -detectUnclosedTags()
    }
    XMarkdownComponent --> MarkdownParser
    XMarkdownComponent --> MarkdownRenderer
\`\`\`

## 状态图

\`\`\`mermaid
stateDiagram-v2
    [*] --> 空闲
    空闲 --> 流式输出中: 开始输出
    流式输出中 --> 流式输出中: 接收 chunk
    流式输出中 --> 渲染完成: hasNextChunk=false
    渲染完成 --> 空闲: 重置
    渲染完成 --> [*]
\`\`\`

## 饼图

\`\`\`mermaid
pie title ngx-x-markdown 核心模块
    "Parser (解析)" : 30
    "Renderer (渲染)" : 25
    "Streaming (流式)" : 25
    "Plugins (插件)" : 10
    "Themes (主题)" : 10
\`\`\`

> 💡 **提示**：Mermaid 图表支持流式渲染——当图表代码块尚未完整时，会在完成后自动渲染。
`;

const IMAGE_CONTENT = `# 🖼️ 图片渲染示例

ngx-x-markdown 完整支持 Markdown 图片语法，包括行内图片、带标题图片等多种格式。

## 基本图片

使用标准 Markdown 语法插入图片：

![Mountain Landscape](https://picsum.photos/seed/mountain/800/400)

## 带标题的图片

图片可以附带标题文本（鼠标悬停可见）：

![Ocean View](https://picsum.photos/seed/ocean/800/400 "美丽的海景")

## 图文混排

在段落中嵌入行内图片可以丰富内容表现力。图片天然支持与周围文本混排：

以下是一些技术架构中常见的图标示例，在实际项目文档中经常需要使用小尺寸图片 ![icon](https://picsum.photos/seed/icon1/20/20) 来增强可读性。

## 图片列表

使用列表组织多张图片：

- **自然风光**
  ![Nature](https://picsum.photos/seed/nature/600/300)

- **城市建筑**
  ![City](https://picsum.photos/seed/city/600/300)

- **抽象艺术**
  ![Abstract](https://picsum.photos/seed/abstract/600/300)

## 图片表格

在表格中展示图片非常适合做对比：

| 类别 | 预览 | 说明 |
|------|------|------|
| 风景 | ![landscape](https://picsum.photos/seed/land/150/100) | 自然风景照片 |
| 动物 | ![animals](https://picsum.photos/seed/animal/150/100) | 野生动物摄影 |
| 美食 | ![food](https://picsum.photos/seed/food/150/100) | 美食摄影 |

## 图片链接

图片也可以作为链接的内容，点击图片跳转到目标页面：

[![GitHub](https://picsum.photos/seed/github/800/200)](https://github.com)

## 在代码中使用

\`\`\`html
<!-- 基本图片 -->
![描述文字](图片地址)

<!-- 带标题的图片 -->
![描述文字](图片地址 "悬停标题")

<!-- 图片链接 -->
[![描述文字](图片地址)](链接地址)
\`\`\`

> 💡 **提示**：在流式渲染模式下，图片会在 URL 解析完成后自动加载，不会因为后续内容未完成而影响已识别图片的展示。
`;
