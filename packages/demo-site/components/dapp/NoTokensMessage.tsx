import { FC } from "react"

export type NoTokensMessageProps = {
  selectedAddress: string
}

const NoTokensMessage: FC<NoTokensMessageProps> = ({ selectedAddress }) => {
  return (
    <>
      <p>You do not have tokens to transfer.</p>
      <p>
        To get some tokens, open a terminal in the root of the repository and
        run:
        <br />
        <br />
        <code>npm run hardhat:faucet {selectedAddress}</code>
        <br />
        <br />
        The UI will update a moment or two after you run that command, once the
        result is mined.
      </p>
    </>
  )
}

export default NoTokensMessage
