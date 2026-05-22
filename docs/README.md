# Claude Code LaoHuang Docs

This directory is the local documentation entrypoint for the customized
Claude Code LaoHuang app.

The upstream reference lives at:

`/Users/xiaowo1800gmail.com/Downloads/cc-haha-main 2/docs`

Use that upstream docs tree as a reference, not as a source to copy blindly.
LaoHuang keeps its own product identity, provider defaults, desktop UI, and
runtime verification flow.

## Start Here

- [Desktop docs](./desktop/index.md)
- [使用橙皮书](./desktop/orange-book.md)
- [Current feature state](./desktop/current-feature-state.md)
- [Quality and upstream backfill](./desktop/quality-and-backfill.md)
- [H5 access](./desktop/h5-access.md)
- [IM adapters](./desktop/im-adapters.md)
- [Agents and teams](./desktop/agents-and-teams.md)
- [Memory](./desktop/memory.md)
- [Skills](./desktop/skills.md)
- [Provider and model runtime](./desktop/provider-model-runtime.md)
- [Computer Use](./desktop/computer-use.md)
- [Workspace and worktrees](./desktop/workspace-and-worktrees.md)
- [Windows 桌面版安装器](./desktop/windows-desktop-installer.md)

## Current Verified Commands

Run from the repo root:

```bash
bun run smoke:laohuang-runtime
bun run test:desktop-server
bun run quality:laohuang
```

The most recent full verification on 2026-05-18:

- `bun run test:desktop-server`: 773 pass / 0 fail across 46 files
- `bun run quality:laohuang`: passed end to end

## Documentation Rules

- Describe the current LaoHuang behavior, not upstream assumptions.
- Keep `Claude Code LaoHuang`, version `0.1.0`, and AI老黄 branding.
- Do not reintroduce the old `NanmiCoder/cc-haha` updater or author metadata.
- Mark live-credential features such as IM adapters as "configured/tested by
  validation" unless real credentials have been used.
- Mention when a feature is verified by automated tests versus only visible in
  the UI.
- Keep demo/mock-only surfaces clearly marked so future agents do not treat
  them as production workflows.
