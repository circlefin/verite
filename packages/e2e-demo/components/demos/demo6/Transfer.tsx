import { DownloadIcon } from "@heroicons/react/solid"
import { FC, useState } from "react"

import { classNames } from "../../../lib/react-fns"
import { LoadingButton } from "../../shared/LoadingButton"
import { Asset, useBalance } from "./Demo6"

type TransferProps = {
  // Callback when transferTokens method is complete (success or failure)
  onTransfer: () => void
  transferTokens: (to: string, amount: string) => Promise<void>
  asset: Asset
  dismissStatusMessage?: () => void
}

const Transfer: FC<TransferProps> = ({ onTransfer, transferTokens, asset }) => {
  // We'll hard-code this market
  const to = asset.depositAddress
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [amount, setAmount] = useState("")
  const { data: balance } = useBalance(asset.tokenAddress)

  return (
    <form
      className="max-w-md mx-auto"
      onSubmit={async (event) => {
        // This function just calls the transferTokens callback with the
        // form's data.
        event.preventDefault()

        if (to && amount) {
          setIsLoading(true)
          await transferTokens(to, amount)
          setIsLoading(false)
          onTransfer()
        }
      }}
    >
      {
        // Conditionally show the user's balance.
        balance && (
          <div className="text-sm font-medium text-gray-700">
            Wallet Balance: {balance.toString()} {asset.name}
          </div>
        )
      }
      <div className="flex flex-col py-4 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Amount of {asset.name}
          </label>
          <input
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            type="number"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1"
            required
          />
        </div>
      </div>
      <div className="w-full py-3 bg-gray-50">
        <LoadingButton
          loading={isLoading}
          type="submit"
          style="dot-loader"
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <DownloadIcon
            className={classNames(
              isLoading ? "hidden" : "inline",
              "h-5 mr-2 -ml-1"
            )}
          />
          Deposit
        </LoadingButton>
      </div>
    </form>
  )
}

export default Transfer
