/* This example requires Tailwind CSS v2.0+ */
import { Disclosure, Menu, Transition } from "@headlessui/react"
import { MenuIcon, XIcon, UserCircleIcon } from "@heroicons/react/outline"
import { signIn, signOut, useSession } from "next-auth/client"
import Link from "next/link"
import { useRouter } from "next/router"
import { FC, Fragment } from "react"

type Props = {
  title: string
}

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

const Header: FC<Props> = ({ title }) => {
  const [session] = useSession()
  const router = useRouter()

  const navigation = session
    ? [
        { name: "Dashboard", href: "/dashboard" },
        { name: "KYC/AML", href: "/attestations/kyc" }
      ]
    : []

  const isActive = (href: string): boolean => {
    return router.pathname === href
  }

  return (
    <>
      <div className="pb-32 bg-gray-800">
        <Disclosure as="nav" className="bg-gray-800">
          {({ open }) => (
            <>
              <div className="px-2 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-between h-16">
                  <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                    {/* Mobile menu button*/}
                    <Disclosure.Button className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
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
                          <a
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              isActive(item.href)
                                ? "bg-gray-900 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white",
                              "px-3 py-2 rounded-md text-sm font-medium"
                            )}
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                    {session && (
                      <Menu as="div" className="relative ml-3">
                        {({ open }) => (
                          <>
                            <div>
                              <Menu.Button className="flex text-sm bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
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
                                  {({ active }) => (
                                    <button
                                      onClick={() =>
                                        signOut({ callbackUrl: "/" })
                                      }
                                      className={classNames(
                                        active ? "bg-gray-100" : "",
                                        "block px-4 py-2 text-sm text-gray-700 w-full text-left"
                                      )}
                                    >
                                      Sign out
                                    </button>
                                  )}
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
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          isActive(item.href)
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white",
                          "block px-3 py-2 rounded-md text-base font-medium"
                        )}
                      >
                        {item.name}
                      </a>
                    ))}
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
        <header className="py-10">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white">{title}</h1>
          </div>
        </header>
      </div>
    </>
  )
}

export default Header
