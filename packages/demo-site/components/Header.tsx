/* This example requires Tailwind CSS v2.0+ */
import { Disclosure } from "@headlessui/react"
import { MenuIcon, XIcon } from "@heroicons/react/outline"
import Head from "next/head"
import Link from "next/link"
import { FC } from "react"
import { isActive, classNames } from "../lib/react-fns"

export type HeaderProps = {
  title: string
}

const navigation = [
  { name: "Issue", href: "/issuer" },
  { name: "Verify", href: "/verifier" },
  { name: "Revoke", href: "/admin" },
  { name: "Dapp", href: "/dapp" },
  { name: "Docs", href: "/documentation" }
]

const Header: FC<HeaderProps> = ({ title }) => {
  return (
    <>
      <Head>
        <title>Verity.id | {title}</title>
      </Head>
      <div className="pb-32 bg-blue-600">
        <header className="py-4 sm:py-10">
          <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              {title}
            </h1>
          </div>
        </header>
      </div>
    </>
  )
}

export default Header
