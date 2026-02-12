# ngx-x-markdown

> Angular 版本的 [@ant-design/x-markdown](https://x.ant.design) —— 支持流式渲染的高性能 Markdown 组件

基于 `@ant-design/x-markdown` (React) 转写的 Angular 库，保留了全部核心功能：

- ✅ Markdown 解析与渲染（基于 [marked](https://marked.js.org/)）
- ✅ 流式输出支持（适配 AI/LLM 聊天场景）
- ✅ 自定义组件替换（将 HTML 标签映射为 Angular 组件）
- ✅ DOMPurify HTML 净化（XSS 防护）
- ✅ 亮色/暗色主题
- ✅ LaTeX 数学公式插件（基于 KaTeX）
- ✅ Angular 17+ Standalone Component

## 安装

```bash
npm install ngx-x-markdown marked dompurify

# 如果需要 LaTeX 支持：
npm install katex
```

## 快速开始

### 1. 基础用法

```typescript
import { Component } from '@angular/core';
import { XMarkdownComponent } from 'ngx-x-markdown';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [XMarkdownComponent],
  template: `
    <x-markdown [content]="markdown" rootClassName="x-markdown-light" />
  `,
})
export class DemoComponent {
  markdown = `
# Hello XMarkdown

这是 **Angular** 版本的 Markdown 渲染组件。

- 支持列表
- 支持 **加粗**、*斜体*
- 支持 \`行内代码\`
  `;
}
```

### 2. 流式渲染（AI 聊天场景）

```typescript
import { Component } from '@angular/core';
import { XMarkdownComponent } from 'ngx-x-markdown';
import type { StreamingOption } from 'ngx-x-markdown';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [XMarkdownComponent],
  template: `
    <x-markdown
      [content]="aiResponse"
      [streaming]="streamingConfig"
      rootClassName="x-markdown-light" />
  `,
})
export class ChatComponent {
  aiResponse = '';

  streamingConfig: StreamingOption = {
    hasNextChunk: true,       // true = 仍在接收数据
    enableAnimation: true,    // 启用逐字淡入动画
    animationConfig: {
      fadeDuration: 200,
      easing: 'ease-in-out',
    },
  };

  // 当 AI 回复完成时：
  onStreamComplete() {
    this.streamingConfig = { ...this.streamingConfig, hasNextChunk: false };
  }

  // 模拟从 SSE/WebSocket 接收数据
  onChunkReceived(chunk: string) {
    this.aiResponse += chunk;
  }
}
```

### 3. 自定义组件替换

将 HTML 标签映射为自定义 Angular 组件：

```typescript
import { Component, Input } from '@angular/core';
import { XMarkdownComponent } from 'ngx-x-markdown';
import type { ComponentMap } from 'ngx-x-markdown';

// 定义自定义 code 组件
@Component({
  selector: 'app-code-block',
  standalone: true,
  template: `
    <div class="code-wrapper">
      <div class="header">
        <span>{{ lang }}</span>
        <button (click)="copy()">复制</button>
      </div>
      <pre><code [innerHTML]="children"></code></pre>
    </div>
  `,
})
export class CodeBlockComponent {
  @Input() lang?: string;
  @Input() block?: boolean;
  @Input() streamStatus: 'loading' | 'done' = 'done';
  @Input() children?: string;

  copy() {
    navigator.clipboard.writeText(this.children?.replace(/<[^>]*>/g, '') || '');
  }
}

// 使用自定义组件
@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [XMarkdownComponent],
  template: `
    <x-markdown
      [content]="markdown"
      [components]="componentMap"
      rootClassName="x-markdown-light" />
  `,
})
export class DemoComponent {
  componentMap: ComponentMap = {
    code: CodeBlockComponent, // <code> 标签将被 CodeBlockComponent 替换
  };

  markdown = '```typescript\nconsole.log("hello");\n```';
}
```

### 4. 主题

使用内置的亮色/暗色主题 CSS：

```json
// angular.json
{
  "styles": [
    "node_modules/ngx-x-markdown/src/themes/light.css",
    "node_modules/ngx-x-markdown/src/themes/dark.css"
  ]
}
```

```html
<!-- 亮色主题 -->
<x-markdown [content]="md" rootClassName="x-markdown-light" />

<!-- 暗色主题 -->
<x-markdown [content]="md" rootClassName="x-markdown-dark" />
```

### 5. LaTeX 数学公式

```typescript
import { Component } from '@angular/core';
import { XMarkdownComponent, Latex } from 'ngx-x-markdown';

@Component({
  selector: 'app-math',
  standalone: true,
  imports: [XMarkdownComponent],
  template: `
    <x-markdown [content]="md" [config]="markedConfig" rootClassName="x-markdown-light" />
  `,
})
export class MathComponent {
  markedConfig = {
    extensions: Latex(),
  };

  md = `
行内公式: $E = mc^2$

块级公式:
$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$
  `;
}
```

> 注意：使用 LaTeX 需要额外安装 `katex` 并引入样式 `katex/dist/katex.min.css`

### 6. Mermaid 图表（推荐：自定义 Code 组件方案）

使用 `MermaidCodeComponent` 可实现流式友好的 Mermaid 渲染：
- 代码块未闭合时显示"正在生成图表…"占位符
- 闭合后一次性调用 `mermaid.render()` 生成 SVG
- 非 mermaid 代码块正常渲染

```typescript
import { Component, OnInit } from '@angular/core';
import { XMarkdownComponent, MermaidCodeComponent } from 'ngx-x-markdown';
import mermaid from 'mermaid';

@Component({
  selector: 'app-diagram',
  standalone: true,
  imports: [XMarkdownComponent],
  template: `
    <x-markdown
      [content]="md"
      [streaming]="{ enable: true }"
      [components]="componentMap"
      rootClassName="x-markdown-light" />
  `,
})
export class DiagramComponent implements OnInit {
  componentMap = { code: MermaidCodeComponent };

  md = `
\`\`\`mermaid
graph TD
    A[开始] --> B{判断}
    B -->|是| C[完成]
    B -->|否| D[重试]
\`\`\`
  `;

  ngOnInit(): void {
    // 全局初始化一次 mermaid 实例
    MermaidCodeComponent.setMermaidInstance(mermaid, { theme: 'default' });
  }
}
```

> 注意：使用 Mermaid 需要安装 `mermaid`：`npm install mermaid`

#### 备选方案：Mermaid 插件

如果不需要流式占位符（如纯静态内容），也可使用 `Mermaid()` marked 插件 + `renderMermaidDiagrams()`。
详见 `examples/mermaid-example.component.ts`。

## API

### `<x-markdown>` 组件 Inputs

| Input | 类型 | 默认值 | 说明 |
|-------|------|--------|------|
| `content` | `string` | `''` | Markdown 内容 |
| `streaming` | `StreamingOption` | - | 流式渲染配置 |
| `config` | `MarkedExtension` | - | Marked.js 扩展配置 |
| `components` | `ComponentMap` | - | 自定义组件映射 |
| `rootClassName` | `string` | - | 根元素额外 CSS 类名 |
| `className` | `string` | - | 额外 CSS 类名 |
| `customStyle` | `object` | - | 内联样式 |
| `paragraphTag` | `string` | `'p'` | 段落 HTML 标签 |
| `openLinksInNewTab` | `boolean` | `false` | 链接新标签页打开 |
| `dompurifyConfig` | `DOMPurifyConfig` | - | DOMPurify 配置 |
| `protectCustomTagNewlines` | `boolean` | `false` | 保护自定义标签换行 |

### StreamingOption

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `hasNextChunk` | `boolean` | `false` | 是否还有后续数据 |
| `enableAnimation` | `boolean` | `false` | 启用淡入动画 |
| `animationConfig` | `AnimationConfig` | - | 动画配置 |
| `incompleteMarkdownComponentMap` | `object` | - | 未完成 Markdown 的组件映射 |

### 自定义组件 Inputs

当自定义组件被注入时，会自动接收以下 `@Input()`：

| Input | 类型 | 说明 |
|-------|------|------|
| `streamStatus` | `'loading' \| 'done'` | 流式状态 |
| `children` | `string` | 子元素 HTML |
| `lang` | `string` | 代码块语言（仅 code 组件） |
| `block` | `boolean` | 是否块级代码（仅 code 组件） |

## 与 React 版本的对应关系

| React (`@ant-design/x-markdown`) | Angular (`ngx-x-markdown`) |
|---|---|
| `<XMarkdown>` 组件 | `<x-markdown>` 组件 |
| `useStreaming()` hook | `processStreamingContent()` 纯函数 |
| `components={{ code: MyCode }}` | `[components]="{ code: MyCodeComponent }"` |
| `html-react-parser` | `innerHTML` + 动态组件注入 |
| `React.createElement()` | `createComponent()` |
| `React.memo` | `ChangeDetectionStrategy.OnPush` |
| `useMemo` / `useRef` | Angular 生命周期 + 缓存 |
| `className` | `rootClassName` / `className` |
| `style` | `customStyle` |

## 项目结构

```
ngx-x-markdown/
├── src/
│   ├── lib/
│   │   ├── core/
│   │   │   ├── parser.ts          # Markdown → HTML（marked.js）
│   │   │   └── renderer.ts        # HTML 净化 + 自定义标签处理
│   │   ├── services/
│   │   │   └── streaming.ts       # 流式处理逻辑
│   │   ├── components/
│   │   │   ├── x-markdown/        # 主组件
│   │   │   └── animation-text/    # 动画文字组件
│   │   ├── plugins/
│   │   │   └── latex.ts           # LaTeX 插件
│   │   └── interfaces/
│   │       └── index.ts           # 类型定义
│   ├── themes/
│   │   ├── light.css              # 亮色主题
│   │   └── dark.css               # 暗色主题
│   └── public-api.ts              # 公开 API
├── examples/                       # 使用示例
├── package.json
└── README.md
```

## License

MIT
