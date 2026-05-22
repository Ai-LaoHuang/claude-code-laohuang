# Claude-code-laohuang 新电脑迁移说明

这份项目已经清空了当前电脑上的 API 配置和本机专用设置。

## 迁移到另一台 Mac

1. 安装 Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

2. 进入项目目录安装依赖

```bash
cd claude-code-laohuang-main
bun install
```

3. 配置新的 API

```bash
cp .env.example .env
```

然后编辑 `.env`，填入你自己的：

- `ANTHROPIC_AUTH_TOKEN`
- `ANTHROPIC_BASE_URL`
- `ANTHROPIC_MODEL`
- `ANTHROPIC_DEFAULT_SONNET_MODEL`
- `ANTHROPIC_DEFAULT_HAIKU_MODEL`
- `ANTHROPIC_DEFAULT_OPUS_MODEL`

4. 启动

```bash
./bin/claude-code-laohuang
```

无头测试：

```bash
./bin/claude-code-laohuang -p "Reply with exactly OK"
```

## 迁移到 Windows

1. 安装 Bun
2. 安装 Git for Windows
3. 进入项目目录安装依赖

```powershell
bun install
```

4. 复制配置模板

```powershell
copy .env.example .env
```

5. 编辑 `.env`，填入你自己的 API 配置

6. 启动

```powershell
bun --env-file=.env ./src/entrypoints/cli.tsx
```

无头测试：

```powershell
bun --env-file=.env ./src/entrypoints/cli.tsx -p "Reply with exactly OK"
```

## 说明

- 当前目录里的 `.env` 已经不包含旧 key
- `.claude/`、`dist/`、`build-windows/` 已默认视为本机或构建产物，不建议作为迁移核心内容
- 最稳的迁移方式是复制源码目录后在目标机器重新 `bun install`
