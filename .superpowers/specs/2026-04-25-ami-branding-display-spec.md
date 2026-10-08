# AWS AMI Branding Display Spec

## Context

The AWS AMI community edition work was narrowed to the LobeHub-facing branding display slice. This spec intentionally excludes the AMI management backend, service configuration, API configuration, user management, version upgrade automation, and runtime favicon switching.

The implementation runs on the local `main` branch of `lobehub-ami`.

## Goals

- Allow AMI operators to customize product branding at runtime where the app can safely read server environment values.
- Keep static browser assets such as favicon and app icons replaceable by AMI image mount or file replacement instead of adding runtime favicon logic.
- Remove public LobeHub support/community/legal/product promotion links from the product UI for the AMI community edition.
- Preserve a small attribution line: `Powered by LobeHub`.

## Runtime Branding Configuration

The app supports these environment variables:

- `BRANDING_NAME`: product display name.
- `BRANDING_ORG_NAME`: organization display name.
- `BRANDING_LOGO_URL`: default logo URL.
- `BRANDING_LOGO_DARK_URL`: dark-theme logo URL override.
- `BRANDING_LOGO_LIGHT_URL`: light-theme logo URL override.
- `BRANDING_DEFAULT_AVATAR_URL`: default non-inbox agent avatar.
- `BRANDING_LOBE_AI_NAME`: default assistant display name.
- `BRANDING_LOBE_AI_AVATAR_URL`: default assistant avatar.

Server-rendered SPA responses inject the resolved values into `window.__SERVER_CONFIG__.clientEnv.branding`. Client-side branding constants prefer this runtime SPA config over build-time `process.env` values, so AMI runtime configuration can take effect without rebuilding the SPA bundle.

## Static Asset Boundary

Favicon, apple-touch-icon, PWA icon files, and other static browser assets remain file-based. AMI packaging should replace the static files in the image or mount replacement assets into the deployed container.

This spec does not add a runtime favicon API or dynamic favicon storage.

## UI Behavior

### Product Logo

- Use the custom logo when one of the branding logo URLs is configured.
- Prefer theme-specific logo URL when available:
  - dark theme: `BRANDING_LOGO_DARK_URL`
  - light theme: `BRANDING_LOGO_LIGHT_URL`
- Fall back to `BRANDING_LOGO_URL`.
- If no logo URL is configured, show the configured product name as text.

### Default Avatars

- Default agent avatar uses `BRANDING_DEFAULT_AVATAR_URL` when configured.
- Default assistant avatar uses `BRANDING_LOBE_AI_AVATAR_URL`, then `BRANDING_LOGO_URL`, then the original `/avatars/lobe-ai.png` fallback.

### Default Assistant Name

User-visible default assistant names should use `BRANDING_LOBE_AI_NAME` where the UI previously displayed hard-coded `Lobe AI` or `LobeAI`.

This includes navigation entries, command menu entries, mobile headers, share previews, agent fallback metadata, inbox fallback metadata, onboarding copy, eval agent selectors, and group supervisor system role identity.

## Link Removal

### About Page

The About page keeps:

- Current version display.
- Update/version status display that does not require external support/community links.
- `Powered by LobeHub`.

The About page removes:

- Official site link.
- Support/business email links.
- Blog link.
- GitHub link.
- Discord link.
- X/Twitter link.
- YouTube link.
- Terms link.
- Privacy link.
- Legal section.

### Help Menu

The home footer help menu removes:

- Documentation link.
- Contact/feedback entry.
- Discord entry.
- GitHub entry.
- Product Hunt entry.
- Changelog modal entry.

The footer should not show an empty help button when no help menu items remain.

### Command Menu

The command menu removes the public about/support group containing:

- Contact us.
- Submit issue.
- Star on GitHub.
- Community support / Discord.

## Out Of Scope

- Admin backend.
- Brand upload UI.
- S3/Redis/PostgreSQL configuration UI.
- Unified API configuration behavior.
- One-click upgrade.
- Casdoor or user-management integration.
- Runtime favicon switching.
- Translation regeneration via `pnpm i18n`.

## Acceptance Criteria

- Branding values can be overridden by environment variables on the server.
- SPA runtime config can override client-bundled defaults.
- Default assistant display name and avatar are configurable.
- About page no longer exposes official, support, community, blog, or legal links.
- Help and command menus no longer expose contact, Discord, GitHub, docs, feedback, or product-promotion links.
- Static favicon replacement remains an AMI packaging concern.
- Focused tests and type checking pass.

## Verification

Commands used:

```bash
bunx vitest run --silent='passed-only' 'src/const/branding.test.ts' 'src/features/Conversation/hooks/useAgentMeta.test.ts'
cd packages/database && bunx vitest run --silent='passed-only' 'src/models/__tests__/agent.getAvatars.test.ts'
bun run type-check
git diff --check
rg -n "OFFICIAL_SITE|BLOG|PRIVACY_URL|TERMS_URL|BRANDING_EMAIL|SOCIAL_URL|GITHUB|DOCUMENTS_REFER_URL|FeedbackModal|Discord|GitHub|Product Hunt|productHunt|ChangelogModal" 'src/routes/(main)/settings/about' 'src/routes/(main)/home/_layout/Footer/index.tsx' 'src/features/CommandMenu/MainMenu.tsx'
```

Expected results:

- Vitest commands exit `0`.
- `bun run type-check` exits `0`.
- `git diff --check` exits `0`.
- The targeted external-link grep exits `1` with no matches.
