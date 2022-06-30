import fetch from "cross-fetch"

/**
 * Perform a fetch and respond with a JSON object
 */
export const jsonFetch = (url: string): Promise<Record<string, unknown>> =>
  fetch(url).then((res) => res.json())

/**
 * Helper function to determine the hostname for the given environment
 */
export function appHost(): string {
  if (process.env.HOST) {
    return process.env.HOST
  } else if (process.env.NEXT_PUBLIC_HOST) {
    return process.env.NEXT_PUBLIC_HOST
  } else if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  } else if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return ""
}

/**
 * Build a URL for the given path
 */
export function fullURL(path = ""): string {
  return `${appHost()}${path}`
}
