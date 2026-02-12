export const AI_CHAT_CONTENT = `## 👋 你好！我是 AI 助手

很高兴为你介绍 **ngx-x-markdown** —— 一个支持流式渲染的 Angular Markdown 组件。

### ✨ 核心特性

1. **流式渲染** — 支持逐字符输出，完美适配 AI/LLM 聊天场景
2. **智能缓存** — 自动处理未完成的 Markdown 语法，确保渲染结果始终正确
3. **自定义组件** — 可将任意 HTML 标签映射为 Angular 组件
4. **主题支持** — 内置亮色/暗色主题，一行代码切换
5. **LaTeX 公式** — 基于 KaTeX 的数学公式渲染

### 📝 使用方法

只需三步即可开始：

\`\`\`typescript
import { XMarkdownComponent } from 'ngx-x-markdown';

@Component({
  imports: [XMarkdownComponent],
  template: \`
    <x-markdown
      [content]="aiResponse"
      [streaming]="{ hasNextChunk: true, enableAnimation: true }"
      rootClassName="x-markdown-light" />
  \`
})
export class ChatComponent {
  aiResponse = '';
}
\`\`\`

### 🎯 适用场景

| 场景 | 说明 |
|------|------|
| AI 聊天 | 流式输出 + 动画效果 |
| 文档预览 | 实时 Markdown 渲染 |
| 技术博客 | 代码高亮 + 数学公式 |
| 在线编辑器 | 实时预览 |

> 💡 **提示**：流式渲染会智能处理不完整的 Markdown 语法，比如未关闭的代码块或加粗标记，确保任意时刻渲染结果都是正确的。

希望这对你有帮助！如有问题请随时提问 😊`;
