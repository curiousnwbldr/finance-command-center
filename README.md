# Command Center Auth Kit

Reusable Okta/Auth.js starter kit for Next.js App Router applications.

This package extracts the reusable authentication pattern from Polaris without carrying over Polaris-specific SOX authorization, role catalogs, dashboards, agents, activity logging, or UI primitives. It is intended to give your team a consistent starting point for command-center style apps where users authenticate once through Okta and then land in a protected application shell.

## What This Package Is

This is a copy/install kit, not a hosted identity service.

It gives another Next.js app the files needed to start using Auth.js/NextAuth with Okta:

- an `auth.ts` configuration file
- a login page
- the Auth.js route handler
- NextAuth session/JWT type augmentation
- an optional `proxy.ts` route guard
- an `.env.example` auth configuration block

The generated files are deliberately light. They include extension hooks where the target app can connect its own user table, audit log, role model, or command-center profile service.

## When To Use It

Use this kit when:

- the target app is a Next.js App Router app
- the target app should authenticate through Okta
- you want a consistent login/session/proxy baseline across internal apps
- you do not want to copy Polaris-specific SOX authorization logic into every project
- your team needs a repeatable CLI command instead of hand-copying auth files

Do not use this kit as-is when:

- the target app is not Next.js App Router
- you need a full central identity broker or token exchange service
- you need SAML-only flows instead of OIDC/OAuth
- you need app-specific authorization already wired end to end

## Recommended Portfolio Architecture

For a broader app portfolio, keep authentication centralized:

1. Users authenticate into the command center through Okta.
2. The command center stores the canonical user profile, access status, and global role or entitlement state.
3. Downstream apps either install this same kit or trust a command-center-issued session/token.
4. App-specific authorization remains local to each app.

That separation matters. Authentication answers “who is this user?” App authorization answers “what can this user do in this app?”

## Package Layout

```text
command-center-auth-kit/
  package.json
  pnpm-lock.yaml
  tsconfig.json
  README.md
  src/
    index.ts
    bin/
      install-auth-kit.ts
    install/
      install-auth-kit.ts
      template.ts
      types.ts
  templates/
    next-app-router/
      auth.ts.hbs
      proxy.ts.hbs
      env.example.hbs
      app/
        login/page.tsx.hbs
        api/auth/[...nextauth]/route.ts.hbs
        types/next-auth.d.ts.hbs
```

## Package Files

### `package.json`

Defines the package name, build scripts, dependencies, peer dependencies, and CLI binary.

Important fields:

- `bin.command-center-auth`: points to the built installer CLI.
- `dependencies.next-auth`: the generated app uses Auth.js/NextAuth.
- `peerDependencies.next`, `react`, `react-dom`: the target app must already be a Next/React app.

### `tsconfig.json`

Builds the CLI and installer source into `dist/`.

This package uses ESM and NodeNext module resolution because the CLI runs under modern Node and imports generated `.js` outputs after TypeScript compilation.

### `src/bin/install-auth-kit.ts`

The CLI entry point.

It parses commands such as:

```bash
command-center-auth install --target /path/to/app --app-name "Finance Command Center"
```

Supported options:

- `--target <path>`: required. Target Next.js app folder.
- `--app-name <name>`: display name used on the generated login page.
- `--provider <okta|auth0|both>`: provider mode. Defaults to `okta`.
- `--dashboard-path <path>`: post-login redirect path. Defaults to `/dashboard`.
- `--no-proxy`: skip generating `proxy.ts`.
- `--force`: overwrite existing generated files.
- `--help`: print usage.

### `src/install/install-auth-kit.ts`

The installer implementation.

Responsibilities:

- resolves the target app path
- loads templates from `templates/next-app-router`
- renders template variables
- creates parent directories
- writes generated files
- skips existing files unless `--force` is provided
- appends the auth block to `.env.example`

It intentionally does not edit existing source files in place, except appending `.env.example`. This makes the install safer and easier to review in Git.

### `src/install/template.ts`

Small template renderer.

It replaces variables like:

```text
{{APP_NAME}}
{{DASHBOARD_PATH}}
{{OKTA_ENABLED_DEFAULT}}
```

It throws if a template references a variable that was not provided.

### `src/install/types.ts`

Shared TypeScript types for the installer:

- `ProviderMode`
- `InstallOptions`
- `TemplateContext`

### `src/index.ts`

Exports the installer and public types for programmatic usage.

This allows a future repo or script to import:

```ts
import { installAuthKit } from "@command-center/auth-kit"
```

## Generated Target Files

The CLI generates the following files inside the target app.

### `auth.ts`

Auth.js/NextAuth configuration.

What it does:

- configures Okta when `OKTA_ENABLED=true`
- optionally configures Auth0 when `AUTH0_ENABLED=true`
- uses JWT sessions
- sets `/login` as the sign-in and error page
- creates session claims from a profile hook
- blocks inactive users when `profile.isActive === false`

Important extension hooks:

```ts
async function onUserSignIn(input) { ... }
async function loadUserProfile(email) { ... }
function buildSessionClaims(profile) { ... }
```

Expected target-app changes:

- connect `onUserSignIn` to your user table or command-center profile API
- connect `loadUserProfile` to your user table or entitlement service
- add any required audit logging inside `onUserSignIn`
- shape `buildSessionClaims` to match your app’s authorization needs

Constraints:

- keep provider secrets on the server only
- do not expose `OKTA_CLIENT_SECRET` through `NEXT_PUBLIC_*`
- avoid importing app client code into `auth.ts`
- keep DB calls resilient because Auth callbacks run on every session refresh

### `app/login/page.tsx`

Login page for the target app.

What it does:

- renders a simple provider selection screen
- supports Okta
- optionally supports Auth0
- redirects to `--dashboard-path` after sign-in
- signs out a prior session before switching providers
- reads Auth.js errors from the URL

Constraints:

- this is intentionally unbranded and dependency-light
- it uses plain Tailwind-style class names
- it does not import Polaris UI primitives
- the target app may restyle it after install

### `app/api/auth/[...nextauth]/route.ts`

Auth.js route handler.

What it does:

```ts
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```

Constraints:

- the target app must support the `@/` alias or change the import path
- this route must remain server-only
- Okta callback URLs must point to this route

### `app/types/next-auth.d.ts`

NextAuth type augmentation.

What it does:

- adds `user.id`
- adds `user.provider`
- adds `user.commandCenterClaims`
- adds matching JWT fields

Constraints:

- keep this file included by the target app’s TypeScript config
- update `CommandCenterClaims` when your role/entitlement payload changes
- keep the claims small enough for JWT session storage

### `proxy.ts`

Optional route guard for Next.js 16.

What it does:

- allows `_next` assets and `/api/auth/*`
- redirects unauthenticated users to `/login`
- redirects active logged-in users away from `/login` to the dashboard path
- blocks inactive sessions

Constraints:

- Next.js 16 uses `proxy.ts`; older apps may use `middleware.ts`
- if the target app already has a proxy/middleware, merge manually
- add public routes explicitly
- keep proxy imports edge-safe

### `.env.example`

The installer appends an auth environment block:

```env
AUTH_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
OKTA_ENABLED=true
NEXT_PUBLIC_OKTA_ENABLED=true
OKTA_CLIENT_ID=
OKTA_CLIENT_SECRET=
OKTA_ISSUER=
```

Constraints:

- production values belong in the deployment environment, not committed files
- `NEXTAUTH_URL` must match the deployed app origin
- Okta redirect URIs must match the deployed app callback URL

## Target App Prerequisites

The target app should have:

- Next.js App Router
- TypeScript
- React
- `next-auth`
- a working `@/` alias, or manually adjust generated imports

Install dependency in the target app:

```bash
pnpm add next-auth
```

If the target app does not use Tailwind-style utility classes, the generated login page will still work structurally, but it will need styling changes.

## Okta Setup

This kit requires an Okta OIDC application/client before a target app can use Okta sign-in.

For production use, ask the IT / IAM team to create and own the Okta application. Developers should not reuse a personal Okta client, a Polaris client, or a client from another app unless IT has explicitly approved that shared model.

Recommended operating model:

- Create a separate Okta OIDC application per app and environment, for example:
  - `Finance Command Center - Dev`
  - `Finance Command Center - Preview`
  - `Finance Command Center - Production`
- Assign ownership to the IT / IAM team or the platform identity owner.
- Restrict app assignment to the correct Okta groups.
- Store client secrets only in the deployment platform or secret manager.
- Rotate client secrets through IT change control.
- Document the redirect URIs and app owner in the target app runbook.

Why separate Okta clients are recommended:

- each app has its own redirect URIs
- compromised secrets can be rotated without affecting other apps
- production access can be controlled independently from dev/preview access
- audit logs map cleanly to the consuming app
- decommissioning an app does not disturb unrelated applications

When a shared Okta client may be acceptable:

- the organization has a true central command-center identity app
- all downstream apps rely on a command-center-issued session or token
- IT has approved all redirect URIs, token claims, and access boundaries
- app teams understand that rotating the shared secret impacts every consumer

In Okta, create or update an OIDC web application.

Recommended settings:

- Sign-in redirect URI:

```text
https://your-app.example.com/api/auth/callback/okta
```

- Local development redirect URI:

```text
http://localhost:3000/api/auth/callback/okta
```

- Sign-out redirect URI:

```text
https://your-app.example.com/login
```

- Grant type:

```text
Authorization Code
```

- Scopes:

```text
openid profile email
```

Set target app environment variables:

```env
OKTA_ENABLED=true
NEXT_PUBLIC_OKTA_ENABLED=true
OKTA_CLIENT_ID=...
OKTA_CLIENT_SECRET=...
OKTA_ISSUER=https://your-org.okta.com
AUTH_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-app.example.com
```

Generate a secret:

```bash
openssl rand -base64 32
```

## Build And Use The Kit

From this package folder:

```bash
pnpm install
pnpm build
```

Install into a target app:

```bash
node dist/bin/install-auth-kit.js install \
  --target /path/to/next-app \
  --app-name "Finance Command Center" \
  --provider okta \
  --dashboard-path /dashboard
```

Install both Okta and Auth0 buttons:

```bash
node dist/bin/install-auth-kit.js install \
  --target /path/to/next-app \
  --app-name "Audit Command Center" \
  --provider both
```

Skip proxy generation:

```bash
node dist/bin/install-auth-kit.js install \
  --target /path/to/next-app \
  --no-proxy
```

Overwrite existing generated files:

```bash
node dist/bin/install-auth-kit.js install \
  --target /path/to/next-app \
  --force
```

## Recommended Team Workflow

1. Put this package in its own repo.
2. Keep it private until the API stabilizes.
3. Require changes through PR review because auth templates are security-sensitive.
4. Tag releases, for example `v0.1.0`.
5. Team members install from the built CLI or private package.
6. Each target app reviews generated changes before committing.

## Security Constraints

- Never commit real Okta client secrets.
- Keep user provisioning and role assignment outside the generated starter unless the target app owns that model.
- Keep JWT claims small and non-sensitive.
- Avoid putting broad entitlements or sensitive metadata into client-readable session fields.
- Treat `proxy.ts` as a first safety net, not the only authorization layer.
- API routes should still perform their own authorization checks.
- If a target app has admin-only areas, add app-specific route and API guards after installing the kit.

## What This Kit Does Not Provide

This kit does not include:

- a user database schema
- team or role administration UI
- app-specific permission checks
- centralized token exchange for downstream apps
- SCIM provisioning
- group-to-role mapping
- audit-log persistence
- session revocation beyond the generated profile hook

Those should be implemented by the command center or target app based on your operating model.

## Common Customizations

### Add user table lookup

Update `loadUserProfile` in generated `auth.ts`:

```ts
async function loadUserProfile(email: string): Promise<UserProfile | null> {
  return await getUserByEmail(email)
}
```

### Add group or role claims

Update `buildSessionClaims`:

```ts
function buildSessionClaims(profile: UserProfile | null) {
  return {
    roles: profile?.roles ?? [],
    apps: profile?.apps ?? [],
  }
}
```

### Add login audit

Update `onUserSignIn`:

```ts
await writeLoginEvent({
  email: input.email,
  provider: input.provider,
  eventType: "login",
})
```

### Add public routes

Update generated `proxy.ts`:

```ts
if (pathname.startsWith("/public-docs")) {
  return NextResponse.next()
}
```

## Troubleshooting

### Okta redirects back to an error page

Check:

- `NEXTAUTH_URL`
- Okta redirect URI
- `OKTA_ISSUER`
- `OKTA_CLIENT_ID`
- `OKTA_CLIENT_SECRET`
- whether `OKTA_ENABLED=true`

### The Okta button is disabled

Set:

```env
NEXT_PUBLIC_OKTA_ENABLED=true
```

The server provider uses `OKTA_ENABLED`; the client login button uses `NEXT_PUBLIC_OKTA_ENABLED`.

### TypeScript cannot resolve `@/auth`

The target app may not use the `@/` alias. Either add the alias to `tsconfig.json` or change generated imports to relative imports.

### Login works but app-specific access is missing

The kit only authenticates. Wire `commandCenterClaims` into the target app’s authorization model.

### Existing proxy or middleware conflicts

Use:

```bash
--no-proxy
```

Then manually merge the generated route-guard logic into the target app’s existing proxy/middleware.

## Current Status

This is a starter kit scaffold. It has been build-tested and smoke-tested locally, but it should still go through normal security review before being used broadly across production apps.
