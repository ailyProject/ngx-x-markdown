export const CODE_TUTORIAL_CONTENT = `## 实现一个简单的流式 Markdown 渲染器

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
