/* This example requires Tailwind CSS v2.0+ */
import { Disclosure, Menu, Transition } from "@headlessui/react"
import { MenuIcon, XIcon, UserCircleIcon } from "@heroicons/react/outline"
import { signOut, useSession } from "next-auth/client"
import Link from "next/link"
import { FC, Fragment } from "react"
import type { User } from "../lib/database"
import { isActive, classNames } from "../lib/react-fns"

type Props = {
  title: string
  theme?: string
  skipAuth?: boolean
}

type Theme = {
  bg: string
  active: string
  hover: string
}

const THEMES: Record<string, Theme> = {
  gray: {
    bg: "bg-gray-800",
    active: "bg-gray-900",
    hover: "hover:bg-gray-700"
  },
  blue: {
    bg: "bg-blue-600",
    active: "bg-blue-800",
    hover: "hover:bg-blue-700"
  },
  indigo: {
    bg: "bg-indigo-600",
    active: "bg-indigo-800",
    hover: "hover:bg-indigo-700"
  },
  green: {
    bg: "bg-green-600",
    active: "bg-green-800",
    hover: "hover:bg-green-700"
  }
}

const Header: FC<Props> = ({ title, theme, skipAuth }) => {
  const [session] = useSession()
  const colors = THEMES[theme || "gray"]

  const navigation = [
    { name: "Issuer", href: "/issuer" },
    { name: "Verifier", href: "/verifier" },
    { name: "Admin", href: "/admin" }
  ]

  return (
    <>
      <div className={`${colors.bg} pb-32`}>
        <Disclosure as="nav" className={colors.bg}>
          {({ open }) => (
            <>
              <div className="max-w-3xl px-2 mx-auto sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-between h-16">
                  <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                    {/* Mobile menu button*/}
                    <Disclosure.Button
                      className={`inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:text-white ${colors.hover} focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white`}
                    >
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
                    <div className="flex items-center flex-shrink-0">
                      <Link href="/">
                        <a className="text-2xl font-extrabold tracking-tight text-center text-white">
                          Verity Demo
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
                                  ? `${colors.active} text-white`
                                  : `text-gray-300 ${colors.hover} hover:text-white`,
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
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                    {!skipAuth && session && (
                      <Menu as="div" className="relative ml-3">
                        {({ open }) => (
                          <>
                            <div>
                              <Menu.Button
                                className={`${colors.bg} flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white`}
                              >
                                <span className="sr-only">Open user menu</span>
                                <UserCircleIcon className="w-8 h-8 text-gray-400 rounded-full" />
                              </Menu.Button>
                            </div>
                            <Transition
                              show={open}
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items
                                static
                                className="absolute right-0 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                              >
                                <div className="px-4 py-3">
                                  <p className="text-sm leading-5 text-gray-700">
                                    Signed in as
                                  </p>
                                  <p className="text-sm font-medium leading-5 text-gray-900 truncate">
                                    {session.user.email}
                                  </p>
                                </div>
                                <Menu.Item>
                                  <button
                                    onClick={() =>
                                      signOut({ callbackUrl: "/" })
                                    }
                                    className="block w-full px-4 py-2 text-sm text-left text-gray-700"
                                  >
                                    Sign out
                                  </button>
                                </Menu.Item>
                              </Menu.Items>
                            </Transition>
                          </>
                        )}
                      </Menu>
                    )}
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="sm:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {session &&
                    navigation.map((item) => (
                      <Link key={item.name} href={item.href}>
                        <a
                          className={classNames(
                            isActive(item.href)
                              ? `${colors.active} text-white`
                              : `text-gray-300 ${colors.hover} hover:text-white`,
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
          <div className="max-w-3xl px-4 mx-auto sm:px-6 lg:px-8">
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
