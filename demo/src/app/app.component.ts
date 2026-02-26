import { Component, OnDestroy, OnInit, signal, computed, ChangeDetectorRef, inject } from '@angular/core';
import { XMarkdownComponent, MermaidCodeComponent, MERMAID_DARK_THEME } from 'ngx-x-markdown';
import type { StreamingOption, ComponentMap } from 'ngx-x-markdown';
import mermaid from 'mermaid';
import { ChatCodeComponent } from './components/chat-code.component';
import {
  AI_CHAT_CONTENT,
  TECH_DOC_CONTENT,
  CODE_TUTORIAL_CONTENT,
  MERMAID_CONTENT,
  IMAGE_CONTENT,
  CHAT_COMPONENTS_CONTENT,
} from './demo-contents';

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
  private cdr = inject(ChangeDetectorRef);

  // ========== Predefined demo contents ==========
  readonly demoContents: { label: string; value: string }[] = [
    { label: '🤖 AI 对话', value: AI_CHAT_CONTENT },
    { label: '📊 技术文档', value: TECH_DOC_CONTENT },
    { label: '💻 代码讲解', value: CODE_TUTORIAL_CONTENT },
    { label: '📈 Mermaid 图表', value: MERMAID_CONTENT },
    { label: '🖼️ 图片渲染', value: IMAGE_CONTENT },
    { label: '🧩 自定义组件', value: CHAT_COMPONENTS_CONTENT },
  ];

  /** Mermaid 自定义组件映射 */
  mermaidComponentMap: ComponentMap = { code: MermaidCodeComponent };

  /** 聊天组件映射（包含所有 aily-* 自定义代码块） */
  chatComponentMap: ComponentMap = { code: ChatCodeComponent };

  /** 当前是否为 Mermaid demo */
  isMermaidDemo = computed(() => this.selectedDemo() === 3);

  /** 当前是否为自定义组件 demo */
  isChatDemo = computed(() => this.selectedDemo() === 5);

  /** 根据当前 demo 返回自定义组件映射 */
  currentComponentMap = computed(() => {
    if (this.isChatDemo()) return this.chatComponentMap;
    if (this.isMermaidDemo()) return this.mermaidComponentMap;
    return undefined;
  });

  selectedDemo = signal(0);

  readonly speedMap: Record<string, number> = { slow: 80, normal: 30, fast: 8 };

  // ========== Actions ==========

  toggleTheme(): void {
    const next = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(next);
    document.body.classList.toggle('dark-mode', next === 'dark');

    // 更新 Mermaid 主题并触发重新渲染
    const config = next === 'dark' ? MERMAID_DARK_THEME : { theme: 'default' };
    MermaidCodeComponent.setMermaidInstance(mermaid, config);
    ChatCodeComponent.setMermaidInstance(mermaid, config);

    const content = this.streamContent();
    if (content) {
      this.streamContent.set('');
      this.cdr.detectChanges();
      queueMicrotask(() => {
        this.streamContent.set(content);
        this.cdr.detectChanges();
      });
    }
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

  /** 非流式直接追加当前 demo 的完整内容 */
  appendContent(): void {
    const current = this.streamContent();
    const toAppend = this.getCurrentFullContent();
    const separator = current && !current.endsWith('\n') ? '\n\n' : '';
    this.streamContent.set(current + separator + toAppend);
    this.streamingConfig.set({ ...this.streamingConfig(), hasNextChunk: false });
  }

  /** 流式追加当前 demo 的内容（在已有内容后逐字追加） */
  appendStreamingContent(): void {
    const current = this.streamContent();
    const toAppend = this.getCurrentFullContent();
    const separator = current && !current.endsWith('\n') ? '\n\n' : '';
    const fullContent = current + separator + toAppend;
    this.charIndex = current.length + separator.length;
    this.isStreaming.set(true);
    this.streamingConfig.set({ ...this.streamingConfig(), hasNextChunk: true });
    this.runStream(fullContent);
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
    // 全局初始化 mermaid 实例，根据当前主题选择配置
    const config = this.theme() === 'dark' ? MERMAID_DARK_THEME : { theme: 'default' };
    MermaidCodeComponent.setMermaidInstance(mermaid, config);
    ChatCodeComponent.setMermaidInstance(mermaid, config);
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

