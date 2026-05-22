#!/usr/bin/env bun
/**
 * Windows 安装包构建脚本
 *
 * 流程：
 * 1. 使用 bun build 打包源代码
 * 2. 收集所有必要文件（node_modules, stubs, 资源文件）
 * 3. 创建 Windows 启动脚本 (.bat)
 * 4. 使用 NSIS 或 Inno Setup 打包成安装包
 */

import { $ } from "bun";
import { mkdir, cp, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const ROOT_DIR = path.join(import.meta.dir, "..");
const BUILD_DIR = path.join(ROOT_DIR, "build-windows");
const DIST_DIR = path.join(ROOT_DIR, "dist");

function createSolidBmp(width: number, height: number, rgb: [number, number, number]): Buffer {
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelSize = rowSize * height;
  const fileSize = 54 + pixelSize;
  const bmp = Buffer.alloc(fileSize);

  bmp.write("BM", 0);
  bmp.writeUInt32LE(fileSize, 2);
  bmp.writeUInt32LE(54, 10);
  bmp.writeUInt32LE(40, 14);
  bmp.writeInt32LE(width, 18);
  bmp.writeInt32LE(height, 22);
  bmp.writeUInt16LE(1, 26);
  bmp.writeUInt16LE(24, 28);
  bmp.writeUInt32LE(pixelSize, 34);

  const [r, g, b] = rgb;
  for (let y = 0; y < height; y++) {
    const rowOffset = 54 + y * rowSize;
    for (let x = 0; x < width; x++) {
      const offset = rowOffset + x * 3;
      bmp[offset] = b;
      bmp[offset + 1] = g;
      bmp[offset + 2] = r;
    }
  }

  return bmp;
}

function createIcoFromPng(png: Buffer): Buffer {
  const ico = Buffer.alloc(22);
  ico.writeUInt16LE(0, 0);
  ico.writeUInt16LE(1, 2);
  ico.writeUInt16LE(1, 4);
  ico[6] = 16;
  ico[7] = 16;
  ico[8] = 0;
  ico[9] = 0;
  ico.writeUInt16LE(1, 10);
  ico.writeUInt16LE(32, 12);
  ico.writeUInt32LE(png.length, 14);
  ico.writeUInt32LE(22, 18);
  return Buffer.concat([ico, png]);
}

console.log("🔨 开始构建 Windows 安装包...\n");

// 步骤 1: 清理旧构建
console.log("📦 步骤 1: 清理旧构建目录");
if (existsSync(BUILD_DIR)) {
  await $`rm -rf ${BUILD_DIR}`;
}
await mkdir(BUILD_DIR, { recursive: true });
await mkdir(DIST_DIR, { recursive: true });
console.log(`   创建目录：${BUILD_DIR}\n`);

// 步骤 2: 复制项目文件
console.log("📦 步骤 2: 复制必要文件到构建目录");
const filesToCopy = [
  "package.json",
  "bun.lock",
  ".env.example",
  "README.md",
  "src",
  "stubs",
  "docs",
];

for (const file of filesToCopy) {
  const src = path.join(ROOT_DIR, file);
  const dest = path.join(BUILD_DIR, file);
  if (existsSync(src)) {
    await cp(src, dest, { recursive: true });
    console.log(`   ✓ ${file}`);
  }
}
console.log();

// 步骤 3: 创建 Windows 启动脚本
console.log("📦 步骤 3: 创建 Windows 启动脚本");
const startBat = `@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

REM 检查是否安装了 Bun
where bun >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [错误] 未检测到 Bun 运行时
    echo.
    echo 请先安装 Bun: https://bun.sh
    echo 或使用以下命令安装:
    echo   powershell -c "irm bun.sh/install.ps1 | iex"
    echo.
    pause
    exit /b 1
)

REM 设置环境变量
if exist ".env" (
    for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
        if not "%%A"=="" if not "%%A:~0,1"=="#" set "%%A=%%B"
    )
)

REM 启动应用
echo.
echo ========================================
echo   Claude-code-laohuang
echo ========================================
echo.

bun run --feature BUDDY --feature PROACTIVE --feature KAIROS_BRIEF --feature KAIROS_DREAM --feature ULTRAPLAN --feature BRIDGE_MODE ./src/entrypoints/cli.tsx %*
`;

await writeFile(path.join(BUILD_DIR, "start.bat"), startBat);
console.log("   ✓ start.bat");

const startTuiBat = `@echo off
start "Claude-code-laohuang" cmd /k "%~dp0start.bat" %*
`;
await writeFile(path.join(BUILD_DIR, "启动应用.bat"), startTuiBat);
console.log("   ✓ 启动应用.bat");

const uninstallBat = `@echo off
echo 正在卸载 Claude-code-laohuang...
echo.

if exist "%PROGRAMFILES%\\claude-code-laohuang\\uninstall.exe" (
    "%PROGRAMFILES%\\claude-code-laohuang\\uninstall.exe"
) else (
    echo 请手动删除安装目录: %PROGRAMFILES%\\claude-code-laohuang
    pause
)
`;
await writeFile(path.join(BUILD_DIR, "uninstall.bat"), uninstallBat);
console.log("   ✓ uninstall.bat\n");

// 步骤 4: 创建 NSIS 安装脚本
console.log("📦 步骤 4: 创建 NSIS 安装脚本");
const nsisScript = `!include "MUI2.nsh"
!include "FileFunc.nsh"

; 安装器基本信息
Name "Claude-code-laohuang"
OutFile "dist\\claude-code-laohuang-setup.exe"
InstallDir "$PROGRAMFILES\\\\claude-code-laohuang"
InstallDirRegKey HKLM "Software\\\\claude-code-laohuang" "Install_Dir"
ShowInstDetails show
ShowUnInstDetails show
RequestExecutionLevel admin

; MUI 配置
!define MUI_ABORTWARNING
!define MUI_ICON "build-windows\\\\docs\\\\icon.ico"
!define MUI_UNICON "build-windows\\\\docs\\\\icon.ico"
!define MUI_WELCOMEFINISHPAGE_BITMAP "build-windows\\\\docs\\\\welcome.bmp"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "build-windows\\\\docs\\\\header.bmp"

; 欢迎页面
!insertmacro MUI_PAGE_WELCOME

; 许可协议页面
;!define MUI_LICENSEPAGE_TEXT_BOTTOM "点击\"我同意\"继续安装"
;!insertmacro MUI_PAGE_LICENSE "build-windows\\\\LICENSE"

; 安装目录选择页面
!insertmacro MUI_PAGE_DIRECTORY

; 安装进度页面
!insertmacro MUI_PAGE_INSTFILES

; 完成页面
!define MUI_FINISHPAGE_RUN "$INSTDIR\\\\启动应用.bat"
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
  File /r "build-windows\\\\*.*"
  File /r "build-windows\\\\src"
  File /r "build-windows\\\\stubs"
  File /r "build-windows\\\\docs"
  File /r "build-windows\\\\node_modules"

  ; 创建开始菜单快捷方式
  CreateDirectory "$SMPROGRAMS\\\\Claude-code-laohuang"
  CreateShortcut "$SMPROGRAMS\\\\Claude-code-laohuang\\\\启动应用.lnk" "$INSTDIR\\\\启动应用.bat"
  CreateShortcut "$SMPROGRAMS\\\\Claude-code-laohuang\\\\卸载.lnk" "$INSTDIR\\\\uninstall.bat"

  ; 创建桌面快捷方式
  CreateShortcut "$DESKTOP\\\\Claude-code-laohuang.lnk" "$INSTDIR\\\\启动应用.bat"

  ; 写入注册表
  WriteRegStr HKLM "Software\\\\claude-code-laohuang" "Install_Dir" "$INSTDIR"
  WriteRegStr HKLM "Software\\\\claude-code-laohuang" "UninstallString" '$INSTDIR\\\\uninstall.exe'

  ; 创建卸载程序
  WriteUninstaller "$INSTDIR\\\\uninstall.exe"
SectionEnd

; 环境变量配置（可选）
Section "配置环境变量 (可选)" Sec02
  ; 将安装目录添加到 PATH
  nsExec::Exec 'setx /M PATH "%PATH%;$INSTDIR"'
SectionEnd

; 卸载部分
Section "Uninstall"
  ; 删除快捷方式
  Delete "$SMPROGRAMS\\\\Claude-code-laohuang\\\\启动应用.lnk"
  Delete "$SMPROGRAMS\\\\Claude-code-laohuang\\\\卸载.lnk"
  RMDir "$SMPROGRAMS\\\\Claude-code-laohuang"
  Delete "$DESKTOP\\\\Claude-code-laohuang.lnk"

  ; 删除安装目录
  RMDir /r "$INSTDIR"

  ; 删除注册表
  DeleteRegKey /ifempty HKLM "Software\\\\claude-code-laohuang"

  MessageBox MB_OK "卸载完成！"
SectionEnd
`;

await writeFile(path.join(ROOT_DIR, "installer.nsi"), nsisScript);
console.log("   ✓ installer.nsi\n");

// 步骤 5: 生成必要的资源文件（占位符）
console.log("📦 步骤 5: 生成资源文件占位符");
const resourcesDir = path.join(BUILD_DIR, "docs");
await mkdir(resourcesDir, { recursive: true });

// 创建占位图标（16x16 PNG 转 ICO 格式）
const iconPlaceholder = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAOklEQVR4AWMYGhoawXAYDgMGAA" +
  "JsYGD4z4gMJsMYDgMGAAIMAAosA0Euq3yHAAAAAElFTkSuQmCC",
  "base64"
);
await writeFile(path.join(resourcesDir, "icon.png"), iconPlaceholder);
await writeFile(path.join(resourcesDir, "icon.ico"), createIcoFromPng(iconPlaceholder));
console.log("   ✓ icon.png / icon.ico (占位符，可替换为实际图标)");

// 创建欢迎图片占位符（164x314）
const welcomeBmp = createSolidBmp(164, 314, [0x20, 0x20, 0x20]);
await writeFile(path.join(resourcesDir, "welcome.bmp"), welcomeBmp);
console.log("   ✓ welcome.bmp (占位符)");

// 创建标题图片占位符（150x57）
const headerBmp = createSolidBmp(150, 57, [0x40, 0x80, 0xc0]);
await writeFile(path.join(resourcesDir, "header.bmp"), headerBmp);
console.log("   ✓ header.bmp (占位符)\n");

// 步骤 6: 安装依赖
console.log("📦 步骤 6: 安装生产依赖");
await $`cd ${BUILD_DIR} && bun install --production`;
console.log();

// 步骤 7: 构建说明
console.log("✅ 构建准备完成！\n");
console.log("下一步操作：");
console.log("");
console.log("1. 安装 NSIS (https://nsis.sourceforge.io/Download)");
console.log("   macOS: brew install nsis");
console.log("   Windows: 下载安装程序安装");
console.log("");
console.log("2. (可选) 替换图标文件:");
console.log(`   - ${resourcesDir}/icon.ico → 替换为你的应用图标`);
console.log(`   - ${resourcesDir}/welcome.bmp → 164x314 欢迎页背景`);
console.log(`   - ${resourcesDir}/header.bmp → 150x57 标题栏图片`);
console.log("");
console.log("3. 运行 NSIS 编译安装脚本:");
console.log(`   makensis -V2 ${path.join(ROOT_DIR, "installer.nsi")}`);
console.log("");
console.log("4. 安装包将生成在:");
console.log(`   ${DIST_DIR}/claude-code-laohuang-setup.exe`);
console.log("");
