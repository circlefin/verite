import { GetServerSideProps, NextPage } from "next"
import QRCode from "qrcode.react"
import VerifierLayout from "components/verifier/Layout"
import { saveVerificationRequest } from "lib/database"
import { generateKycVerificationRequest } from "lib/verification/requests"
import { VerificationRequestWrapper } from "types"

type Props = {
  verificationRequestWrapper: VerificationRequestWrapper
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const verificationRequest = await generateKycVerificationRequest()
  await saveVerificationRequest(verificationRequest)

  const verificationRequestWrapper: VerificationRequestWrapper = {
    requestUrl: `${process.env.HOST}/api/verification/${verificationRequest.request.id}`,
    version: "1"
  }

  return {
    props: {
      verificationRequestWrapper
    }
  }
}

const VerifierPage: NextPage<Props> = ({ verificationRequestWrapper }) => {
  return (
    <VerifierLayout title="KYC/AML Verification">
      <div className="flex flex-col justify-center space-y-8">
        <QRCode
          value={JSON.stringify(verificationRequestWrapper)}
          className="w-48 h-48 mx-auto"
          renderAs="svg"
        />
        <textarea
          className="container h-40 mx-auto font-mono text-sm border-2"
          readOnly
          value={JSON.stringify(verificationRequestWrapper, null, 4)}
        />
      </div>
    </VerifierLayout>
  )
}

export default VerifierPage
