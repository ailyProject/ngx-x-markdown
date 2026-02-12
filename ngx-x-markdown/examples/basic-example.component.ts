import { Component } from '@angular/core';
import { XMarkdownComponent } from 'ngx-x-markdown';

/**
 * 示例 1：基础用法 - 静态 Markdown 渲染
 */
@Component({
  selector: 'app-basic-example',
  standalone: true,
  imports: [XMarkdownComponent],
  template: `
    <h2>基础 Markdown 渲染</h2>
    <x-markdown
      [content]="markdownContent"
      rootClassName="x-markdown-light">
    </x-markdown>
  `,
})
export class BasicExampleComponent {
  markdownContent = `
# Hello XMarkdown for Angular

这是一个 **Angular** 版本的 Markdown 渲染组件。

## 功能特性

- ✅ Markdown 解析与渲染
- ✅ 流式输出支持
- ✅ 自定义组件替换
- ✅ 亮色/暗色主题
- ✅ LaTeX 数学公式

## 代码示例

\`\`\`typescript
const greeting = 'Hello, XMarkdown!';
console.log(greeting);
\`\`\`

## 表格

| 特性 | React | Angular |
|------|-------|---------|
| 组件 | XMarkdown | XMarkdownComponent |
| 流式 | useStreaming | processStreamingContent |
| 主题 | CSS class | CSS class |

> 这是一段引用文本
  `;
}
