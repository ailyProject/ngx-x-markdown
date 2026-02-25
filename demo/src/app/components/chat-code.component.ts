import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * 聊天代码块组件 — 用于渲染所有自定义 aily-* 代码块和标准代码块。
 *
 * 支持的 lang 类型:
 * - aily-state: 状态显示 (doing/done/warn/error/info)
 * - aily-button: 按钮组件
 * - aily-board: 开发板查看器
 * - aily-library: 扩展库查看器
 * - aily-think: 思考过程查看器
 * - aily-mermaid: Mermaid 图表查看器
 * - aily-context: 上下文查看器
 * - aily-blockly: Blockly 积木代码查看器
 * - aily-error: 错误信息查看器
 * - aily-task-action: 任务操作查看器
 * - mermaid: 标准 Mermaid 图表
 * - 其他: 标准代码块渲染
 */
@Component({
  selector: 'ngx-chat-code',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- aily-state: 状态提示 -->
    @if (isAilyType('aily-state') && parsedData) {
      <div class="aily-state" [attr.data-state]="parsedData.state">
        <span class="aily-state-icon">{{ stateIcon }}</span>
        <span class="aily-state-text">{{ parsedData.text }}</span>
        @if (parsedData.progress != null) {
          <div class="aily-state-progress">
            <div class="aily-state-progress-bar" [style.width.%]="parsedData.progress"></div>
          </div>
          <span class="aily-state-progress-text">{{ parsedData.progress }}%</span>
        }
      </div>
    }

    <!-- aily-button: 按钮组 -->
    @if (isAilyType('aily-button') && parsedArray) {
      <div class="aily-button-group">
        @for (btn of parsedArray; track btn.action) {
          <button
            class="aily-btn"
            [attr.data-type]="btn.type || 'default'"
            [disabled]="btn.disabled"
            [class.loading]="btn.loading"
            (click)="onButtonClick(btn)">
            @if (btn.icon) {
              <span class="aily-btn-icon">{{ btn.icon }}</span>
            }
            {{ btn.text }}
          </button>
        }
      </div>
    }

    <!-- aily-board: 开发板卡片 -->
    @if (isAilyType('aily-board') && parsedData) {
      <div class="aily-card aily-board">
        <div class="aily-card-header">
          <span class="aily-card-icon">🔧</span>
          <div class="aily-card-title">
            <strong>{{ parsedData.nickname || parsedData.name }}</strong>
            @if (parsedData.version) {
              <span class="aily-card-version">v{{ parsedData.version }}</span>
            }
          </div>
          @if (parsedData.brand) {
            <span class="aily-card-badge">{{ parsedData.brand }}</span>
          }
        </div>
        @if (parsedData.description) {
          <p class="aily-card-desc">{{ parsedData.description }}</p>
        }
        <div class="aily-card-meta">
          <span class="aily-card-meta-item">📦 {{ parsedData.name }}</span>
          @if (parsedData.author) {
            <span class="aily-card-meta-item">👤 {{ parsedData.author || '未知' }}</span>
          }
        </div>
      </div>
    }

    <!-- aily-library: 扩展库卡片 -->
    @if (isAilyType('aily-library') && parsedData) {
      <div class="aily-card aily-library">
        <div class="aily-card-header">
          <span class="aily-card-icon">📚</span>
          <div class="aily-card-title">
            <strong>{{ parsedData.nickname || parsedData.name }}</strong>
            @if (parsedData.version) {
              <span class="aily-card-version">v{{ parsedData.version }}</span>
            }
          </div>
          @if (parsedData.tested !== undefined) {
            <span class="aily-card-badge" [attr.data-tested]="parsedData.tested">
              {{ parsedData.tested ? '✅ 已测试' : '⚠️ 未测试' }}
            </span>
          }
        </div>
        @if (parsedData.description) {
          <p class="aily-card-desc">{{ parsedData.description }}</p>
        }
        <div class="aily-card-meta">
          <span class="aily-card-meta-item">📦 {{ parsedData.name }}</span>
          @if (parsedData.author) {
            <span class="aily-card-meta-item">👤 {{ parsedData.author }}</span>
          }
        </div>
        @if (parsedData.keywords?.length) {
          <div class="aily-card-tags">
            @for (tag of parsedData.keywords; track tag) {
              <span class="aily-card-tag">{{ tag }}</span>
            }
          </div>
        }
      </div>
    }

    <!-- aily-think: 思考过程 -->
    @if (isAilyType('aily-think') && parsedData) {
      <details class="aily-think" [attr.open]="!parsedData.isComplete ? '' : null">
        <summary class="aily-think-summary">
          <span class="aily-think-icon">{{ parsedData.isComplete ? '💡' : '🔄' }}</span>
          <span>{{ parsedData.isComplete ? '思考过程' : '正在思考...' }}</span>
        </summary>
        <div class="aily-think-content">{{ parsedData.content }}</div>
      </details>
    }

    <!-- aily-mermaid: Mermaid 图表 (JSON 包装) -->
    @if (isAilyType('aily-mermaid')) {
      <div class="aily-mermaid-wrapper">
        <div class="aily-mermaid-placeholder" [style.display]="diagramReady ? 'none' : ''">
          <div class="aily-mermaid-spinner"></div>
          <span>{{ streamStatus === 'loading' ? '正在生成图表…' : '正在渲染图表…' }}</span>
        </div>
        <div class="aily-mermaid-diagram" #diagramContainer [style.display]="diagramReady ? '' : 'none'"></div>
        @if (renderError) {
          <div class="aily-mermaid-error">{{ renderError }}</div>
        }
      </div>
    }

    <!-- aily-context: 上下文代码查看器 -->
    @if (isAilyType('aily-context') && parsedData) {
      <div class="aily-context">
        <div class="aily-context-header">
          <span class="aily-context-icon">📄</span>
          <span class="aily-context-label">{{ parsedData.label || '代码上下文' }}</span>
        </div>
        <pre class="aily-context-code"><code>{{ parsedData.encoded ? decodeBase64(parsedData.content) : parsedData.content }}</code></pre>
      </div>
    }

    <!-- aily-blockly: Blockly 积木代码查看器 -->
    @if (isAilyType('aily-blockly') && parsedData) {
      <div class="aily-blockly">
        @if (parsedData.title) {
          <div class="aily-blockly-header">
            <span class="aily-blockly-icon">🧩</span>
            <span class="aily-blockly-title">{{ parsedData.title }}</span>
          </div>
        }
        @if (parsedData.blocks?.length) {
          <div class="aily-blockly-blocks">
            @for (blk of parsedData.blocks; track blk.id) {
              <div class="aily-blockly-block" [attr.data-type]="blk.type">
                <span class="aily-blockly-block-type">{{ blk.type }}</span>
                @if (blk.pin != null) {
                  <span class="aily-blockly-block-pin">Pin: {{ blk.pin }}</span>
                }
                @if (blk.time != null) {
                  <span class="aily-blockly-block-time">{{ blk.time }}ms</span>
                }
              </div>
            }
          </div>
        }
        @if (parsedData.code) {
          <pre class="aily-blockly-code"><code>{{ parsedData.code }}</code></pre>
        }
      </div>
    }

    <!-- aily-error: 错误查看器 -->
    @if (isAilyType('aily-error') && parsedData) {
      <div class="aily-error" [attr.data-severity]="parsedData.severity || 'error'">
        <div class="aily-error-header">
          <span class="aily-error-icon">{{ severityIcon }}</span>
          <span class="aily-error-title">
            @if (parsedData.error?.status) {
              <strong>错误 {{ parsedData.error.status }}</strong>
            } @else {
              <strong>错误</strong>
            }
          </span>
          @if (parsedData.timestamp) {
            <span class="aily-error-time">{{ formatTime(parsedData.timestamp) }}</span>
          }
        </div>
        @if (parsedData.error?.message) {
          <p class="aily-error-message">{{ parsedData.error.message }}</p>
        }
        @if (parsedData.metadata) {
          <div class="aily-error-meta">
            @for (item of objectEntries(parsedData.metadata); track item[0]) {
              <span class="aily-error-meta-item">{{ item[0] }}: {{ item[1] }}</span>
            }
          </div>
        }
      </div>
    }

    <!-- aily-task-action: 任务操作查看器 -->
    @if (isAilyType('aily-task-action') && parsedData) {
      <div class="aily-task-action" [attr.data-action]="parsedData.actionType">
        <div class="aily-task-action-header">
          <span class="aily-task-action-icon">{{ taskActionIcon }}</span>
          <span class="aily-task-action-type">{{ taskActionLabel }}</span>
        </div>
        @if (parsedData.message) {
          <p class="aily-task-action-message">{{ parsedData.message }}</p>
        }
        @if (parsedData.metadata) {
          <div class="aily-task-action-meta">
            @for (item of objectEntries(parsedData.metadata); track item[0]) {
              <span class="aily-task-action-meta-item">{{ item[0] }}: {{ item[1] }}</span>
            }
          </div>
        }
      </div>
    }

    <!-- mermaid: 标准 Mermaid 图表 -->
    @if (isMermaid) {
      <div class="aily-mermaid-wrapper">
        <div class="aily-mermaid-placeholder" [style.display]="diagramReady ? 'none' : ''">
          <div class="aily-mermaid-spinner"></div>
          <span>{{ streamStatus === 'loading' ? '正在生成图表…' : '正在渲染图表…' }}</span>
        </div>
        <div class="aily-mermaid-diagram" #diagramContainer [style.display]="diagramReady ? '' : 'none'"></div>
        @if (renderError) {
          <div class="aily-mermaid-error">{{ renderError }}</div>
        }
      </div>
    }

    <!-- 标准代码块 -->
    @if (isRegularCode) {
      @if (block) {
        <pre><code [class]="langClass" [innerHTML]="children"></code></pre>
      } @else {
        <code [innerHTML]="children"></code>
      }
    }
  `,
  styles: [`
    :host { display: block; }

    /* ====== aily-state ====== */
    .aily-state {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 14px;
      margin: 6px 0;
      transition: all 0.2s;
    }
    .aily-state[data-state="doing"] {
      background: #e6f7ff;
      border: 1px solid #91d5ff;
      color: #096dd9;
    }
    .aily-state[data-state="done"] {
      background: #f6ffed;
      border: 1px solid #b7eb8f;
      color: #389e0d;
    }
    .aily-state[data-state="warn"] {
      background: #fffbe6;
      border: 1px solid #ffe58f;
      color: #d48806;
    }
    .aily-state[data-state="error"] {
      background: #fff2f0;
      border: 1px solid #ffccc7;
      color: #cf1322;
    }
    .aily-state[data-state="info"] {
      background: #f0f5ff;
      border: 1px solid #adc6ff;
      color: #1d39c4;
    }
    .aily-state-icon { font-size: 16px; flex-shrink: 0; }
    .aily-state-text { flex: 1; }
    .aily-state-progress {
      width: 100px;
      height: 6px;
      background: rgba(0,0,0,0.06);
      border-radius: 3px;
      overflow: hidden;
    }
    .aily-state-progress-bar {
      height: 100%;
      background: #1677ff;
      border-radius: 3px;
      transition: width 0.3s ease;
    }
    .aily-state-progress-text {
      font-size: 12px;
      min-width: 36px;
      text-align: right;
    }

    /* ====== aily-button ====== */
    .aily-button-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 8px 0;
    }
    .aily-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 16px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid #d9d9d9;
      background: #fff;
      color: #333;
    }
    .aily-btn:hover { border-color: #1677ff; color: #1677ff; }
    .aily-btn[data-type="primary"] {
      background: #1677ff;
      color: #fff;
      border-color: #1677ff;
    }
    .aily-btn[data-type="primary"]:hover { background: #4096ff; }
    .aily-btn[data-type="dashed"] { border-style: dashed; }
    .aily-btn[data-type="link"] {
      border: none;
      background: none;
      color: #1677ff;
      padding: 6px 8px;
    }
    .aily-btn[data-type="link"]:hover { color: #4096ff; }
    .aily-btn[data-type="text"] {
      border: none;
      background: none;
      color: #333;
      padding: 6px 8px;
    }
    .aily-btn[data-type="text"]:hover { background: #f5f5f5; }
    .aily-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .aily-btn-icon { font-size: 14px; }

    /* ====== aily-card (board & library) ====== */
    .aily-card {
      border: 1px solid #e8e8e8;
      border-radius: 10px;
      padding: 16px;
      margin: 8px 0;
      background: #fafafa;
      transition: all 0.2s;
    }
    .aily-card:hover {
      border-color: #1677ff;
      box-shadow: 0 2px 8px rgba(22, 119, 255, 0.1);
    }
    .aily-card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }
    .aily-card-icon { font-size: 22px; }
    .aily-card-title {
      flex: 1;
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .aily-card-title strong { font-size: 15px; color: #1a1a1a; }
    .aily-card-version {
      font-size: 12px;
      color: #8c8c8c;
      background: #f0f0f0;
      padding: 1px 6px;
      border-radius: 4px;
    }
    .aily-card-badge {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 4px;
      background: #e6f7ff;
      color: #1677ff;
      white-space: nowrap;
    }
    .aily-card-badge[data-tested="false"] {
      background: #fffbe6;
      color: #d48806;
    }
    .aily-card-badge[data-tested="true"] {
      background: #f6ffed;
      color: #389e0d;
    }
    .aily-card-desc {
      font-size: 13px;
      color: #595959;
      margin: 0 0 10px 0;
      line-height: 1.6;
    }
    .aily-card-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #8c8c8c;
    }
    .aily-card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 10px;
    }
    .aily-card-tag {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 4px;
      background: #f0f0f0;
      color: #595959;
    }

    /* ====== aily-think ====== */
    .aily-think {
      border: 1px solid #e8e8e8;
      border-radius: 10px;
      margin: 8px 0;
      overflow: hidden;
      background: #fafafa;
    }
    .aily-think-summary {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: #1a1a1a;
      user-select: none;
    }
    .aily-think-summary:hover { background: #f0f0f0; }
    .aily-think-icon { font-size: 16px; }
    .aily-think-content {
      padding: 0 16px 14px 16px;
      font-size: 13px;
      color: #595959;
      line-height: 1.8;
      white-space: pre-wrap;
      border-top: 1px solid #f0f0f0;
      word-wrap: break-word;
    }

    /* ====== aily-mermaid & mermaid ====== */
    .aily-mermaid-wrapper {
      margin: 8px 0;
      border: 1px solid #e8e8e8;
      border-radius: 10px;
      overflow: hidden;
    }
    .aily-mermaid-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 32px 16px;
      background: #fafafa;
      color: #8c8c8c;
      font-size: 14px;
      min-height: 120px;
    }
    .aily-mermaid-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #d9d9d9;
      border-top-color: #1677ff;
      border-radius: 50%;
      animation: chat-code-spin 0.8s linear infinite;
    }
    @keyframes chat-code-spin { to { transform: rotate(360deg); } }
    .aily-mermaid-diagram {
      text-align: center;
      overflow-x: auto;
      padding: 16px;
    }
    .aily-mermaid-diagram ::ng-deep svg { max-width: 100%; height: auto; }
    .aily-mermaid-error {
      padding: 12px 16px;
      border-top: 1px solid #ff4d4f;
      background: #fff2f0;
      color: #ff4d4f;
      font-size: 13px;
    }

    /* ====== aily-context ====== */
    .aily-context {
      border: 1px solid #e8e8e8;
      border-radius: 10px;
      margin: 8px 0;
      overflow: hidden;
    }
    .aily-context-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: #fafafa;
      border-bottom: 1px solid #f0f0f0;
      font-size: 13px;
      color: #595959;
    }
    .aily-context-code {
      margin: 0;
      padding: 14px 16px;
      font-size: 13px;
      line-height: 1.6;
      overflow-x: auto;
      background: #282c34;
      color: #abb2bf;
    }
    .aily-context-code code {
      font-family: 'Fira Code', 'Menlo', 'Consolas', monospace;
    }

    /* ====== aily-blockly ====== */
    .aily-blockly {
      border: 1px solid #e8e8e8;
      border-radius: 10px;
      margin: 8px 0;
      overflow: hidden;
      background: #fafafa;
    }
    .aily-blockly-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
      font-weight: 500;
      color: #1a1a1a;
    }
    .aily-blockly-blocks {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 12px 16px;
    }
    .aily-blockly-block {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 6px;
      background: #f0f5ff;
      border: 1px solid #adc6ff;
      font-size: 12px;
      color: #1d39c4;
    }
    .aily-blockly-block-type { font-weight: 500; }
    .aily-blockly-block-pin, .aily-blockly-block-time {
      color: #8c8c8c;
      font-size: 11px;
    }
    .aily-blockly-code {
      margin: 0;
      padding: 14px 16px;
      font-size: 13px;
      line-height: 1.6;
      overflow-x: auto;
      background: #282c34;
      color: #abb2bf;
      border-top: 1px solid #f0f0f0;
    }
    .aily-blockly-code code {
      font-family: 'Fira Code', 'Menlo', 'Consolas', monospace;
    }

    /* ====== aily-error ====== */
    .aily-error {
      border-radius: 10px;
      margin: 8px 0;
      overflow: hidden;
      border: 1px solid #ffccc7;
      background: #fff2f0;
    }
    .aily-error[data-severity="warning"] {
      border-color: #ffe58f;
      background: #fffbe6;
    }
    .aily-error-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(0,0,0,0.04);
    }
    .aily-error-icon { font-size: 18px; }
    .aily-error-title {
      flex: 1;
      font-size: 14px;
      color: #cf1322;
    }
    .aily-error[data-severity="warning"] .aily-error-title { color: #d48806; }
    .aily-error-time {
      font-size: 12px;
      color: #8c8c8c;
    }
    .aily-error-message {
      padding: 10px 16px;
      margin: 0;
      font-size: 13px;
      color: #595959;
      line-height: 1.6;
    }
    .aily-error-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      padding: 8px 16px 12px;
      font-size: 12px;
      color: #8c8c8c;
    }

    /* ====== aily-task-action ====== */
    .aily-task-action {
      border: 1px solid #e8e8e8;
      border-radius: 10px;
      margin: 8px 0;
      overflow: hidden;
      background: #f0f5ff;
      border-color: #adc6ff;
    }
    .aily-task-action[data-action="error"] {
      background: #fff2f0;
      border-color: #ffccc7;
    }
    .aily-task-action[data-action="timeout"] {
      background: #fffbe6;
      border-color: #ffe58f;
    }
    .aily-task-action-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(0,0,0,0.04);
    }
    .aily-task-action-icon { font-size: 18px; }
    .aily-task-action-type {
      font-size: 14px;
      font-weight: 500;
      color: #1a1a1a;
    }
    .aily-task-action-message {
      padding: 10px 16px;
      margin: 0;
      font-size: 13px;
      color: #595959;
      line-height: 1.6;
    }
    .aily-task-action-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      padding: 8px 16px 12px;
      font-size: 12px;
      color: #8c8c8c;
    }
  `],
})
export class ChatCodeComponent implements OnChanges, OnDestroy {
  // ===================== Inputs =====================

  @Input() children: string = '';
  @Input() block: boolean = false;
  @Input() lang: string = '';
  @Input() streamStatus: string = 'done';

  // ===================== View =====================

  @ViewChild('diagramContainer') diagramContainer?: ElementRef<HTMLElement>;

  // ===================== Internal State =====================

  parsedData: any = null;
  parsedArray: any[] | null = null;
  renderError: string = '';
  diagramReady: boolean = false;

  private renderedSource: string = '';
  private rendering = false;
  private renderTimer: ReturnType<typeof setTimeout> | null = null;
  private static mermaidInstance: any = null;
  private static mermaidInitialized = false;
  private static idCounter = 0;

  /** 自定义代码块类型列表 */
  private static readonly AILY_TYPES = [
    'aily-state', 'aily-button', 'aily-board', 'aily-library',
    'aily-think', 'aily-mermaid', 'aily-context', 'aily-blockly',
    'aily-error', 'aily-task-action',
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private hostRef: ElementRef<HTMLElement>,
  ) {}

  // ===================== Static API =====================

  static setMermaidInstance(instance: any, config?: Record<string, any>): void {
    ChatCodeComponent.mermaidInstance = instance;
    if (instance && !ChatCodeComponent.mermaidInitialized) {
      instance.initialize({ startOnLoad: false, ...config });
      ChatCodeComponent.mermaidInitialized = true;
    }
  }

  // ===================== Getters =====================

  get isMermaid(): boolean {
    return this.block && this.lang === 'mermaid' && !this.isAilyType('mermaid');
  }

  get isRegularCode(): boolean {
    if (this.isMermaid) return false;
    if (this.block && ChatCodeComponent.AILY_TYPES.includes(this.lang)) return false;
    return true;
  }

  get langClass(): string {
    return this.lang ? `language-${this.lang}` : '';
  }

  get stateIcon(): string {
    const icons: Record<string, string> = {
      doing: '⏳', done: '✅', warn: '⚠️', error: '❌', info: 'ℹ️',
    };
    return icons[this.parsedData?.state] || 'ℹ️';
  }

  get severityIcon(): string {
    const icons: Record<string, string> = {
      error: '❌', warning: '⚠️', info: 'ℹ️',
    };
    return icons[this.parsedData?.severity] || '❌';
  }

  get taskActionIcon(): string {
    const icons: Record<string, string> = {
      max_messages: '📨', error: '❌', timeout: '⏰', unknown: '❓',
    };
    return icons[this.parsedData?.actionType] || '📋';
  }

  get taskActionLabel(): string {
    const labels: Record<string, string> = {
      max_messages: '消息数已达上限',
      error: '任务执行错误',
      timeout: '任务超时',
      unknown: '未知操作',
    };
    return labels[this.parsedData?.actionType] || '任务操作';
  }

  // ===================== Lifecycle =====================

  ngOnChanges(changes: SimpleChanges): void {
    this.parseContent();

    // Mermaid 渲染 (标准 mermaid 或 aily-mermaid)
    if (this.isMermaid || this.isAilyType('aily-mermaid')) {
      if (changes['streamStatus'] && this.streamStatus === 'loading') {
        this.diagramReady = false;
        this.renderedSource = '';
      }
      if (this.streamStatus === 'done') {
        let source = '';
        if (this.isMermaid) {
          source = this.stripHtmlEntities(this.children).trim();
        } else if (this.parsedData?.code) {
          source = this.parsedData.code.trim();
        }
        if (source && source !== this.renderedSource) {
          this.scheduleRender(source);
        }
      }
    }
  }

  ngOnDestroy(): void {
    if (this.renderTimer) {
      clearTimeout(this.renderTimer);
      this.renderTimer = null;
    }
  }

  // ===================== Methods =====================

  isAilyType(type: string): boolean {
    return this.block && this.lang === type;
  }

  onButtonClick(btn: any): void {
    console.log('[ChatCode] Button clicked:', btn.action, btn);
  }

  decodeBase64(str: string): string {
    try { return atob(str); } catch { return str; }
  }

  formatTime(ts: string): string {
    try {
      return new Date(ts).toLocaleString('zh-CN');
    } catch { return ts; }
  }

  objectEntries(obj: any): [string, any][] {
    return obj ? Object.entries(obj) : [];
  }

  // ===================== Parsing =====================

  private parseContent(): void {
    this.parsedData = null;
    this.parsedArray = null;

    if (!this.block || !ChatCodeComponent.AILY_TYPES.includes(this.lang)) return;

    try {
      const raw = this.stripHtmlEntities(this.children).trim();
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        this.parsedArray = parsed;
      } else {
        this.parsedData = parsed;
      }
    } catch (e) {
      // JSON 解析失败时静默忽略，会渲染为标准代码块
      console.warn(`[ChatCode] Failed to parse ${this.lang} content:`, e);
    }
  }

  // ===================== Mermaid Rendering =====================

  private scheduleRender(source: string): void {
    if (this.renderTimer) clearTimeout(this.renderTimer);
    this.renderTimer = setTimeout(() => this.doRender(source), 50);
  }

  private async doRender(source: string): Promise<void> {
    const mermaidApi = ChatCodeComponent.mermaidInstance;
    if (!mermaidApi) {
      this.renderError = 'Mermaid 实例未设置';
      this.cdr.detectChanges();
      return;
    }

    if (this.rendering) return;
    this.rendering = true;
    this.renderError = '';

    try {
      const id = `chat-mermaid-${++ChatCodeComponent.idCounter}`;

      const offscreen = document.createElement('div');
      offscreen.style.cssText = 'position:fixed;left:-9999px;top:-9999px;visibility:hidden;z-index:-1';
      document.body.appendChild(offscreen);

      let svg: string;
      try {
        const result = await mermaidApi.render(id, source, offscreen);
        svg = result.svg;
      } finally {
        offscreen.remove();
        document.getElementById(id)?.remove();
      }

      this.renderedSource = source;

      if (!this.diagramContainer) {
        this.cdr.detectChanges();
      }

      if (this.diagramContainer) {
        this.withScrollProtection(() => {
          this.diagramContainer!.nativeElement.innerHTML = svg;
          this.diagramReady = true;
          this.cdr.detectChanges();
        });
      }
    } catch (e: any) {
      this.renderError = `图表渲染失败：${e?.message || e}`;
      this.cdr.detectChanges();
    } finally {
      this.rendering = false;
    }
  }

  // ===================== Scroll Preservation =====================

  private withScrollProtection(fn: () => void): void {
    const snap = this.captureScrollableAncestors();
    fn();
    this.restoreScrollableAncestors(snap);
  }

  private captureScrollableAncestors(): Array<[Element, number, number]> {
    const positions: Array<[Element, number, number]> = [];
    let el: Element | null = this.hostRef.nativeElement;
    while (el) {
      if (el.scrollTop !== 0 || el.scrollLeft !== 0) {
        positions.push([el, el.scrollTop, el.scrollLeft]);
      }
      el = el.parentElement;
    }
    return positions;
  }

  private restoreScrollableAncestors(snapshot: Array<[Element, number, number]>): void {
    for (const [el, top, left] of snapshot) {
      el.scrollTop = top;
      el.scrollLeft = left;
    }
  }

  // ===================== Util =====================

  private stripHtmlEntities(html: string): string {
    if (typeof document === 'undefined') return html;
    const el = document.createElement('textarea');
    el.innerHTML = html;
    return el.value;
  }
}
