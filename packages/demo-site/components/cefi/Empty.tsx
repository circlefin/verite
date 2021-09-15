import { PlusIcon } from "@heroicons/react/solid"
import Link from "next/link"

export default function EmptyAccount(): JSX.Element {
  return (
    <div className="text-center my-16">
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        No transactions
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by sending some VUSDC.
      </p>
      <div className="mt-6">
        <Link href="/demos/cefi/send" passHref>
          <div className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Send VUSDC
          </div>
        </Link>
      </div>
    </div>
  )
}
