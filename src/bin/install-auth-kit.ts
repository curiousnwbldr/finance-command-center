#!/usr/bin/env node
import { installAuthKit } from "../install/install-auth-kit.js"
import type { InstallOptions, ProviderMode } from "../install/types.js"

function readArg(args: string[], name: string, fallback?: string): string | undefined {
  const index = args.indexOf(name)
  if (index === -1) return fallback
  return args[index + 1] ?? fallback
}

function hasFlag(args: string[], name: string): boolean {
  return args.includes(name)
}

function parseProvider(value: string | undefined): ProviderMode {
  if (value === "okta" || value === "auth0" || value === "both") return value
  throw new Error("--provider must be one of: okta, auth0, both")
}

function usage(): string {
  return `
Usage:
  finance-command-center-auth install --target <path> [options]
  command-center-auth install --target <path> [options]

Options:
  --app-name <name>          App display name. Default: Command Center
  --provider <mode>          okta | auth0 | both. Default: okta
  --dashboard-path <path>    Post-login route. Default: /dashboard
  --no-proxy                 Do not generate proxy.ts
  --force                    Overwrite existing files
  --help                     Show help
`.trim()
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (hasFlag(args, "--help") || !command) {
    console.log(usage())
    return
  }

  if (command !== "install") {
    throw new Error(`Unknown command "${command}".\n\n${usage()}`)
  }

  const target = readArg(args, "--target")
  if (!target) {
    throw new Error(`--target is required.\n\n${usage()}`)
  }

  const options: InstallOptions = {
    target,
    appName: readArg(args, "--app-name", "Command Center")!,
    provider: parseProvider(readArg(args, "--provider", "okta")),
    dashboardPath: readArg(args, "--dashboard-path", "/dashboard")!,
    includeProxy: !hasFlag(args, "--no-proxy"),
    force: hasFlag(args, "--force"),
  }

  await installAuthKit(options)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
