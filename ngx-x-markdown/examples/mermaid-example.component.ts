import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { XMarkdownComponent, MermaidCodeComponent } from 'ngx-x-markdown';
import mermaid from 'mermaid';

/**
 * Mermaid 图表渲染示例（推荐方案：自定义 Code 组件）
 *
 * 安装依赖：npm install mermaid
 *
 * 工作原理：
 * 1. 将 MermaidCodeComponent 注册为 code 标签的自定义组件
 * 2. 流式输入时，未闭合的 mermaid 代码块显示"正在生成图表…"占位符
 * 3. 代码块闭合后（streamStatus === 'done'），一次性调用 mermaid.render() 生成 SVG
 * 4. 非 mermaid 的 code 标签正常渲染
 */
@Component({
  selector: 'app-mermaid-example',
  standalone: true,
  imports: [XMarkdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>示例 1：静态渲染</h2>
    <x-markdown
      [content]="staticMd"
      [components]="componentMap"
      rootClassName="x-markdown-light" />

    <hr />

    <h2>示例 2：流式渲染（模拟打字效果）</h2>
    <button (click)="startStreaming()" [disabled]="isStreaming">
      {{ isStreaming ? '输出中...' : '开始流式输出' }}
    </button>
    <x-markdown
      [content]="streamingMd"
      [streaming]="{ enable: true }"
      [components]="componentMap"
      rootClassName="x-markdown-light" />
  `,
})
export class MermaidExampleComponent implements OnInit, OnDestroy {
  /**
   * 核心：将 MermaidCodeComponent 注册为 code 标签的渲染器。
   * 它会自动区分 mermaid 和普通代码块。
   */
  componentMap = { code: MermaidCodeComponent };

  // ===================== 示例 1：静态 =====================

  staticMd = `
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

    U->>F: 点击查询
    F->>B: GET /api/data
    B-->>F: JSON 响应
    F-->>U: 渲染页面
\`\`\`
  `;

  // ===================== 示例 2：流式 =====================

  streamingMd = '';
  isStreaming = false;
  private streamTimer: ReturnType<typeof setInterval> | null = null;

  /** 模拟 SSE / LLM 流式输出的完整内容 */
  private readonly fullStreamContent = `# 流式 Mermaid 演示

下面是一个逐字输出的图表：

\`\`\`mermaid
graph LR
    Start[开始] --> Parse[解析内容]
    Parse --> Check{是否 mermaid?}
    Check -->|是| Placeholder[显示占位符]
    Check -->|否| Render[正常渲染]
    Placeholder --> Close[代码块闭合]
    Close --> Diagram[渲染图表]
\`\`\`

图表渲染完成！上面的流程图演示了 MermaidCodeComponent 的工作流程。
`;

  private streamIndex = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // 初始化 mermaid 实例（全局只需一次）
    MermaidCodeComponent.setMermaidInstance(mermaid, {
      theme: 'default',
    });
  }

  ngOnDestroy(): void {
    this.stopStreaming();
  }

  startStreaming(): void {
    if (this.isStreaming) return;

    this.streamingMd = '';
    this.streamIndex = 0;
    this.isStreaming = true;

    // 模拟每 30ms 输出 2-5 个字符
    this.streamTimer = setInterval(() => {
      if (this.streamIndex >= this.fullStreamContent.length) {
        this.stopStreaming();
        return;
      }

      const chunkSize = Math.floor(Math.random() * 4) + 2;
      const end = Math.min(this.streamIndex + chunkSize, this.fullStreamContent.length);
      this.streamingMd = this.fullStreamContent.slice(0, end);
      this.streamIndex = end;
      this.cdr.markForCheck();
    }, 30);
  }

  private stopStreaming(): void {
    if (this.streamTimer) {
      clearInterval(this.streamTimer);
      this.streamTimer = null;
    }
    this.isStreaming = false;
    this.cdr.markForCheck();
  }
}
