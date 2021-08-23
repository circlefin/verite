import { useRouter } from "next/router"

export const PASSWORD_PROTECTION_COOKIE = "PPBqWA9"

export function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(" ")
}

export function isActive(href: string, inclusive = true): boolean {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter()

  if (inclusive) {
    return router.pathname.startsWith(href) || router.asPath.startsWith(href)
  }
  return router.pathname === href
}
