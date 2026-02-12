import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XMarkdownComponent } from 'ngx-x-markdown';

/**
 * 示例 5：主题切换 - 亮色/暗色
 */
@Component({
  selector: 'app-theme-example',
  standalone: true,
  imports: [CommonModule, XMarkdownComponent],
  template: `
    <h2>主题切换</h2>
    <div style="margin-bottom: 16px;">
      <button (click)="toggleTheme()">
        切换到{{ isDark ? '亮色' : '暗色' }}主题
      </button>
    </div>

    <div [style.background]="isDark ? '#1a1a1a' : '#ffffff'"
         [style.padding.px]="24"
         [style.border-radius.px]="8">
      <x-markdown
        [content]="markdownContent"
        [rootClassName]="themeClass">
      </x-markdown>
    </div>
  `,
  // 需要在 angular.json 的 styles 中引入:
  // "node_modules/ngx-x-markdown/src/themes/light.css"
  // "node_modules/ngx-x-markdown/src/themes/dark.css"
})
export class ThemeExampleComponent {
  isDark = false;

  get themeClass(): string {
    return this.isDark ? 'x-markdown-dark' : 'x-markdown-light';
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
  }

  markdownContent = `
# 主题切换演示

这是一段 **Markdown** 内容，支持亮色和暗色主题切换。

## 列表

- 项目一
- 项目二
- 项目三

## 代码

\`\`\`javascript
function hello() {
  console.log('Hello, XMarkdown!');
}
\`\`\`

## 表格

| 主题 | 类名 |
|------|------|
| 亮色 | x-markdown-light |
| 暗色 | x-markdown-dark |

> 点击上方按钮切换主题
  `;
}
