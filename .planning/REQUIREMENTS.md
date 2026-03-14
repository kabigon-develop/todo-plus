# Requirements: todo-plus UI 现代化改造

**Defined:** 2026-03-14
**Core Value:** 在不改动任何业务逻辑和数据层的前提下，让每一位用户打开应用的第一眼就感受到精致与专业。

## v1 需求

### 设计 Token 基础（Phase 1）

- [x] **TOKEN-01**: 建立 CSS 自定义属性设计 Token 系统（--color-primary、--surface-*、--text-* 等语义化变量）
- [ ] **TOKEN-02**: 扩展 tailwind.config.js 将 CSS 变量注册为 Tailwind 工具类（bg-primary、bg-surface 等）
- [ ] **TOKEN-03**: 实现深色/浅色主题切换（index.html 防闪脚本 + ui.ts 主题状态 + 切换按钮）
- [x] **TOKEN-04**: 定义青绿色系调色板（teal-500 #14b8a6 为锚点，5 阶热力图色阶，优先级/状态颜色 token）

### 原子组件重设计（Phase 2）

- [ ] **COMP-01**: Button 组件 CVA variants 迁移至语义化 token（消除硬编码 slate-* 颜色）
- [ ] **COMP-02**: Badge/Tag 组件迁移至语义化 token，支持优先级色彩变体
- [ ] **COMP-03**: Tab 导航重设计（青绿滑动指示器动画、图标对齐、活动态样式）
- [ ] **COMP-04**: Dialog/弹层重设计（backdrop blur、slide-up 入场动画、圆角卡片样式）
- [ ] **COMP-05**: 输入框/表单组件重设计（聚焦态青绿边框、错误态样式、一致间距）

### 页面级重设计（Phase 3）

- [ ] **PAGE-01**: Todo 列表重设计（hover-reveal 操作按钮、左边框优先级色块、标签胶囊、截止日期徽章）
- [ ] **PAGE-02**: Kanban 看板重设计（三列彩色标题、卡片悬停阴影、拖拽视觉反馈、修复已知竞态 bug）
- [ ] **PAGE-03**: Dashboard 重设计（指标卡片图标化、日历热力图色阶替代文字标签、进度条美化）
- [ ] **PAGE-04**: 空状态设计（无 Todo/Idea 时的插图 + 引导文案）
- [ ] **PAGE-05**: 全局布局与间距规范（字号阶梯、行高、间距 scale、响应式断点）

### 动效系统（Phase 4）

- [ ] **ANIM-01**: 列表入场动画（Todo/Idea 卡片新增时 TransitionGroup 滚动入场）
- [ ] **ANIM-02**: Tab 切换过渡（三个 Tab 内容切换时淡入淡出/滑动效果）
- [ ] **ANIM-03**: 卡片悬停微动效（hover 升起 + 阴影加深，增加精致感）
- [ ] **ANIM-04**: reduced-motion 支持（尊重系统动效偏好，弹层等缓动减弱）

## v2 需求

### 高级交互

- **ADV-01**: Tag 输入组件（支持逐个添加/删除的 chip 输入，替代当前 comma 字符串方案）
- **ADV-02**: 拖拽排序的抛物线动画（高复杂度，目前简单版本已满足需求）
- **ADV-03**: Dashboard 移动端专用布局（7 列日历需要独立设计，不可简单压缩）

### 增强功能

- **ENH-01**: 键盘快捷键提示（弹出式 cheatsheet）
- **ENH-02**: 批量选择 Todo 的优化视觉（当前基础可用）
- **ENH-03**: Idea 卡片富文本预览

## Out of Scope

| Feature | Reason |
|---------|--------|
| 后端/数据库集成 | 保持纯前端 localStorage 架构，不在本次改造范围 |
| 业务逻辑修改 | 仅改外观，stores/ 和 lib/ 内容不变（Kanban 竞态 bug 除外） |
| 新功能开发 | 专注 UI 改造，不新增功能模块 |
| 设计系统文档站 | 不建 Storybook/文档站，工期不支持 |
| IE/旧浏览器兼容 | 仅支持现代浏览器（Chrome/Safari/Firefox 最新版） |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TOKEN-01 | Phase 1 | Complete |
| TOKEN-02 | Phase 1 | Pending |
| TOKEN-03 | Phase 1 | Pending |
| TOKEN-04 | Phase 1 | Complete |
| COMP-01 | Phase 2 | Pending |
| COMP-02 | Phase 2 | Pending |
| COMP-03 | Phase 2 | Pending |
| COMP-04 | Phase 2 | Pending |
| COMP-05 | Phase 2 | Pending |
| PAGE-01 | Phase 3 | Pending |
| PAGE-02 | Phase 3 | Pending |
| PAGE-03 | Phase 3 | Pending |
| PAGE-04 | Phase 3 | Pending |
| PAGE-05 | Phase 3 | Pending |
| ANIM-01 | Phase 4 | Pending |
| ANIM-02 | Phase 4 | Pending |
| ANIM-03 | Phase 4 | Pending |
| ANIM-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-14 after roadmap creation*
