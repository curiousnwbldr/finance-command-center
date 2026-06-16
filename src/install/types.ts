export type ProviderMode = "okta" | "auth0" | "both"

export interface InstallOptions {
  target: string
  appName: string
  provider: ProviderMode
  dashboardPath: string
  force: boolean
  includeProxy: boolean
}

export interface TemplateContext {
  appName: string
  provider: ProviderMode
  dashboardPath: string
  oktaEnabledDefault: "true" | "false"
  auth0EnabledDefault: "true" | "false"
}
