# Reactive MD Cattca 互动小说组件

**中文** · [English](README.md)

基于公开扩展 SDK 的 `<cattca>` 组件包。它从一个 `cattca` 代码围栏读取互动小说剧本，渲染正文、选项、文本输入、重开按钮和调试状态。

语法参考 [CattcaJS](https://github.com/raricycms/CattcaJS)。本实现是独立的安全子集，不嵌入 CattcaJS，也不会用 `eval` 或 `new Function` 执行剧本。

> 状态：示例组件包。用于验证容器组件、SSR、离线导出和浏览器交互，不随库发布。

## 直接看效果

构建后在浏览器打开：

- `dist/interactive.html`：自包含交互版，可离线打开。
- `dist/static.html`：静态版，只显示初始状态。

## 使用

组件包依赖宿主提供同一份 `reactive-md`、React 和 React DOM。宿主装配：

```tsx
import { createReactHost } from 'reactive-md/react';
import { cattcaPackage } from 'reactive-md-cattca-package/react';

export const host = createReactHost({ packages: [cattcaPackage] });
export const { config, reactConfig } = host;
```

在 Markdown 中写：

````markdown
<cattca label="床与晨光" height="460" debug="{{ debug }}" disabled="{{ lock }}">

```cattca
你叫莱莉菥。
现在是早上六点，你醒了。

</let 赖床次数 = 0; label 故事开始;/>
你要怎么做？
</input case 选择:
  '继续睡觉' -> goto 睡觉:
  '起床' -> goto 起床;
/>

</label 睡觉; set 赖床次数 = 赖床次数 + 1;
if 赖床次数 > 2 -> goto 睡过头/>
你睡不着，翻了个身。
</goto 故事开始;/>
</label 睡过头/>
结局：你睡过头了。
</exit/>
```

</cattca>
````

组件只读取第一个 `cattca` 代码围栏（没有语言标记时取第一个代码围栏）。剧本不会显示在正文里。

## 属性

| 属性 | 默认值 | 含义 |
| --- | --- | --- |
| `label` | `互动小说` | 标题与无障碍名称 |
| `height` | `420` | 正文区域最高高度，200–900 像素 |
| `debug` | `false` | 显示变量与解释器日志 |
| `disabled` | `false` | 禁用选项、输入和重开按钮 |

## 支持的命令

| 命令 | 写法 | 说明 |
| --- | --- | --- |
| `let` | `let 名称` / `let 名称 = 表达式` | 声明变量；不写 `=` 时为 `null` |
| `set` | `set 名称 = 表达式` | 给已声明的变量赋值 |
| `apply` | `apply 表达式` | 把结果显示在正文中 |
| `log` | `log 表达式` | 写入日志，不进入正文 |
| `label` | `label 名称` | 标记跳转位置 |
| `goto` | `goto 名称` | 跳到标签 |
| `if` | `if 条件 -> 一条命令` | 条件为真时执行一条命令 |
| `input text` | `input text 变量名` | 暂停并等待一行文本 |
| `input case` | `input case [: 变量] : '选项' -> 命令 : ...` | 暂停并显示选项按钮 |
| `exit` | `exit` | 结束故事 |

命令块使用 `</ ... />`，块内用分号分隔多条命令。标签名和变量名支持中文。

## 表达式

支持字面量、变量、算术、比较、逻辑、三元表达式、括号和 `Math` 白名单：

```cattca
</let x = 2; let y = 3;
apply x + y * 4;
apply x > y ? "x 大" : "y 大";
apply "你好，" + "世界";
apply Math.max(x, y);/>
```

- 不使用 `eval` / `new Function`，不能访问 `window`、`document`、`fetch` 等全局对象。
- `Math` 只开放 `abs`、`ceil`、`floor`、`max`、`min`、`pow`、`round`、`sign`、`sqrt`、`trunc` 以及常量 `PI`、`E`。
- 表达式求值失败时，`apply` / `let` / `set` 按 Cattca 的行为回退为原文；`if` 条件失败时按 `false` 处理并写入日志。

## 与 CattcaJS 的差异

当前实现覆盖核心文本、变量、控制流和输入，不支持：

- `say` / `pass`；
- Cattca 对象与函数系统；
- `{# ... }`、`{@ ... }`、`{\ ... }` 大括号语法糖；
- 注释语法；
- 任意 JavaScript 表达式、全局对象、`Math` 之外的库。

`input case` 的选项命令保持简单；选项命令中不要使用带顶层冒号的复杂三元表达式。

## 安全与预算

组件不执行剧本中的 JavaScript。解释器对以下资源设置上限：

- 剧本 100,000 字符、5,000 条指令；
- 单次恢复执行 20,000 步，防止 `goto` 无限循环；
- 正文 10,000 条、500,000 字符；
- 1,000 个变量、2,000 条日志、64 个选项；
- 表达式 2,000 字符、嵌套 32 层；
- 文本输入 2,000 字符。

超限会停止故事并在正文区域显示错误。

## 开发

```sh
npm run typecheck
npm test              # 构建 + 引擎单元测试
npm run test:browser  # 构建 + Edge/Playwright 浏览器冒烟测试
```

浏览器测试默认使用 Windows 上的 Edge；其他平台可设置 `PLAYWRIGHT_CHANNEL`。

## 目录

| 路径 | 用途 |
| --- | --- |
| `index.ts` | Demo `plugin/<name>/` 目录模式的根级发现入口 |
| `src/node-entry.ts` | 包入口与 SSR 入口 |
| `src/cattca-engine.ts` | 安全解析器、表达式求值、解释器与预算 |
| `src/manifests.ts` | `<cattca>` 的 manifest |
| `src/components.tsx` | React 播放器、静态/SSR 输出与宿主配置 |
| `src/component.css` | 组件结构与主题变量 |
| `sample/document.reactive.md` | 示例互动小说 |
| `test/engine.test.mjs` | 引擎、控制流和示例剧本测试 |
| `scripts/build.mjs` | Vite 构建、SSR 校验与载体页 |
| `scripts/smoke.mjs` | 真实浏览器交互检查 |
