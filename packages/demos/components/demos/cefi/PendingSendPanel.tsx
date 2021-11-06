import { PendingSend } from "../../../lib/database"
import { LoadingButton } from "../../shared/LoadingButton"

type Props = {
  row: PendingSend
  loading: boolean
  onCancel: () => void
}

export default function PendingSendPanel({
  row,
  loading,
  onCancel
}: Props): JSX.Element {
  const amount = row.amount
  const address = row.to
  return (
    <div className="bg-gray-50 sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          You are trying to send someone VUSDC
        </h3>
        <div className="max-w-xl mt-2 text-sm text-gray-500">
          <p>
            You have an outstanding request to send {amount} VUSDC to {address}.
            Before it can be broadcast to the network, the counterparty must
            provide beneficiary information.
          </p>
        </div>
        <div className="mt-5 space-x-4">
          <LoadingButton
            type="submit"
            style="dot-loader"
            loading={loading}
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
          >
            Cancel
          </LoadingButton>
        </div>
      </div>
    </div>
  )
}
