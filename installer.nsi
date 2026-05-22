!include "MUI2.nsh"
!include "FileFunc.nsh"

; 安装器基本信息
Name "Claude-code-laohuang"
OutFile "dist\claude-code-laohuang-setup.exe"
InstallDir "$PROGRAMFILES\\claude-code-laohuang"
InstallDirRegKey HKLM "Software\\claude-code-laohuang" "Install_Dir"
ShowInstDetails show
ShowUnInstDetails show
RequestExecutionLevel admin

; MUI 配置
!define MUI_ABORTWARNING
!define MUI_ICON "build-windows\\docs\\icon.ico"
!define MUI_UNICON "build-windows\\docs\\icon.ico"
!define MUI_WELCOMEFINISHPAGE_BITMAP "build-windows\\docs\\welcome.bmp"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "build-windows\\docs\\header.bmp"

; 欢迎页面
!insertmacro MUI_PAGE_WELCOME

; 许可协议页面
;!define MUI_LICENSEPAGE_TEXT_BOTTOM "点击"我同意"继续安装"
;!insertmacro MUI_PAGE_LICENSE "build-windows\\LICENSE"

; 安装目录选择页面
!insertmacro MUI_PAGE_DIRECTORY

; 安装进度页面
!insertmacro MUI_PAGE_INSTFILES

; 完成页面
!define MUI_FINISHPAGE_RUN "$INSTDIR\\启动应用.bat"
!define MUI_FINISHPAGE_RUN_TEXT "立即启动 Claude-code-laohuang"
!insertmacro MUI_PAGE_FINISH

; 卸载确认页面
!insertmacro MUI_UNPAGE_CONFIRM

; 卸载进度页面
!insertmacro MUI_UNPAGE_INSTFILES

; 卸载完成页面
!insertmacro MUI_UNPAGE_FINISH

; 语言
!insertmacro MUI_LANGUAGE "SimpChinese"

; 安装部分
Section "Claude-code-laohuang (必填)" Sec01
  SectionIn RO
  SetOutPath "$INSTDIR"

  ; 复制所有文件
  File /r "build-windows\\*.*"
  File /r "build-windows\\src"
  File /r "build-windows\\stubs"
  File /r "build-windows\\docs"
  File /r "build-windows\\node_modules"

  ; 创建开始菜单快捷方式
  CreateDirectory "$SMPROGRAMS\\Claude-code-laohuang"
  CreateShortcut "$SMPROGRAMS\\Claude-code-laohuang\\启动应用.lnk" "$INSTDIR\\启动应用.bat"
  CreateShortcut "$SMPROGRAMS\\Claude-code-laohuang\\卸载.lnk" "$INSTDIR\\uninstall.bat"

  ; 创建桌面快捷方式
  CreateShortcut "$DESKTOP\\Claude-code-laohuang.lnk" "$INSTDIR\\启动应用.bat"

  ; 写入注册表
  WriteRegStr HKLM "Software\\claude-code-laohuang" "Install_Dir" "$INSTDIR"
  WriteRegStr HKLM "Software\\claude-code-laohuang" "UninstallString" '$INSTDIR\\uninstall.exe'

  ; 创建卸载程序
  WriteUninstaller "$INSTDIR\\uninstall.exe"
SectionEnd

; 环境变量配置（可选）
Section "配置环境变量 (可选)" Sec02
  ; 将安装目录添加到 PATH
  nsExec::Exec 'setx /M PATH "%PATH%;$INSTDIR"'
SectionEnd

; 卸载部分
Section "Uninstall"
  ; 删除快捷方式
  Delete "$SMPROGRAMS\\Claude-code-laohuang\\启动应用.lnk"
  Delete "$SMPROGRAMS\\Claude-code-laohuang\\卸载.lnk"
  RMDir "$SMPROGRAMS\\Claude-code-laohuang"
  Delete "$DESKTOP\\Claude-code-laohuang.lnk"

  ; 删除安装目录
  RMDir /r "$INSTDIR"

  ; 删除注册表
  DeleteRegKey /ifempty HKLM "Software\\claude-code-laohuang"

  MessageBox MB_OK "卸载完成！"
SectionEnd
