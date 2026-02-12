export const IMAGE_CONTENT = `# 🖼️ 图片渲染示例

ngx-x-markdown 完整支持 Markdown 图片语法，包括行内图片、带标题图片等多种格式。

## 基本图片

使用标准 Markdown 语法插入图片：

![Mountain Landscape](https://picsum.photos/seed/mountain/800/400)

## 带标题的图片

图片可以附带标题文本（鼠标悬停可见）：

![Ocean View](https://picsum.photos/seed/ocean/800/400 "美丽的海景")

## 图文混排

在段落中嵌入行内图片可以丰富内容表现力。图片天然支持与周围文本混排：

以下是一些技术架构中常见的图标示例，在实际项目文档中经常需要使用小尺寸图片 ![icon](https://picsum.photos/seed/icon1/20/20) 来增强可读性。

## 图片列表

使用列表组织多张图片：

- **自然风光**
  ![Nature](https://picsum.photos/seed/nature/600/300)

- **城市建筑**
  ![City](https://picsum.photos/seed/city/600/300)

- **抽象艺术**
  ![Abstract](https://picsum.photos/seed/abstract/600/300)

## 图片表格

在表格中展示图片非常适合做对比：

| 类别 | 预览 | 说明 |
|------|------|------|
| 风景 | ![landscape](https://picsum.photos/seed/land/150/100) | 自然风景照片 |
| 动物 | ![animals](https://picsum.photos/seed/animal/150/100) | 野生动物摄影 |
| 美食 | ![food](https://picsum.photos/seed/food/150/100) | 美食摄影 |

## 图片链接

图片也可以作为链接的内容，点击图片跳转到目标页面：

[![GitHub](https://picsum.photos/seed/github/800/200)](https://github.com)

## 在代码中使用

\`\`\`html
<!-- 基本图片 -->
![描述文字](图片地址)

<!-- 带标题的图片 -->
![描述文字](图片地址 "悬停标题")

<!-- 图片链接 -->
[![描述文字](图片地址)](链接地址)
\`\`\`

> 💡 **提示**：在流式渲染模式下，图片会在 URL 解析完成后自动加载，不会因为后续内容未完成而影响已识别图片的展示。
`;
