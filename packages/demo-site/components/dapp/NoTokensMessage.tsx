import { PlusIcon } from "@heroicons/react/outline"
import { FC, useState } from "react"
import DotLoader from "react-spinners/DotLoader"
import { LoadingButton } from "../LoadingButton"

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
      <p>You do not have any tokens to transfer.</p>
      <p>
        <LoadingButton
          loading={loading}
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
          text="Get Tokens"
        />
      </p>

      <p>
        The UI will update within 30 seconds after you request tokens, once the
        result is mined.
      </p>
    </div>
  )
}

export default NoTokensMessage
