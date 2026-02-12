import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XMarkdownComponent } from 'ngx-x-markdown';
import type { ComponentMap, StreamingOption } from 'ngx-x-markdown';

// ===================== 自定义 Code 组件 =====================

@Component({
  selector: 'app-custom-code',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="custom-code-block">
      <div class="code-header">
        <span class="code-lang">{{ lang || 'text' }}</span>
        <button (click)="copyCode()">复制</button>
        <span *ngIf="streamStatus === 'loading'" class="loading-indicator">
          ⏳ 输出中...
        </span>
      </div>
      <pre class="code-content"><code [innerHTML]="children"></code></pre>
    </div>
  `,
  styles: [`
    .custom-code-block {
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      overflow: hidden;
      margin: 8px 0;
    }
    .code-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #f5f5f5;
      border-bottom: 1px solid #e8e8e8;
    }
    .code-lang {
      font-size: 12px;
      color: #666;
      font-weight: 600;
    }
    .code-header button {
      margin-left: auto;
      font-size: 12px;
      cursor: pointer;
      padding: 2px 8px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      background: #fff;
    }
    .loading-indicator {
      font-size: 12px;
      color: #1677ff;
    }
    .code-content {
      margin: 0;
      padding: 12px;
      background: #fafafa;
    }
    .code-content code {
      font-family: 'Fira Code', monospace;
      font-size: 13px;
      line-height: 1.6;
    }
  `],
})
export class CustomCodeComponent {
  @Input() lang?: string;
  @Input() block?: boolean;
  @Input() streamStatus: 'loading' | 'done' = 'done';
  @Input() children?: string;

  copyCode(): void {
    const textContent = this.children?.replace(/<[^>]*>/g, '') || '';
    navigator.clipboard.writeText(textContent).then(() => {
      alert('代码已复制！');
    });
  }
}

// ===================== 自定义 Thinking 组件 =====================

@Component({
  selector: 'app-custom-thinking',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <details class="thinking-block" [attr.open]="streamStatus === 'loading' ? '' : null">
      <summary>
        🧠 思考过程
        <span *ngIf="streamStatus === 'loading'" class="thinking-spinner">⏳</span>
      </summary>
      <div class="thinking-content" [innerHTML]="children"></div>
    </details>
  `,
  styles: [`
    .thinking-block {
      border: 1px solid #e6f4ff;
      border-radius: 8px;
      margin: 12px 0;
      background: #f0f8ff;
    }
    summary {
      padding: 8px 16px;
      cursor: pointer;
      font-weight: 600;
      color: #1677ff;
    }
    .thinking-spinner {
      margin-left: 8px;
    }
    .thinking-content {
      padding: 0 16px 12px;
      color: #666;
      font-size: 13px;
      line-height: 1.6;
    }
  `],
})
export class CustomThinkingComponent {
  @Input() streamStatus: 'loading' | 'done' = 'done';
  @Input() children?: string;
}

// ===================== 使用自定义组件的主示例 =====================

/**
 * 示例 3：自定义组件替换
 */
@Component({
  selector: 'app-custom-components-example',
  standalone: true,
  imports: [XMarkdownComponent],
  template: `
    <h2>自定义组件替换</h2>
    <x-markdown
      [content]="markdownContent"
      [components]="componentMap"
      rootClassName="x-markdown-light">
    </x-markdown>
  `,
})
export class CustomComponentsExampleComponent {
  // 组件映射: HTML 标签名 -> Angular 组件类
  componentMap: ComponentMap = {
    code: CustomCodeComponent,
    thinking: CustomThinkingComponent,
  };

  markdownContent = `
# 自定义组件示例

下面的代码块将使用自定义的 Code 组件渲染：

\`\`\`typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<h1>Hello Angular!</h1>'
})
export class AppComponent {}
\`\`\`

下面是自定义的 thinking 标签：

<thinking>
让我思考一下这个问题...
首先分析用户需求，然后给出解决方案。
</thinking>

以上就是自定义组件的效果。
  `;
}
