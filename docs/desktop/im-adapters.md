# IM Adapters

IM adapters let a chat platform relay messages into a Claude Code LaoHuang
desktop session.

Current platforms:

- Telegram
- Feishu
- WeChat
- DingTalk

The adapters are useful, but they are credential-dependent. The repo currently
has automated coverage for configuration storage, masking, common adapter
helpers, and platform formatting logic. Live delivery still needs real platform
credentials and manual validation.

## Current Verification State

Automated tests cover:

- `/api/adapters` config read/write
- owner-only `adapters.json` permissions
- secret masking in GET responses
- preserving existing secrets when the UI sends masked values back
- WeChat and DingTalk unbind flows
- common pairing/session/ws bridge helpers
- Feishu card, media, extraction, streaming-card helpers
- DingTalk card, permission-card, stream-state helpers

Manual validation still needed:

- Telegram bot receiving a real private message
- Feishu private bot message and card callback
- WeChat QR login and text flow
- DingTalk registration/poll and stream callback
- permission approval buttons or text commands on each platform

## Runtime Chain

```text
Desktop Settings
  -> /api/adapters
  -> ~/.claude/adapters.json or $CLAUDE_CONFIG_DIR/adapters.json
  -> adapters/<platform>/index.ts
  -> /api/sessions
  -> /ws/:sessionId
  -> Claude Code LaoHuang session
```

In development, run adapters manually:

```bash
cd adapters
bun install
bun run telegram
bun run feishu
bun run wechat
bun run dingtalk
```

## API Surface

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/adapters` | `GET` | Return masked adapter config. |
| `/api/adapters` | `PUT` | Shallow-merge config updates. |
| `/api/adapters/wechat/login/start` | `POST` | Start WeChat QR login. |
| `/api/adapters/wechat/login/poll` | `POST` | Poll WeChat QR login state. |
| `/api/adapters/wechat/unbind` | `POST` | Clear WeChat credentials and users. |
| `/api/adapters/dingtalk/registration/begin` | `POST` | Start DingTalk registration. |
| `/api/adapters/dingtalk/registration/poll` | `POST` | Poll DingTalk registration state and save credentials on success. |
| `/api/adapters/dingtalk/unbind` | `POST` | Clear DingTalk credentials and users. |

Only these top-level config keys are accepted:

- `serverUrl`
- `defaultProjectDir`
- `telegram`
- `feishu`
- `wechat`
- `dingtalk`
- `pairing`

## Stored Config Shape

The adapter config file may contain:

```ts
type AdapterFileConfig = {
  serverUrl?: string
  defaultProjectDir?: string
  pairing?: {
    code?: string | null
    expiresAt?: number | null
    createdAt?: number | null
  }
  telegram?: {
    botToken?: string
    allowedUsers?: number[]
    pairedUsers?: PairedUser[]
    defaultWorkDir?: string
  }
  feishu?: {
    appId?: string
    appSecret?: string
    encryptKey?: string
    verificationToken?: string
    allowedUsers?: string[]
    pairedUsers?: PairedUser[]
    defaultWorkDir?: string
    streamingCard?: boolean
  }
  wechat?: {
    accountId?: string
    botToken?: string
    baseUrl?: string
    userId?: string
    allowedUsers?: string[]
    pairedUsers?: PairedUser[]
    defaultWorkDir?: string
  }
  dingtalk?: {
    clientId?: string
    clientSecret?: string
    allowedUsers?: string[]
    pairedUsers?: PairedUser[]
    defaultWorkDir?: string
    endpoint?: string
    permissionCardTemplateId?: string
  }
}
```

`PairedUser` stores:

```ts
{
  userId: string | number
  displayName: string
  pairedAt: number
}
```

## Secret Handling

Secrets are masked by `GET /api/adapters`:

- Telegram `botToken`
- Feishu `appSecret`
- Feishu `encryptKey`
- Feishu `verificationToken`
- WeChat `botToken`
- DingTalk `clientSecret`
- pairing `code`

When a masked value such as `****cret` is sent back in a `PUT`, the service
preserves the previously stored real secret.

The config file is written with owner-only permissions (`0600`).

## Platform Notes

### Telegram

Required config:

- `telegram.botToken`
- `telegram.allowedUsers` or successful pairing

Runtime script:

```bash
cd adapters
bun run telegram
```

Expected live check:

1. Create a bot with BotFather.
2. Save the token in Settings.
3. Generate a pairing code.
4. Send the pairing code to the bot in a private chat.
5. Send a simple message and confirm the desktop session replies.
6. Trigger a permission request and confirm button handling.

### Feishu

Required config:

- `feishu.appId`
- `feishu.appSecret`
- optional `encryptKey` and `verificationToken` depending on app setup
- `allowedUsers` or successful pairing

Runtime script:

```bash
cd adapters
bun run feishu
```

Expected live check:

1. Publish the Feishu bot app.
2. Confirm private message events are enabled.
3. Save app credentials in Settings.
4. Pair via code in a private chat.
5. Send a message and confirm reply.
6. Trigger a permission request and confirm card callback.

### WeChat

Credential flow:

- start QR login via `/api/adapters/wechat/login/start`
- poll via `/api/adapters/wechat/login/poll`
- credentials are saved on successful login

Runtime script:

```bash
cd adapters
bun run wechat
```

Expected live check:

1. Start QR login from Settings.
2. Scan and finish login.
3. Pair a user or configure `allowedUsers`.
4. Send a simple message.
5. Test permission approval text commands if the platform does not expose
   native buttons.
6. Use `/api/adapters/wechat/unbind` or Settings unbind when finished.

### DingTalk

Credential flow:

- begin registration via `/api/adapters/dingtalk/registration/begin`
- poll via `/api/adapters/dingtalk/registration/poll`
- `clientId` and `clientSecret` are saved on success

Runtime script:

```bash
cd adapters
bun run dingtalk
```

Expected live check:

1. Begin DingTalk registration.
2. Complete authorization from the provided QR/link.
3. Poll until credentials are saved.
4. Pair a user or configure `allowedUsers`.
5. Send a simple message.
6. Trigger a permission request and confirm permission card handling.

## Safety Boundary

- Do not commit `adapters.json`.
- Do not paste real tokens into docs or tests.
- Keep `allowedUsers` narrow for live adapters.
- Prefer a test bot/account before binding a main personal account.
- If a credential leaks, rotate it at the platform and unbind it in Settings.

## Useful Test Commands

```bash
bun test src/desktop-server/__tests__/adapters.test.ts
cd adapters && bun test
```

These commands validate storage and adapter helper logic; they do not prove
live platform delivery.
