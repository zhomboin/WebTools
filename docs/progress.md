# 进度记录

> 项目进度主文档：记录每次修改与当前状态，由 Agent 在每次修改后维护。专项进度文档（如有）从本文档链接进入。被推翻内容的记录见 [变更记录](changelog.md)。

## 当前状态

- 阶段：工程骨架初始化完成
- 已完成：需求与技术分析文档；项目规范与文档体系（含 `temp/`、`reports/` 目录约束）；工程骨架（Vite + React + TypeScript strict + oxlint，hash 路由，首页与四大类工具页占位，隐私提示组件）；GitHub 远端接入（SSH），main 已推送
- 进行中：无
- 下一步：第一期工具（JSON 处理、日期时间）

## 修改记录

| 日期 | 修改内容 | 分支 | 相关文档 |
| --- | --- | --- | --- |
| 2026-10-17 | 落盘需求与技术分析文档（自上一项目迁移，作为本项目初始需求与技术分析） | main | `docs/requirements-analysis.md` |
| 2026-10-17 | 初始化项目基础规范与文档体系：UTF-8 无 BOM 文件约束、前端工程约束、目录结构、Git 工作流（main + feature 分支 + PR + 合并前代码检视）、文档维护规则；初始化 git 仓库 | main | `README.md`、`docs/conventions.md`、`docs/progress.md`、`docs/changelog.md` |
| 2026-10-17 | 新增目录约束：项目临时文件统一放 `temp/`（不入版本管理），代码检视及其它生成的报告统一放 `reports/`（纳入版本管理，命名 `YYYY-MM-DD-<主题>.md`）；同步更新目录结构与 `.gitignore` | docs/temp-and-reports-dirs | `docs/conventions.md`、`README.md`、`.gitignore` |
| 2026-10-17 | `reports/` 改为不入版本管理：加入 `.gitignore`，从版本库移除已跟踪的报告文件，同步规范表述与目录树；被推翻内容记入变更记录 | docs/gitignore-reports | `.gitignore`、`docs/conventions.md`、`README.md`、`docs/changelog.md` |
| 2026-10-17 | 前端工程初始化：Vite + React + TypeScript（strict）+ oxlint + react-router（hash 路由）；首页与四大类工具页（占位）全部 lazy 加载；隐私提示组件与全局样式；`npm run build` / `npm run lint` / preview 冒烟测试通过 | feature/project-init | `package.json`、`index.html`、`tsconfig*.json`、`vite.config.ts`、`.oxlintrc.json`、`public/`、`src/`、`README.md`、`docs/conventions.md` |
| 2026-10-17 | 接入 GitHub 远端并推送 main：SSH 认证测试通过，`origin` = `git@github.com:zhomboin/WebTools.git`（HTTPS 地址 `https://github.com/zhomboin/WebTools.git` 留作备用） | docs/add-github-remote | `docs/conventions.md`、`docs/progress.md` |

## 专项进度文档

| 文档 | 说明 |
| --- | --- |
| （暂无） | — |
