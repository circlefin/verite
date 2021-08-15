import QRCode from "qrcode.react"
import { FC } from "react"

type TransferStatusProps = {
  simulateFunction: () => Promise<void>
  verification: Record<string, any>
}

const TransferStatus: FC<TransferStatusProps> = ({
  simulateFunction,
  verification
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Present KYC Verifiable Credential
      </h3>
      {verification && (
        <>
          <label className="block text-sm font-medium text-gray-700">
            Scan this QR code with the verity app to provide your KYC Verifiable
            Credential:
          </label>
          <div className="py-4">
            <QRCode value={JSON.stringify(verification.qrCodeData)} />
          </div>
        </>
      )}
      <label className="block text-sm font-medium text-gray-700">
        Alternatively, you can simulate verification:
      </label>
      <button
        type="submit"
        onClick={simulateFunction}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Simulate Verification
      </button>
    </div>
  )
}

export default TransferStatus
