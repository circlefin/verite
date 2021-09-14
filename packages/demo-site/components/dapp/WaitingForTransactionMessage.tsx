import { InformationCircleIcon } from "@heroicons/react/solid"
import { FC } from "react"

type Props = {
  txHash: string
}

const WaitingForTransactionMessage: FC<Props> = ({ txHash }) => {
  return (
    <div className="p-4 rounded-md bg-yellow-50">
      <div className="flex">
        <div className="flex-shrink-0">
          <InformationCircleIcon
            className="w-5 h-5 text-yellow-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3 overflow-scroll">
          <p className="text-sm font-medium text-yellow-800">
            Waiting for transaction <strong>{txHash}</strong> to be mined
          </p>
        </div>
      </div>
    </div>
  )
}

export default WaitingForTransactionMessage
