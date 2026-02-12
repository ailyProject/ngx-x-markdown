export const MERMAID_CONTENT = `# Mermaid 图表渲染

ngx-x-markdown 支持通过 Mermaid 插件渲染各种图表。

## 流程图

\`\`\`mermaid
graph TD
    A[用户请求] --> B{是否已认证?}
    B -->|是| C[加载数据]
    B -->|否| D[跳转登录]
    C --> E[渲染页面]
    D --> F[输入凭证]
    F --> G{验证通过?}
    G -->|是| C
    G -->|否| H[显示错误]
    H --> F
\`\`\`

## 时序图

\`\`\`mermaid
sequenceDiagram
    participant U as 👤 用户
    participant F as 🖥️ 前端
    participant A as ⚙️ API 网关
    participant S as 🤖 AI 服务

    U->>F: 发送消息
    F->>A: POST /api/chat
    A->>S: 转发请求
    S-->>A: SSE 流式响应
    A-->>F: 逐块返回
    F-->>U: 流式渲染 Markdown
    Note over F,U: 使用 ngx-x-markdown 实时渲染
\`\`\`

## 类图

\`\`\`mermaid
classDiagram
    class XMarkdownComponent {
        +string content
        +StreamingOption streaming
        +ComponentMap components
        +ngOnChanges()
        -processContent()
        -injectDynamicComponents()
    }
    class MarkdownParser {
        +parse(content) string
        -configureLinkRenderer()
        -configureCodeRenderer()
    }
    class MarkdownRenderer {
        +render(html) string
        -configureDOMPurify()
        -detectUnclosedTags()
    }
    XMarkdownComponent --> MarkdownParser
    XMarkdownComponent --> MarkdownRenderer
\`\`\`

## 状态图

\`\`\`mermaid
stateDiagram-v2
    [*] --> 空闲
    空闲 --> 流式输出中: 开始输出
    流式输出中 --> 流式输出中: 接收 chunk
    流式输出中 --> 渲染完成: hasNextChunk=false
    渲染完成 --> 空闲: 重置
    渲染完成 --> [*]
\`\`\`

## 饼图

\`\`\`mermaid
pie title ngx-x-markdown 核心模块
    "Parser (解析)" : 30
    "Renderer (渲染)" : 25
    "Streaming (流式)" : 25
    "Plugins (插件)" : 10
    "Themes (主题)" : 10
\`\`\`

> 💡 **提示**：Mermaid 图表支持流式渲染——当图表代码块尚未完整时，会在完成后自动渲染。
`;
