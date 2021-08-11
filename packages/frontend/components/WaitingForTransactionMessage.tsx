import { FC } from "react";

type Props = {
  txHash: string
}

const WaitingForTransactionMessage: FC<Props> = ({ txHash }) => {
  return (
    <div className="alert alert-info" role="alert">
      Waiting for transaction <strong>{txHash}</strong> to be mined
    </div>
  );
}

export default WaitingForTransactionMessage
