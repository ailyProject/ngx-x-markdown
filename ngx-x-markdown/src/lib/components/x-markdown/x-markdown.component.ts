import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  ViewContainerRef,
  ViewChild,
  AfterViewChecked,
  Type,
  Injector,
  createComponent,
  EnvironmentInjector,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MarkdownParser } from '../../core/parser';
import { MarkdownRenderer } from '../../core/renderer';
import {
  StreamCache,
  getInitialCache,
  processStreamingContent,
} from '../../services/streaming';
import type {
  XMarkdownConfig,
  StreamingOption,
  ComponentMap,
} from '../../interfaces';

@Component({
  selector: 'x-markdown',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="mergedCls"
         [style]="customStyle"
         #markdownContainer
         [innerHTML]="safeHtml">
    </div>
  `,
  styleUrls: ['./x-markdown.component.css'],
})
export class XMarkdownComponent implements OnChanges, AfterViewChecked {
  // ===================== Inputs =====================

  /** Markdown 内容 */
  @Input() content: string = '';

  /** 流式渲染配置 */
  @Input() streaming?: StreamingOption;

  /** Marked.js 扩展配置 */
  @Input() config?: XMarkdownConfig['config'];

  /** 自定义组件映射: { tagName: AngularComponentClass } */
  @Input() components?: ComponentMap;

  /** 段落标签名 */
  @Input() paragraphTag?: string;

  /** 根元素额外 CSS 类名 */
  @Input() rootClassName?: string;

  /** 根元素额外 CSS 类名 */
  @Input() className?: string;

  /** 内联样式 */
  @Input() customStyle?: { [key: string]: string };

  /** 是否在新标签页打开链接 */
  @Input() openLinksInNewTab?: boolean;

  /** DOMPurify 配置 */
  @Input() dompurifyConfig?: XMarkdownConfig['dompurifyConfig'];

  /** 保护自定义标签换行符 */
  @Input() protectCustomTagNewlines?: boolean;

  // ===================== View =====================

  @ViewChild('markdownContainer', { static: true }) containerRef!: ElementRef<HTMLElement>;

  // ===================== Internal State =====================

  safeHtml: SafeHtml = '';
  mergedCls: string = 'x-markdown';

  private parser!: MarkdownParser;
  private renderer!: MarkdownRenderer;
  private streamCache: StreamCache = getInitialCache();
  private displayContent: string = '';
  private needsComponentInjection = false;
  private injectedComponentRefs: Array<{ destroy: () => void }> = [];

  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);
  private viewContainerRef = inject(ViewContainerRef);
  private injector = inject(Injector);
  private envInjector = inject(EnvironmentInjector);

  // ===================== Lifecycle =====================

  ngOnChanges(changes: SimpleChanges): void {
    const needsParserRebuild =
      changes['config'] ||
      changes['paragraphTag'] ||
      changes['openLinksInNewTab'] ||
      changes['components'] ||
      changes['protectCustomTagNewlines'];

    const needsRendererRebuild =
      changes['components'] ||
      changes['dompurifyConfig'] ||
      changes['streaming'];

    if (needsParserRebuild || !this.parser) {
      this.parser = new MarkdownParser({
        markedConfig: this.config,
        paragraphTag: this.paragraphTag,
        openLinksInNewTab: this.openLinksInNewTab,
        components: this.components,
        protectCustomTagNewlines: this.protectCustomTagNewlines,
      });
    }

    if (needsRendererRebuild || !this.renderer) {
      this.renderer = new MarkdownRenderer({
        components: this.components,
        dompurifyConfig: this.dompurifyConfig,
        streaming: this.streaming,
      });
    }

    // Update class
    this.mergedCls = ['x-markdown', this.rootClassName, this.className]
      .filter(Boolean)
      .join(' ');

    // Process content
    this.processContent();
  }

  ngAfterViewChecked(): void {
    if (this.needsComponentInjection) {
      this.needsComponentInjection = false;
      this.injectDynamicComponents();
    }
  }

  // ===================== Content Processing =====================

  private processContent(): void {
    const rawContent = this.content || '';

    // Streaming processing
    const result = processStreamingContent(rawContent, this.streamCache, {
      streaming: this.streaming,
      components: this.components,
    });
    this.displayContent = result.output;
    this.streamCache = result.cache;

    if (!this.displayContent) {
      this.safeHtml = '';
      return;
    }

    // Parse markdown to HTML
    const htmlString = this.parser.parse(this.displayContent);

    // Render (sanitize + inject attributes)
    const cleanHtml = this.renderer.render(htmlString);

    // Bypass Angular sanitization since we already used DOMPurify
    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(cleanHtml);

    // Schedule dynamic component injection
    if (this.components && Object.keys(this.components).length > 0) {
      this.needsComponentInjection = true;
    }

    this.cdr.markForCheck();
  }

  // ===================== Dynamic Component Injection =====================

  /**
   * 在 DOM 渲染后，查找自定义标签并动态创建 Angular 组件
   */
  private injectDynamicComponents(): void {
    // 先销毁之前注入的组件
    this.destroyInjectedComponents();

    if (!this.components || !this.containerRef) return;

    const container = this.containerRef.nativeElement;

    for (const [tagName, componentClass] of Object.entries(this.components)) {
      if (!componentClass) continue;
      const elements = container.querySelectorAll(tagName);

      elements.forEach((element: Element) => {
        try {
          const componentRef = createComponent(componentClass as Type<any>, {
            environmentInjector: this.envInjector,
            elementInjector: this.injector,
          });

          // 传递属性
          const attrs = element.attributes;
          const instance = componentRef.instance;

          for (let i = 0; i < attrs.length; i++) {
            const attr = attrs[i];
            const propName = this.attrToProp(attr.name);
            if (propName in instance) {
              (instance as any)[propName] = attr.value;
            }
          }

          // 传递子内容 HTML
          if (element.innerHTML && 'children' in instance) {
            (instance as any).children = element.innerHTML;
          }

          // stream status
          const streamStatus = element.getAttribute('data-stream-status');
          if (streamStatus && 'streamStatus' in instance) {
            (instance as any).streamStatus = streamStatus;
          }

          // code 块的特殊属性
          if (tagName === 'code') {
            const block = element.getAttribute('data-block');
            const codeStreamStatus = element.getAttribute('data-state');
            const lang =
              element.getAttribute('data-lang') ||
              element.className?.match(/(?:^|\s)language-([^\s]+)/)?.[1] ||
              element.className?.match(/(?:^|\s)lang-([^\s]+)/)?.[1];

            if ('block' in instance) {
              (instance as any).block = block === 'true';
            }
            if ('streamStatus' in instance) {
              (instance as any).streamStatus = codeStreamStatus === 'loading' ? 'loading' : 'done';
            }
            if (lang && 'lang' in instance) {
              (instance as any).lang = lang;
            }
          }

          componentRef.changeDetectorRef.detectChanges();

          // 替换 DOM 节点
          const hostElement = componentRef.location.nativeElement;
          element.parentNode?.replaceChild(hostElement, element);

          this.injectedComponentRefs.push(componentRef);

          // 将 componentRef 附着到 ApplicationRef
          this.viewContainerRef.insert(componentRef.hostView);
        } catch (e) {
          console.warn(`[ngx-x-markdown] Failed to inject component for <${tagName}>:`, e);
        }
      });
    }
  }

  private destroyInjectedComponents(): void {
    for (const ref of this.injectedComponentRefs) {
      try {
        ref.destroy();
      } catch {
        // ignore
      }
    }
    this.injectedComponentRefs = [];
  }

  private attrToProp(attrName: string): string {
    // Convert kebab-case to camelCase
    return attrName.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
  }

  ngOnDestroy(): void {
    this.destroyInjectedComponents();
  }
}
