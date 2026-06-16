export function renderTemplate(source: string, context: Record<string, string>): string {
  return source.replace(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g, (_match, key: string) => {
    if (!(key in context)) {
      throw new Error(`Template variable ${key} was not provided.`)
    }
    return context[key]
  })
}
