import { Component, OnDestroy } from '@angular/core';
import { XMarkdownComponent } from 'ngx-x-markdown';
import type { StreamingOption } from 'ngx-x-markdown';

/**
 * 示例 2：流式输出 - 模拟 AI 聊天场景
 */
@Component({
  selector: 'app-streaming-example',
  standalone: true,
  imports: [XMarkdownComponent],
  template: `
    <h2>流式 Markdown 渲染（模拟 AI 回复）</h2>

    <div style="margin-bottom: 16px;">
      <button (click)="startStreaming()">开始流式输出</button>
      <button (click)="reset()" style="margin-left: 8px;">重置</button>
    </div>

    <x-markdown
      [content]="streamContent"
      [streaming]="streamingConfig"
      rootClassName="x-markdown-light">
    </x-markdown>
  `,
})
export class StreamingExampleComponent implements OnDestroy {
  streamContent = '';
  isStreaming = false;
  private timer: any = null;
  private charIndex = 0;

  streamingConfig: StreamingOption = {
    hasNextChunk: true, // 启用流式缓存
    enableAnimation: true, // 启用淡入动画
    animationConfig: {
      fadeDuration: 200,
      easing: 'ease-in-out',
    },
  };

  private fullContent = `## AI 回复示例

你好！我是一个 AI 助手。让我为你介绍 **Angular XMarkdown** 组件：

### 主要特性

1. **流式渲染** - 支持逐字符输出，适配 AI 聊天场景
2. **自定义组件** - 可替换 HTML 标签为自定义 Angular 组件
3. **主题支持** - 内置亮色和暗色主题

### 代码示例

\`\`\`typescript
@Component({
  template: \`<x-markdown [content]="md" [streaming]="config" />\`
})
export class MyComponent {
  md = '# Hello';
  config = { hasNextChunk: true };
}
\`\`\`

> 💡 流式渲染会智能处理未完成的 Markdown 语法，确保渲染结果始终正确。

希望这对你有帮助！`;

  startStreaming(): void {
    this.reset();
    this.isStreaming = true;
    this.streamingConfig = { ...this.streamingConfig, hasNextChunk: true };

    this.timer = setInterval(() => {
      if (this.charIndex >= this.fullContent.length) {
        // 流式结束
        this.streamingConfig = { ...this.streamingConfig, hasNextChunk: false };
        this.isStreaming = false;
        clearInterval(this.timer);
        return;
      }

      // 每次输出 1-5 个字符，模拟真实 AI 输出
      const chunkSize = Math.floor(Math.random() * 5) + 1;
      const end = Math.min(this.charIndex + chunkSize, this.fullContent.length);
      this.streamContent = this.fullContent.slice(0, end);
      this.charIndex = end;
    }, 30);
  }

  reset(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.streamContent = '';
    this.charIndex = 0;
    this.isStreaming = false;
    this.streamingConfig = { ...this.streamingConfig, hasNextChunk: false };
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
