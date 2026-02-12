import { Component } from '@angular/core';
import { XMarkdownComponent } from 'ngx-x-markdown';
import { Latex } from 'ngx-x-markdown';

/**
 * 示例 4：LaTeX 数学公式 + Marked 扩展
 */
@Component({
  selector: 'app-latex-example',
  standalone: true,
  imports: [XMarkdownComponent],
  template: `
    <h2>LaTeX 数学公式</h2>
    <x-markdown
      [content]="markdownContent"
      [config]="markedConfig"
      rootClassName="x-markdown-light">
    </x-markdown>
  `,
})
export class LatexExampleComponent {
  // 使用 Latex 插件扩展 Marked
  markedConfig = {
    extensions: Latex({ replaceAlignStart: true }),
  };

  markdownContent = `
# 数学公式示例

## 行内公式

质能方程: $E = mc^2$

欧拉公式: $e^{i\\pi} + 1 = 0$

## 块级公式

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

$$
\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}
$$

## 矩阵

$$
A = \\begin{pmatrix}
a_{11} & a_{12} \\\\
a_{21} & a_{22}
\\end{pmatrix}
$$
  `;
}
