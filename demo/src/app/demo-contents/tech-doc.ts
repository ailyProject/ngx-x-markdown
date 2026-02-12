export const TECH_DOC_CONTENT = `# Angular 信号（Signals）完全指南

Angular 信号是 Angular 16+ 引入的 **响应式原语**，用于管理组件状态。

## 什么是信号？

信号是一个包含值的包装器，当值改变时会通知所有消费者。

\`\`\`typescript
import { signal, computed, effect } from '@angular/core';

// 创建一个可写信号
const count = signal(0);

// 读取值
console.log(count()); // 0

// 更新值
count.set(1);
count.update(v => v + 1);
\`\`\`

## 计算信号（Computed）

计算信号自动追踪依赖并在依赖变化时重新计算：

\`\`\`typescript
const firstName = signal('张');
const lastName = signal('三');

const fullName = computed(() => firstName() + ' ' + lastName());

console.log(fullName()); // "张 三"
firstName.set('李');
console.log(fullName()); // "李 三"
\`\`\`

## Effect

Effect 在信号值变化时执行副作用：

\`\`\`typescript
effect(() => {
  console.log('当前计数:', count());
  // 每次 count 变化时自动执行
});
\`\`\`

## 最佳实践

### ✅ 推荐

- 使用 \`signal()\` 替代简单的组件属性
- 使用 \`computed()\` 替代 getter
- 在组件中优先使用 \`OnPush\` 变更检测策略

### ❌ 避免

- 不要在 \`computed()\` 中执行副作用
- 不要在 \`effect()\` 中修改信号值（可能导致循环）
- 避免过度使用 effect，优先考虑 computed

## 与 RxJS 的互操作

\`\`\`typescript
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

// Observable → Signal
const data = toSignal(this.http.get('/api/data'));

// Signal → Observable
const count$ = toObservable(count);
\`\`\`

> **总结**：Angular Signals 提供了一种简洁高效的状态管理方式，特别适合组件级别的响应式数据流。`;
