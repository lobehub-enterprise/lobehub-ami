# AWS AMI Branding Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the AWS AMI community edition branding display configurable at runtime and remove public LobeHub support/community/legal links from the product UI.

**Architecture:** Centralize branding values in `@lobechat/business-const`, inject resolved server values into SPA runtime config, and update UI consumers to read the shared constants. Keep favicon and app icons static so AMI packaging can replace mounted files directly.

**Tech Stack:** Next.js 16, React 19, TypeScript, SPA runtime config via `window.__SERVER_CONFIG__`, Vitest, pnpm/bun.

---

## File Structure

- `packages/business/const/src/branding.ts`: source of runtime-aware branding constants.
- `packages/const/src/meta.ts`: default avatar fallbacks.
- `src/types/spaServerConfig.ts`: SPA client env type for runtime branding.
- `src/app/spa/[variants]/[[...path]]/route.ts`: inject server-resolved branding into SPA config.
- `src/components/Branding/ProductLogo/Custom.tsx`: render configured logo or text fallback.
- `src/components/BrandWatermark/index.tsx`: render non-linked `Powered by LobeHub`.
- `src/routes/(main)/settings/about/features/About.tsx`: reduced About page content.
- `src/routes/(main)/settings/about/features/Version.tsx`: remove external version/logo links.
- `src/routes/(main)/settings/about/features/AboutList.tsx`: deleted old external-link list helper.
- `src/routes/(main)/settings/about/features/ItemCard.tsx`: deleted old external-link card helper.
- `src/routes/(main)/settings/about/features/ItemLink.tsx`: deleted old external-link item helper.
- `src/routes/(main)/home/_layout/Footer/index.tsx`: remove help menu external links and promotions.
- `src/features/CommandMenu/MainMenu.tsx`: remove about/support command group.
- Default assistant UI call sites: replace hard-coded `Lobe AI` / `LobeAI` with `BRANDING_LOBE_AI_NAME`.
- `src/const/branding.test.ts`: test runtime branding behavior.
- `src/features/Conversation/hooks/useAgentMeta.test.ts`: update default assistant fallback expectation.
- `packages/database/src/models/__tests__/agent.getAvatars.test.ts`: update DB fallback expectation.

## Task 1: Runtime Branding Constants

**Files:**

- Modify: `packages/business/const/src/branding.ts`

- Modify: `packages/const/src/meta.ts`

- Test: `src/const/branding.test.ts`

- [x] **Step 1: Write failing branding tests**

Create `src/const/branding.test.ts` with tests that set `BRANDING_NAME`, `BRANDING_ORG_NAME`, `BRANDING_LOGO_URL`, `BRANDING_DEFAULT_AVATAR_URL`, `BRANDING_LOBE_AI_NAME`, and `BRANDING_LOBE_AI_AVATAR_URL`, then dynamically import `@lobechat/business-const` and `@lobechat/const`.

Expected failing assertions before implementation:

```text
expected 'LobeHub' to be 'Acme Hub'
expected '/avatars/agent-default.png' to be '/custom/default-agent.png'
```

- [x] **Step 2: Run red test**

Run:

```bash
bunx vitest run --silent='passed-only' 'src/const/branding.test.ts'
```

Expected before implementation: fail on fixed branding constants.

- [x] **Step 3: Add runtime-aware constants**

Add `RuntimeBrandingConfig`, `getRuntimeBrandingConfig`, and `getBrandingValue` in `packages/business/const/src/branding.ts`.

Expose:

```ts
export const BRANDING_NAME = getBrandingValue('name', 'BRANDING_NAME', 'LobeHub');
export const BRANDING_LOGO_URL = getBrandingValue('logoUrl', 'BRANDING_LOGO_URL', '');
export const BRANDING_LOGO_DARK_URL = getBrandingValue('logoDarkUrl', 'BRANDING_LOGO_DARK_URL', '');
export const BRANDING_LOGO_LIGHT_URL = getBrandingValue(
  'logoLightUrl',
  'BRANDING_LOGO_LIGHT_URL',
  '',
);
export const BRANDING_DEFAULT_AVATAR_URL = getBrandingValue(
  'defaultAvatarUrl',
  'BRANDING_DEFAULT_AVATAR_URL',
  '',
);
export const BRANDING_LOBE_AI_NAME = getBrandingValue(
  'lobeAiName',
  'BRANDING_LOBE_AI_NAME',
  'Lobe AI',
);
export const BRANDING_LOBE_AI_AVATAR_URL = getBrandingValue(
  'lobeAiAvatarUrl',
  'BRANDING_LOBE_AI_AVATAR_URL',
  '',
);
export const ORG_NAME = getBrandingValue('orgName', 'BRANDING_ORG_NAME', 'LobeHub');
```

- [x] **Step 4: Wire avatar defaults**

Update `packages/const/src/meta.ts`:

```ts
export const DEFAULT_AVATAR = BRANDING_DEFAULT_AVATAR_URL || '/avatars/agent-default.png';
export const DEFAULT_INBOX_AVATAR =
  BRANDING_LOBE_AI_AVATAR_URL || BRANDING_LOGO_URL || '/avatars/lobe-ai.png';
```

- [x] **Step 5: Run green test**

Run:

```bash
bunx vitest run --silent='passed-only' 'src/const/branding.test.ts'
```

Expected after implementation: all tests pass.

## Task 2: SPA Runtime Branding Injection

**Files:**

- Modify: `src/types/spaServerConfig.ts`

- Modify: `src/app/spa/[variants]/[[...path]]/route.ts`

- Test: `src/const/branding.test.ts`

- [x] **Step 1: Extend SPA client env type**

Add `branding?: RuntimeBrandingConfig` to `SPAClientEnv`.

- [x] **Step 2: Inject branding values into SPA config**

Update `buildClientEnv()` to include:

```ts
branding: {
  defaultAvatarUrl: BRANDING_DEFAULT_AVATAR_URL,
  lobeAiAvatarUrl: BRANDING_LOBE_AI_AVATAR_URL,
  lobeAiName: BRANDING_LOBE_AI_NAME,
  logoDarkUrl: BRANDING_LOGO_DARK_URL,
  logoLightUrl: BRANDING_LOGO_LIGHT_URL,
  logoUrl: BRANDING_LOGO_URL,
  name: BRANDING_NAME,
  orgName: ORG_NAME,
},
```

- [x] **Step 3: Test runtime config precedence**

Add a test where `process.env.BRANDING_NAME` is `Env Hub` and `window.__SERVER_CONFIG__.clientEnv.branding.name` is `Runtime Hub`.

Expected:

```ts
expect(BRANDING_NAME).toBe('Runtime Hub');
```

- [x] **Step 4: Run focused test**

Run:

```bash
bunx vitest run --silent='passed-only' 'src/const/branding.test.ts'
```

Expected: pass.

## Task 3: Product Logo Rendering

**Files:**

- Modify: `src/components/Branding/ProductLogo/Custom.tsx`

- [x] **Step 1: Read theme and logo constants**

Import `BRANDING_LOGO_DARK_URL`, `BRANDING_LOGO_LIGHT_URL`, `BRANDING_LOGO_URL`, and `useIsDark`.

- [x] **Step 2: Resolve logo by theme**

Implement this resolution in `CustomImageLogo`:

```ts
const isDark = useIsDark();
const logoUrl = (isDark ? BRANDING_LOGO_DARK_URL : BRANDING_LOGO_LIGHT_URL) || BRANDING_LOGO_URL;
```

- [x] **Step 3: Add text fallback**

Use text logo when no logo URL is configured:

```ts
const hasLogo = !!(BRANDING_LOGO_URL || BRANDING_LOGO_DARK_URL || BRANDING_LOGO_LIGHT_URL);
```

Render `CustomTextLogo` instead of an empty image when `hasLogo` is false.

## Task 4: Default Assistant Branding

**Files:**

- Modify: `packages/builtin-agents/src/agents/inbox/index.ts`

- Modify: `packages/builtin-agents/src/agents/web-onboarding/index.ts`

- Modify: `packages/builtin-agents/src/agents/group-supervisor/systemRole.ts`

- Modify: `packages/database/src/models/agent.ts`

- Modify: default assistant display call sites under `src/features` and `src/routes`

- Test: `src/features/Conversation/hooks/useAgentMeta.test.ts`

- Test: `packages/database/src/models/__tests__/agent.getAvatars.test.ts`

- [x] **Step 1: Use branded inbox avatar in builtin agents**

Set builtin inbox and web onboarding avatars to `DEFAULT_INBOX_AVATAR`.

- [x] **Step 2: Use branded assistant name in fallback metadata**

Update `AgentModel.getAgentAvatarsByIds()` to return `BRANDING_LOBE_AI_NAME` for inbox agents without a stored title.

- [x] **Step 3: Replace UI hard-coded assistant names**

Replace user-visible `Lobe AI` / `LobeAI` fallbacks with `BRANDING_LOBE_AI_NAME` in navigation, command menu, mobile headers, share previews, eval selectors, onboarding, group welcome, and agent metadata hooks.

- [x] **Step 4: Update focused tests**

Update expected fallback title from a hard-coded string to `BRANDING_LOBE_AI_NAME`.

- [x] **Step 5: Run tests**

Run:

```bash
bunx vitest run --silent='passed-only' 'src/features/Conversation/hooks/useAgentMeta.test.ts'
cd packages/database && bunx vitest run --silent='passed-only' 'src/models/__tests__/agent.getAvatars.test.ts'
```

Expected: pass.

## Task 5: About Page Link Removal

**Files:**

- Modify: `src/routes/(main)/settings/about/features/About.tsx`

- Modify: `src/routes/(main)/settings/about/features/Version.tsx`

- Modify: `src/components/BrandWatermark/index.tsx`

- Delete: `src/routes/(main)/settings/about/features/AboutList.tsx`

- Delete: `src/routes/(main)/settings/about/features/ItemCard.tsx`

- Delete: `src/routes/(main)/settings/about/features/ItemLink.tsx`

- [x] **Step 1: Remove contact, community, and legal sections**

Keep only version display and a `BrandWatermark` in `About.tsx`.

- [x] **Step 2: Remove external logo and changelog links**

In `Version.tsx`, remove the `OFFICIAL_SITE` logo link and external changelog/manual upgrade anchors.

- [x] **Step 3: Make watermark non-linked**

Render `Powered by` plus the LobeHub text mark without wrapping it in an external anchor.

- [x] **Step 4: Delete unused About list helpers**

Delete the three old link helper files because no remaining UI consumes them.

## Task 6: Help And Command Menu Link Removal

**Files:**

- Modify: `src/routes/(main)/home/_layout/Footer/index.tsx`

- Modify: `src/features/CommandMenu/MainMenu.tsx`

- [x] **Step 1: Remove help menu external items**

Delete docs, feedback, Discord, changelog, GitHub, and Product Hunt items from the footer help menu.

- [x] **Step 2: Avoid empty help button**

Render the help dropdown only when `helpMenuItems` has entries.

- [x] **Step 3: Remove command menu about/support group**

Delete command menu entries for contact, submit issue, star GitHub, and community support.

## Task 7: Verification

**Files:**

- All modified files.

- [x] **Step 1: Format changed files**

Run:

```bash
git diff --name-only --diff-filter=ACM -z | xargs -0 bunx prettier --write
```

Expected: changed files are formatted.

- [x] **Step 2: Run focused tests**

Run:

```bash
bunx vitest run --silent='passed-only' 'src/const/branding.test.ts' 'src/features/Conversation/hooks/useAgentMeta.test.ts'
cd packages/database && bunx vitest run --silent='passed-only' 'src/models/__tests__/agent.getAvatars.test.ts'
```

Expected: both commands exit `0`.

- [x] **Step 3: Run type checking**

Run:

```bash
bun run type-check
```

Expected: `tsgo --noEmit` exits `0`.

- [x] **Step 4: Check diff whitespace**

Run:

```bash
git diff --check
```

Expected: exits `0`.

- [x] **Step 5: Check removed-link surfaces**

Run:

```bash
rg -n "OFFICIAL_SITE|BLOG|PRIVACY_URL|TERMS_URL|BRANDING_EMAIL|SOCIAL_URL|GITHUB|DOCUMENTS_REFER_URL|FeedbackModal|Discord|GitHub|Product Hunt|productHunt|ChangelogModal" 'src/routes/(main)/settings/about' 'src/routes/(main)/home/_layout/Footer/index.tsx' 'src/features/CommandMenu/MainMenu.tsx'
```

Expected: exits `1` with no matches.

## Self-Review

- Spec coverage: runtime branding, SPA injection, static favicon boundary, default assistant branding, About page cleanup, help menu cleanup, command menu cleanup, tests, and type checking are covered.
- Placeholder scan: no `TBD`, `TODO`, or unresolved implementation placeholders.
- Type consistency: branding field names match `RuntimeBrandingConfig`, `SPAClientEnv.branding`, and injected `buildClientEnv()` properties.
