import { FC, useState } from "react"

type TransferProps = {
  transferTokens: (to: string, amount: string) => Promise<void>
  tokenSymbol: string
}

const Transfer: FC<TransferProps> = ({ transferTokens, tokenSymbol }) => {
  const [to, setTo] = useState("")
  const [amount, setAmount] = useState("")

  return (
    <div>
      <h4>Transfer</h4>
      <form
        onSubmit={(event) => {
          // This function just calls the transferTokens callback with the
          // form's data.
          event.preventDefault()

          if (to && amount) {
            transferTokens(to, amount)
          }
        }}
      >
        <div className="form-group">
          <label>Amount of {tokenSymbol}</label>
          <input
            className="form-control"
            type="number"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1"
            required
          />
        </div>
        <div className="form-group">
          <label>Recipient address</label>
          <input
            className="form-control"
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input className="btn btn-primary" type="submit" value="Transfer" />
        </div>
      </form>
    </div>
  )
}

export default Transfer
