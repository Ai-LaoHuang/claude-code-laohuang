# Computer Use

Computer Use lets Claude Code LaoHuang expose a dynamic `computer-use` MCP
server so an active coding session can inspect the screen and operate the
desktop by screenshot, mouse, keyboard, clipboard, and app-control tools.

This page documents the current LaoHuang wiring. The upstream reference has
fuller product prose under
`/Users/xiaowo1800gmail.com/Downloads/cc-haha-main 2/docs/features/computer-use.md`,
but this app keeps its own storage, launcher, branding, and verification notes.

## Current Status

| Area | State | Notes |
| --- | --- | --- |
| Settings page | Wired | `desktop/src/pages/ComputerUseSettings.tsx` reads status, setup, installed apps, authorized apps, grant flags, and custom Python path. |
| Desktop server API | Tested | `/api/computer-use/*` is covered by focused backend tests. |
| Runtime approval modal | Tested in UI | `ComputerUsePermissionModal` handles app approval and macOS TCC permission prompts. |
| Python runtime bridge | Partially tested | Python discovery, custom interpreter normalization, and requirement pinning are covered. Real screenshot/click/type still needs target-machine validation. |
| Dynamic MCP injection | Wired for interactive macOS sessions | The CLI injects the `computer-use` MCP config when `CHICAGO_MCP` is enabled, the platform is macOS, the session is interactive, and Computer Use is enabled. |

## Main Code Paths

| Layer | Path |
| --- | --- |
| Settings API client | `desktop/src/api/computerUse.ts` |
| Settings UI | `desktop/src/pages/ComputerUseSettings.tsx` |
| Runtime approval UI | `desktop/src/components/chat/ComputerUsePermissionModal.tsx` |
| Server routes | `src/desktop-server/api/computer-use.ts` |
| WebSocket approval bridge | `src/desktop-server/services/computerUseApprovalService.ts` |
| Dynamic MCP setup | `src/utils/computerUse/setup.ts` |
| Tool call wrapper | `src/utils/computerUse/wrapper.tsx` |
| Python bridge | `src/utils/computerUse/pythonBridge.ts` |
| Desktop executor | `src/utils/computerUse/executor.ts` |
| Runtime helpers | `runtime/mac_helper.py`, `runtime/win_helper.py` |

## API Surface

All routes live under `/api/computer-use`.

| Route | Purpose |
| --- | --- |
| `GET /status` | Checks supported platform, Python runtime, venv, dependency stamp, and OS permissions. |
| `POST /setup` | Writes runtime helper files, creates `~/.claude/.runtime/venv`, installs requirements, and records the requirements digest. |
| `GET /apps` | Lists installed apps through the Python helper when the runtime is ready. |
| `GET /authorized-apps` | Reads persisted Computer Use config. |
| `PUT /authorized-apps` | Updates `enabled`, `authorizedApps`, `grantFlags`, and `pythonPath`. |
| `POST /open-settings` | Opens macOS Privacy panes or Windows privacy settings. |
| `POST /request-access` | Bridges runtime MCP permission requests into the desktop WebSocket session. |

## Storage

Computer Use uses the inherited cc-haha config namespace:

```text
~/.claude/cc-haha/computer-use-config.json
~/.claude/.runtime/
~/.claude/.runtime/venv/
~/.claude/.runtime/requirements.sha256
~/.claude/.runtime/venv-base-interpreter.txt
```

The config shape is:

```json
{
  "enabled": true,
  "authorizedApps": [
    {
      "bundleId": "com.apple.Terminal",
      "displayName": "Terminal",
      "authorizedAt": "2026-05-19T00:00:00.000Z"
    }
  ],
  "grantFlags": {
    "clipboardRead": true,
    "clipboardWrite": true,
    "systemKeyCombos": true
  },
  "pythonPath": null
}
```

`enabled` now participates in the CLI gate through
`src/utils/computerUse/gates.ts`; when the Settings toggle is off, new
interactive sessions do not expose the `computer-use` MCP tools unless the
config is turned back on. `CLAUDE_COMPUTER_USE_ENABLED=0` remains a stronger
environment override.

## Runtime Flow

1. A desktop session starts the CLI with `CC_HAHA_DESKTOP_SERVER_URL` when the
   SDK/WebSocket bridge is available.
2. `src/main.tsx` checks the feature gate, macOS platform, interactive mode,
   and `getChicagoEnabled()`.
3. `setupComputerUseMCP()` adds the dynamic `computer-use` stdio config and
   `mcp__computer-use__*` allowed tool names.
4. MCP client connection is intercepted in-process by `client.ts` and
   `createComputerUseMcpServerForCli()`.
5. Tool calls go through `wrapper.tsx`, which binds the session context,
   loads preauthorized apps, enforces the file lock, and forwards permission
   prompts.
6. `executor.ts` sends concrete operations to `runtime/mac_helper.py` or
   `runtime/win_helper.py` through `pythonBridge.ts`.

## Permissions And Safety

- App control is allowlisted by bundle ID. Settings can preauthorize apps, and
  runtime requests can ask the user before a tool proceeds.
- Grant flags cover clipboard read, clipboard write, and system key combos.
- A file lock prevents multiple sessions from using Computer Use at the same
  time.
- macOS requires Accessibility and Screen Recording permissions. The app can
  open the matching System Settings panes, but the user still grants the OS
  permission manually.
- The Python bridge saves and restores clipboard contents when typing through
  clipboard paste.
- Pressing Escape can abort a Computer Use turn when the hotkey registers;
  otherwise the fallback is stopping the session from the UI or interrupting
  the CLI.

## Manual Validation Checklist

Run this on the target Mac before claiming full desktop-control readiness:

1. Open Settings > Computer Use and confirm Python, venv, dependencies, and
   macOS permissions are green.
2. Toggle Computer Use off, start a new session, and confirm the model cannot
   call `mcp__computer-use__*` tools.
3. Toggle it back on, preauthorize a harmless app such as Calculator or TextEdit.
4. Ask the model to screenshot the desktop, click inside that app, type a short
   string, and report what it sees.
5. Deny one runtime app permission request and confirm the tool call stops
   cleanly.
6. Try one clipboard-based text entry and confirm the original clipboard is
   restored afterward.

## Automated Verification

Focused checks:

```bash
bun test src/desktop-server/__tests__/computer-use-api.test.ts \
  src/desktop-server/__tests__/computer-use-python.test.ts \
  src/desktop-server/__tests__/computer-use-requirements.test.ts

cd desktop && bun run test -- \
  src/pages/ComputerUseSettings.test.tsx \
  src/components/chat/ComputerUsePermissionModal.test.tsx \
  --run
```

General smoke:

```bash
bun run smoke:laohuang-runtime
```

These checks verify config behavior, UI rendering, Python discovery, and the
runtime setup contract. They do not physically move the mouse or inspect the
real screen; that remains a manual target-machine validation.
