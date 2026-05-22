# Claude Code LaoHuang UI Restructure Plan

Created: 2026-05-18

## Current Snapshot

Rollback snapshot:

`/Users/xiaowo1800gmail.com/Documents/cli/backups/claude-code-laohuang-0.1.0-20260518-102508/source`

The current app is stable at `0.1.0`. Branding and author links have been updated to AI老黄.

## Current UI Map

### App Shell

- `AppShell.tsx`
  - Owns startup, desktop/H5 bootstrap, mobile drawer behavior, and global layout.
  - Renders `Sidebar`, `TabBar`, `ContentRouter`, `ToastContainer`, and `UpdateChecker`.
- `ContentRouter.tsx`
  - Routes active tabs to `EmptySession`, `ActiveSession`, `ScheduledTasks`, `Settings`, or terminal panels.
- `tabStore.ts`
  - Current app-level navigation model is tab-based.
  - Tab types: `session`, `settings`, `scheduled`, `terminal`.

### Left Sidebar

- `Sidebar.tsx`
  - Brand and GitHub link.
  - New session.
  - Scheduled tasks.
  - Session search, refresh, batch delete.
  - Project grouping, pinning, hiding, sorting, drag reorder.
  - Session list.
  - Settings entry near the bottom.

### Settings

- `Settings.tsx`
  - One large file containing most settings panels.
  - Current tabs:
    - Providers
    - Permissions
    - General
    - H5 Access
    - Adapters
    - Terminal
    - MCP
    - Agents
    - Skill
    - Memory
    - Plugins
    - Computer Use
    - Activity
    - Diagnostics
    - About

## Main Problems

1. Settings is too flat.
   Fifteen settings tabs are treated as equal. Users need to understand the whole app structure before they can find the right control.

2. Sidebar has too many jobs.
   It is a project/session navigator, global app launcher, schedule entry, brand surface, and settings launcher at the same time.

3. The app lacks a clear "workbench" model.
   The center chat area is strong, but surrounding tools are not organized around the user's task flow.

4. Settings implementation is too large.
   `Settings.tsx` mixes navigation, provider logic, permission UI, H5 access, agents, plugins, skills, diagnostics, and about page content.

## Target Information Architecture

### Primary Surfaces

1. Workbench
   - Chat/session workspace.
   - Project context.
   - Terminal.
   - Files or opened targets in later phases.

2. Automation
   - Scheduled tasks.
   - Task runs.
   - Activity.

3. AI Setup
   - Providers.
   - Models.
   - Permissions.
   - General runtime behavior.
   - H5 access.
   - Adapters.

4. Extensions
   - MCP.
   - Agents.
   - Skill.
   - Plugins.
   - Memory.
   - Computer Use.

5. System
   - Diagnostics.
   - Updates.
   - About.

## Proposed Layout Direction

### Desktop

- Left rail: narrow global navigation.
  - Workbench
  - Automation
  - AI Setup
  - Extensions
  - System
- Session drawer: project/session list, search, batch actions.
- Main area: active tab content.
- Optional right inspector: context, tool calls, selected extension details, diagnostics summary.

### Mobile/H5

- Preserve drawer behavior.
- Keep primary session flow first.
- Secondary surfaces open as full-screen panels.

## Implementation Phases

### Phase 0: Rollback Safety

Done.

- Created local source snapshot before UI restructuring.
- Excluded rebuildable artifacts to keep backup small.

### Phase 1: Group Settings Navigation

Status: done.

Goal:

- Make the existing Settings page easier to scan without changing business logic.

Actions:

- Replace the flat settings tab list with grouped sections:
  - AI Setup
  - Workspace
  - Extensions
  - System
  - About
- Keep all existing panels and stores.
- Keep existing URL/tab behavior.
- Add minimal translations for group labels.
- Extract grouped settings navigation into `desktop/src/pages/settings/SettingsNavigation.tsx`.

Risk:

- Low. Mostly changes navigation rendering and labels.

### Phase 2: Split Settings File

Goal:

- Reduce risk before deeper layout work.

Actions:

- Move settings panels into `desktop/src/pages/settings/`.
- Keep `Settings.tsx` as a thin orchestrator.
- Move shared settings helpers into local helper modules.

Risk:

- Medium. Many imports and tests may need small updates.

### Phase 3: App-Level Navigation Rail

Goal:

- Separate global surfaces from session navigation.

Actions:

- Introduce `AppNavRail`.
- Move Settings, Scheduled Tasks, and future surfaces into the rail.
- Keep project/session drawer focused on sessions only.

Risk:

- Medium. Affects shell layout and mobile behavior.

### Phase 4: Workbench Context Panel

Goal:

- Make the app feel like an AI workbench, not just a chat app.

Actions:

- Add right-side contextual panel.
- Show session context, model/provider, permission mode, attached files, tool activity, and diagnostics shortcuts.

Risk:

- Medium-high. Needs careful responsive behavior.

### Phase 5: Visual System Pass

Goal:

- Make all surfaces feel like one product.

Actions:

- Normalize density, heading scale, buttons, icon usage, focus states, empty states, and status colors.
- Keep the app utilitarian and work-focused.

Risk:

- Low-medium, depending on scope.

## Recommended Next Action

Continue with Phase 2: split the remaining large settings panels into dedicated files under `desktop/src/pages/settings/`, starting with About, Skill, Plugin, Agents, and H5 Access because they have clearer boundaries than the provider editor.
