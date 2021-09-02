import { Listbox, Transition } from "@headlessui/react"
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid"
import { useRouter } from "next/router"
import { FC, Fragment, useState } from "react"
import { classNames } from "../../lib/react-fns"

const DEMOS = [
  {
    title: "Basic Issuance",
    href: "/issuer",
    description:
      "An end-user requests KYC or Credit Score credentials from an issuer"
  },
  {
    title: "Basic Verification",
    href: "/verifier",
    description: "An end-user submits a credential to a 3rd party verifier"
  },
  {
    title: "Basic Revocation",
    href: "/revocation",
    description:
      "A compliance officer revokes a previously-issued KYC credential"
  },
  {
    title: "Dapp Requiring KYC",
    href: "/dapp",
    description:
      "An example of how a Dapp can prevent usage until a valid KYC credential is provided"
  },
  {
    title: "Centralized app with travel rule",
    href: "/cefi",
    description:
      "An example of how a centralized service could satisfy Travel Rule requirements before performing a transaction"
  }
]

type Demo = typeof DEMOS[0]

const DemoSelector: FC = () => {
  const router = useRouter()

  const currentDemo = DEMOS.find((demo) =>
    router.pathname.startsWith(demo.href)
  )
  const [selected, setSelected] = useState<Demo>(currentDemo)

  const onSelect = (demo: Demo) => {
    setSelected(demo)
    console.log("going to ", demo.href)
    router.push(demo.href)
  }

  return (
    <Listbox value={selected} onChange={onSelect}>
      {({ open }) => (
        <>
          <div className="relative w-full mt-1">
            <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-md shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <span className="block text-gray-800 truncate">
                {selected ? selected.title : "Select a Demo"}
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <SelectorIcon
                  className="w-5 h-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                <Listbox.Option
                  value={undefined}
                  disabled={true}
                  className="relative py-2 pl-3 font-semibold text-gray-900 border-b-2 cursor-default select-none pr-9"
                >
                  Select a Demo
                </Listbox.Option>
                {DEMOS.map((demo) => (
                  <Listbox.Option
                    key={demo.href}
                    className={({ active }) =>
                      classNames(
                        active ? "text-white bg-indigo-600" : "text-gray-900",
                        "cursor-default select-none relative py-2 pl-3 pr-9"
                      )
                    }
                    value={demo}
                  >
                    {({ selected, active }) => (
                      <div className="flex flex-col">
                        <div className="flex justify-between">
                          <span
                            className={classNames(
                              selected ? "font-semibold" : "font-normal",
                              "block truncate"
                            )}
                          >
                            {demo.title}
                          </span>

                          {selected && (
                            <span
                              className={classNames(
                                active ? "text-white" : "text-indigo-600",
                                "absolute inset-y-0 right-0 flex items-center pr-4"
                              )}
                            >
                              <CheckIcon
                                className="w-5 h-5"
                                aria-hidden="true"
                              />
                            </span>
                          )}
                        </div>
                        <p
                          className={classNames(
                            active ? "text-indigo-200" : "text-gray-500",
                            "mt-2"
                          )}
                        >
                          {demo.description}
                        </p>
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  )
}

export default DemoSelector

/*
           <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
                Select a Demo
                <ChevronDownIcon
                  className="w-5 h-5 ml-2 -mr-1"
                  aria-hidden="true"
                />
              </Menu.Button>
            </div>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-50 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  {DEMOS.map(([title, href]) => (
                    <Menu.Item key={href}>
                      {({ active }) => (
                        <Link href={href}>
                          <a
                            className={classNames(
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700",
                              "block px-4 py-2 text-sm hover:text-gray-900"
                            )}
                          >
                            {title}
                          </a>
                        </Link>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

					*/
