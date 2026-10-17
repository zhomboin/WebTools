# WebTools — Web 工具平台

纯前端的在线工具集合：所有数据处理均在用户本地浏览器内完成，任何输入（密码、密钥、图片、文本）都不经过网络上传。无后端、无数据库、无登录，纯静态 SPA，可部署到任意 HTTPS 静态托管。

## 核心特性

- **本地处理**：全部工具逻辑运行在浏览器本地，数据零上传；
- **零后端**：纯静态产物，无服务端、无数据库、无用户体系；
- **按需加载**：路由级懒加载，重型依赖动态 import，主包保持精简。

## 工具矩阵（第一版）

| 类别 | 工具 |
| --- | --- |
| JSON 处理 | 格式化、压缩、校验 |
| 图片处理 | 压缩、格式转换 |
| 安全工具 | 密码生成、SSH 密钥对生成、常见加密、常见 Hash |
| 日期时间 | 时间获取、格式化、转换、时区转换 |

## 快速开始

工程骨架尚未初始化；初始化后本节命令生效。

```bash
npm install
npm run dev
```

## 目录结构

```text
WebTools/
├── README.md                  # 项目入口（唯一位于根目录的文档）
├── .editorconfig              # 文件基础格式约束（UTF-8 无 BOM、LF 等）
├── .gitattributes             # git 文本/换行规范化
├── .gitignore
├── docs/                      # 所有文档统一存放目录
├── temp/                      # 项目临时文件（不入版本管理）
├── reports/                   # 代码检视报告与其它生成的报告
├── index.html                 # SPA 入口（工程骨架初始化后创建）
├── package.json               # 工程骨架初始化后创建
├── public/                    # 静态资源（工程骨架初始化后创建）
└── src/
    ├── pages/                 # 工具页面，按 json/ image/ crypto/ datetime/ 分子目录
    ├── lib/                   # 纯 TS 核心逻辑（json、image、crypto、datetime 独立模块）
    ├── components/            # 共享 UI（结果面板、复制按钮、隐私提示等）
    └── routes/                # 路由定义
```

## 文档

| 文档 | 说明 |
| --- | --- |
| [需求与技术分析](docs/requirements-analysis.md) | 平台定位、分项技术方案、实施分期 |
| [项目规范](docs/conventions.md) | 文件约束、前端工程约束、目录结构、Git 工作流、文档维护规则 |
| [进度记录](docs/progress.md) | 项目进度主文档，记录每次修改 |
| [变更记录](docs/changelog.md) | 全项目唯一的历史变更与推翻内容记录 |

## 开发流程

遵循 [项目规范](docs/conventions.md)：`main` 为主分支，新功能在 feature 分支开发，通过 PR 合入，合并前完成代码检视。
