import type { TokenizerAndRendererExtension } from 'marked';

export type MermaidOption = {
  /**
   * 传入 mermaid 实例（来自 `import mermaid from 'mermaid'`）。
   * 由用户端传入，避免库强依赖 mermaid 包。
   */
  mermaidInstance?: any;

  /**
   * mermaid.initialize() 配置
   * @see https://mermaid.js.org/config/setup/modules/mermaidAPI.html#mermaidapi-configuration-defaults
   */
  mermaidConfig?: Record<string, any>;

  /**
   * 自定义容器的 CSS 类名
   * @default 'x-markdown-mermaid'
   */
  containerClassName?: string;
};

const fencedCodeRule = /^(`{3,})mermaid\s*\n([\s\S]*?)\n\1(?:\n|$)/;

type MermaidToken = {
  type: string;
  raw: string;
  text: string;
};

/**
 * Mermaid 插件 —— 将 ```mermaid 代码块转换为 Mermaid 可渲染的 HTML。
 *
 * 工作原理：
 * 1. 通过 marked 的 tokenizer 拦截 ```mermaid 代码块
 * 2. 渲染为 `<pre class="mermaid">` 元素（Mermaid 的标准 DOM 约定）
 * 3. 用户在 Angular 组件中调用 `mermaid.run()` 完成实际图表渲染
 *
 * 使用方式：
 * ```typescript
 * import mermaid from 'mermaid';
 * import { Mermaid } from 'ngx-x-markdown';
 *
 * config = { extensions: Mermaid({ mermaidInstance: mermaid }) };
 * ```
 */
export const Mermaid = (options?: MermaidOption): TokenizerAndRendererExtension[] => {
  const {
    mermaidInstance,
    mermaidConfig,
    containerClassName = 'x-markdown-mermaid',
  } = options || {};

  // 如果传入了 mermaid 实例，进行初始化
  if (mermaidInstance) {
    mermaidInstance.initialize({
      startOnLoad: false,
      ...mermaidConfig,
    });
  }

  const blockMermaid: TokenizerAndRendererExtension = {
    name: 'mermaid',
    level: 'block' as const,
    start(src: string) {
      const index = src.indexOf('```mermaid');
      return index !== -1 ? index : undefined;
    },
    tokenizer(src: string): MermaidToken | undefined {
      const match = src.match(fencedCodeRule);
      if (match) {
        return {
          type: 'mermaid',
          raw: match[0],
          text: match[2].trim(),
        };
      }
      return undefined;
    },
    renderer(token: Record<string, string>): string {
      // 输出 Mermaid 标准格式的 <pre class="mermaid">
      // mermaid.run() 会自动查找并渲染这些元素
      const text = token['text'] || '';
      const escapedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<div class="${containerClassName}"><pre class="mermaid">${escapedText}</pre></div>\n`;
    },
  };

  return [blockMermaid];
};

/**
 * 在 DOM 渲染后调用，触发 mermaid 渲染指定容器内的图表。
 *
 * @param mermaidInstance - mermaid 实例
 * @param container - 包含 mermaid 元素的 DOM 容器，不传则全局渲染
 */
export async function renderMermaidDiagrams(
  mermaidInstance: any,
  container?: HTMLElement,
): Promise<void> {
  if (!mermaidInstance) {
    console.warn('[ngx-x-markdown] mermaid instance is required for rendering.');
    return;
  }

  const nodes = container
    ? container.querySelectorAll('pre.mermaid:not([data-processed])')
    : document.querySelectorAll('pre.mermaid:not([data-processed])');

  if (nodes.length === 0) return;

  try {
    await mermaidInstance.run({ nodes });
  } catch (e) {
    console.warn('[ngx-x-markdown] Mermaid rendering error:', e);
  }
}

export default Mermaid;
