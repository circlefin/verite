import { CashIcon } from "@heroicons/react/solid"
import { formatDistanceToNow } from "date-fns"
import { useSession } from "next-auth/client"
import { History } from "../../lib/database/prisma"

type Props = {
  item: History
}

export default function HistoryItem({ item }: Props): JSX.Element {
  const [session] = useSession()

  const user = session.user

  const send = item.from === user["address"]
  let description: string
  let amount: string
  if (send) {
    description = `Transfer to ${item.to}`
    amount = `-${item.amount}`
  } else {
    description = `Transfer from ${item.from}`
    amount = item.amount
  }

  return (
    <>
      <tr className="bg-white">
        <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500">
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
        </td>

        <td className="max-w-0 w-full px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <div className="flex">
            <span className="group inline-flex space-x-2 truncate text-sm">
              <CashIcon
                className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                aria-hidden="true"
              />
              <p className="text-gray-500 truncate group-hover:text-gray-900">
                {description}
              </p>
            </span>
          </div>
        </td>
        <td className="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500">
          <span className="text-gray-900 font-medium">{amount} </span>
          VUSDC
        </td>
      </tr>
    </>
  )
}
