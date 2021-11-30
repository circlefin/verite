import React, { FC, useState } from "react"

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
            <a href="#">Circle</a>
          </li>
          <li>
            <a href="#">Coinbase</a>
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
