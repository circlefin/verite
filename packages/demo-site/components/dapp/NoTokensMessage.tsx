import { FC } from "react"

export type NoTokensMessageProps = {
  selectedAddress: string
}

const NoTokensMessage: FC<NoTokensMessageProps> = ({ selectedAddress }) => {
  return (
    <div className="prose">
      <p>You do not have tokens to transfer.</p>
      <p>
        To get some tokens, open a terminal in the root of the repository and
        run:
      </p>
      <pre>npm run hardhat:faucet {selectedAddress}</pre>
      <p>
        The UI will update a moment or two after you run that command, once the
        result is mined.
      </p>
    </div>
  )
}

export default NoTokensMessage
