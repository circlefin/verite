import { History } from "../../../lib/database/prisma"
import HistoryItem from "./HistoryItem"

type Props = {
  history: History[]
}

export default function HistoryList({ history }: Props): JSX.Element {
  return (
    <div className="flex flex-col mt-2">
      <div className="align-middle min-w-full overflow-x-auto shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th
                style={{ fontSize: "0.75rem" }}
                className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                style={{ fontSize: "0.75rem" }}
                className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Transaction
              </th>
              <th
                style={{ fontSize: "0.75rem" }}
                className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((item) => (
              <HistoryItem item={item} key={item.id}></HistoryItem>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
