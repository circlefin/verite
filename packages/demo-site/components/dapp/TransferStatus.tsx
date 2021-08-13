import QRCode from "qrcode.react"
import { FC } from "react"

type TransferStatusProps = {
  statusMessage: string
  isVerifying: boolean
  simulateFunction: () => Promise<void>
  verifyFunction: () => Promise<void>
  verification: Record<string, any>
}

const TransferStatus: FC<TransferStatusProps> = ({
  statusMessage,
  isVerifying,
  simulateFunction,
  verifyFunction,
  verification
}) => {
  if (isVerifying) {
    return (
      <div>
        <hr />
        <h3>Present KYC Verifiable Credential</h3>A QR code should be here.
        Meanwhile, you can simulate verification:
        {verification ? (
          <>
            <div>
              <br />
              <QRCode value={JSON.stringify(verification.qrCodeData)} />
              <br />
            </div>
          </>
        ) : (
          <>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                verifyFunction()
              }}
            >
              <div className="form-group">
                <input
                  className="btn btn-primary"
                  type="submit"
                  value="Verification via demo-site"
                />
              </div>
            </form>
          </>
        )}
        <br />
        <form
          onSubmit={(event) => {
            event.preventDefault()
            simulateFunction()
          }}
        >
          <div className="form-group">
            <input
              className="btn btn-primary"
              type="submit"
              value="Simulate Verification"
            />
          </div>
        </form>
      </div>
    )
  }
  return (
    <div className="alert alert-info" role="alert">
      {statusMessage}
    </div>
  )
}

export default TransferStatus
