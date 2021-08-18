import { PlusIcon } from "@heroicons/react/outline"
import { FC, useState } from "react"

export type NoTokensMessageProps = {
  faucetFunction: (address: string) => Promise<void>
  selectedAddress: string
}

const NoTokensMessage: FC<NoTokensMessageProps> = ({
  faucetFunction,
  selectedAddress
}) => {
  const [loading, setLoading] = useState<boolean>(false)
  return (
    <div className="prose">
      <p>You do not have tokens to transfer.</p>
      <p>
        <button
          onClick={async () => {
            if (loading) {
              return
            }
            setLoading(true)
            try {
              await faucetFunction(selectedAddress)
            } finally {
              setLoading(false)
            }
          }}
          type="button"
          disabled={loading}
          className={`${
            loading ? "opacity-50" : ""
          } inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          <PlusIcon className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" />
          Get Tokens
        </button>
      </p>

      <p>
        The UI will update within 30 seconds after you request tokens, once the
        result is mined.
      </p>
    </div>
  )
}

export default NoTokensMessage
