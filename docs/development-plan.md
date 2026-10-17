# 开发计划

> 依据 [需求与技术分析](requirements-analysis.md) 的功能范围与分期建议制定，为滚动计划：条目完成情况以本计划状态列与 [进度记录](progress.md) 为准，被推翻的排期或决策记录于 [变更记录](changelog.md)。

## 里程碑

| 阶段 | 内容 | 状态 |
| --- | --- | --- |
| M0 工程骨架 | Vite + React + TS strict + oxlint，hash 路由，四大类页面占位 | 已完成 |
| M1 第一期：JSON + 日期时间 | JSON 处理工具、日期时间工具，引入 vitest 单测 | 已完成 |
| M2 第二期：安全工具 | 密码生成、Hash、加密 | 待开始 |
| M3 第三期：图片处理 | 压缩、格式转换 | 待开始 |
| M4 第四期：SSH 密钥对 | Ed25519 密钥对生成 | 待开始 |
| M5 扩展候选 | Base64/URL 编解码、UUID、JWT 解码、二维码、正则测试、文本 Diff、颜色转换、单位换算等 | 按需排期 |

## M1 第一期（当前）

| 序号 | 分支 | 范围 | 状态 |
| --- | --- | --- | --- |
| 1 | `feature/json-tools` | 引入 vitest（devDependency，`npm test`）；`src/lib/json.ts`：格式化（2/4 空格）、压缩、校验（错误定位到行列）、key 排序、Unicode 转义/反转义；输入上限 5MB 并提示（Web Worker 兜底后置）；JsonPage：输入/输出双栏、操作栏、错误定位展示、复制/下载 | 已完成 |
| 2 | `feature/datetime-tools` | `src/lib/datetime.ts`：Unix 时间戳 ↔ 日期互转（秒/毫秒自动识别）、时区转换（`Intl` + 全量时区列表）、自定义格式化与解析（`yyyy/MM/dd/HH/mm/ss/SSS` 子集）、相对时间（`Intl.RelativeTimeFormat`）、时间差计算；DatetimePage 分块 UI；共享 `CopyButton` 组件 | 已完成 |

## M2 第二期：安全工具

| 序号 | 分支 | 范围 | 状态 |
| --- | --- | --- | --- |
| 3 | `feature/password-generator` | `crypto.getRandomValues` + 拒绝采样避免模偏差；长度、字符集、排除易混淆字符选项；强度估算展示 | 待开始 |
| 4 | `feature/hash-tools` | WebCrypto（SHA-1/SHA-256/SHA-384/SHA-512、HMAC）；`hash-wasm` 动态 import（MD5/CRC32/SHA-3）；支持文本输入 | 待开始 |
| 5 | `feature/encryption` | AES-GCM（默认，12 字节 IV）/ AES-CBC，口令派生密钥用 PBKDF2；RSA-OAEP 加解密 | 待开始 |

## M3 第三期：图片处理

| 序号 | 分支 | 范围 | 状态 |
| --- | --- | --- | --- |
| 6 | `feature/image-tools` | `createImageBitmap`（EXIF 方向自动摆正）+ `OffscreenCanvas` + `toBlob`；PNG/JPEG/WebP 互转、JPEG/WebP 质量压缩、分辨率缩放；批量处理、压缩前后体积对比、下载；UI 明示限制（无 AVIF 编码、HEIC 仅 Safari、动图丢动画）；`pica` 高质量缩放按需后置 | 待开始 |

## M4 第四期：SSH 密钥对

| 序号 | 分支 | 范围 | 状态 |
| --- | --- | --- | --- |
| 7 | `feature/ssh-keygen` | `ed25519-keygen`（动态 import）生成 Ed25519 OpenSSH 格式密钥对；明文私钥 UI 显著警告；passphrase 加密与 RSA/ECDSA 后置 | 待开始 |

## 执行约定（每个 PR）

1. 从最新 `main` 拉取 feature 分支开发；
2. 核心逻辑进 `src/lib/`（纯 TS + vitest 单测），UI 只做参数收集与结果展示；
3. 自验全绿：`npm run build`、`npm run lint`、`npm test`；
4. 文档同步（本计划状态列、`docs/progress.md`）；
5. 推送远端并创建 GitHub PR；
6. 合并前完成代码检视（报告存 `reports/`），通过后在 GitHub 合并 PR 并删除远端与本地分支；
7. 每期完成后通读全部文档，核对与最新进度一致。
