import { NextRouter } from "next/router"

export function useActiveClass(router: NextRouter) {
  return (
    href: string,
    active: string,
    inactive: string,
    base: string
  ): string => {
    if (router.pathname === href) {
      return [base, active].join(" ")
    } else {
      return [base, inactive].join(" ")
    }
  }
}
