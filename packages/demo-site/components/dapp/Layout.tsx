import Link from "next/link"
import { FC } from "react"
import EthLayout from "../layouts/EthLayout"

type Props = {
  balance?: any
  symbol?: string
  account?: string
}

const DappLayout: FC<Props> = ({ children, balance, symbol, account }) => {
  let title = "Verity Demo USDC"
  if (symbol) {
    title = `${title} (${symbol})`
  }

  return (
    <EthLayout noPadding={true} title={title}>
      {balance && symbol && account && (
        <div className="flex flex-row space-x-2 border-b bg-blue-50">
          <div className="flex-1 hidden p-4 border-r sm:block">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Account
            </h3>
            <p className="mt-1 text-sm text-gray-500">{account}</p>
          </div>
          <div className="flex items-center justify-end flex-1 p-4 text-center sm:text-right">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {balance.toString()} {symbol}
            </h3>
          </div>
        </div>
      )}
      <div className="px-5 py-6 sm:px-6 min-h-[17rem]">{children}</div>
      <div className="prose-sm max-w-none text-gray-600 text-center pb-6">
        <Link href="https://github.com/centrehq/demo-site/blob/main/packages/contract/contracts/VerificationValidator.sol">
          <a target="_blank">View Smart Contract Source</a>
        </Link>
      </div>
    </EthLayout>
  )
}

export default DappLayout
