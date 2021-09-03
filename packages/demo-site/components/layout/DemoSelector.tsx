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
    title: "Compliance & Basic Revocation",
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
            <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-md shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
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
                        active ? "text-white bg-blue-600" : "text-gray-900",
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
                                active ? "text-white" : "text-blue-600",
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
                            active ? "text-blue-200" : "text-gray-500",
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
