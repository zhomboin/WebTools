# 项目规范

> 本文档是全项目规范的唯一维护处：文件约束、前端工程约束、目录结构、Git 工作流、文档维护规则均集中于此。本文档只保留最新版本，历史变更一律见 [变更记录](changelog.md)。

## 1. 文件约束

- 编码：所有文本文件一律 **UTF-8 无 BOM**。由 `.editorconfig` 的 `charset = utf-8` 强制（带 BOM 的变体为 `utf-8-bom`，禁止使用）；
- 换行符：一律 **LF**。由 `.editorconfig` 与 `.gitattributes` 共同强制；
- 文件末尾保留一个空行（`insert_final_newline`）；除 Markdown 外去除行尾空白；
- 缩进：统一 2 空格，不使用 Tab；
- 文档文件名：小写英文 kebab-case（如 `requirements-analysis.md`）；文档内容语言为中文；
- 所有文档统一放在 `docs/` 目录下，唯一例外是根目录的 `README.md`（项目入口）；
- 项目临时文件统一放在根目录 `temp/` 下，不纳入版本管理（已加入 `.gitignore`）；
- 代码检视报告与其它生成的报告统一放在根目录 `reports/` 下，不纳入版本管理（已加入 `.gitignore`），文件命名 `YYYY-MM-DD-<主题>.md`。

## 2. 前端工程约束

- 技术栈：React + TypeScript（strict 模式）+ Vite，包管理器 npm，lint 使用 oxlint；
- 形态：纯静态 SPA。无后端、无数据库、无登录、无用户体系；禁止引入任何依赖服务端的库或服务；
- 本地处理原则：所有工具的数据处理必须在用户浏览器本地完成，**禁止将用户输入发送到网络**；
- 分层约定：
  - `src/lib/`：工具核心逻辑，纯 TS 模块，不依赖 DOM / React，可单元测试；
  - `src/pages/`、`src/components/`：只做参数收集、结果展示与交互，不放业务逻辑；
- 路由：采用 hash 路由（`createHashRouter`），无需为静态托管配置 SPA fallback；
- 性能：路由按工具拆分页面并全部 lazy 加载；重型依赖（如 hash-wasm、ed25519-keygen、pica）一律动态 import 按需加载，不进主包；
- 依赖策略：优先使用浏览器原生 API（JSON 内置、Canvas、WebCrypto、Intl）；新增第三方依赖须在 PR 中说明必要性；
- UI 约定：每个工具页显著标注"所有处理均在本地浏览器完成，数据不会上传"；密码、密钥、图片类工具尤其必要；
- UI 约定（布局）：一个工具类别下含多个独立功能时，必须用 Tab 分隔（共享 `Tabs` 组件），每个 Tab 只呈现一个功能的重点内容，禁止把多个功能堆叠在同一长页；卡片布局适度使用——工作面（输入框、输出框、编辑器、表格）与结果面板用白色卡片承载，装饰性容器不套卡片，禁止卡片嵌套；
- 目标浏览器：Chrome / Edge / Firefox / Safari 最新两个大版本；部署环境必须 HTTPS（`crypto.subtle` 仅在安全上下文可用，本地开发 localhost 除外）。

## 3. 目录结构

```text
WebTools/
├── README.md                  # 项目入口（唯一位于根目录的文档）
├── .editorconfig              # 文件基础格式约束（UTF-8 无 BOM、LF 等）
├── .gitattributes             # git 文本/换行规范化
├── .gitignore
├── .oxlintrc.json             # oxlint 配置
├── index.html                 # SPA 入口
├── package.json
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── vite.config.ts
├── public/                    # 静态资源
├── docs/                      # 所有文档统一存放目录
│   ├── requirements-analysis.md   # 需求与技术分析
│   ├── conventions.md             # 项目规范（本文档）
│   ├── progress.md                # 进度记录（主文档）
│   └── changelog.md               # 变更记录
├── temp/                      # 项目临时文件（不入版本管理）
├── reports/                   # 代码检视报告与其它生成的报告（不入版本管理）
└── src/
    ├── main.tsx               # 应用入口
    ├── index.css              # 全局样式
    ├── pages/                 # 工具页面，按 json/ image/ crypto/ datetime/ 分子目录
    ├── lib/                   # 纯 TS 核心逻辑（json、image、crypto、datetime 独立模块）
    ├── components/            # 共享 UI（布局、隐私提示、工具页外壳等）
    └── routes/                # 路由定义（hash 路由，全部 lazy 加载）
```

## 4. Git 工作流

- 主分支为 `main`，始终保持可发布状态；
- **任何新功能、修复、文档修改都不得直接在 `main` 上开发**：从 `main` 拉取新分支，命名规则：
  - `feature/<功能名>`：新功能；
  - `fix/<问题名>`：缺陷修复；
  - `docs/<主题>`：纯文档修改；
- 分支完成后通过 **PR 合入 `main`**：远端为 `origin`（`github.com/zhomboin/WebTools`），功能分支推送到远端并发起 PR 合并；
- **每次合并前必须完成一次代码检视**：逐文件检查功能正确性、规范符合性（对照本文档）、文档同步情况，检视通过后方可合并；
- 合并后删除功能分支。

## 5. 文档体系与维护规则

文档体系（均位于 `docs/`）：

| 文档 | 职责 |
| --- | --- |
| `requirements-analysis.md` | 需求与技术分析 |
| `conventions.md` | 项目规范（本文档），所有工程与协作约定的唯一维护处 |
| `progress.md` | 进度记录主文档：记录每次修改与当前状态，专项进度文档从它链接进入 |
| `changelog.md` | 变更记录：全项目唯一允许记录历史版本信息的地方 |

新增专项进度、专项设计等文档时：放在 `docs/`，并从 `progress.md` 与 `README.md` 的文档索引链接进入。

维护规则（每次修改后必须执行）：

1. 每次修改完成后，更新 `progress.md`：追加修改记录、刷新当前状态；
2. 用户在对话中提出的任何"后续注意 / 约定 / 偏好"，当次整合进本文档对应章节，不得只留在对话里；
3. 每个功能完成后，通读全部文档，核对与最新进度、最新要求一致，不一致处立即修正；
4. 任何被推翻或替换的决策 / 内容，只记录在 `changelog.md`（记录变更对象、原内容、现内容、原因）；
5. 除 `changelog.md` 外，所有文档只保留最新版本，**禁止出现任何历史版本标注**（如"在某版本为 X，后修订为 Y"）；需要历史信息时一律链接到 `changelog.md`。
