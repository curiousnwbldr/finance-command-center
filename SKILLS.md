# Command Center Auth Kit Skill

## Purpose

Use this skill to install and configure the Command Center Auth Kit in a Next.js App Router application.

The package provides a repeatable authentication scaffold for apps that need Auth.js / NextAuth with Okta, and optionally Auth0. It generates the auth configuration, login page, Auth.js route handler, type augmentation, route guard, environment variable examples, and the required app-owner handoff document.

- Package: `@curiousnwbldr/finance-command-center-auth`
- Primary CLI command: `finance-command-center-auth`
- Alias CLI command: `command-center-auth`
- Required handoff file: `AUTH_SETUP_HANDOFF.md`

## When To Use This Skill

Use this skill when the user asks for any of the following:

- add authentication
- add login
- add Okta login
- add SSO
- add Auth.js
- add NextAuth
- add command-center authentication
- scaffold authentication files
- configure auth for a Next.js App Router app

Use this skill only when the target repository is a Next.js App Router application or appears intended to become one.

Do not use this skill when:

- the app is not a Next.js application
- the app uses only the Pages Router and cannot support App Router files
- the user needs a complete identity provider service
- the user needs SAML-only authentication
- the app already has a custom authentication system and the user has not asked to replace or extend it
- the user has not given permission to modify files

## Human-Friendly Summary

Tell the user:

> I can add the standard command-center authentication scaffold to this app. I will create login and Auth.js files, update `.env.example`, create the app-owner handoff document, and show you the exact environment variables your IT/IAM team needs to provide.

Avoid exposing unnecessary terminal details to non-developer users. Explain the outcome, not every command, unless they ask.

## Preflight Checklist

Before running the installer, inspect the target repository.

Confirm:

- the repo has a `package.json`
- the app is a Next.js app
- the app uses or can support the App Router
- the repo is clean enough to modify safely
- the user agrees to add generated authentication files

Recommended commands:

```bash
pwd
ls
test -f package.json && cat package.json
git status --short
```

Look for Next.js:

```bash
cat package.json | grep '"next"'
```

Look for App Router structure:

```bash
find . -maxdepth 3 -type d \( -name app -o -name pages \)
```

If the app has only `pages/` and no `app/`, ask the user whether they want to proceed with App Router files.

## Dependency Requirements

The target app should have these peer dependencies:

```bash
pnpm add next react react-dom next-auth
```

If the target app already has them, do not reinstall unnecessarily.

Check with:

```bash
pnpm list next react react-dom next-auth
```

Prefer the package manager already used by the repository:

- `pnpm-lock.yaml` means use `pnpm`
- `package-lock.json` means use `npm`
- `yarn.lock` means use `yarn`
- no lockfile means prefer `pnpm` unless the user says otherwise

Equivalent install commands:

```bash
npm install next react react-dom next-auth
yarn add next react react-dom next-auth
```

## Install Command

Preferred command with pnpm:

```bash
pnpm dlx @curiousnwbldr/finance-command-center-auth install \
  --target . \
  --app-name "<APP_NAME>" \
  --provider okta
```

With npm:

```bash
npx @curiousnwbldr/finance-command-center-auth install \
  --target . \
  --app-name "<APP_NAME>" \
  --provider okta
```

With the short alias after package installation:

```bash
command-center-auth install \
  --target . \
  --app-name "<APP_NAME>" \
  --provider okta
```

Use the application’s real display name for `<APP_NAME>`.

Example:

```bash
pnpm dlx @curiousnwbldr/finance-command-center-auth install \
  --target . \
  --app-name "Finance Command Center" \
  --provider okta
```

## Supported Options

- `--target <path>`: required target Next.js app folder
- `--app-name <name>`: app display name; default is `Command Center`
- `--provider <mode>`: `okta`, `auth0`, or `both`; default is `okta`
- `--dashboard-path <path>`: post-login route; default is `/dashboard`
- `--no-proxy`: do not generate `proxy.ts`
- `--force`: overwrite existing generated files
- `--help`: show help

Provider guidance:

- Use `okta` for standard enterprise Okta SSO.
- Use `auth0` only when the app is intended to authenticate through Auth0.
- Use `both` only when the user explicitly asks for both providers.
- Default to `okta` if the user is unsure.

Proxy guidance:

- Generate `proxy.ts` by default.
- Use `--no-proxy` if the app already has complex middleware or proxy logic.
- If the app already has `proxy.ts` or `middleware.ts`, do not overwrite without asking.

Force guidance:

- Do not use `--force` unless the user explicitly asks to overwrite generated auth files.
- If generated files already exist, show the user what would be overwritten.

## Generated Files

The installer creates or appends the following authentication files:

- `auth.ts`
- `app/login/page.tsx`
- `app/api/auth/[...nextauth]/route.ts`
- `app/types/next-auth.d.ts`
- `proxy.ts`
- `.env.example`

Expected installer output should resemble:

```text
created auth.ts
created app/login/page.tsx
created app/api/auth/[...nextauth]/route.ts
created app/types/next-auth.d.ts
created proxy.ts
appended .env.example
```

After installation, the agent must also create:

- `AUTH_SETUP_HANDOFF.md`

## Environment Variables

After installation, explain that real secret values must come from the IT/IAM or platform owner. Never invent client IDs, client secrets, issuers, or production URLs.

Required variables:

| Variable | Required | Owner | Notes |
| --- | --- | --- | --- |
| `AUTH_SECRET` | Yes | App/deployment owner | Generate a strong random value. |
| `NEXTAUTH_SECRET` | Yes | App/deployment owner | Can match `AUTH_SECRET` if the app standard allows. |
| `NEXTAUTH_URL` | Yes | App/deployment owner | Must match the deployed app origin. |
| `OKTA_ENABLED` | Yes | App/deployment owner | Usually `true`. |
| `NEXT_PUBLIC_OKTA_ENABLED` | Yes | App/deployment owner | Usually `true`; controls login button visibility. |
| `OKTA_CLIENT_ID` | Yes | IT/IAM | From the Okta OIDC app. |
| `OKTA_CLIENT_SECRET` | Yes | IT/IAM | From the Okta OIDC app; secret. |
| `OKTA_ISSUER` | Yes | IT/IAM | Example: `https://your-org.okta.com`. |

Optional Auth0 variables when `--provider auth0` or `--provider both` is used:

```env
AUTH0_ENABLED=true
NEXT_PUBLIC_AUTH0_ENABLED=true
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_ISSUER=
```

Tell the user:

> Your IT/IAM team needs to provide `OKTA_CLIENT_ID`, `OKTA_CLIENT_SECRET`, and `OKTA_ISSUER`. Your deployment owner needs to set `NEXTAUTH_URL`, `AUTH_SECRET`, and `NEXTAUTH_SECRET`.

Generate local development secrets only if requested:

```bash
openssl rand -base64 32
```

Do not commit real values to Git.

## Okta Setup Requirements

The target app needs an Okta OIDC web application.

Ask the IT/IAM owner for:

- Okta client ID
- Okta client secret
- Okta issuer URL
- approved redirect URI
- approved sign-out URI
- assigned user/group access
- app owner
- secret rotation owner
- production approval status

Recommended redirect URI:

```text
https://<APP_HOST>/api/auth/callback/okta
```

Local development redirect URI:

```text
http://localhost:3000/api/auth/callback/okta
```

Recommended sign-out URI:

```text
https://<APP_HOST>/login
```

Local development sign-out URI:

```text
http://localhost:3000/login
```

Recommended scopes:

```text
openid profile email
```

Do not reuse Okta clients from unrelated apps unless IT/IAM explicitly approves.

## Required App Owner Handoff

After installing the auth kit, create `AUTH_SETUP_HANDOFF.md` in the target repository.

The handoff document is intended for non-developer app owners, IT/IAM teams, deployment owners, and reviewers.

Its purpose is not to instruct the non-developer user to run the installer. The agent performs the installation. The handoff document is the final closeout artifact that clearly lists what remains open and which manual setup steps must still be completed before the app is ready for production use.

It must summarize:

- what changed
- what files were created
- what manual setup items are still open
- what the app owner needs from IT/IAM
- what environment variables must be configured
- what deployment settings must be updated
- what validation steps remain
- what security review items remain

Do not include real secrets in this document.

### Handoff Document Structure

Create `AUTH_SETUP_HANDOFF.md` with this structure:

```markdown
# Authentication Setup Handoff

## Summary

Authentication scaffolding has been added to this app using the Command Center Auth Kit.

The app now includes Auth.js / NextAuth configuration, Okta provider setup, a login page, an authentication route handler, session/JWT type augmentation, route protection, and example environment variables.

This setup adds authentication only. App-specific authorization, roles, permissions, user provisioning, and audit logging still need to be connected by the app team.

## Open Manual Setup Items

The agent has completed the code installation. The following items still require app owner, IT/IAM, deployment owner, or security review action. Items marked `Open` block production use until completed.

| Item | Owner | Status | Notes |
| --- | --- | --- | --- |
| Okta OIDC app/client | IT/IAM | `Open` | Create or confirm the Okta web app and provide the required Okta values. |
| Okta user/group assignment | IT/IAM / app owner | `Open` | Assign the approved users or groups that may access this app. |
| Deployment environment variables | Deployment owner | `Open` | Configure the required variables listed below in the deployment platform or secret manager. |
| Production app URL | Deployment owner | `Open` | Confirm `NEXTAUTH_URL` and deployed redirect/sign-out URLs match the production host. |
| Local or staging validation | App/deployment owner | `Open` | Confirm login, callback, redirect, and protected-route behavior. |
| App-specific authorization | App team | `Open` | Connect roles, permissions, user provisioning, inactive-user handling, and audit logging as needed. |
| Security review | Security/app owner | `Open` | Confirm secret handling, API authorization, and production readiness. |

## Files Added Or Updated

List the files from the generated files section of this skill.

## Decisions Used During Setup

| Item | Value |
| --- | --- |
| App name | `<APP_NAME>` |
| Provider | `<PROVIDER>` |
| Post-login route | `<DASHBOARD_PATH>` |
| Proxy generated | `<YES_OR_NO>` |
| Installed by | `<AGENT_OR_PERSON>` |
| Install date | `<DATE>` |

## Information Needed From IT / IAM

Ask IT/IAM to create or confirm an Okta OIDC web application for this app. Include the Okta values, owners, redirect URIs, sign-out URIs, assigned groups/users, and production approval status from the Okta setup requirements section.

## Environment Variables To Configure

Include the environment variable table from this skill. Keep placeholders for unknown values and never include real secrets.

## Deployment Checklist

- Okta app created by IT/IAM.
- Okta redirect URI matches deployed app callback URL.
- Okta sign-out URI matches deployed app login URL.
- Required users/groups assigned in Okta.
- Environment variables added to deployment platform.
- Secrets stored only in secret manager or deployment platform.
- `.env.example` contains placeholders only.
- App builds successfully.
- `/login` page loads.
- Okta sign-in completes successfully.
- User lands on the expected post-login page.
- Unauthenticated users are redirected to `/login`.
- Existing public routes still work.
- Existing API routes still perform authorization checks.

## App Team Follow-Up

Review and connect the generated auth extension hooks to the app's user profile, entitlement, role, or audit systems as needed.

## Security Notes

Use the security rules from this skill.

## Validation Commands

Use the validation commands from this skill and record which checks passed, failed, or were unavailable.

## Status

| Item | Status |
| --- | --- |
| Auth scaffold installed | `<DONE_OR_PENDING>` |
| IT/IAM values collected | `<DONE_OR_PENDING>` |
| Environment variables configured | `<DONE_OR_PENDING>` |
| Local validation completed | `<DONE_OR_PENDING>` |
| Production validation completed | `<DONE_OR_PENDING>` |
| Security review completed | `<DONE_OR_PENDING>` |

Use `Done` only for items the agent actually completed or verified. Use `Open` for manual items still waiting on IT/IAM, deployment owner, app owner, app team, or security review.
```

### Handoff Agent Requirements

The agent must:

1. Create `AUTH_SETUP_HANDOFF.md` after installation.
2. Replace placeholders where known.
3. Leave unknown values as clear placeholders.
4. Never insert real secrets.
5. Mention that IT/IAM must provide Okta values.
6. Mention that app-specific authorization is not completed by this kit.
7. Include an `Open Manual Setup Items` section near the top.
8. Mark unresolved manual setup items as `Open`.
9. Include the generated files list.
10. Include validation commands.
11. Include a production readiness checklist.

If the user is non-technical, summarize the handoff document in plain English after creating it.

## App Team Follow-Up

The generated `auth.ts` includes extension hooks that must be reviewed:

- `onUserSignIn`
- `loadUserProfile`
- `buildSessionClaims`

Required app-team decisions:

- Where is the user profile stored?
- How are inactive users identified?
- What roles or entitlements should be added to the session?
- Should login events be written to an audit log?
- Which pages should be public?
- Which pages require authentication?
- Which API routes require authorization checks?

## Post-Install Validation

After running the installer, validate the generated files.

List generated files:

```bash
find . -maxdepth 5 -type f \( \
  -path "./auth.ts" -o \
  -path "./app/login/page.tsx" -o \
  -path "./app/api/auth/*/route.ts" -o \
  -path "./app/types/next-auth.d.ts" -o \
  -path "./proxy.ts" -o \
  -path "./.env.example" -o \
  -path "./AUTH_SETUP_HANDOFF.md" \
\) | sort
```

Check for unresolved template placeholders:

```bash
grep -R "{{" auth.ts app proxy.ts .env.example AUTH_SETUP_HANDOFF.md 2>/dev/null || true
grep -R "}}" auth.ts app proxy.ts .env.example AUTH_SETUP_HANDOFF.md 2>/dev/null || true
```

Expected result: no output from the grep commands.

Run type/build checks using the target repo’s scripts. Inspect `package.json` first:

```bash
cat package.json
```

Common validations:

```bash
pnpm build
pnpm typecheck
pnpm lint
```

If scripts do not exist, do not invent them. Report that the repo does not define that validation script.

## Safe Git Workflow

Before modifying files:

```bash
git status --short
```

After installation:

```bash
git status --short
```

Show the user which files changed.

Recommend:

```bash
git diff
```

Do not commit automatically unless the user asks.

Suggested commit message if requested:

```text
Add command-center authentication scaffold
```

## Handling Existing Files

If any generated file already exists:

- do not overwrite it automatically
- explain which file exists
- ask whether to skip the file, manually merge changes, or rerun with `--force`

Files to be careful with:

- `auth.ts`
- `proxy.ts`
- `middleware.ts`
- `app/api/auth/[...nextauth]/route.ts`
- `.env.example`
- `AUTH_SETUP_HANDOFF.md`

If the app already has `middleware.ts`, explain that Next.js 16 uses `proxy.ts`, but older apps may use `middleware.ts`. The user may need a manual merge.

## Common Success Response

After a successful install, tell the user:

> Authentication scaffolding has been added. The app now has an Auth.js config, login page, auth route handler, type augmentation, route guard, `.env.example` entries, and an app-owner handoff document. The remaining work is to add real Okta environment variables and connect the placeholder profile hooks in `auth.ts` to the app’s user or entitlement system.

Then list changed files.

## Common Failure Cases

### Package Manager Cannot Run `pnpm dlx`

Try npm:

```bash
npx @curiousnwbldr/finance-command-center-auth install \
  --target . \
  --app-name "<APP_NAME>" \
  --provider okta
```

### `pnpm` Blocks Newly Published Package

If `pnpm` has `minimumReleaseAge` enabled, use:

```bash
pnpm dlx --config.minimum-release-age=0 @curiousnwbldr/finance-command-center-auth install \
  --target . \
  --app-name "<APP_NAME>" \
  --provider okta
```

### Existing Files Are Skipped

Explain that the installer avoids overwriting existing files by default. Ask whether to use `--force` or manually merge.

### TypeScript Cannot Resolve `@/auth`

The target app may not have an `@/` alias.

Check `tsconfig.json`. If the alias is missing, either add an alias or change generated imports to relative imports.

### Login Page Renders But Provider Button Is Disabled

Check:

```env
NEXT_PUBLIC_OKTA_ENABLED=true
```

### Okta Callback Fails

Check `NEXTAUTH_URL` and all required Okta variables. Also verify that the Okta redirect URI exactly matches:

```text
https://<APP_HOST>/api/auth/callback/okta
```

### App Has Custom Authorization Needs

Explain that this package only provides authentication scaffolding. The app must still implement its own authorization rules, user roles, permissions, and audit logging.

## Security Rules

Never:

- commit real secrets
- print secrets into chat unless the user already pasted them and explicitly asks for analysis
- invent Okta credentials
- overwrite existing auth files without user consent
- treat route guards as the only authorization layer
- put sensitive entitlement data into client-readable session claims

Always:

- use `.env.example` for placeholders only
- keep real secrets in the deployment platform or secret manager
- recommend IT/IAM ownership of Okta apps
- remind the user to review generated files before committing
- keep app-specific authorization separate from authentication
- rotate Okta client secrets according to IT policy

## Agent Decision Tree

1. User asks for authentication.
2. Confirm the repo is a Next.js App Router app.
3. Determine package manager.
4. Check for existing auth files.
5. Install peer dependencies if missing.
6. Run the installer.
7. Create or confirm `AUTH_SETUP_HANDOFF.md`.
8. Validate generated files.
9. Check for unresolved template placeholders.
10. Run available build/type/lint checks.
11. Evaluate the Definition Of Done.
12. Explain any partial-state items that remain incomplete.
13. Provide the Required Final Output grouped by completed work, app owner actions, IT/IAM actions, security review items, and generated documents.

## Minimal Agent Sequence

For a clean pnpm Next.js App Router app:

1. Check the working tree with `git status --short`.
2. Install missing peer dependencies from the dependency requirements section.
3. Run the preferred pnpm install command from the install command section.
4. Confirm all generated files, including `AUTH_SETUP_HANDOFF.md`.
5. Run the unresolved-placeholder checks from the validation section.
6. Run available build/type/lint checks.
7. Evaluate the Definition Of Done.
8. Summarize any partial-state items that remain incomplete.
9. Provide the Required Final Output.

## Definition Of Done

Authentication setup is considered complete only when all of the following are true:

- Auth scaffolding installed successfully.
- `AUTH_SETUP_HANDOFF.md` created.
- No unresolved template placeholders remain.
- Build succeeds.
- Typecheck succeeds, if available.
- Required environment variables documented.
- Okta application/client information documented.
- Redirect URIs documented.
- App owner handoff document delivered.
- Open manual setup items clearly identified.
- Generated files reviewed before commit.

If any item is incomplete, the setup remains in a partial state and the agent must explain the remaining work.


## Required Final Output

At the end of the skill execution, provide the following closeout summary.

### Completed

- Files created.
- Files modified.
- Validations passed.

### Requires App Owner Action

- Environment variables still needed.
- Deployment changes still needed.

### Requires IT/IAM Action

- Okta client information still needed.
- Redirect URI approval.
- User/group assignment.

### Requires Security Review

- Any remaining security review items.

### Generated Documents

- `AUTH_SETUP_HANDOFF.md`

## Notes For Non-Developer Users

If the user is non-technical, avoid saying “run this command” as the primary instruction.

Instead say:

> I can apply the standard authentication setup for you. I’ll add the required files, then I’ll show you the environment variables your IT/IAM team needs to fill in.

Only ask the user for decisions they can answer:

- What is the app name?
- Should this use Okta?
- What page should users land on after login?
- Is there already an existing login system?
- Who owns the Okta app/client?

Do not ask non-developer users to choose between package managers, module formats, or dependency models unless necessary.
