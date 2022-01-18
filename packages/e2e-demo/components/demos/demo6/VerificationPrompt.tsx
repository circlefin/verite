import Link from "next/link"
import React, { FC } from "react"

type Props = {
  onDone: () => Promise<void>
}

const Verification: FC<Props> = ({ onDone }) => {
  return (
    <>
      <div>
        Before participating in these markets, you must verify your KYC/AML
        Attestation from a trusted issuer.
      </div>

      <div className="prose">
        <ul>
          <li>
            <Link href="/demos/issuer/kyc">
              <a>Circle</a>
            </Link>
          </li>
          <li>
            <Link href="/demos/issuer/kyc">
              <a>Coinbase</a>
            </Link>
          </li>
        </ul>
        Already have a credential?{" "}
        <a href="#" onClick={onDone}>
          Click here
        </a>
      </div>
    </>
  )
}

export default Verification
