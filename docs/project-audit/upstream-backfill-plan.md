# Upstream Backfill Plan

Source reference: `/Users/xiaowo1800gmail.com/Downloads/cc-haha-main 2`

Working app: `/Users/xiaowo1800gmail.com/Downloads/claude-code-laohuang-main 2`

## Goal

Use `cc-haha-main 2` as a reference, not as a replacement. Backfill stable upstream functionality into the LaoHuang version one slice at a time while preserving:

- product identity: `Claude Code LaoHuang`
- version line: `0.1.0`
- current desktop UI direction
- MiniMax/provider runtime path
- fixed `script/build_and_run.sh` behavior
- local user data under `.desktop-gpt55-claude`

## Current Read

`cc-haha-main 2` is stronger as an upstream reference package:

- fuller docs: desktop, agent, memory, skills, IM, computer-use, H5 access
- fuller engineering workflow: `.github`, release notes, quality-gate scripts, PR/release scripts
- cleaner upstream product metadata: `Claude Code Haha`, version `0.2.7`
- old updater endpoint still points to `NanmiCoder/cc-haha`

`claude-code-laohuang-main 2` is the active customized product:

- branded package/app metadata for LaoHuang
- current acrylic/vision-style desktop UI
- active provider/runtime configuration
- desktop server APIs for providers, sessions, skills, plugins, memory, H5 access, diagnostics, tasks, teams, computer-use
- current build/run script and tested `MiniMax-M2.7` reply path

## Backfill Rules

1. Never copy an entire top-level folder over the LaoHuang version.
2. Treat upstream docs and tests as the first source of truth for expected behavior.
3. Bring over one functional slice at a time, then run focused checks.
4. Preserve LaoHuang branding, social links, bundle identifier, icon set, and updater settings.
5. Do not reintroduce the old default Codex bridge path unless `USE_CODEX_BRIDGE=1` is explicitly requested.

## Priority Slices

### P0 - Safety And Regression Nets

Purpose: stop future UI work from breaking message sending, provider selection, and desktop startup.

Candidate upstream sources:

- `scripts/quality-gate/*`
- `scripts/pr/*`
- `scripts/git-hooks/*`
- `.github/*`
- `docs/guide/contributing.md`

Backfill approach:

- Port only the checks that fit the current package scripts and directory layout.
- Add a local smoke command that verifies:
  - desktop TypeScript compile
  - ChatInput tests
  - provider smoke path
  - build script syntax
  - app launch process appears

Risk:

- Upstream quality scripts may assume docs/release files that LaoHuang does not have.
- Keep this as an adapted local gate, not a raw copy.

### P1 - Functional Documentation

Purpose: recover the upstream operating manual so future agents can understand what each system is supposed to do.

Candidate upstream sources:

- `docs/desktop/*`
- `docs/agent/*`
- `docs/memory/*`
- `docs/skills/*`
- `docs/features/computer-use*`
- `docs/im/*`
- `docs/guide/third-party-models.md`

Backfill approach:

- Create LaoHuang docs that summarize the current behavior.
- Link upstream docs as reference notes where behavior still matches.
- Mark areas that are aspirational, partial, or disabled.

Risk:

- Copying upstream docs verbatim can describe features that are not wired in this customized app.

### P2 - Provider And Model Reliability

Purpose: make provider selection, context windows, and model switching robust.

Candidate upstream/current files to compare:

- `desktop/src/components/controls/ModelSelector.tsx`
- `desktop/src/components/chat/ContextUsageIndicator.tsx`
- `src/desktop-server/services/providerService.ts`
- `src/desktop-server/services/conversationService.ts`
- `src/desktop-server/api/models.ts`
- `docs/guide/third-party-models.md`

Backfill approach:

- Compare upstream UI behavior against the LaoHuang runtime path.
- Add focused tests for provider switching and stale model IDs.
- Keep `MiniMax-M2.7` direct provider as the default working path.

Risk:

- Upstream defaults may point to old providers or official Claude behavior.

### P3 - H5 And Remote Access

Purpose: make mobile/browser access understandable and testable.

Candidate upstream sources:

- `docs/desktop/06-h5-access.md`
- `docs/superpowers/specs/2026-05-09-h5-access-design.md`
- `src/desktop-server/api/h5-access.ts`
- `src/desktop-server/services/h5AccessService.ts`
- `desktop/src/components/layout/H5ConnectionView.tsx`

Backfill approach:

- First audit whether current H5 access works in the LaoHuang app.
- Backfill docs and missing tests before changing UX.

Risk:

- H5 exposes local session control; keep it opt-in and token-gated.

### P4 - IM Adapters

Purpose: recover clarity around Telegram, Feishu, WeChat, and DingTalk remote workflows.

Candidate upstream sources:

- `docs/im/*`
- `desktop/src/pages/AdapterSettings.tsx`
- `src/desktop-server/api/adapters.ts`
- adapter service files under `adapters/`

Backfill approach:

- Confirm which adapters are currently functional.
- Backfill setup docs and diagnostics first.
- Add smoke checks for config validation only; avoid live IM tests unless credentials are provided.

Risk:

- Docs may imply public deployment or working credentials when none are configured.

### P5 - Agent, Teams, Memory, Skills

Purpose: restore the user-facing explanation and identify incomplete features.

Candidate upstream sources:

- `docs/agent/*`
- `docs/memory/*`
- `docs/skills/*`
- `desktop/src/pages/AgentTeams.tsx`
- `desktop/src/pages/MemorySettings.tsx`
- `desktop/src/components/skills/*`
- `src/desktop-server/services/agentService.ts`
- `src/desktop-server/services/teamService.ts`
- `src/desktop-server/services/pluginService.ts`

Backfill approach:

- Audit UI surfaces first.
- Add docs and small tests for list/detail flows.
- Avoid changing core agent orchestration until provider and startup are stable.

Risk:

- These systems are broad and easy to regress; keep changes narrow.

## Do Not Backfill Blindly

- `desktop/src-tauri/tauri.conf.json`: upstream has old product name, bundle id, and updater endpoint.
- app icons and screenshots: LaoHuang already has customized assets.
- `desktop/src/theme/globals.css`: this is now the main UI design surface.
- `desktop/src/components/layout/*`: only compare behavior; do not overwrite the current rail/sidebar shell.
- root `package.json`: preserve LaoHuang commands and version.
- `script/build_and_run.sh`: preserve current default provider behavior.

## First Implementation Step

Start with P0:

1. Inspect upstream quality-gate assumptions.
2. Create a LaoHuang-specific smoke script or package command.
3. Verify it catches the exact class of breakage seen today:
   - send button locked
   - stale provider/model id
   - local bridge connection refused
   - app launch without sidecar

## Progress

- 2026-05-18: Added `scripts/smoke-laohuang-runtime.ts` and `smoke:laohuang-runtime` as the first P0 regression net. It verifies `script/build_and_run.sh` syntax, confirms the app does not silently force the local Codex bridge unless `USE_CODEX_BRIDGE=1`, and checks that the active provider/model/base URL match the desktop settings. Current verified path: `MiniMax-M2.7` direct provider.
- 2026-05-18: Added `scripts/quality-laohuang.ts` and `quality:laohuang` as a local quality gate adapted from the upstream quality-gate idea. It currently runs the LaoHuang runtime smoke, provider proxy smoke, core tool registry smoke, desktop TypeScript check, and focused `ChatInput` regression tests. Use `bun run quality:laohuang -- --full` when a production desktop build should be included.
- 2026-05-18: Added a focused `ChatInput` regression test for the exact failure mode where the default composer is shown without launch controls for an empty session. The test confirms the Run button stays enabled and sends the message through the active session instead of locking or trying to create a replacement session.
- 2026-05-18: Backfilled the first desktop-server test slice from upstream as `src/desktop-server/__tests__/provider-proxy.test.ts`, adapted for LaoHuang's provider/runtime changes. It covers provider presets, isolated provider settings IO, OpenAI-compatible URL construction, Anthropic ↔ OpenAI Chat tool conversion, and streaming tool-use events. Added `test:desktop-server` and wired it into `quality:laohuang`.
- 2026-05-18: Backfilled the remaining upstream `src/server/__tests__` suite into `src/desktop-server/__tests__` and adapted it to the LaoHuang desktop-server layout. Key adaptations preserved LaoHuang's `src/desktop-server` path, `claude-code-laohuang` CLI name, `MiniMax/OpenAI-compatible` provider preset ordering, nested task-list storage, current default desktop model IDs, H5 settings-surface behavior, and mock SDK CLI use for WebSocket E2E. Verification: `bun run test:desktop-server` passes with 773 tests across 46 files.
- 2026-05-18: Backfilled upstream plugin/model reliability fixes that were required by the expanded tests: `enabledPlugins` version constraint arrays now count as enabled, `/reload-plugins` refreshes the settings cache before resolving plugin state, and `getModelOptions()` now keeps saved OpenAI OAuth Codex models visible alongside third-party/env-configured Anthropic-compatible models. Verification: `bun run quality:laohuang` passes end-to-end.
- 2026-05-19: Started P1 documentation backfill without copying upstream branding. Added `docs/README.md`, `docs/desktop/index.md`, `docs/desktop/current-feature-state.md`, and `docs/desktop/quality-and-backfill.md`. These pages document the current verified LaoHuang feature state, the adapted upstream test suite, runtime defaults, manual validation checklist, and quality commands. Verification: `bun run smoke:laohuang-runtime` passes.
- 2026-05-19: Continued P3/P4 documentation backfill for H5 remote access and IM adapters. Added `docs/desktop/h5-access.md` and `docs/desktop/im-adapters.md`, then linked both from the docs root and desktop index. The docs record the current token-gated H5 request policy, origin/public URL rules, adapter config shape, secret masking behavior, live platform checklists, and the line between automated coverage and credential/device-only validation. Verification: `bun run smoke:laohuang-runtime`, focused H5/adapter desktop-server tests, and full `adapters` test suite pass.
- 2026-05-19: Completed the first P5 documentation slice. Added `docs/desktop/agents-and-teams.md`, `docs/desktop/memory.md`, and `docs/desktop/skills.md`, then linked them from the docs root and desktop index. The docs separate real production surfaces from mock/demo code, document API routes, storage paths, safety boundaries, frontend entrypoints, and automated/manual verification boundaries for Agents, Teams, Memory, and Skills.
- 2026-05-19: Added `docs/desktop/provider-model-runtime.md` for the provider/model runtime slice. It documents saved provider storage, managed env sync, MiniMax defaults, OpenAI-compatible proxy formats, model and effort APIs, OpenAI OAuth model visibility, session-scoped runtime overrides, and context-window display semantics.
- 2026-05-19: Added `docs/desktop/computer-use.md` for the Computer Use slice and linked it from the docs root and desktop index. Also fixed the Settings enable toggle so the stored `enabled:false` value is read by the CLI Computer Use gate before injecting the dynamic `computer-use` MCP server.
- 2026-05-19: Added `docs/desktop/workspace-and-worktrees.md` for the workspace slice. It documents repository context, direct branch launch, deferred isolated worktree materialization, workspace panel changed/tree/file/diff routes, composer code references, path boundaries, turn checkpoints, and rewind behavior.
- 2026-05-19: Performed a packaged macOS app validation pass for the workspace slice. `./script/build_and_run.sh --verify` launched the app, the packaged sidecar served repository/workspace APIs, the UI listed the disposable validation project, the workspace panel displayed changed files/diff, and `README.md` could be added as a composer reference. Real model-send worktree materialization and live rewind execute remain deferred.
