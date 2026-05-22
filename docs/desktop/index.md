# Desktop Docs

Claude Code LaoHuang is the customized desktop app built from the cc-haha
reference tree. It keeps the upstream desktop-server architecture and adds the
LaoHuang identity, visual shell, provider defaults, and local quality gate.

## Documents

- [Current feature state](./current-feature-state.md)
- [使用橙皮书](./orange-book.md)
- [Quality and upstream backfill](./quality-and-backfill.md)
- [H5 access](./h5-access.md)
- [IM adapters](./im-adapters.md)
- [Agents and teams](./agents-and-teams.md)
- [Memory](./memory.md)
- [Skills](./skills.md)
- [Provider and model runtime](./provider-model-runtime.md)
- [Computer Use](./computer-use.md)
- [Workspace and worktrees](./workspace-and-worktrees.md)
- [Windows 桌面版安装器](./windows-desktop-installer.md)

## Main Runtime Pieces

| Area | Current LaoHuang path |
| --- | --- |
| Desktop UI | `desktop/src` |
| Tauri app shell | `desktop/src-tauri` |
| Desktop server | `src/desktop-server` |
| CLI entry | `bin/claude-code-laohuang` |
| Provider runtime | `src/desktop-server/services/providerService.ts` and managed settings |
| Workspace/worktree runtime | `src/desktop-server/services/workspaceService.ts` and `src/desktop-server/services/repositoryLaunchService.ts` |
| Backfill plan | `docs/project-audit/upstream-backfill-plan.md` |

## What Changed From Upstream

- Server code is under `src/desktop-server`, while upstream docs and tests often
  refer to `src/server`.
- The launcher command is `claude-code-laohuang`.
- Version is `0.1.0`.
- Default verified provider path is direct MiniMax/OpenAI-compatible style,
  not the local Codex bridge unless `USE_CODEX_BRIDGE=1` is explicitly used.
- The desktop UI has been restyled toward the current glass/acrylic LaoHuang
  shell.
- The auto-updater endpoint is intentionally not pointed at the old upstream
  repository.

## Next Documentation Work

The backfilled test suite gives enough coverage to write docs in smaller
verified slices:

1. OpenAI OAuth live login and updater/release configuration when the final
   LaoHuang GitHub release URL is available.
2. Packaged-app manual pass for workspace panel, isolated worktree creation,
   and rewind in a disposable repository.
