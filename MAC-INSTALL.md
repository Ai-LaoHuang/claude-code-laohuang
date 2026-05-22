# Claude-code-laohuang Mac 一键安装

## 用法

1. 解压项目
2. 双击：

`Claude-code-laohuang-Mac-一键安装.command`

## 安装器会做什么

- 自动检查并安装 Bun
- 自动执行 `bun install`
- 如果 `.env` 不存在，自动从 `.env.example` 创建
- 如果 API 还没填，会自动用 TextEdit 打开 `.env`
- API 已填好时，自动启动 `Claude-code-laohuang`
- 自动在桌面生成启动器：
  `~/Desktop/Claude-code-laohuang.command`

## 首次配置需要填写

- `ANTHROPIC_AUTH_TOKEN`
- `ANTHROPIC_BASE_URL`
- `ANTHROPIC_MODEL`
- `ANTHROPIC_DEFAULT_SONNET_MODEL`
- `ANTHROPIC_DEFAULT_HAIKU_MODEL`
- `ANTHROPIC_DEFAULT_OPUS_MODEL`
