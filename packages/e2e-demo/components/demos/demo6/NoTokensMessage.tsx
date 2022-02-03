import { PlusIcon } from "@heroicons/react/outline"
import { FC, useState } from "react"

import { classNames } from "../../../lib/react-fns"
import { LoadingButton } from "../../shared/LoadingButton"

export type NoTokensMessageProps = {
  faucetFunction: (address: string) => Promise<boolean>
  selectedAddress: string
}

const NoTokensMessage: FC<NoTokensMessageProps> = ({
  faucetFunction,
  selectedAddress
}) => {
  const [loading, setLoading] = useState<boolean>(false)
  return (
    <div className="prose">
      <p>For this demo you will need some tokens to deposit in a pool.</p>
      <p>
        <LoadingButton
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          loading={loading}
          style="dot-loader"
          onClick={async () => {
            if (loading) {
              return
            }
            setLoading(true)
            const success = await faucetFunction(selectedAddress)
            if (!success) {
              setLoading(false)
            }
          }}
        >
          <>
            <PlusIcon
              className={classNames(
                loading ? "hidden" : "inline",
                "w-5 h-5 mr-2 -ml-1"
              )}
            />
            Get Tokens
          </>
        </LoadingButton>
      </p>

      <p>
        The UI will update within 30 seconds after you request tokens, once the
        result is mined.
      </p>
    </div>
  )
}

export default NoTokensMessage
