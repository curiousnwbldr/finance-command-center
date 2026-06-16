import { mkdir, readFile, writeFile, access, appendFile } from "node:fs/promises"
import { constants } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { renderTemplate } from "./template.js"
import type { InstallOptions, TemplateContext } from "./types.js"

type TemplateFile = {
  template: string
  destination: string
}

const TEMPLATE_FILES: TemplateFile[] = [
  { template: "auth.ts.hbs", destination: "auth.ts" },
  { template: "app/login/page.tsx.hbs", destination: "app/login/page.tsx" },
  { template: "app/api/auth/[...nextauth]/route.ts.hbs", destination: "app/api/auth/[...nextauth]/route.ts" },
  { template: "app/types/next-auth.d.ts.hbs", destination: "app/types/next-auth.d.ts" },
]

function packageRoot(): string {
  const currentFile = fileURLToPath(import.meta.url)
  return resolve(dirname(currentFile), "../..")
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK)
    return true
  } catch {
    return false
  }
}

function toTemplateContext(options: InstallOptions): TemplateContext {
  return {
    appName: options.appName,
    provider: options.provider,
    dashboardPath: options.dashboardPath,
    oktaEnabledDefault: options.provider === "okta" || options.provider === "both" ? "true" : "false",
    auth0EnabledDefault: options.provider === "auth0" || options.provider === "both" ? "true" : "false",
  }
}

function asRecord(context: TemplateContext): Record<string, string> {
  return {
    APP_NAME: context.appName,
    DASHBOARD_PATH: context.dashboardPath,
    OKTA_ENABLED_DEFAULT: context.oktaEnabledDefault,
    AUTH0_ENABLED_DEFAULT: context.auth0EnabledDefault,
  }
}

async function writeRenderedTemplate(args: {
  templatesRoot: string
  targetRoot: string
  file: TemplateFile
  context: Record<string, string>
  force: boolean
}): Promise<"created" | "overwritten" | "skipped"> {
  const sourcePath = join(args.templatesRoot, args.file.template)
  const destinationPath = join(args.targetRoot, args.file.destination)
  const alreadyExists = await exists(destinationPath)

  if (alreadyExists && !args.force) return "skipped"

  const source = await readFile(sourcePath, "utf8")
  const rendered = renderTemplate(source, args.context)
  await mkdir(dirname(destinationPath), { recursive: true })
  await writeFile(destinationPath, rendered, "utf8")
  return alreadyExists ? "overwritten" : "created"
}

async function appendEnvExample(targetRoot: string, templatesRoot: string, context: Record<string, string>): Promise<"appended" | "present"> {
  const envPath = join(targetRoot, ".env.example")
  const marker = "# Command Center Auth Kit"
  const block = renderTemplate(await readFile(join(templatesRoot, "env.example.hbs"), "utf8"), context)

  if (await exists(envPath)) {
    const current = await readFile(envPath, "utf8")
    if (current.includes(marker)) return "present"
    await appendFile(envPath, `\n\n${block}`, "utf8")
    return "appended"
  }

  await writeFile(envPath, `${block}\n`, "utf8")
  return "appended"
}

export async function installAuthKit(options: InstallOptions): Promise<void> {
  const targetRoot = resolve(options.target)
  const templatesRoot = join(packageRoot(), "templates/next-app-router")
  const context = asRecord(toTemplateContext(options))
  const files = [...TEMPLATE_FILES]

  if (options.includeProxy) {
    files.push({ template: "proxy.ts.hbs", destination: "proxy.ts" })
  }

  await mkdir(targetRoot, { recursive: true })

  for (const file of files) {
    const status = await writeRenderedTemplate({
      templatesRoot,
      targetRoot,
      file,
      context,
      force: options.force,
    })
    console.log(`${status.padEnd(11)} ${file.destination}`)
  }

  const envStatus = await appendEnvExample(targetRoot, templatesRoot, context)
  console.log(`${envStatus.padEnd(11)} .env.example`)
}
