import { FC } from "react"

export type TransactionErrorMessageProps = {
  message: string,
  dismiss: React.MouseEventHandler
}

const TransactionErrorMessage: FC<TransactionErrorMessageProps> = ({ message, dismiss }) => {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="alert alert-danger" role="alert">
          {message + " "}
          <button
            type="button"
            className="close"
            data-dismiss="alert"
            aria-label="Close"
            onClick={dismiss}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransactionErrorMessage
