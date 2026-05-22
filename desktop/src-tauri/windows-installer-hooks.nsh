!include "LogicLib.nsh"
!include "x64.nsh"

!macro LAOHUANG_FIND_GIT_FOR_WINDOWS OUT_VAR
  StrCpy ${OUT_VAR} ""

  ${If} ${FileExists} "$PROGRAMFILES64\Git\bin\bash.exe"
    StrCpy ${OUT_VAR} "$PROGRAMFILES64\Git"
  ${ElseIf} ${FileExists} "$PROGRAMFILES\Git\bin\bash.exe"
    StrCpy ${OUT_VAR} "$PROGRAMFILES\Git"
  ${Else}
    SetRegView 64
    ClearErrors
    ReadRegStr ${OUT_VAR} HKLM "SOFTWARE\GitForWindows" "InstallPath"
    ${If} ${Errors}
    ${OrIfNot} ${FileExists} "${OUT_VAR}\bin\bash.exe"
      SetRegView 32
      ClearErrors
      ReadRegStr ${OUT_VAR} HKLM "SOFTWARE\GitForWindows" "InstallPath"
      ${If} ${Errors}
      ${OrIfNot} ${FileExists} "${OUT_VAR}\bin\bash.exe"
        SetRegView lastused
        ClearErrors
        ReadRegStr ${OUT_VAR} HKCU "SOFTWARE\GitForWindows" "InstallPath"
        ${If} ${Errors}
        ${OrIfNot} ${FileExists} "${OUT_VAR}\bin\bash.exe"
          StrCpy ${OUT_VAR} ""
        ${EndIf}
      ${EndIf}
    ${EndIf}
    SetRegView lastused
  ${EndIf}
!macroend

!macro LAOHUANG_INSTALL_GIT_FOR_WINDOWS
  DetailPrint "Git for Windows is required for project shell commands. Checking installation..."
  !insertmacro LAOHUANG_FIND_GIT_FOR_WINDOWS $1

  ${If} $1 != ""
    DetailPrint "Git for Windows found: $1"
  ${Else}
    MessageBox MB_YESNO|MB_ICONQUESTION "Claude Code LaoHuang 桌面版需要 Git for Windows。$\r$\n$\r$\n它提供 Git 和 Git Bash，用于项目命令、代码仓库操作和部分 Shell 工具。$\r$\n$\r$\n安装器可以现在自动下载并静默安装 Git for Windows。是否继续？" IDYES +2 IDNO 0
    Abort "缺少 Git for Windows。请安装 https://git-scm.com/download/win 后重新运行安装器。"

    DetailPrint "Downloading and installing Git for Windows..."
    nsExec::ExecToLog `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$$ErrorActionPreference = 'Stop'; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $$release = Invoke-RestMethod 'https://api.github.com/repos/git-for-windows/git/releases/latest'; $$asset = $$release.assets | Where-Object { $$_.name -match '^Git-.*-64-bit\.exe$$' } | Select-Object -First 1; if (-not $$asset) { throw 'Cannot find Git for Windows 64-bit installer in latest GitHub release.' }; $$out = Join-Path $$env:TEMP 'GitForWindowsSetup.exe'; Invoke-WebRequest -Uri $$asset.browser_download_url -OutFile $$out; $$proc = Start-Process -FilePath $$out -ArgumentList '/VERYSILENT','/NORESTART','/NOCANCEL','/SP-' -Wait -PassThru; if ($$proc.ExitCode -ne 0) { throw ('Git installer exited with code ' + $$proc.ExitCode) }; if (-not (Test-Path 'C:\Program Files\Git\bin\bash.exe')) { throw 'Git installer finished, but C:\Program Files\Git\bin\bash.exe was not found.' }"`
    Pop $0
    ${If} $0 != 0
      MessageBox MB_OK|MB_ICONSTOP "自动安装 Git for Windows 失败。$\r$\n$\r$\n可能原因：网络无法访问 GitHub、系统权限不足、杀毒软件拦截，或 GitHub 下载失败。$\r$\n$\r$\n请手动安装 Git for Windows：$\r$\nhttps://git-scm.com/download/win$\r$\n$\r$\n安装后重新运行 Claude Code LaoHuang 安装器。"
      Abort "Git for Windows 自动安装失败。"
    ${EndIf}

    !insertmacro LAOHUANG_FIND_GIT_FOR_WINDOWS $1
    ${If} $1 == ""
      MessageBox MB_OK|MB_ICONSTOP "Git for Windows 安装后仍未检测到 bash.exe。$\r$\n$\r$\n请确认 Git 安装在默认目录，或稍后在 Claude Code LaoHuang 的设置 > 终端中手动配置 Bash 路径。"
      Abort "Git for Windows 安装校验失败。"
    ${EndIf}
    DetailPrint "Git for Windows installed: $1"
  ${EndIf}
!macroend

!macro NSIS_HOOK_PREINSTALL
  DetailPrint "Stopping running Claude Code LaoHuang sidecars..."
  nsExec::ExecToLog 'taskkill /F /T /IM claude-sidecar-x86_64-pc-windows-msvc.exe'
  Pop $0
  nsExec::ExecToLog 'taskkill /F /T /IM claude-sidecar-aarch64-pc-windows-msvc.exe'
  Pop $0
  nsExec::ExecToLog 'taskkill /F /T /IM claude-sidecar.exe'
  Pop $0
  Sleep 1000

  !insertmacro LAOHUANG_INSTALL_GIT_FOR_WINDOWS
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  DetailPrint "Stopping running Claude Code LaoHuang processes..."
  nsExec::ExecToLog 'taskkill /F /T /IM claude-code-desktop.exe'
  Pop $0
  nsExec::ExecToLog 'taskkill /F /T /IM claude-sidecar-x86_64-pc-windows-msvc.exe'
  Pop $0
  nsExec::ExecToLog 'taskkill /F /T /IM claude-sidecar-aarch64-pc-windows-msvc.exe'
  Pop $0
  nsExec::ExecToLog 'taskkill /F /T /IM claude-sidecar.exe'
  Pop $0
  Sleep 1000
!macroend
