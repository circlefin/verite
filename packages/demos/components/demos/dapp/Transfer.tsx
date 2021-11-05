import { PaperAirplaneIcon } from "@heroicons/react/solid"
import type { VerificationResultResponse } from "@verity/core"
import { FC, useState } from "react"
import { classNames } from "../../../lib/react-fns"
import type { VerificationRequestResponse } from "../../../lib/verification-request"
import { LoadingButton } from "../../LoadingButton"
import TransferStatus from "./TransferStatus"

type TransferProps = {
  transferTokens: (to: string, amount: string) => Promise<void>
  tokenSymbol: string
  isVerifying?: boolean
  simulateFunction?: () => Promise<void>
  verification?: VerificationRequestResponse
  dismissStatusMessage?: () => void
  verificationInfoSet?: VerificationResultResponse
}

const Transfer: FC<TransferProps> = ({
  transferTokens,
  tokenSymbol,
  isVerifying,
  simulateFunction,
  verification,
  verificationInfoSet
}) => {
  const [to, setTo] = useState(process.env.NEXT_PUBLIC_ETH_DEFAULT_RECIPIENT)
  const [amount, setAmount] = useState("")

  const isLoading = isVerifying && !verificationInfoSet

  return (
    <form
      className="max-w-md mx-auto rounded-lg shadow-md"
      onSubmit={(event) => {
        // This function just calls the transferTokens callback with the
        // form's data.
        event.preventDefault()

        if (to && amount) {
          transferTokens(to, amount)
        }
      }}
    >
      <div className="flex flex-col px-8 py-4 space-y-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Transfer
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Amount of {tokenSymbol}
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
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Recipient address
          </label>
          <input
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
          />
        </div>

        {/*
          If we have transfer or verification status to report, we do so here.
        */}
        {isLoading && (
          <TransferStatus
            simulateFunction={simulateFunction}
            verification={verification}
          />
        )}
      </div>
      <div className="px-4 py-3 text-right bg-gray-50 sm:px-6">
        <LoadingButton
          loading={isLoading}
          type="submit"
          style="dot-loader"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PaperAirplaneIcon
            className={classNames(
              isLoading ? "hidden" : "inline",
              "w-5 h-5 mr-2 -ml-1"
            )}
          />
          Transfer
        </LoadingButton>
      </div>
    </form>
  )
}

export default Transfer
