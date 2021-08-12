import { BadgeCheckIcon, XCircleIcon } from "@heroicons/react/outline"
import QRCode from "qrcode.react"
import useSWR from "swr"
import { jsonFetch } from "../../lib/utils"

type Props = {
  id: string
  qrcodeData: Record<string, unknown>
}

export default function QRCodeOrStatus({ id, qrcodeData }: Props): JSX.Element {
  const { data } = useSWR(`/api/verification/${id}/status`, jsonFetch, {
    refreshInterval: 1000
  })

  if (data) {
    if (data.status === "approved") {
      return <BadgeCheckIcon className="w-48 h-48 mx-auto text-green-400" />
    } else if (data.status === "rejected") {
      return <XCircleIcon className="w-48 h-48 mx-auto text-red-400" />
    }
  }

  return (
    <>
      <QRCode
        value={JSON.stringify(qrcodeData)}
        className="w-48 h-48 mx-auto"
        renderAs="svg"
      />
      <textarea
        className="container h-40 mx-auto font-mono text-sm border-2"
        readOnly
        value={JSON.stringify(qrcodeData, null, 4)}
      />
    </>
  )
}
