# 技术栈

**分析日期：** 2026-03-14

## 语言

**主要：**
- TypeScript 5.4.3 - 全部源代码和配置

**次要：**
- HTML5 - 页面标记（通过`index.html`）
- CSS 3 - 通过Tailwind进行样式化

## 运行时

**环境：**
- Node.js - 开发环境（目标ES2020用于浏览器执行）
- 浏览器 - 生产运行时（ES2020+）

**包管理器：**
- npm - 依赖管理
- 锁定文件：`package-lock.json`存在

## 框架

**核心：**
- Vue 3.4.21 - 渐进式JavaScript框架，用于UI开发
- Pinia 2.1.7 - 状态管理（Vuex继任者）

**UI/样式：**
- Tailwind CSS 3.4.3 - 实用优先CSS框架
- Radix Vue 1.9.17 - 无头UI组件（无样式基础组件）
- class-variance-authority 0.7.1 - 组件变体的CSS类组合
- tailwind-merge 3.4.0 - 智能合并Tailwind类
- tailwindcss-animate 1.0.7 - 动画工具集
- @tailwindcss/forms 0.5.7 - 表单元素样式化

**图标：**
- lucide-vue-next 0.563.0 - Vue 3图标库

**工具类：**
- clsx 2.1.1 - 类名连接工具

## 关键依赖

**关键：**
- vue 3.4.21 - 核心框架，不可移除
- pinia 2.1.7 - 状态持久化和管理层
- typescript 5.4.3 - 开发时类型安全

**构建/开发：**
- vite 4.5.3 - 现代打包工具和开发服务器
- @vitejs/plugin-vue 4.6.2 - Vite中的Vue 3支持
- vue-tsc 1.8.27 - Vue的TypeScript类型检查

**测试：**
- vitest 0.34.6 - 单元测试运行器
- @vue/test-utils 2.4.5 - Vue组件测试工具
- jsdom 24.0.0 - Node.js中的DOM实现

**CSS处理：**
- tailwindcss 3.4.3 - CSS生成
- postcss 8.4.38 - CSS转换
- autoprefixer 10.4.19 - 浏览器厂商前缀

**开发工具：**
- chrome-devtools-mcp 0.17.0 - Chrome DevTools集成
- @types/node 20.11.30 - Node.js类型定义

## 配置

**环境：**
- 无.env文件 - 配置基于代码
- 运行时不需要外部API密钥或凭证

**构建：**
- `vite.config.ts` - Vite打包工具配置，带Vue插件
- `tsconfig.json`、`tsconfig.app.json` - TypeScript编译设置
- `postcss.config.js` - PostCSS插件（Tailwind、Autoprefixer）
- `tailwind.config.js` - Tailwind CSS配置，带自定义颜色
- `components.json` - shadcn-vue组件配置

**构建脚本（package.json）：**
```
dev: vite                    # 开发服务器
build: vite build            # 生产构建
preview: vite preview        # 预览构建输出
test: vitest run             # 运行一次测试
test:watch: vitest           # 监视模式运行测试
```

## 平台要求

**开发：**
- Node.js 20+（从@types/node版本推断）
- npm 8+（支持lockfile v2）
- 支持shell的现代终端

**生产：**
- 支持ES2020的现代浏览器（Chrome 80+、Firefox 74+、Safari 13.1+、Edge 80+）
- 支持localStorage API（用于数据持久化）
- 无需服务器 - 完全客户端应用

## 数据持久化

**存储：**
- 仅浏览器localStorage
- 无数据库连接
- 无后端API调用
- 所有数据存储在客户端本地
- 存储键：`todo-plus:todos`和`todo-plus:ideas`

---

*栈分析完成于 2026-03-14*
