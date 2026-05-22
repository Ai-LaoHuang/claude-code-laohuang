# Quality And Upstream Backfill

The LaoHuang project uses `/Users/xiaowo1800gmail.com/Downloads/cc-haha-main 2`
as an upstream reference. The goal is to recover useful behavior, tests, and
docs without overwriting LaoHuang branding or runtime choices.

## Backfilled Test Suite

The upstream `src/server/__tests__` suite has been adapted into:

`src/desktop-server/__tests__`

Key adaptations:

- `src/server` imports became `src/desktop-server`.
- `claude-haha` launcher references became `claude-code-laohuang`.
- Business-flow WebSocket tests use the mock SDK CLI fixture instead of the real
  desktop CLI.
- Provider preset expectations include LaoHuang's OpenAI-compatible preset.
- Task tests use the current nested task-list storage shape.
- H5 auth tests allow the current settings-surface payload shape.
- Model tests match current LaoHuang default model IDs and OpenAI OAuth model
  behavior.

Current result:

```text
bun run test:desktop-server
773 pass
0 fail
46 files
```

## Local Quality Gate

Run:

```bash
bun run quality:laohuang
```

This currently checks:

1. LaoHuang runtime/provider smoke.
2. Provider proxy transform smoke.
3. Core tool registry smoke.
4. Full desktop-server test suite.
5. Desktop TypeScript check.
6. Focused ChatInput regression tests.

Use the optional full build mode when a release or packaged app check is needed:

```bash
bun run quality:laohuang -- --full
```

## Guardrails

Do not backfill these blindly from upstream:

- Tauri updater endpoint.
- Product name, bundle id, app icon, or author metadata.
- Default provider settings.
- `script/build_and_run.sh` bridge defaults.
- The current desktop visual shell in `desktop/src`.

## Next Backfill Work

Docs now need to catch up with the verified behavior:

- H5 access usage and security model.
- IM adapter setup and live validation checklist.
- Agent, Teams, Memory, and Skills user-facing behavior.
- Provider/model runtime and troubleshooting.

Each doc page should say whether the feature is:

- verified by automated tests
- verified only by smoke tests
- requires live credentials
- pending manual UI validation
