export const CHAT_COMPONENTS_CONTENT = `# 🧩 自定义组件渲染

ngx-x-markdown 支持通过自定义代码块渲染丰富的 UI 组件。以下展示所有可用的自定义组件类型。


## 库依赖

需要安装以下库：
- \`@aily-project/lib-r4-wifis3\` - WiFi连接
- \`@aily-project/lib-openweathermap\` - 天气数据
- \`@aily-project/lib-u8g2\` - SSD1306显示

## 状态提示 (aily-state)

支持 doing / done / warn / error / info 五种状态，并可带进度条：

\`\`\`aily-state
{"state":"doing","text":"正在查询开发板文档"}
\`\`\`

\`\`\`aily-state
{"state":"done","text":"开发板文档查阅完成"}
\`\`\`

\`\`\`aily-state
{"state":"warn","text":"没有找到相关的开发板文档"}
\`\`\`

\`\`\`aily-state
{"state":"error","text":"发生错误，请稍后再试"}
\`\`\`

\`\`\`aily-state
{"state":"info","text":"这是一条普通信息提示"}
\`\`\`

\`\`\`aily-state
{"state":"doing","text":"正在编译代码","progress":65}
\`\`\`

## 按钮组 (aily-button)

支持 primary / default / dashed / link / text 类型：

\`\`\`aily-button
[{"text":"创建项目","action":"create_project","type":"primary"},{"text":"补充说明","action":"more_info","type":"default"},{"text":"查看文档","action":"view_docs","type":"link","icon":"file-text"},{"text":"删除","action":"delete","type":"dashed","disabled":true}]
\`\`\`

## 开发板查看器 (aily-board)

展示硬件开发板的详细信息卡片：

\`\`\`aily-board
{"name":"@aily-project/board-jinniu_board","nickname":"金牛创翼板","version":"0.0.1","description":"金牛创翼板是一款集成多种常用传感器的开发板，包括电机、WS2812灯、LED灯、超声波、DHT11、自锁和按键开关、电位器、无源蜂鸣器和电机驱动","author":"","brand":"OpenJumper","disabled":false}
\`\`\`

## 扩展库查看器 (aily-library)

展示扩展库的详细信息和标签：

\`\`\`aily-library
{"name":"@aily-project/lib-servo360","nickname":"360舵机驱动","version":"1.0.0","description":"360舵机控制支持库，支持Arduino UNO、MEGA、ESP32等开发板","author":"aily Project","keywords":["aily","blockly","servo","执行器"],"tested":true}
\`\`\`

\`\`\`aily-library
{"name":"@aily-project/lib-sht3x","nickname":"SHT3x温湿度传感器库","version":"0.0.1","description":"支持Arduino SHT30、SHT31和SHT35温湿度传感器的控制库","author":"Danil","keywords":["aily","blockly","sht3x","温湿度传感器"],"tested":false}
\`\`\`

## 思考过程 (aily-think)

展示 AI 的思考链，支持折叠/展开：

\`\`\`aily-think
{"content":"首先，我需要分析用户的需求。用户想要控制一个LED灯，这需要用到数字输出功能。\\n\\n接下来，我需要确定使用哪个引脚。Arduino Uno上的引脚13有内置LED，可以直接使用。\\n\\n最后，我需要编写相应的代码来实现闪烁效果。","isComplete":true}
\`\`\`

## Mermaid 图表 (aily-mermaid)

通过 JSON 封装的 Mermaid 图表：

\`\`\`aily-mermaid
{"code":"graph TD\\n    A[开始] --> B{是否已安装驱动?}\\n    B -->|是| C[连接开发板]\\n    B -->|否| D[安装驱动]\\n    D --> C\\n    C --> E[选择串口]\\n    E --> F[上传代码]\\n    F --> G[完成]"}
\`\`\`

\`\`\`aily-mermaid
{"code":"sequenceDiagram\\n    participant U as 用户\\n    participant A as 应用\\n    participant B as 开发板\\n    U->>A: 点击上传\\n    A->>B: 发送代码\\n    B-->>A: 返回状态\\n    A-->>U: 显示结果"}
\`\`\`

## 上下文查看器 (aily-context)

展示代码上下文片段：

\`\`\`aily-context
{"label":"main.ino:15-28","content":"void setup() {\\n  Serial.begin(9600);\\n  pinMode(LED_BUILTIN, OUTPUT);\\n}\\n\\nvoid loop() {\\n  digitalWrite(LED_BUILTIN, HIGH);\\n  delay(1000);\\n  digitalWrite(LED_BUILTIN, LOW);\\n  delay(1000);\\n}","encoded":false}
\`\`\`

## 积木代码查看器 (aily-blockly)

展示 Blockly 积木块和对应代码：

\`\`\`aily-blockly
{"title":"LED闪烁程序","code":"void setup() {\\n  pinMode(13, OUTPUT);\\n}\\n\\nvoid loop() {\\n  digitalWrite(13, HIGH);\\n  delay(500);\\n  digitalWrite(13, LOW);\\n  delay(500);\\n}","blocks":[{"type":"setup_block","id":"setup1"},{"type":"pin_mode","id":"pm1","pin":13,"mode":"OUTPUT"},{"type":"loop_block","id":"loop1"},{"type":"digital_write","id":"dw1","pin":13,"value":"HIGH"},{"type":"delay","id":"d1","time":500}]}
\`\`\`

## 错误查看器 (aily-error)

展示格式化的错误信息：

\`\`\`aily-error
{"error":{"status":500,"message":"无法连接到编译服务器，请检查网络连接"},"timestamp":"2025-02-13T10:30:00.000Z","severity":"error","metadata":{"retryCount":3,"lastAttempt":"2025-02-13T10:29:55.000Z"}}
\`\`\`

## 任务操作查看器 (aily-task-action)

展示任务执行状态和操作提示：

\`\`\`aily-task-action
{"actionType":"max_messages","message":"已达到最大消息数限制（10条），您可以选择继续对话或开始新会话。","metadata":{"maxMessages":10,"currentMessages":10}}
\`\`\`

---

## 混合内容

以上组件可以和普通 Markdown 自由混排：

Arduino Uno上每一个带有数字编号的引脚，都是数字引脚，包括写有"A"编号的模拟输入引脚。

\`\`\`aily-state
{"state":"doing","text":"正在查询开发板文档"}
\`\`\`

\`\`\`aily-state
{"state":"done","text":"开发板文档查阅完成"}
\`\`\`

\`\`\`c
pinMode(pin, mode);
\`\`\`

参数pin为指定配置的引脚编号；参数mode为指定的配置模式。

| 模式宏名称 | 说明 |
| ----- | --- |
| INPUT | 输入模式 |
| OUTPUT | 输出模式 |
| INPUT_PULLUP | 输入上拉模式 |

\`\`\`aily-button
[{"text":"查看更多引脚说明","action":"view_more_pins","type":"primary"},{"text":"开始编程","action":"start_coding","type":"default"}]
\`\`\`

> 💡 **提示**：所有自定义组件均支持流式渲染 — 当代码块尚未完整时显示加载状态，完成后自动渲染最终效果。
`;
