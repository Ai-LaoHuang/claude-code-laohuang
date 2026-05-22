# Claude Code LaoHuang

<p align="right"><a href="./README.md">中文</a> | <strong>English</strong></p>

<p align="center">
  <img src="desktop/public/app-icon.png" alt="Claude Code LaoHuang" width="96" height="96">
</p>

<p align="center">
  <strong>Claude Code LaoHuang</strong><br>
  A locally runnable Claude Code desktop workbench.
</p>

Claude Code LaoHuang is a desktop AI coding workbench for local project work. It keeps the project context, tool execution, and multi-model provider flow from Claude Code, then wraps them in a desktop UI for daily use.

The desktop app supports Anthropic-compatible API providers, including MiniMax, DeepSeek, OpenRouter, and similar endpoints.

---

## Desktop Preview

This is a real screenshot of the macOS desktop `.app`. The workbench includes a project sidebar, session list, conversation area, tool activity, permission mode, model selector, context usage, and bottom composer.

<p align="center">
  <img src="docs/desktop/screenshots/workbench-main.png" alt="Claude Code LaoHuang desktop workbench" width="900">
</p>

## Download Desktop App

- [macOS Apple Silicon `.dmg`](https://github.com/Ai-LaoHuang/claude-code-laohuang/releases/download/v0.1.0/Claude-Code-LaoHuang_0.1.0_macos_arm64.dmg)
- [Windows x64 `.exe` installer](https://github.com/Ai-LaoHuang/claude-code-laohuang/releases/download/v0.1.0/Claude-Code-LaoHuang_0.1.0_windows_x64_setup.exe)
- [v0.1.0 release page](https://github.com/Ai-LaoHuang/claude-code-laohuang/releases/tag/v0.1.0)

The macOS package is a local Apple Silicon build and is not notarized yet. macOS may show a Gatekeeper warning the first time it is opened.

macOS DMG SHA256:

```text
f1de4b9b1c8162898a4f26b4f922079242f42a1a99d10b9bf9764e821806f171
```

Windows installer SHA256:

```text
eec6531c177106bdc1943d56b5cac08effa62bc4792407c808e646ed09419b9e
```

## Desktop Highlights

- Native desktop workbench: manage projects and session history from the sidebar while keeping the main conversation and tool results in one place.
- Local project workflow: open projects, launch terminals, inspect the workspace, and continue coding tasks around the current directory.
- Multi-provider model setup: configure Anthropic-compatible providers such as MiniMax, DeepSeek, and OpenRouter.
- Permission mode controls: switch access modes from the composer for review, editing, and more automated workflows.
- Context usage display: watch long-context pressure directly from the input area.
- Desktop installer path: macOS has local `.app` / `.dmg` builds; Windows x64 builds an NSIS desktop installer through GitHub Actions on a Windows runner.

## Installer Status

| Platform | Status | Notes |
|------|------|------|
| macOS Apple Silicon | Verified | Local build output includes `.app` and `.dmg` |
| Windows x64 | Automated build configured | The `Build Windows Desktop Installer` GitHub Actions workflow creates a desktop NSIS `.exe` installer |

The Windows desktop installer handles WebView2 during installation and checks Git for Windows. If a dependency cannot be installed automatically, it shows a clear Chinese failure message with manual installation guidance.

## Documentation

- [Desktop user guide](docs/desktop/orange-book.md)
- [Windows desktop installer notes](docs/desktop/windows-desktop-installer.md)
- [Desktop docs index](docs/desktop/index.md)
- [Current feature state](docs/desktop/current-feature-state.md)

## Development And Packaging

The desktop app lives in `desktop/`. Packaging scripts live in `desktop/scripts/`.

```bash
# macOS Apple Silicon desktop build
cd desktop
bun install
bun run build:macos-arm64
```

```powershell
# Windows x64 desktop installer build, run on a Windows build machine
cd desktop
powershell -ExecutionPolicy Bypass -File ./scripts/build-windows-x64.ps1
```

## Note

This repository contains local runnable fixes and desktop packaging work around Claude Code related source material. It is provided for learning, research, and local practice.
