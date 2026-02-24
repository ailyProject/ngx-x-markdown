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
  OnDestroy,
  Type,
  Injector,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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

/**
 * 已注入的动态组件的追踪记录
 * 通过 fingerprint 来判断是否可以复用，避免销毁/重建导致的闪烁
 */
interface InjectedEntry {
  /** 用于判断是否可复用的指纹（tagName + 关键属性 + 内容摘要） */
  fingerprint: string;
  /** Angular ComponentRef */
  componentRef: ComponentRef<any>;
  /** 组件宿主 DOM 元素 */
  hostElement: HTMLElement;
  /** 上次注入时所用的标签名 */
  tagName: string;
}

@Component({
  selector: 'x-markdown',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="mergedCls"
         [style]="customStyle"
         #markdownContainer>
    </div>
  `,
  styleUrls: ['./x-markdown.component.css'],
})
export class XMarkdownComponent implements OnChanges, OnDestroy {
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

  mergedCls: string = 'x-markdown';

  private parser!: MarkdownParser;
  private renderer!: MarkdownRenderer;
  private streamCache: StreamCache = getInitialCache();
  private displayContent: string = '';

  /**
   * 已注入的动态组件列表，按 fingerprint 索引以支持复用
   */
  private injectedEntries: InjectedEntry[] = [];

  /**
   * 上一次渲染的 sanitized HTML，用于判断 DOM 是否需要更新
   */
  private lastRenderedHtml: string = '';

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

    // 在所有 DOM 操作前保存滚动位置
    const container = this.containerRef?.nativeElement;
    const scrollSnapshot = container
      ? this.captureAncestorScrollPositions(container)
      : null;

    if (!this.displayContent) {
      this.updateDom('');
      this.injectDynamicComponents();
      if (scrollSnapshot) this.restoreAncestorScrollPositions(scrollSnapshot);
      return;
    }

    // Parse markdown to HTML
    const htmlString = this.parser.parse(this.displayContent);

    // Render (sanitize + inject attributes)
    const cleanHtml = this.renderer.render(htmlString);

    // 更新 DOM + 注入动态组件
    this.updateDom(cleanHtml);
    this.injectDynamicComponents();

    // 在所有 DOM 操作完成后恢复滚动位置（此时组件 SVG 已回到 DOM，内容高度已恢复）
    if (scrollSnapshot) this.restoreAncestorScrollPositions(scrollSnapshot);

    this.cdr.markForCheck();
  }

  // ===================== Incremental DOM Update =====================

  /**
   * 增量更新 DOM：比较新旧 HTML 对应的顶层子节点，仅替换发生变化的尾部。
   * 稳定的前缀节点（及其内部已注入的动态组件）保持不动，避免全量 innerHTML 重建。
   */
  private updateDom(newHtml: string): void {
    const container = this.containerRef?.nativeElement;
    if (!container) return;

    // 如果 HTML 没有变化，跳过 DOM 操作
    if (newHtml === this.lastRenderedHtml) return;
    this.lastRenderedHtml = newHtml;

    // 将新 HTML 解析到临时容器
    const temp = document.createElement('div');
    temp.innerHTML = newHtml;

    // --- 判断哪些顶层子节点是"稳定的"（无需更新） ---

    // 找出包含已注入组件宿主的顶层节点索引
    const injectedTopIndices = new Set<number>();
    for (const entry of this.injectedEntries) {
      for (let i = 0; i < container.childNodes.length; i++) {
        const child = container.childNodes[i];
        if (child === entry.hostElement ||
            (child instanceof Element && child.contains(entry.hostElement))) {
          injectedTopIndices.add(i);
          break;
        }
      }
    }

    // 逐个比较顶层子节点，找到第一个不匹配的位置
    // 已注入组件的位置视为"稳定"（跳过比较），避免组件被反复摘除/重插导致闪烁
    let stableCount = 0;
    const maxCompare = Math.min(container.childNodes.length, temp.childNodes.length);
    while (stableCount < maxCompare) {
      if (injectedTopIndices.has(stableCount)) {
        // 此位置有已注入的 Angular 组件，视为稳定，不替换
        stableCount++;
        continue;
      }
      if (container.childNodes[stableCount].isEqualNode(temp.childNodes[stableCount])) {
        stableCount++;
      } else {
        break;
      }
    }

    // --- 从 temp 提取所有自定义组件元素的最新 props（供稳定区域组件更新用） ---
    this._tempPropsMap = new Map<string, Record<string, any>>();
    if (this.components) {
      for (const [tagName] of Object.entries(this.components)) {
        const selector = this.getComponentSelector(tagName);
        const elements = temp.querySelectorAll(selector);
        elements.forEach((el: Element, idx: number) => {
          const fp = this.getElementFingerprint(tagName, el, idx);
          const props = this.extractElementProps(tagName, el);
          this._tempPropsMap!.set(fp, props);
        });
      }
    }

    // --- 分离注入组件：稳定区域的保留，变化区域的摘出供后续复用 ---

    const stableEntries: InjectedEntry[] = [];
    const detachedMap = new Map<string, InjectedEntry[]>();

    for (const entry of this.injectedEntries) {
      let inStable = false;
      for (let i = 0; i < stableCount; i++) {
        const child = container.childNodes[i];
        if (child === entry.hostElement ||
            (child instanceof Element && child.contains(entry.hostElement))) {
          inStable = true;
          break;
        }
      }
      if (inStable) {
        stableEntries.push(entry);
      } else {
        // 从 DOM 中摘出但不销毁
        if (entry.hostElement.parentNode) {
          entry.hostElement.parentNode.removeChild(entry.hostElement);
        }
        const list = detachedMap.get(entry.fingerprint) || [];
        list.push(entry);
        detachedMap.set(entry.fingerprint, list);
      }
    }

    this.injectedEntries = stableEntries;
    this._pendingDetachedMap = detachedMap;

    // --- 仅替换变化的尾部 ---

    // 移除 stableCount 之后的旧节点
    while (container.childNodes.length > stableCount) {
      container.removeChild(container.lastChild!);
    }

    // 从 temp 移入 stableCount 之后的新节点
    while (temp.childNodes.length > stableCount) {
      container.appendChild(temp.childNodes[stableCount]);
    }
  }

  /** 暂存的待复用组件映射 */
  private _pendingDetachedMap: Map<string, InjectedEntry[]> | null = null;

  /** 暂存的 temp DOM 自定义组件 props 映射（供稳定区域组件更新） */
  private _tempPropsMap: Map<string, Record<string, any>> | null = null;

  // ===================== Dynamic Component Injection =====================

  /**
   * 获取自定义组件的 DOM 选择器。
   * 对于 code：仅选择块级代码（data-block="true"），行内代码保留原始 HTML 渲染。
   */
  private getComponentSelector(tagName: string): string {
    if (tagName === 'code') {
      return 'code[data-block="true"]';
    }
    return tagName;
  }

  /**
   * 为一个 DOM 元素生成 fingerprint，用于跨渲染周期的组件复用匹配
   * 对于 code 块：tagName + lang + block
   * 对于其他自定义标签：tagName + 属性签名
   */
  private getElementFingerprint(tagName: string, element: Element, index?: number): string {
    if (tagName === 'code') {
      const lang = element.getAttribute('data-lang') ||
        element.className?.match(/(?:^|\s)language-([^\s]+)/)?.[1] || '';
      const block = element.getAttribute('data-block') || 'false';
      // 加入位置索引避免同类代码块指纹碰撞
      return `code::${lang}::${block}::${index ?? 0}`;
    }

    // 对于其他自定义标签，使用标签名 + 排序后的属性作为指纹
    const attrs: string[] = [];
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      // 排除易变的属性
      if (attr.name !== 'data-stream-status') {
        attrs.push(`${attr.name}=${attr.value}`);
      }
    }
    attrs.sort();
    return `${tagName}::${attrs.join('|')}`;
  }

  /**
   * 提取元素的 props（属性 + children + 特殊处理）
   */
  private extractElementProps(tagName: string, element: Element): Record<string, any> {
    const props: Record<string, any> = {};

    // 基础属性
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      const propName = this.attrToProp(attr.name);
      props[propName] = attr.value;
    }

    // 子内容
    props['children'] = element.innerHTML || '';

    // stream status
    const streamStatus = element.getAttribute('data-stream-status');
    if (streamStatus) {
      props['streamStatus'] = streamStatus;
    }

    // code 块的特殊属性
    if (tagName === 'code') {
      const block = element.getAttribute('data-block');
      const codeStreamStatus = element.getAttribute('data-state');
      const lang =
        element.getAttribute('data-lang') ||
        element.className?.match(/(?:^|\s)language-([^\s]+)/)?.[1] ||
        element.className?.match(/(?:^|\s)lang-([^\s]+)/)?.[1];

      props['block'] = block === 'true';
      props['streamStatus'] = codeStreamStatus === 'loading' ? 'loading' : 'done';
      if (lang) {
        props['lang'] = lang;
      }
    }

    return props;
  }

  /**
   * 在 DOM 渲染后，查找自定义标签并创建/复用 Angular 组件
   * 关键改进：通过 fingerprint 匹配实现组件复用，避免闪烁
   */
  private injectDynamicComponents(): void {
    const container = this.containerRef?.nativeElement;
    if (!container) return;

    const detachedMap = this._pendingDetachedMap || new Map<string, InjectedEntry[]>();
    this._pendingDetachedMap = null;

    // --- 更新稳定区域已有组件的 props（如 streamStatus 从 loading → done） ---
    const tempPropsMap = this._tempPropsMap;
    this._tempPropsMap = null;
    if (tempPropsMap) {
      for (const entry of this.injectedEntries) {
        const newProps = tempPropsMap.get(entry.fingerprint);
        if (newProps) {
          this.updateComponentProps(entry.componentRef, newProps);
          entry.componentRef.changeDetectorRef.detectChanges();
        }
      }
    }

    // 如果没有 components 配置，销毁所有已摘出的组件并返回
    if (!this.components || Object.keys(this.components).length === 0) {
      for (const [, entries] of detachedMap) {
        for (const entry of entries) {
          try { entry.componentRef.destroy(); } catch { /* ignore */ }
        }
      }
      // 同时销毁留在稳定区域的旧组件（components 配置已清除）
      this.destroyInjectedComponents();
      return;
    }

    const newEntries: InjectedEntry[] = [];
    const reusedFingerprints = new Set<InjectedEntry>();

    // 计算每个 tagName 的稳定组件数量，作为新组件的索引偏移（避免指纹碰撞）
    const stableCountByTag = new Map<string, number>();
    for (const entry of this.injectedEntries) {
      stableCountByTag.set(entry.tagName, (stableCountByTag.get(entry.tagName) || 0) + 1);
    }

    for (const [tagName, componentClass] of Object.entries(this.components)) {
      if (!componentClass) continue;
      const selector = this.getComponentSelector(tagName);
      const elements = container.querySelectorAll(selector);
      const indexOffset = stableCountByTag.get(tagName) || 0;

      elements.forEach((element: Element, index: number) => {
        const fingerprint = this.getElementFingerprint(tagName, element, indexOffset + index);
        const props = this.extractElementProps(tagName, element);

        // 尝试从 detachedMap 中复用
        const detachedList = detachedMap.get(fingerprint);
        const reusable = detachedList?.shift();

        if (reusable) {
          // ====== 复用已有组件 ======
          reusedFingerprints.add(reusable);

          // 通过 setInput 更新 props，确保 ngOnChanges 正确触发
          this.updateComponentProps(reusable.componentRef, props);
          reusable.componentRef.changeDetectorRef.detectChanges();

          // 将已有的宿主元素放回新位置
          element.parentNode?.replaceChild(reusable.hostElement, element);
          newEntries.push(reusable);
        } else {
          // ====== 创建新组件 ======
          try {
            const componentRef = createComponent(componentClass as Type<any>, {
              environmentInjector: this.envInjector,
              elementInjector: this.injector,
            });

            this.updateComponentProps(componentRef, props);
            componentRef.changeDetectorRef.detectChanges();

            const hostElement = componentRef.location.nativeElement;
            element.parentNode?.replaceChild(hostElement, element);

            this.viewContainerRef.insert(componentRef.hostView);

            newEntries.push({
              fingerprint,
              componentRef,
              hostElement,
              tagName,
            });
          } catch (e) {
            console.warn(`[ngx-x-markdown] Failed to inject component for <${tagName}>:`, e);
          }
        }
      });
    }

    // 销毁未被复用的旧组件
    for (const [, entries] of detachedMap) {
      for (const entry of entries) {
        if (!reusedFingerprints.has(entry)) {
          try {
            entry.componentRef.destroy();
          } catch {
            // ignore
          }
        }
      }
    }

    // 保留稳定区域已有的组件，加上本轮新注入的组件
    this.injectedEntries = [...this.injectedEntries, ...newEntries];
  }

  /**
   * 通过 ComponentRef.setInput() 更新组件属性。
   * 先比较值是否变化，避免不必要的 setInput 调用触发 ngOnChanges。
   * 对于非 @Input 属性，回退到直接赋值。
   */
  private updateComponentProps(componentRef: ComponentRef<any>, props: Record<string, any>): void {
    const instance = componentRef.instance;
    for (const [key, value] of Object.entries(props)) {
      try {
        // 值未变则跳过，避免不必要地触发 ngOnChanges
        if (Object.is(instance[key], value)) continue;
        componentRef.setInput(key, value);
      } catch {
        // setInput 对非 @Input 属性会抛出异常，回退到直接赋值
        if (key in instance && !Object.is(instance[key], value)) {
          instance[key] = value;
        }
      }
    }
  }

  private destroyInjectedComponents(): void {
    for (const entry of this.injectedEntries) {
      try {
        entry.componentRef.destroy();
      } catch {
        // ignore
      }
    }
    this.injectedEntries = [];
  }

  // ===================== Scroll Preservation =====================

  /**
   * 遍历祖先链，记录所有有滚动偏移的元素的滚动位置
   */
  private captureAncestorScrollPositions(startEl: Element): Array<[Element, number, number]> {
    const positions: Array<[Element, number, number]> = [];
    let el: Element | null = startEl;
    while (el) {
      if (el.scrollTop !== 0 || el.scrollLeft !== 0) {
        positions.push([el, el.scrollTop, el.scrollLeft]);
      }
      el = el.parentElement;
    }
    return positions;
  }

  /**
   * 恢复之前保存的滚动位置
   */
  private restoreAncestorScrollPositions(snapshot: Array<[Element, number, number]>): void {
    for (const [el, top, left] of snapshot) {
      el.scrollTop = top;
      el.scrollLeft = left;
    }
  }

  private attrToProp(attrName: string): string {
    // Convert kebab-case to camelCase
    return attrName.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
  }

  ngOnDestroy(): void {
    this.destroyInjectedComponents();
  }
}
