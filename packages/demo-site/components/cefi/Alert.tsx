import { ExclamationIcon } from "@heroicons/react/outline"
import { CheckCircleIcon, XIcon } from "@heroicons/react/solid"

type Props = {
  text: string
  type: string
  onDismiss: () => void
}

/**
 * Simple alert to show success / failure messages
 */
export default function Alert({ text, type, onDismiss }: Props): JSX.Element {
  if (type === "error") {
    return (
      <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationIcon
              className="w-5 h-5 text-yellow-400"
              aria-hidden="true"
            />
          </div>
          <div className="ml-3 overflow-scroll">
            <p className="text-sm text-yellow-700">{text}</p>
          </div>
          <div className="pl-3 ml-auto">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onDismiss}
                type="button"
                className="inline-flex bg-yellow-50 rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
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

  return (
    <div className="p-4 rounded-md bg-green-50">
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircleIcon
            className="w-5 h-5 text-green-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3 overflow-scroll">
          <p className="text-sm font-medium text-green-800">{text}</p>
        </div>
        <div className="pl-3 ml-auto">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onDismiss}
              type="button"
              className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
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
