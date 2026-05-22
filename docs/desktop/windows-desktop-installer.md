# Windows 桌面版安装器

这页记录 Claude Code LaoHuang 的 Windows 桌面版打包方式和安装时依赖处理。

## 目标

Windows 用户拿到的应该是一个桌面版安装器，而不是命令行源码包。

安装器应尽量做到：

- 双击安装。
- 自动准备必要运行环境。
- 无法自动安装时，给出明确失败原因和手动安装地址。
- 安装完成后能从开始菜单或桌面快捷方式启动 `Claude Code LaoHuang` 桌面窗口。

## 构建产物

新的 Windows 桌面版构建脚本生成 NSIS `.exe` 安装器：

```text
desktop/build-artifacts/windows-x64/Claude-Code-LaoHuang_0.1.0_windows_x64_setup.exe
```

它不是旧的根目录 `dist/claude-code-laohuang-setup.exe`。旧的 CLI/TUI 源码运行包安装器链路已经移除，避免和当前桌面版发布路径混淆。

## 构建命令

必须在 Windows 主机运行：

```powershell
cd desktop
powershell -ExecutionPolicy Bypass -File ./scripts/build-windows-x64.ps1
```

构建机需要：

- Windows x64
- Bun
- Rust
- Visual Studio 2022 Build Tools
- `Desktop development with C++` / `VC.Tools.x86.x64`

这些是构建机依赖，不是最终用户依赖。

## 最终用户安装时自动处理的依赖

### WebView2 Runtime

`desktop/src-tauri/tauri.conf.json` 中配置了：

```json
"webviewInstallMode": {
  "type": "embedBootstrapper",
  "silent": true
}
```

安装器会嵌入 Microsoft WebView2 bootstrapper，并在目标机器缺少 WebView2 Runtime 时静默安装。

如果 WebView2 安装失败，通常原因是：

- 目标机器无法访问 Microsoft 下载地址。
- 系统权限不足。
- 企业策略或安全软件阻止安装。

### Git for Windows

`desktop/src-tauri/windows-installer-hooks.nsh` 会在安装前检查 Git for Windows：

- 默认路径：`C:\Program Files\Git\bin\bash.exe`
- 注册表：`HKLM/HKCU\SOFTWARE\GitForWindows\InstallPath`

如果没有检测到，安装器会询问用户是否自动下载并静默安装 Git for Windows。

自动安装流程：

1. 通过 GitHub Releases API 找到最新 `Git-*-64-bit.exe`。
2. 下载到 `%TEMP%\GitForWindowsSetup.exe`。
3. 使用 `/VERYSILENT /NORESTART /NOCANCEL /SP-` 静默安装。
4. 再次检查 `C:\Program Files\Git\bin\bash.exe`。

如果失败，安装器会显示中文错误提示，并给出手动安装地址：

```text
https://git-scm.com/download/win
```

常见失败原因：

- 无法访问 GitHub。
- 没有管理员权限。
- 杀毒软件或企业安全策略拦截。
- GitHub API 或下载链接不可用。
- Git 安装到了非默认目录。

如果 Git 安装在非默认目录，用户可以之后在：

```text
设置 > 终端
```

手动配置 Bash 路径。

## 为什么改成 NSIS `.exe`

之前 Windows 桌面脚本构建 `.msi`：

```powershell
tauri build --bundles msi
```

但项目现有的安装器 hook 是 NSIS hook：

```text
desktop/src-tauri/windows-installer-hooks.nsh
```

NSIS 可以更直接地做安装前依赖检查、自动安装和中文错误提示。因此脚本改为：

```powershell
tauri build --bundles nsis
```

## 注意

- 这套改动解决的是最终用户安装体验。
- Windows 桌面安装器仍必须在 Windows 构建机上生成；macOS 不能直接产出可验证的 Windows Tauri 桌面安装器。
- 安装器不要求最终用户安装 Bun、Rust 或 Visual Studio Build Tools。
- 如果目标机器网络无法访问 Microsoft/GitHub，WebView2 或 Git 的自动安装可能失败，需要手动下载安装。
