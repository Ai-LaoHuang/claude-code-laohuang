# Claude Code LaoHuang 使用橙皮书

版本：`0.1.0`  
作者：AI老黄  
适用对象：第一次使用 Claude Code LaoHuang 的用户、想把它作为日常 AI 编程工作台的用户、需要排查运行问题的维护者。

## 这本橙皮书解决什么问题

Claude Code LaoHuang 是一个本地运行的 AI 编程工作台。它保留 Claude Code 的核心编程能力，同时加入 LaoHuang 版的桌面 UI、Provider 管理、工作区面板、Skills、Memory、Computer Use、定时任务、H5 访问和 IM 适配能力。

你可以把它理解成三层：

| 层级 | 它负责什么 |
| --- | --- |
| 桌面端 | 新建会话、选择项目、聊天、查看文件变更、设置 Provider、管理扩展。 |
| 本地服务 | 保存会话、连接 CLI、处理 Provider 代理、管理工作区、暴露本地 API。 |
| CLI/模型运行时 | 真正执行代码阅读、编辑、Shell、MCP、Skills、权限审批和模型对话。 |

这本手册只讲使用，不假设你会读源码。

## 最快上手

### 1. 打开桌面端

macOS 推荐使用已打包的 App：

```bash
open "/Users/xiaowo1800gmail.com/Downloads/claude-code-laohuang-main 2/desktop/build-artifacts/macos-arm64/Claude Code LaoHuang.app"
```

如果你是开发者，可以从项目根目录重新构建并启动：

```bash
./script/build_and_run.sh --rebuild --verify
```

### 2. 创建第一条会话

1. 点击左侧 `+ 新建会话`。
2. 选择一个项目文件夹。
3. 在底部输入框写需求，例如：

```text
阅读这个项目，告诉我入口文件在哪里，以及启动命令是什么。
```

4. 点击右侧运行按钮。

### 3. 选择权限

输入框左下角可以选择权限模式。常用选择：

| 模式 | 适合场景 |
| --- | --- |
| 默认权限 | 普通问答、读代码、低风险编辑。 |
| 自动审查 | 希望模型自己判断命令和文件操作是否安全。 |
| 完全访问权限 | 你信任当前任务，需要让模型完整读写项目和执行 Shell。 |
| 自定义 | 按本机 `config.toml` 或策略细化权限。 |

刚开始建议使用默认权限或自动审查。做本地项目修复时，再切到完全访问权限。

### 4. 选择模型

输入框右下角可以切换模型。当前 LaoHuang 版默认验证路径是 MiniMax：

| 项 | 当前默认 |
| --- | --- |
| Provider | MiniMax M2.7 |
| 模型 | MiniMax-M2.7 |
| 上下文窗口 | 约 `204800` tokens |

如果你配置了 OpenAI OAuth 或其他 Anthropic/OpenAI 兼容 Provider，也会在模型列表中显示。

## 界面导览

### 左侧主栏

左侧竖向图标栏是全局入口：

| 入口 | 用途 |
| --- | --- |
| 新建会话 | 开始一个新的编码会话。 |
| 历史/项目 | 查看已有项目和历史会话。 |
| 定时任务 | 创建周期性自动任务。 |
| 终端 | 在桌面端里直接运行本机 Shell。 |
| Workspace | 查看当前会话的文件、diff、图片和代码引用。 |
| 设置 | Provider、权限、Skills、Memory、Computer Use、诊断等设置。 |

### 会话列表

侧栏会按项目和时间组织会话。你可以：

- 搜索会话。
- 在指定项目中新建会话。
- 批量管理或删除旧会话。
- 隐藏不常用项目。
- 在 Finder 中打开项目目录。

### 顶部标题栏

活动会话顶部只显示当前对话标题、简要状态和右侧工具图标。简要状态包含最后更新时间、消息数、token 或活跃状态。这个设计避免同一个标题在页面里重复出现。

### 聊天区

聊天区主要由三类内容组成：

| 内容 | 说明 |
| --- | --- |
| 用户消息 | 你的需求、补充说明、文件引用。 |
| 助手回复 | 模型解释、计划、结果和代码说明。 |
| 工具卡片 | Shell、文件读写、diff、Memory、Computer Use 等工具执行过程。 |

消息旁边的 `Copy` 只复制对应消息内容，方便你整理笔记或复盘。

### 底部输入框

输入框是最核心的操作区：

| 控件 | 用途 |
| --- | --- |
| `+` | 添加附件、文件、上下文或其他输入。 |
| 权限按钮 | 切换默认、自动审查、完全访问、自定义权限。 |
| 上下文百分比 | 查看当前会话上下文使用情况。 |
| 模型选择 | 切换 Provider 和模型。 |
| 运行按钮 | 发送当前请求。 |
| 项目行 | 显示当前会话绑定的项目文件夹。 |

## Provider 和模型配置

### 什么时候需要配置 Provider

如果你遇到这些情况，就需要检查 Provider：

- 模型无法回复。
- 请求返回鉴权失败。
- 模型列表里没有你想用的模型。
- 你想切换 MiniMax、OpenRouter、OpenAI 兼容服务或官方 Claude。

### 设置入口

进入：

```text
设置 > 服务商
```

你可以做这些操作：

- 查看当前 Provider。
- 新增 Provider。
- 测试 Provider 是否可用。
- 激活某个 Provider。
- 切回官方/default 模式。

### 常见字段怎么填

| 字段 | 说明 |
| --- | --- |
| 名称 | 你自己识别用，例如 `MiniMax M2.7`。 |
| Base URL | 服务商 API 地址。 |
| API Key/Auth Token | 服务商密钥或 token。 |
| API Format | `anthropic`、`openai_chat` 或 `openai_responses`。 |
| Main/Haiku/Sonnet/Opus | 不同角色对应的模型 ID。 |
| Context Window | 模型上下文窗口，用于显示和自动压缩判断。 |

LaoHuang 版会把 Provider 托管配置写入：

```text
~/.claude/cc-haha/providers.json
~/.claude/cc-haha/settings.json
```

`cc-haha` 是继承存储命名，不代表界面品牌。

### API Format 选择建议

| Format | 什么时候选 |
| --- | --- |
| `anthropic` | 服务商直接兼容 Anthropic Messages API。 |
| `openai_chat` | 服务商使用 OpenAI Chat Completions。 |
| `openai_responses` | 服务商使用 OpenAI Responses API。 |

如果你不确定，先看服务商文档。如果它提供的是 `/v1/chat/completions`，通常选 `openai_chat`。

## 权限模式

权限决定模型能不能读文件、写文件、执行命令、访问 Shell 和系统工具。

### 推荐用法

| 任务 | 推荐权限 |
| --- | --- |
| 解释代码、找入口、写计划 | 默认权限 |
| 修 bug、改 UI、跑测试 | 完全访问权限 |
| 只想让它架构分析不改文件 | 计划模式或更保守权限 |
| 需要接触敏感目录 | 自定义权限 |

### 使用习惯

给模型权限之前，最好先明确任务边界：

```text
只改 desktop/src/components/chat 和 desktop/src/theme/globals.css，不要动业务逻辑。
```

如果是高风险操作，可以要求：

```text
先列出将要修改的文件，等我确认后再动。
```

## 项目与工作区

### 当前项目

每个会话最好绑定一个工作目录。绑定后，模型会以这个目录为上下文：

- 读代码。
- 改代码。
- 跑测试。
- 查看 Git 状态。
- 生成 diff。

### Workspace 面板

Workspace 面板用于检查代码结果。它有两个主要视图：

| 视图 | 用途 |
| --- | --- |
| Changed | 查看当前会话或 Git 中变更的文件。 |
| All | 浏览项目文件树。 |

在文件预览里你可以：

- 查看文本和 Markdown。
- 查看图片。
- 查看 diff。
- 复制路径。
- 把文件添加到聊天。
- 对某一行或某段代码写本地评论，再送入下一轮请求。

### 什么时候用 Workspace

建议在这些场景使用：

- 模型说“改好了”，你想看改了哪些文件。
- UI 改动后要查 CSS 和组件。
- 你想把某段代码作为下一轮上下文。
- 你要检查某个图片、Markdown 或 diff。

## Worktree 工作流

LaoHuang 版支持两种项目启动方式：

| 模式 | 说明 |
| --- | --- |
| Current worktree | 直接在当前项目目录工作。 |
| Isolated worktree | 为这次会话创建隔离工作区，避免污染主目录。 |

### 什么时候用 Isolated worktree

适合这些任务：

- 大改 UI。
- 重构一批文件。
- 做不确定的实验。
- 希望随时丢弃本次修改。

隔离 worktree 会放在项目目录下：

```text
.claude/worktrees/desktop-...
```

内部分支会用：

```text
worktree-desktop-...
```

这些内部分支会从普通分支选择器中隐藏。

## Rewind 回退

Rewind 用来把会话和文件恢复到某个用户消息之前。它适合处理：

- 改坏了 UI。
- 模型走错方向。
- 想回到某一轮重新来。

建议流程：

1. 先打开 Workspace 看当前变更。
2. 找到想回退到的那条用户消息。
3. 先 dry-run 或预览。
4. 确认会删除/恢复哪些文件。
5. 再执行回退。

重要提醒：如果你没有用 Git，Rewind 比 Git commit 更脆弱。重大改动前，最好做快照或 Git 提交。

## Skills

Skills 是可复用的本地能力说明。LaoHuang 版界面中统一显示为英文 `Skills`。

### 入口

```text
设置 > Skills
```

这里可以看到三类 Skills：

| 来源 | 位置 |
| --- | --- |
| 用户级 | `~/.claude/skills` |
| 项目级 | 当前项目 `.claude/skills` |
| 插件级 | 已启用插件提供的 skills 目录 |

### Skill 能做什么

一个 Skill 通常包含：

- 什么时候使用。
- 可用工具。
- 参数提示。
- 示例流程。
- 相关脚本或模板。

会话中可调用的 Skill 会进入 slash command 发现列表。你可以在输入框里输入 `/` 查看可用命令。

### 使用建议

把高频工作做成 Skill，例如：

- 固定的 UI 验收流程。
- Remotion 视频生成流程。
- Obsidian 知识库整理流程。
- 某个平台 API 的操作流程。

## Memory

Memory 是本地项目记忆。它不是聊天记录，而是给项目长期沉淀规则、偏好、决策和上下文。

### 入口

```text
设置 > Memory
```

你可以：

- 查看项目记忆文件。
- 编辑 Markdown。
- 搜索记忆。
- 保存或回退编辑。

Memory 文件保存在：

```text
~/.claude/projects/{projectId}/memory
```

### 适合写进 Memory 的内容

- 项目启动命令。
- UI 风格约束。
- Provider 选择原因。
- 用户偏好。
- 不要再踩的坑。
- 重要版本快照位置。

不建议写入：

- API Key。
- 密码。
- 私密聊天原文。
- 大段无结构日志。

## MCP、插件和扩展

### MCP

MCP 是模型调用外部工具的方式。常见用途：

- 浏览器控制。
- 文件系统工具。
- 数据库工具。
- 自定义脚本工具。
- Computer Use。

### 插件

插件可以提供：

- Skills。
- MCP server。
- Agents。
- 额外 UI 或运行时能力。

一般流程：

1. 在终端安装插件。
2. 回到设置页启用插件。
3. 重新加载或新建会话。
4. 在 Skills、MCP 或 Agents 页面确认是否出现。

## Computer Use

Computer Use 让模型能看屏幕、点鼠标、输入键盘、操作本机 App。它很强，也需要谨慎使用。

### 入口

```text
设置 > Computer Use
```

你需要确认：

- Python runtime 可用。
- 依赖安装完成。
- macOS 已授予 Accessibility。
- macOS 已授予 Screen Recording。
- 目标 App 已授权。

### 适合场景

- 检查桌面端 UI 是否真的变了。
- 操作浏览器或本地 App。
- 截图验证视觉问题。
- 模拟用户点击。

### 风险控制

建议只授权必要 App。比如要检查 UI，就只授权 Claude Code LaoHuang 或浏览器，不要一次性授权所有 App。

如果模型请求控制一个新的 App，先看清楚弹窗，再决定允许或拒绝。

## 定时任务

定时任务用于让 LaoHuang 按周期执行固定提示词。

### 入口

```text
定时任务
```

你可以创建：

| 类型 | 示例 |
| --- | --- |
| 每 N 分钟 | 每 30 分钟检查一次日志。 |
| 每 N 小时 | 每 6 小时汇总一次项目状态。 |
| 每天 | 每天 9 点生成日报。 |
| 工作日 | 工作日早上检查待办。 |
| 指定星期 | 每周一、三、五执行。 |
| 每月 | 每月 1 日做月度总结。 |
| 自定义 Cron | 高级用户自定义表达式。 |

### 创建任务需要填什么

| 字段 | 说明 |
| --- | --- |
| 名称 | 任务列表显示名。 |
| 描述 | 这件事为什么存在。 |
| Prompt | 真正执行的提示词。 |
| 时间规则 | 频率、时间、Cron。 |
| 模型/Provider | 可选，指定运行模型。 |
| 权限模式 | 可选，决定任务能做什么。 |
| 文件夹 | 任务在哪个项目目录执行。 |
| Worktree | 是否隔离执行。 |
| 通知 | 可选，桌面、Telegram、Feishu。 |

### 注意

定时任务依赖桌面端或本地服务在线。电脑关机、App 退出、服务未启动时，任务不会像云端任务那样独立运行。

## 终端

终端页可以直接运行本机 Shell。

入口：

```text
设置 > 终端
```

常见用途：

- 安装插件。
- 安装 Skills。
- 添加 MCP。
- 跑测试。
- 执行项目启动命令。

文档里的 `claude <参数>` 在 LaoHuang 版中通常可替换为：

```bash
claude-code-laohuang <参数>
```

例如：

```bash
claude-code-laohuang mcp add ...
claude-code-laohuang plugin install ...
```

## H5 访问

H5 访问让浏览器或手机访问本机桌面服务。它不是公开账号系统，只适合你控制的网络环境。

入口：

```text
设置 > H5 访问
```

基本流程：

1. 启用 H5。
2. 生成 token。
3. 立即保存 token，因为之后只显示预览。
4. 配置允许访问的 Origin。
5. 在手机或另一个浏览器输入服务器地址和 token。
6. 用完后关闭 H5 或重新生成 token。

安全提醒：

- 不要使用通配符 Origin。
- 不要把 token 发到公开群。
- 不要把本地服务直接暴露到公网。
- 反向代理必须支持 WebSocket。

## IM Adapters

IM Adapters 用来把 Telegram、飞书、微信、钉钉消息转发到 LaoHuang 会话。

当前支持：

| 平台 | 状态 |
| --- | --- |
| Telegram | 配置和格式逻辑已覆盖，需要真实 bot 凭证做 live 测试。 |
| 飞书 | 配置、卡片、回调逻辑已覆盖，需要真实应用做 live 测试。 |
| 微信 | QR 登录和文本流需要真实环境验证。 |
| 钉钉 | 注册、轮询和卡片回调需要真实环境验证。 |

适合场景：

- 手机上给桌面 AI 发任务。
- 从飞书/钉钉触发项目检查。
- 把权限请求发到 IM 里确认。

不适合场景：

- 公开群里直接开放。
- 没有用户白名单。
- 没有 token 或 pairing 机制。

## Agents 和 Teams

Agents 是预设角色。Teams 是多个 Agent 协同工作。

入口：

```text
设置 > Agents
```

当前可用能力：

- 查看已安装 Agent。
- 查看 Agent 来源、模型、工具和 system prompt。
- 插件提供的 Agent 可以出现在同一列表。
- 活动会话里如果有团队运行，会显示团队状态条。
- 可以打开成员 transcript 标签。

当前需要注意：

- Settings 中主要是浏览和查看。
- Agent 创建、编辑、删除 API 存在，但 UI 还不是完整编辑器。
- 真实多 Agent 团队编排需要实际运行验证。

## Activity 与 Token 用量

入口：

```text
设置 > Token 用量
```

可以看到：

- 今天、昨天、近 4 天、近 30 天 token。
- 会话数量。
- 消息数量。
- 工具调用数量。
- 连续活跃天数。
- 热力图。

它适合做复盘：

- 最近是不是用量异常。
- 某天为什么 token 激增。
- 哪些项目消耗最多。

## 诊断与 Doctor

入口：

```text
设置 > 诊断
```

诊断页用于排查：

- 服务端启动失败。
- CLI 启动失败。
- Provider 错误。
- 会话运行错误。
- UI 本地状态异常。

你可以：

- 查看最近事件。
- 打开日志目录。
- 导出诊断包。
- 复制错误摘要。
- 清理日志。
- 运行 Doctor。

Doctor 只清理安全的 UI 本地键，例如打开的 tab、会话运行时选择、主题和语言，不会碰：

- 聊天历史。
- 模型配置。
- Skills。
- MCP。
- IM。
- OAuth。

## 更新与版本

当前版本：

```text
0.1.0
```

当前作者：

```text
AI老黄
```

更新页会显示版本和 GitHub 入口。旧的 `NanmiCoder/cc-haha` 更新来源不应该再作为 LaoHuang 版默认更新源。

## 常用工作流

### 工作流 1：让它读懂一个项目

```text
请先阅读这个项目，不要修改文件。告诉我：
1. 项目是什么技术栈
2. 启动命令是什么
3. 关键入口文件在哪里
4. 最近最值得补测试的模块是什么
```

适合权限：默认权限。

### 工作流 2：修一个 bug

```text
这个页面不会回复消息了。请先定位原因，再小范围修复。不要做无关 UI 重构。修完后跑相关测试。
```

适合权限：完全访问权限。

建议结束前要求：

```text
请总结你改了哪些文件、为什么这么改、验证命令是什么。
```

### 工作流 3：改 UI

```text
按我截图里的风格改这个界面。只改视觉和布局，不改业务逻辑。改完后启动桌面端让我检查。
```

适合权限：完全访问权限。

建议模型做：

- 先保存当前版本快照。
- 改 UI。
- 跑组件测试。
- 打包启动。
- 截图验证。

### 工作流 4：做版本快照

如果当前目录不是 Git 仓库，可以让模型复制快照：

```text
把当前版本保存到 /Users/xiaowo1800gmail.com/Documents/cli/backups，目录名带上时间和说明，方便以后恢复。
```

如果是 Git 仓库，优先用 Git：

```bash
git status
git add ...
git commit -m "save working ui baseline"
```

### 工作流 5：生成复盘笔记

```text
把这次修改记录到我的 Obsidian Daily：做了什么、为什么做、验证结果、下一步。
```

适合把长期项目经验沉淀下来。

## 故障处理

### 模型不会回复

优先检查：

1. Provider 是否激活。
2. API Key 或 Auth Token 是否有效。
3. Base URL 是否正确。
4. 模型 ID 是否真实存在。
5. 当前权限是否阻止了必要操作。
6. 诊断页是否有 CLI 启动错误。

可尝试：

```bash
bun run smoke:laohuang-runtime
```

### 会话卡住

可以按顺序尝试：

1. 点击停止。
2. 刷新会话。
3. 新建会话复现。
4. 打开诊断复制错误摘要。
5. 运行 Doctor。
6. 重新启动 App。

### UI 改坏了

优先看有没有快照：

```text
/Users/xiaowo1800gmail.com/Documents/cli/backups
```

如果项目在 Git 中：

```bash
git status
git diff
```

先看 diff，不要直接硬重置，除非你确认所有未提交修改都不要了。

### 工作区显示不对

检查：

- 项目目录是否还存在。
- 当前目录是不是 Git 仓库。
- 是否打开了隔离 worktree。
- 文件是否太大或二进制。
- 是否被路径安全规则拒绝。

### Computer Use 不可用

检查：

- 设置里 Computer Use 是否启用。
- Python/venv 是否绿色。
- macOS Accessibility 是否授权。
- macOS Screen Recording 是否授权。
- 当前 App 是否在授权列表。
- 环境变量 `CLAUDE_COMPUTER_USE_ENABLED=0` 是否禁用了功能。

### H5 或 IM 连接不上

检查：

- H5 是否启用。
- token 是否是最新。
- allowed origin 是否完整匹配。
- Mac 和手机是否在同一可信网络。
- 反向代理是否转发 `/api/*`、`/ws/*`、`/proxy/*`、`/sdk/*`。
- IM 平台凭证是否保存且没有被错误覆盖。

## 安全建议

### API Key

- 不要把 API Key 发到聊天里。
- 不要写入项目 README。
- 不要写入 Memory。
- 用 Provider 设置页保存。

### 文件修改

重大修改前：

- 建 Git commit。
- 或做本地快照。
- 或使用 isolated worktree。

### 权限

完全访问权限很方便，但要有边界：

- 只在可信项目里用。
- 给明确任务范围。
- 高风险命令先让模型解释。
- 不要让模型随意清理系统目录。

### 远程入口

H5 和 IM 都应该有明确边界：

- 只给自己或可信团队用。
- token/白名单不要公开。
- 用完关闭。

## 给 AI老黄的推荐用法

如果你把 LaoHuang 版当成日常 AI 编程工作台，推荐这样用：

1. 每次大改前先保存版本。
2. UI 任务先给截图，再要求“只改 UI，不改业务逻辑”。
3. 功能修复要求模型跑测试和启动 App。
4. 重要过程写入 Obsidian Daily。
5. 高频流程沉淀成 Skills。
6. 对不确定的改动使用 isolated worktree。
7. 用 Workspace 面板检查模型到底改了什么。
8. 用诊断页保留错误摘要，方便跨会话继续。

## 附录：常用命令

从项目根目录运行：

```bash
# 启动已打包 App 并校验进程
./script/build_and_run.sh --verify

# 重新构建并启动 App
./script/build_and_run.sh --rebuild --verify

# 运行 LaoHuang runtime smoke
bun run smoke:laohuang-runtime

# 运行桌面服务测试
bun run test:desktop-server

# 运行整体质量检查
bun run quality:laohuang
```

桌面端目录：

```bash
cd desktop

# 运行前端测试
bun run test -- --run

# 类型检查
bun run lint
```

CLI：

```bash
./bin/claude-code-laohuang
./bin/claude-code-laohuang -p "explain this project"
echo "explain this code" | ./bin/claude-code-laohuang -p
./bin/claude-code-laohuang --help
```

## 当前边界

截至本橙皮书写入时，以下能力已经有自动化测试或配置验证，但真实账号/真实设备 live 验证仍需要按环境补齐：

- OpenAI OAuth 浏览器登录。
- Telegram、飞书、微信、钉钉真实收发消息。
- Computer Use 实际控制目标 App。
- H5 从第二设备访问。
- 真实模型请求触发 isolated worktree materialization。
- Rewind 在真实长会话中的完整恢复体验。

这些不是不能用，而是不要在没有 live 验证前把它们当成生产级承诺。
