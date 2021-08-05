import {
  fetchStatusList,
  generateKycVerificationRequest,
  RevocableCredential,
  RevocationListCredential
} from "@centre/verity"
import { GetServerSideProps, NextPage } from "next"
import { v4 as uuidv4 } from "uuid"
import DemoLayout from "../../components/demo/Layout"
import QRCodeOrStatus from "../../components/issuer/QRCodeOrStatus"
import RevokeButton from "../../components/issuer/RevokeButton"
import { requireAuth } from "../../lib/auth-fns"
import {
  findNewestCredential,
  saveVerificationRequest
} from "../../lib/database"

export type VerificationRequestWrapper = {
  requestUrl: string
  version: string
}

type Props = {
  credential: RevocableCredential | undefined
  revocationList: RevocationListCredential | undefined
  verificationRequestWrapper: VerificationRequestWrapper
  id: string
}

export const getServerSideProps: GetServerSideProps<Props> = requireAuth(
  async () => {
    const id = uuidv4()
    const verificationRequest = generateKycVerificationRequest(
      process.env.VERIFIER_DID,
      `${process.env.HOST}/api/verification/${id}`,
      process.env.VERIFIER_DID,
      `${process.env.HOST}/api/verification/${id}/callback`,
      [process.env.ISSUER_DID],
      id
    )
    await saveVerificationRequest(verificationRequest)

    const verificationRequestWrapper: VerificationRequestWrapper = {
      requestUrl: `${process.env.HOST}/api/verification/${verificationRequest.request.id}`,
      version: "1"
    }

    let revocationList
    let credential = await findNewestCredential()
    if (credential) {
      revocationList = await fetchStatusList(credential)
      credential = JSON.parse(JSON.stringify(credential))
    } else {
      credential = null
      revocationList = null
    }

    return {
      props: {
        id: verificationRequest.request.id,
        credential: credential,
        revocationList,
        verificationRequestWrapper
      }
    }
  }
)

const DemoPage: NextPage<Props> = ({
  id,
  credential,
  revocationList,
  verificationRequestWrapper
}) => {
  return (
    <DemoLayout title="Demo: Revocation">
      <p>
        Let&apos;s try that again, but we will revoke the credential before
        verifying.
      </p>
      <p className="mt-4">
        For demo purposes, this button will let you revoke and unrevoke the
        latest credential issued. Assuming you&apos;ve completed the first steps
        of this demo, that should be the credential held in your mobile wallet.
      </p>

      <p className="mt-4">
        <RevokeButton credential={credential} defaultRevoked={true} />
      </p>

      <p className="mt-4">
        You can confirm that your credential is revoked on the mobile app. Tap
        the &quot;Credentials&quot; tab and select the credential in the list.
        There should be a field labeled &quot;Revoked&quot;
      </p>

      <p className="mt-4">
        Once you have confirmed that the credential on your mobile device is
        revoked, scan the QR code below and try to verify the credential.
      </p>

      <div className="mt-4">
        <QRCodeOrStatus id={id} qrcodeData={verificationRequestWrapper} />
      </div>

      <h2 className="mt-4 text-lg font-semibold">How it works:</h2>
      <p className="mt-4">
        Verity uses{" "}
        <a href="https://w3c-ccg.github.io/vc-status-list-2021">
          Status List 2021
        </a>{" "}
        to revoke credentials. In brief, the revocation list is a bitstring.
        When a revocable credential is issued, it is given an index within that
        bitstring. If the bit at that index is a 1, the credential is considered
        revoked.
      </p>

      <p className="mt-4">
        Here is the credential with the `credentialStatus` property.
      </p>

      <div className="container mx-auto mt-8 overflow-scroll font-mono text-sm border-2">
        <pre>{JSON.stringify(credential, null, 4)}</pre>
      </div>

      <p className="mt-4">
        Here is the associated revocation list. Notice that it is actually a
        Verifiable Credential. The bitstring is actually zlib compressed and
        base64 encoded bitstring.
      </p>
      <div className="container mx-auto mt-8 overflow-scroll font-mono text-sm border-2">
        <pre>{JSON.stringify(revocationList, null, 4)}</pre>
      </div>
    </DemoLayout>
  )
}

export default DemoPage
