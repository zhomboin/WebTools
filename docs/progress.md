# 进度记录

> 项目进度主文档：记录每次修改与当前状态，由 Agent 在每次修改后维护。专项进度文档（如有）从本文档链接进入。被推翻内容的记录见 [变更记录](changelog.md)。

## 当前状态

- 阶段：M2 第二期完成，准备 M3 第三期（图片处理）
- 已完成：需求与技术分析文档；项目规范与文档体系（含 `temp/`、`reports/` 目录约束）；工程骨架（Vite + React + TypeScript strict + oxlint，hash 路由，首页与四大类工具页占位，隐私提示组件）；GitHub 远端接入（SSH），main 已推送；开发计划制定（M0–M5）；JSON 处理工具（自研解析器精确定位错误行列、格式化/压缩/排序/Unicode 转义、vitest 单测）；日期时间工具（当前时间、时间戳互转、时区转换与常用时区对照、自定义格式化/解析、相对时间、时间差，全量时区列表，单测 20 例）；界面视觉优化（青瓷薄荷淡彩主题、分类专属色、分区式布局、1200px 容器、容器查询自适应、lucide-react 图标）；密码生成器（拒绝采样、字符集与易混淆排除、熵强度估算，单测 12 例）；Hash 计算（WebCrypto SHA 家族 + HMAC，hash-wasm 按需加载 MD5/CRC32/SHA-3，已知向量单测 15 例）；加解密（AES-GCM/CBC + PBKDF2 口令派生 + RSA-OAEP 3072 位 PEM，单测 14 例，浏览器往返验证含中文与 emoji）
- 进行中：无
- 下一步：M3 第三期图片处理（`feature/image-tools`，见 [开发计划](development-plan.md)）

## 修改记录

| 日期 | 修改内容 | 分支 | 相关文档 |
| --- | --- | --- | --- |
| 2026-10-17 | 落盘需求与技术分析文档（自上一项目迁移，作为本项目初始需求与技术分析） | main | `docs/requirements-analysis.md` |
| 2026-10-17 | 初始化项目基础规范与文档体系：UTF-8 无 BOM 文件约束、前端工程约束、目录结构、Git 工作流（main + feature 分支 + PR + 合并前代码检视）、文档维护规则；初始化 git 仓库 | main | `README.md`、`docs/conventions.md`、`docs/progress.md`、`docs/changelog.md` |
| 2026-10-17 | 新增目录约束：项目临时文件统一放 `temp/`（不入版本管理），代码检视及其它生成的报告统一放 `reports/`（纳入版本管理，命名 `YYYY-MM-DD-<主题>.md`）；同步更新目录结构与 `.gitignore` | docs/temp-and-reports-dirs | `docs/conventions.md`、`README.md`、`.gitignore` |
| 2026-10-17 | `reports/` 改为不入版本管理：加入 `.gitignore`，从版本库移除已跟踪的报告文件，同步规范表述与目录树；被推翻内容记入变更记录 | docs/gitignore-reports | `.gitignore`、`docs/conventions.md`、`README.md`、`docs/changelog.md` |
| 2026-10-17 | 前端工程初始化：Vite + React + TypeScript（strict）+ oxlint + react-router（hash 路由）；首页与四大类工具页（占位）全部 lazy 加载；隐私提示组件与全局样式；`npm run build` / `npm run lint` / preview 冒烟测试通过 | feature/project-init | `package.json`、`index.html`、`tsconfig*.json`、`vite.config.ts`、`.oxlintrc.json`、`public/`、`src/`、`README.md`、`docs/conventions.md` |
| 2026-10-17 | 接入 GitHub 远端并推送 main：SSH 认证测试通过，`origin` = `git@github.com:zhomboin/WebTools.git`（HTTPS 地址 `https://github.com/zhomboin/WebTools.git` 留作备用） | docs/add-github-remote | `docs/conventions.md`、`docs/progress.md` |
| 2026-10-17 | 制定开发计划：M0–M5 里程碑、第一期两项 PR 拆分、每 PR 执行约定；接入真实 GitHub PR 流程（gh CLI） | docs/development-plan | `docs/development-plan.md`、`docs/progress.md`、`README.md` |
| 2026-10-17 | JSON 处理工具：自研递归下降解析器（错误定位到行列，不依赖引擎报错格式）、格式化/压缩/校验/key 排序/Unicode 转义反转义、5MB 输入上限、复制/下载；引入 vitest（23 例单测）；共享 CopyButton 组件；build/lint/test 全绿，浏览器 GUI 冒烟通过 | feature/json-tools | `src/lib/json.ts`、`src/lib/json.test.ts`、`src/pages/json/JsonPage.tsx`、`src/components/CopyButton.tsx`、`src/index.css`、`package.json` |
| 2026-10-17 | 日期时间工具：时间戳互转（自动识别秒/毫秒）、时区转换（全量时区列表 + 常用时区对照 + GMT 偏移展示）、自定义格式化与解析（yyyy/MM/dd/HH/mm/ss/SSS）、相对时间、时间差计算、实时当前时间；20 例单测；GUI 冒烟发现并修复 `dateStyle/timeStyle` 与 `timeZoneName` 组合的 Intl 规范冲突 | feature/datetime-tools | `src/lib/datetime.ts`、`src/lib/datetime.test.ts`、`src/pages/datetime/`、`src/index.css` |
| 2026-10-18 | 界面视觉优化（方案 A 青瓷薄荷）：淡彩底 + 白色工作面 + 四类工具专属色、分区式布局去卡片嵌套、960 → 1200px 容器与正文放大、容器查询自适应（1000/660 断点）、lucide-react 图标；设计稿预览两套配色方案经用户确认后实施；build/lint/test 全绿，宽屏视觉验收 + 窄屏 DOM 断言 + 真实点击功能验证通过 | feature/ui-refresh | `src/index.css`、`src/components/`、`src/pages/`、`package.json` |
| 2026-10-18 | 密码生成器：`crypto.getRandomValues` 拒绝采样避免模偏差、四类字符集 + 排除易混淆字符、每类至少一位保证、Fisher-Yates 洗牌、熵估算与五级强度条；随机源可注入（单测 12 例）；build/lint/test 全绿，GUI 冒烟（截图视觉验收）通过 | feature/password-generator | `src/lib/password.ts`、`src/lib/password.test.ts`、`src/pages/crypto/`、`src/index.css` |
| 2026-10-18 | Hash 计算：WebCrypto（SHA-1/256/384/512 + HMAC）+ hash-wasm 动态 import（MD5/CRC32/SHA-3，独立 chunk 不进主包）；15 例已知向量单测；GUI 冒烟并与 Node webcrypto 交叉验证结果一致（发现并桥接 hash-wasm crc32 类型声明与运行时不一致） | feature/hash-tools | `src/lib/hash.ts`、`src/lib/hash.test.ts`、`src/pages/crypto/sections/HashSection.tsx`、`src/index.css`、`package.json` |
| 2026-10-18 | 加解密：AES-GCM（12 字节 IV）/AES-CBC + PBKDF2（10 万次迭代）口令派生，密文格式 Base64(salt+iv+cipher)；RSA-OAEP 3072 位密钥对生成（SPKI/PKCS8 PEM 导出导入）；14 例单测（往返、错口令、损坏数据、密钥不匹配）；浏览器 GUI 验证 AES 与 RSA 加解密往返（含中文与 emoji）完全一致；M2 第二期完成 | feature/encryption | `src/lib/encryption.ts`、`src/lib/encryption.test.ts`、`src/pages/crypto/sections/EncryptionSection.tsx`、`src/index.css` |
| 2026-10-18 | 安全工具页 Tab 化（用户反馈：多功能堆叠无重点）：新增共享 Tabs 组件（无障碍 tablist + 方向键），四个功能 Tab 各自呈现重点；EncryptionSection 拆分为 SymmetricSection 与 RsaSection；UI 布局约定写入规范（多功能必须 Tab 分隔、卡片适度使用） | feature/crypto-tabs | `src/components/Tabs.tsx`、`src/pages/crypto/`、`src/index.css`、`docs/conventions.md` |

## 专项进度文档

| 文档 | 说明 |
| --- | --- |
| [开发计划](development-plan.md) | 里程碑与各期 PR 拆分，状态随 PR 合并更新 |
