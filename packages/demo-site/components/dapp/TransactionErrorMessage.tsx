import { InformationCircleIcon, XIcon } from "@heroicons/react/solid"
import { FC } from "react"

export type TransactionErrorMessageProps = {
  message: string
  dismiss: React.MouseEventHandler
}

const TransactionErrorMessage: FC<TransactionErrorMessageProps> = ({
  message,
  dismiss
}) => {
  return (
    <div className="p-4 rounded-md bg-red-50">
      <div className="flex">
        <div className="flex-shrink-0">
          <InformationCircleIcon
            className="w-5 h-5 text-red-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3 overflow-scroll">
          <p className="text-sm font-medium text-red-800">{message}</p>
        </div>
        <div className="pl-3 ml-auto">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
              onClick={dismiss}
            >
              <span className="sr-only">Dismiss</span>
              <XIcon className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionErrorMessage
