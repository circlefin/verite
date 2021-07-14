import { useRouter } from "next/router"

export type IsActiveProps = {
  inclusive?: boolean
}

export function isActive(
  href: string,
  { inclusive }: IsActiveProps = {}
): boolean {
  const router = useRouter()

  if (inclusive) {
    return router.pathname.startsWith(href)
  }

  return router.pathname === href
}

export function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(" ")
}
