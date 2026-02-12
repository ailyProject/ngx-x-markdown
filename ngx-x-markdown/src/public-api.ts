// Components
export { XMarkdownComponent } from './lib/components/x-markdown/x-markdown.component';
export { AnimationTextComponent } from './lib/components/animation-text/animation-text.component';

// Core
export { MarkdownParser } from './lib/core/parser';
export { MarkdownRenderer } from './lib/core/renderer';

// Services / Streaming
export {
  processStreamingContent,
  getInitialCache,
  commitCache,
  isInCodeBlock,
} from './lib/services/streaming';
export type { StreamCache } from './lib/services/streaming';

// Interfaces
export type {
  XMarkdownConfig,
  StreamingOption,
  StreamStatus,
  ComponentMap,
  AnimationConfig,
  Token,
  Tokens,
} from './lib/interfaces';
export { StreamCacheTokenType } from './lib/interfaces';

// Plugins
export { Latex } from './lib/plugins';
export type { LatexOption } from './lib/plugins';
export { Mermaid, renderMermaidDiagrams } from './lib/plugins';
export type { MermaidOption } from './lib/plugins';
