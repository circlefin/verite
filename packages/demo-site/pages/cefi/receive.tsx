import { NextPage } from "next"
import QRCode from "qrcode.react"
import React from "react"
import Layout from "../../components/cefi/Layout"
import Tabs from "../../components/cefi/Tabs"
import { useBalance } from "../../hooks/useBalance"
import { requireAuth } from "../../lib/auth-fns"

export const getServerSideProps = requireAuth(async () => {
  return { props: {} }
})

const Page: NextPage = () => {
  const { data } = useBalance()

  const tabs = [
    { name: "My Account", href: "/cefi", current: false },
    { name: "Send", href: "/cefi/send", current: false },
    { name: "Receive", href: "/cefi/receive", current: true }
  ]

  if (!data) {
    return null
  }

  return (
    <Layout>
      <React.StrictMode>
        <Tabs tabs={tabs}></Tabs>
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Receive VUSDC
          </h3>
          <p className="max-w-4xltext-sm text-gray-500">
            You can receive VUSDC at this address:
          </p>
          <p>{data?.address}</p>

          <QRCode
            value={data?.address}
            className="w-48 h-48"
            renderAs="svg"
          ></QRCode>
        </div>
      </React.StrictMode>
    </Layout>
  )
}

export default Page
