# Provider And Model Runtime

This page records how the current LaoHuang desktop app chooses providers,
models, effort, runtime overrides, and context-window display.

## Current Status

| Area | Status | Notes |
| --- | --- | --- |
| Saved provider CRUD | Verified | `/api/providers` stores provider definitions in the isolated LaoHuang/cc-haha settings area. |
| Provider activation | Verified | Activating a provider writes managed env values into `cc-haha/settings.json`. |
| MiniMax runtime path | Verified by smoke | Current smoke confirms `MiniMax M2.7` with `MiniMax-M2.7`. |
| OpenAI-compatible proxy transforms | Verified | Anthropic messages are transformed to OpenAI Chat/Responses and back. |
| Model list/current model API | Verified | Active provider models override standalone/default model list. |
| Runtime model switch | Verified by WebSocket tests | Connected sessions can restart with a session-scoped provider/model override. |
| Context usage indicator | Verified by UI tests | Uses live context inspection first and transcript estimate as fallback. |
| Live provider call | Credential-gated | Static/proxy tests pass; real upstream API calls require credentials. |
| OpenAI OAuth browser flow | Partially verified | Token storage/API behavior is tested; real browser login still needs manual validation. |

## Storage

Provider state is intentionally stored away from the original Claude Code
settings file:

```text
$CLAUDE_CONFIG_DIR/cc-haha/providers.json
$CLAUDE_CONFIG_DIR/cc-haha/settings.json
```

or, when `CLAUDE_CONFIG_DIR` is not set:

```text
~/.claude/cc-haha/providers.json
~/.claude/cc-haha/settings.json
```

The internal `cc-haha` directory name is inherited storage. Do not rename it
without a migration.

## Provider API

| Endpoint | Method | Current behavior |
| --- | --- | --- |
| `/api/providers` | `GET` | Lists saved providers and `activeId`. |
| `/api/providers/presets` | `GET` | Lists provider presets from `providerPresets.json`. |
| `/api/providers/auth-status` | `GET` | Checks provider/env/original settings auth availability. |
| `/api/providers/settings` | `GET` / `PUT` | Reads or updates managed `cc-haha/settings.json`. |
| `/api/providers` | `POST` | Creates a saved provider. New providers are not auto-activated. |
| `/api/providers/:id` | `GET` / `PUT` / `DELETE` | Reads, updates, or deletes an inactive provider. |
| `/api/providers/:id/activate` | `POST` | Activates one provider and syncs managed env. |
| `/api/providers/official` | `POST` | Clears active provider env and returns to official/default mode. |
| `/api/providers/:id/test` | `POST` | Tests a saved provider, optionally with overrides. |
| `/api/providers/test` | `POST` | Tests unsaved provider config. |

Deleting an active provider is blocked. Switch providers first.

## Saved Provider Shape

```ts
type SavedProvider = {
  id: string
  presetId: string
  name: string
  apiKey: string
  authStrategy?: ProviderAuthStrategy
  baseUrl: string
  apiFormat: 'anthropic' | 'openai_chat' | 'openai_responses'
  models: {
    main: string
    haiku: string
    sonnet: string
    opus: string
  }
  autoCompactWindow?: number
  modelContextWindows?: Record<string, number>
  notes?: string
}
```

`autoCompactWindow` and `modelContextWindows` must be integers between
`16000` and `10000000`.

## Managed Environment

Activating a non-official provider writes managed env keys into
`cc-haha/settings.json`.

Important keys:

| Key | Meaning |
| --- | --- |
| `ANTHROPIC_BASE_URL` | Provider base URL or local proxy URL. |
| `ANTHROPIC_API_KEY` | API key, dummy key, or proxy-managed marker depending on auth strategy. |
| `ANTHROPIC_AUTH_TOKEN` | Auth token for Anthropic-compatible providers using bearer-token style auth. |
| `ANTHROPIC_MODEL` | Main model. |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | Haiku-role model. |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | Sonnet-role model. |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | Opus-role model. |
| `CLAUDE_CODE_AUTO_COMPACT_WINDOW` | Optional provider auto-compact override. |
| `CLAUDE_CODE_MODEL_CONTEXT_WINDOWS` | JSON map of model id to context-window tokens. |

When switching back to official mode, provider-managed keys are removed while
unrelated user settings remain.

## API Formats

| Format | Behavior |
| --- | --- |
| `anthropic` | Direct Anthropic-compatible Messages API. |
| `openai_chat` | Uses desktop proxy and converts Anthropic messages to OpenAI Chat Completions. |
| `openai_responses` | Uses desktop proxy and converts Anthropic messages to OpenAI Responses. |

For proxy formats, the CLI sees:

```text
ANTHROPIC_BASE_URL=http://127.0.0.1:{serverPort}/proxy
ANTHROPIC_API_KEY=proxy-managed
```

The provider's real upstream URL/key stay inside the desktop server proxy.

## Current MiniMax Preset

The active LaoHuang smoke path is:

| Field | Value |
| --- | --- |
| Provider | `MiniMax M2.7` |
| Preset | `minimax` |
| Base URL | `https://api.minimaxi.com/anthropic` |
| API format | `anthropic` |
| Main model | `MiniMax-M2.7` |
| Context window | `204800` tokens |
| Auth strategy | `auth_token` |

This is why the smoke command reports:

```text
provider=MiniMax M2.7
model=MiniMax-M2.7
baseUrl=https://api.minimaxi.com/anthropic
```

## Model API

| Endpoint | Method | Current behavior |
| --- | --- | --- |
| `/api/models` | `GET` | Lists active provider models, or standalone env/default/OpenAI OAuth models when no provider is active. |
| `/api/models/current` | `GET` | Reads current model from active provider managed settings or user settings. |
| `/api/models/current` | `PUT` | Persists selected model; composite `model:context` stores context separately. |
| `/api/effort` | `GET` | Reads effort from user settings. |
| `/api/effort` | `PUT` | Writes effort to user settings. |

When a provider is active, model reads/writes use provider-managed
`cc-haha/settings.json` so global `~/.claude/settings.json` does not leak stale
model IDs into provider mode.

When no provider is active, the standalone list is:

1. env-configured Anthropic-compatible models,
2. built-in official defaults if no env models exist,
3. OpenAI OAuth Codex models if a saved OpenAI login exists.

## Official Fallback Models

| Model id | Label | Context shown in catalog |
| --- | --- | --- |
| `claude-opus-4-7` | `Opus 4.7` | `1m` |
| `claude-sonnet-4-6` | `Sonnet 4.6` | `200k` |
| `claude-haiku-4-5` | `Haiku 4.5` | `200k` |

The desktop fallback constant is `claude-opus-4-7`.

## OpenAI OAuth Models

If OpenAI OAuth login exists, the model API also exposes:

| Model id | Label |
| --- | --- |
| `gpt-5.3-codex` | `GPT-5.3 Codex` |
| `gpt-5.4` | `GPT-5.4` |
| `gpt-5.5` | `GPT-5.5` |
| `gpt-5.4-mini` | `GPT-5.4 Mini` |

OpenAI token values are never returned from the OAuth status API. The browser
login flow itself still needs live manual validation with a real account.

## Model Selector Behavior

`desktop/src/components/controls/ModelSelector.tsx` has two modes:

| Mode | Used for | Behavior |
| --- | --- | --- |
| Global settings mode | Settings/general model selection | Calls `/api/models/current` and `/api/effort`. |
| Runtime-scoped mode | Chat composer/session controls | Groups choices by provider and stores a session runtime selection. |

Runtime selections are stored in browser localStorage under:

```text
cc-haha-session-runtime
```

The storage key is inherited. It maps session ids to:

```ts
{ providerId: string | null, modelId: string }
```

When a provider is updated or activated, connected idle sessions are refreshed
to keep their runtime selection pointing at a valid provider model.

## WebSocket Runtime Switch

The client sends:

```ts
{ type: 'set_runtime_config', providerId: string | null, modelId: string }
```

The server stores the override for that session and restarts the CLI process.

Runtime override settings include:

| Setting | Source |
| --- | --- |
| `model` | selected runtime model id |
| `providerId` | selected provider id or `null` |
| `permissionMode` | persisted user permission mode |
| `effort` | user settings effort |
| `thinking` | disabled only when `alwaysThinkingEnabled === false` |

If the selected provider id no longer exists, the server removes the stale
override and falls back to default runtime settings.

## Context Window Display

The small context indicator in the composer does not show a hardcoded model
marketing number. It shows the `rawMaxTokens` from session inspection.

Fetch flow:

1. `ContextUsageIndicator` calls `/api/sessions/:id/inspect` with:

   ```text
   includeContext=true
   contextOnly=true
   timeout=20000
   ```

2. The desktop server asks the live CLI session for:

   ```ts
   { subtype: 'get_context_usage', estimateOnly: true }
   ```

3. If the live CLI is not running or unavailable, transcript estimate may be
   used instead.
4. The UI renders:
   - used percentage,
   - used tokens,
   - free tokens,
   - context window,
   - largest non-deferred categories.

This explains why a session may show around `258k`/`262k` when using Kimi
models, around `200k`/`204800` for MiniMax or Sonnet-class providers, or larger
numbers for a provider/model whose context mapping is configured that way. It
does not mean the Codex app itself has only that much model context.

## Context Window Sources

Context windows come from:

1. `CLAUDE_CODE_MODEL_CONTEXT_WINDOWS` if configured,
2. provider preset `modelContextWindows`,
3. built-in direct model mappings,
4. built-in pattern mappings,
5. default fallback from the CLI/session analysis layer.

Built-in examples:

| Model family | Window |
| --- | --- |
| `MiniMax-M2.7` | `204800` |
| `kimi-k2.6` | `262144` |
| `deepseek-v4-pro` | `1000000` |
| `claude-opus-4-7` | `1000000` |
| `claude-sonnet-4-6` | `200000` |
| `gpt-5.5` OpenAI OAuth helper | `1050000` |
| `gpt-5.3-codex` OpenAI OAuth helper | `400000` |

## Quality Commands

Focused verification:

```bash
bun test src/desktop-server/__tests__/providers.test.ts
bun test src/desktop-server/__tests__/provider-presets.test.ts
bun test src/desktop-server/__tests__/provider-proxy.test.ts
bun test src/desktop-server/__tests__/settings.test.ts
bun test src/desktop-server/__tests__/haha-openai-oauth-api.test.ts
cd desktop && bun run test -- src/components/controls/ModelSelector.test.tsx src/components/chat/ContextUsageIndicator.test.tsx --run
```

Runtime smoke:

```bash
bun run smoke:laohuang-runtime
bun run smoke:provider-proxy
```

Full local quality gate:

```bash
bun run quality:laohuang
```

## Manual Validation Still Needed

- Run one real message with the currently active MiniMax provider in the
  packaged app.
- Test one OpenAI-compatible proxy provider with real credentials.
- Complete OpenAI OAuth in a browser and confirm models appear in the model
  list afterward.
- Switch provider/model in a live connected session and confirm the restart is
  visible but the session remains usable.
- Open the context indicator after switching models and confirm the displayed
  context window matches the selected runtime model.

