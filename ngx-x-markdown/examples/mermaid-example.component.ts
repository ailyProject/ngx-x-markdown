import { Component, ElementRef, ViewChild, AfterViewChecked, ChangeDetectionStrategy } from '@angular/core';
import { XMarkdownComponent, Mermaid, renderMermaidDiagrams } from 'ngx-x-markdown';
import mermaid from 'mermaid';

/**
 * Mermaid 图表渲染示例
 *
 * 安装依赖：npm install mermaid
 *
 * 工作原理：
 * 1. Mermaid() 插件将 ```mermaid 代码块转为 <pre class="mermaid"> 元素
 * 2. 在 ngAfterViewChecked 中调用 renderMermaidDiagrams() 触发实际渲染
 */
@Component({
  selector: 'app-mermaid-example',
  standalone: true,
  imports: [XMarkdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <x-markdown
      #mdContainer
      [content]="md"
      [config]="markedConfig"
      rootClassName="x-markdown-light" />
  `,
})
export class MermaidExampleComponent implements AfterViewChecked {
  @ViewChild('mdContainer', { read: ElementRef }) containerRef!: ElementRef<HTMLElement>;

  markedConfig = {
    extensions: Mermaid({
      mermaidInstance: mermaid,
      mermaidConfig: {
        theme: 'default', // 'default' | 'dark' | 'forest' | 'neutral'
      },
    }),
  };

  md = `
# Mermaid 图表示例

## 流程图

\`\`\`mermaid
graph TD
    A[开始] --> B{是否登录?}
    B -->|是| C[进入首页]
    B -->|否| D[跳转登录页]
    D --> E[输入账号密码]
    E --> B
\`\`\`

## 时序图

\`\`\`mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant B as 后端
    participant D as 数据库

    U->>F: 点击查询
    F->>B: GET /api/data
    B->>D: SELECT * FROM table
    D-->>B: 返回数据
    B-->>F: JSON 响应
    F-->>U: 渲染页面
\`\`\`

## 甘特图

\`\`\`mermaid
gantt
    title 项目开发计划
    dateFormat  YYYY-MM-DD
    section 设计
    需求分析     :a1, 2024-01-01, 7d
    UI 设计      :a2, after a1, 5d
    section 开发
    前端开发     :b1, after a2, 14d
    后端开发     :b2, after a2, 14d
    section 测试
    集成测试     :c1, after b1, 7d
\`\`\`
  `;

  ngAfterViewChecked(): void {
    // 每次视图更新后尝试渲染未处理的 mermaid 图表
    if (this.containerRef) {
      renderMermaidDiagrams(mermaid, this.containerRef.nativeElement);
    }
  }
}
