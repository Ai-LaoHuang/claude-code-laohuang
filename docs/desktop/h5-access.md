# H5 Access

H5 Access is the optional browser/mobile entrypoint for the local Claude Code
LaoHuang desktop server.

It is not a public account system. If someone has the server URL and a valid H5
token, they can reach the exposed desktop chat capabilities. Use it only on a
network, domain, and team boundary you control.

## Current Verification State

Automated tests cover:

- disabled-by-default state
- token generation, preview, verification, regeneration, and disable
- token hashes only in persisted settings
- allowed origin normalization and wildcard rejection
- local loopback/Tauri requests staying tokenless
- LAN/remote browser REST, proxy, SDK, and WebSocket access being blocked or
  token-gated as appropriate
- explicit deployment auth behavior

Manual validation still needed:

- phone/browser access from a second device
- reverse proxy forwarding of `/api/*`, `/proxy/*`, `/ws/*`, and `/sdk/*`
- the actual H5 page flow after entering server URL and token

## API Surface

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/h5-access` | `GET` | Read sanitized settings. |
| `/api/h5-access` | `PUT` | Update `allowedOrigins` and `publicBaseUrl`. |
| `/api/h5-access/enable` | `POST` | Enable H5 and return the raw token once. |
| `/api/h5-access/disable` | `POST` | Disable H5 and clear the token hash. |
| `/api/h5-access/regenerate` | `POST` | Create a new token and invalidate the old one. |
| `/api/h5-access/verify` | `POST` | Verify `Authorization: Bearer <token>`. |

## Stored Settings

Settings are stored inside the desktop managed settings file under `h5Access`.

Public fields returned by the API:

```json
{
  "enabled": false,
  "tokenPreview": null,
  "allowedOrigins": [],
  "publicBaseUrl": null
}
```

Internal persisted fields also include `tokenHash`. The raw token is never
returned again after `enable` or `regenerate`.

## Token Rules

- Raw tokens start with `h5_`.
- The service stores only `sha256(token)`.
- `tokenPreview` is safe to display in UI, but it is not usable for auth.
- Regenerating a token immediately invalidates the old one.
- Disabling H5 clears token hash and preview.

## Origin Rules

`allowedOrigins` accepts only full HTTP/HTTPS origins.

Examples:

```text
http://192.168.1.20:5173
https://cc.example.com
```

Normalization:

- paths are stripped from origins
- duplicate origins are removed
- wildcard origins are rejected
- username/password credentials in URLs are rejected
- protocols other than `http:` and `https:` are rejected

## Public URL Rules

`publicBaseUrl` is the displayed external server URL for H5 clients.

Resolution priority while H5 is enabled:

1. `CLAUDE_H5_PUBLIC_BASE_URL`, if valid
2. auto LAN URL when `CLAUDE_H5_AUTO_PUBLIC_URL=1`
3. stored `publicBaseUrl`

The auto LAN URL uses the first private IPv4 address and the current desktop
server port.

## Request Policy

Local trusted requests do not need the H5 token:

- loopback desktop browser requests
- Tauri WebView requests from `http://tauri.localhost`
- local internal SDK routes
- local adapter API integrations

Remote browser requests are treated as H5 browser requests:

- `/api/*`
- `/proxy/*`
- `/ws/*`
- `/sdk/*`

When H5 is enabled, remote browser capability routes require the H5 token. When
H5 is disabled, those same remote capability routes are blocked unless explicit
deployment auth is configured.

## Recommended Manual Validation

1. Start the packaged app.
2. Open Settings and enable H5 Access.
3. Generate a token and copy it immediately.
4. Set `allowedOrigins` to the browser origin you will use.
5. If testing from another device, confirm the Mac and phone are on the same
   trusted network or configure a private HTTPS reverse proxy.
6. Open the H5 page from the second browser/device.
7. Enter server URL and token.
8. Send one harmless message.
9. Regenerate the token and confirm the old browser token fails.
10. Disable H5 when finished.

## Reverse Proxy Checklist

Forward these paths to the desktop server:

- `/`
- `/assets/*`
- `/api/*`
- `/proxy/*`
- `/ws/*`
- `/sdk/*`

The proxy must support WebSocket upgrade for `/ws/*` and `/sdk/*`.

Do not use wildcard CORS origins. Add the exact browser origin to
`allowedOrigins`.
