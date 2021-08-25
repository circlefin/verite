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
        <Disclosure as="nav" className="bg-blue-600">
          {({ open }) => (
            <>
              <div className="max-w-4xl px-2 mx-auto sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-between h-16">
                  <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                    {/* Mobile menu button*/}
                    <Disclosure.Button className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XIcon className="block w-6 h-6" aria-hidden="true" />
                      ) : (
                        <MenuIcon
                          className="block w-6 h-6"
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>
                  <div className="flex items-center justify-center flex-1 sm:items-stretch sm:justify-start">
                    <div className="flex-shrink-0">
                      <Link href="/">
                        <a className="text-2xl font-extrabold tracking-tight text-center text-white">
                          Verity.id
                        </a>
                      </Link>
                    </div>
                    <div className="hidden sm:block sm:ml-6">
                      <div className="flex space-x-4">
                        {navigation.map((item) => (
                          <Link key={item.name} href={item.href}>
                            <a
                              className={classNames(
                                isActive(item.href)
                                  ? "bg-blue-800 text-white"
                                  : "text-gray-300 hover:bg-blue-700 hover:text-white",
                                "px-3 py-2 rounded-md text-sm font-medium"
                              )}
                            >
                              {item.name}
                            </a>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="sm:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {navigation.map((item) => (
                    <Link key={item.name} href={item.href}>
                      <a
                        className={classNames(
                          isActive(item.href)
                            ? "bg-blue-800 text-white"
                            : "text-gray-300 hover:bg-blue-700 hover:text-white",
                          "block px-3 py-2 rounded-md text-base font-medium"
                        )}
                      >
                        {item.name}
                      </a>
                    </Link>
                  ))}
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
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
