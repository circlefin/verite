// This type defines the verification result and related metadata returned
// by a verifier to this dapp
import type { VerificationInfoResponse } from "@centre/verity"
import { TransactionResponse, Web3Provider } from "@ethersproject/providers"
import { InformationCircleIcon, XIcon } from "@heroicons/react/solid"
import { useWeb3React } from "@web3-react/core"
import { Contract } from "ethers"
import React, { FC, useEffect, useState } from "react"
import useSWR from "swr"

// import the contract's artifacts and address
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import TokenArtifact from "../../contracts/Token.json"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import contractAddressJSON from "../../contracts/contract-address.json"
import { contractFetcher } from "../../lib/eth-fns"
import { fullURL } from "../../lib/utils"
import type { VerificationRequestResponse } from "../../lib/verification-request"

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import DappLayout from "./Layout"
import Loading from "./Loading"
import NoTokensMessage from "./NoTokensMessage"
import TransactionErrorMessage from "./TransactionErrorMessage"
import Transfer from "./Transfer"
import WaitingForTransactionMessage from "./WaitingForTransactionMessage"

const contractAddress: string =
  process.env.NEXT_PUBLIC_ETH_CONTRACT_ADDRESS || contractAddressJSON.Token

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001

/**
 * This component is based on the ethers boilerplate project.
 * It does these things:
 *  1. Connects to the user's wallet
 *  2. Initializes ethers and the Token contract
 *  3. Polls the user balance and verification status to keep them updated
 *  4. Transfers tokens by sending transactions
 *  5. Renders the whole application
 *
 * Note that (3) and (4) are specific of this sample application, but they show
 * you how to keep your Dapp and contract's state in sync, and how to send a
 * transaction.
 */
const Dapp: FC = () => {
  const { account, library } = useWeb3React<Web3Provider>()
  // Refresh the user's contract balance every 1 second
  const { data: balance, mutate } = useSWR(
    [contractAddress, "balanceOf", account],
    {
      fetcher: contractFetcher(library, TokenArtifact.abi),
      refreshInterval: 1000
    }
  )

  // token name and symbol
  const [tokenData, setTokenData] = useState<{ name: string; symbol: string }>()

  // transactions being sent and any error with them
  const [txBeingSent, setTxBeingSent] = useState("")
  const [transactionError, setTransactionError] = useState(null)

  // non-error status message for rendering
  const [statusMessage, setStatusMessage] = useState("")
  // verification-related state
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationInfoSet, setVerificationInfoSet] =
    useState<VerificationInfoResponse>(null)
  const [verification, setVerification] =
    useState<VerificationRequestResponse>(null)

  // const [token, setToken] = useState<Contract>(null)
  const [pollVerificationInterval, setPollVerificationInterval] = useState(null)

  const token = new Contract(
    contractAddress,
    TokenArtifact.abi,
    library.getSigner(0)
  )

  // Intial setup
  useEffect(() => {
    // Load the token information (name, symbol)
    const getTokenData = async () => {
      const name: string = await token.name()
      const symbol: string = await token.symbol()

      setTokenData({ name, symbol })
    }

    getTokenData()

    // Set up listeners for the token contract so we know when
    // to update balances, etc.
    const fromMe = token.filters.Transfer(account, null)
    const toMe = token.filters.Transfer(null, account)
    library.on(fromMe, (from, to, amount, event) => {
      console.log("Transfer sent", { from, to, amount, event })
      mutate(undefined, true)
    })

    library.on(toMe, (from, to, amount, event) => {
      console.log("Transfer received", { from, to, amount, event })
      mutate(undefined, true)
    })

    return () => {
      library.removeAllListeners(toMe)
      library.removeAllListeners(fromMe)
    }
  }, [])

  /**
   * When we have a verification, we'll poll on it
   */
  useEffect(() => {
    const startPollingVerification = (id: string) => {
      const i = setInterval(() => fetchVerificationStatus(id), 1000)
      setPollVerificationInterval(i)
      return i
    }

    const stopPollingVerification = () => {
      clearInterval(pollVerificationInterval as unknown as number)
      setPollVerificationInterval(null)
    }

    let timer
    if (verification) {
      timer = startPollingVerification(verification.id)
    } else {
      stopPollingVerification()
    }

    return () => {
      clearInterval(timer)
    }
  }, [verification])

  /**
   * Start verification via demo-site verifier.
   */
  const createVerification = async () => {
    try {
      // Create a Verification Request
      const resp = await fetch(
        fullURL(
          `/api/verification?type=kyc&subjectAddress=${account}&contractAddress=${contractAddress}`
        ),
        { method: "POST" }
      )
      const verification = await resp.json()
      setVerification(verification)
      setIsVerifying(true)
    } catch (e) {
      setVerification(undefined)
      setIsVerifying(false)
      setStatusMessage(
        "API call to Verifier failed. Are you running demo-site?"
      )
    }
  }

  const fetchVerificationStatus = async (id: string) => {
    try {
      const resp = await fetch(fullURL(`/api/verification/${id}/status`), {
        method: "POST"
      })
      const verification = await resp.json()

      if (verification.status === "approved") {
        setVerification(undefined)
        setVerificationInfoSet(verification.result)
        setIsVerifying(false)
        setStatusMessage(
          "Verification complete. You can now transfer > 10 VUSDC"
        )
      } else if (verification.status === "rejected") {
        setVerification(undefined)
        setVerificationInfoSet(undefined)
        setIsVerifying(false)
        setStatusMessage("Verification failed.")
      }
    } catch (e) {
      setVerification(undefined)
      setVerificationInfoSet(undefined)
      setIsVerifying(false)

      setStatusMessage(
        "API call to Verifier failed. Are you running demo-site?"
      )
    }
  }
  // End demo-site verifier

  const getVerificationResult = async () => {
    // Clear verification if one exists. This will stop polling on the
    // unsimulated verification workflow
    setVerification(undefined)

    // in this recipe, the dApp calls a verifier by API and passes its
    // own subject address to be used in the verification result digest.
    // The verifier does not require proof of ownership of that address,
    // so no client-side signature in MetaMask is required, but the
    // remote contract that uses the verifier's result will enforce proof
    // of address ownership, so the verification result cannot be used by
    // any other dapp or address.
    // Among the many alternative approaches, one is for this component
    // to authorize the verifier to execute an authorized transfer (see EIP-3009).

    const postData = {
      subjectAddress: account,
      contractAddress: contractAddress
    }
    const res = await fetch(fullURL("/api/demo/simulate-verification"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(postData)
    })
    const verificationInfoSet: VerificationInfoResponse = await res.json()

    // For now the verifier is merely returning a signed result as if verification succeeded.
    // What should happen is that this component polls the verifier to see when verification
    // has succeeded (or failed).

    setVerificationInfoSet(verificationInfoSet)
    setIsVerifying(false)
    setStatusMessage("Verification complete. You can now transfer > 10 VUSDC")
  }

  const transferTokens = async (to: string, amount: string) => {
    // Sending a transaction is a complex operation:
    //   - The user can reject it
    //   - It can fail before reaching the ethereum network (i.e. if the user
    //     doesn't have ETH for paying for the tx's gas)
    //   - It has to be mined, so it isn't immediately confirmed.
    //     Note that some testing networks, like Hardhat Network, do mine
    //     transactions immediately, but your dapp should be prepared for
    //     other networks.
    //   - It can fail once mined.

    try {
      // If a transaction fails, we save that error in the component's state.
      // We only save one such error, so before sending a second transaction, we
      // clear it.
      dismissTransactionError()

      // send the transfer, either with verification or without
      let tx: TransactionResponse
      const t = await token.verificationThreshold()
      if (t <= amount && verificationInfoSet) {
        tx = await token.validateAndTransfer(
          to,
          amount,
          verificationInfoSet.verificationInfo,
          verificationInfoSet.signature
        )
        // uncomment the following line to force verification to expire with each transfer instead of timing out:
        //setVerificationInfoSet( undefined );
      } else {
        tx = await token.transfer(to, amount)
      }

      // save the transaction's hash in the Dapp's state. This
      // way we can indicate that we are waiting for it to be mined.
      setTxBeingSent(tx.hash)

      // We use .wait() to wait for the transaction to be mined. This method
      // returns the transaction's receipt.
      const receipt = await tx.wait()

      // The receipt contains a status flag, which is 0 to indicate an error.
      if (receipt.status === 0) {
        // We can't know the exact error that made the transaction fail when it
        // was mined, so we throw this generic one.
        throw new Error("TX failed")
      }

      // If we got here, the transaction was successful, so update Dapp state.
      // Force the balance refresher to update state
      mutate(undefined, true)
      setStatusMessage("Transaction Succeeded")
      setIsVerifying(false)
    } catch (error) {
      console.error(error)

      // We check the error code to see if this error was produced because the
      // user rejected a tx. If that's the case, we do nothing.
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return
      }

      const message = getRpcErrorMessage(error)

      // if the error is verification-related, we prompt -- this would be better handled
      // up front before the transfer, but for the sake of example, we show that
      // the contract is not relying solely on the web frontend to fire the error
      if (message.indexOf("Verifiable Credential:") !== -1) {
        setIsVerifying(true)
        setVerification(undefined)
        setVerificationInfoSet(undefined)

        // Generate a QR code for scanning
        createVerification()
      }

      // This is the error message to kick off the Verification workflow. We
      // special case it so it is not shown to the user.
      const sentinel =
        "Verifiable Credential: Transfers of this amount require validateAndTransfer"
      if (message.indexOf(sentinel) === -1) {
        // Other errors are logged and stored in the Dapp's state. This is used to
        // show them to the user, and for debugging.
        setTransactionError(getRpcErrorMessage(error))
      }
    } finally {
      // If we leave the try/catch, we aren't sending a tx anymore, so we clear
      // this part of the state.
      setTxBeingSent(undefined)
    }
  }

  // This method just clears part of the state
  const dismissTransactionError = () => {
    setTransactionError(undefined)
    setStatusMessage(undefined)
  }

  const dismissStatusMessage = () => {
    setStatusMessage(undefined)
  }

  // This is an utility method that makes an RPC error human readable
  const getRpcErrorMessage = (error: {
    data: { message: string }
    message: string
  }) => {
    if (error?.data?.message) {
      return error.data.message
    }

    if (error?.message) {
      return error?.message
    }

    return `Unknown Error: ${error?.toString()}`
  }

  // If the token data or the user's balance hasn't loaded yet, we show
  // a loading component
  if (!tokenData || !balance) {
    return (
      <DappLayout>
        <Loading />
      </DappLayout>
    )
  }

  const faucet = async (address: string): Promise<boolean> => {
    try {
      const resp = await fetch(fullURL("/api/demo/faucet"), {
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({ address })
      })
      const json = await resp.json()
      if (json.status !== "ok") {
        console.error(json)
        setTransactionError(
          `API call to faucet failed: ${JSON.stringify(json)}`
        )
        return false
      }
    } catch (e) {
      console.error(e)
      setTransactionError(`API call to faucet failed: ${e.message}`)
      return false
    }

    return true
  }

  return (
    <DappLayout balance={balance} symbol={tokenData.symbol}>
      <div className="prose max-w-none">
        <p className="font-bold">
          In this demo, transfers of 10 or more VUSDC will require proof of KYC.
        </p>
        <p>
          Other DeFi use cases include credit credentials for lower
          collateralization and improved borrowing terms, accredited investor
          status for access to new markets, proof of geo location for licensed
          services, etc.
        </p>
      </div>

      <div>
        {/*
        Sending a transaction isn't an immediate action. We have to wait
        for it to be mined.
        If we are waiting for one, we show a message here.
      */}
        {txBeingSent && <WaitingForTransactionMessage txHash={txBeingSent} />}

        {/*
        Sending a transaction can fail in multiple ways.
        If that happened, we show a message here.
      */}
        {transactionError && (
          <TransactionErrorMessage
            message={transactionError}
            dismiss={() => dismissTransactionError()}
          />
        )}

        {statusMessage && (
          <div className="p-4 rounded-md bg-blue-50">
            <div className="flex">
              <div className="flex-shrink-0">
                <InformationCircleIcon
                  className="w-5 h-5 text-blue-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">
                  {statusMessage}
                </p>
              </div>
              <div className="pl-3 ml-auto">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    className="inline-flex bg-blue-50 rounded-md p-1.5 text-blue-500 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-50 focus:ring-blue-600"
                    onClick={() => dismissStatusMessage()}
                  >
                    <span className="sr-only">Dismiss</span>
                    <XIcon className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="py-8">
        {/*
        If the user has no tokens, we don't show the Transfer form
      */}
        {balance.eq(0) && (
          <NoTokensMessage faucetFunction={faucet} selectedAddress={account} />
        )}

        {/*
        This component displays a form that the user can use to send a
        transaction and transfer some tokens.
        The component doesn't have logic, it just calls the transferTokens
        callback.
      */}
        {balance.gt(0) && (
          <Transfer
            transferTokens={transferTokens}
            tokenSymbol={tokenData.symbol}
            isVerifying={isVerifying}
            simulateFunction={getVerificationResult}
            verification={verification}
            verificationInfoSet={verificationInfoSet}
            dismissStatusMessage={dismissStatusMessage}
          />
        )}
      </div>
    </DappLayout>
  )
}

export default Dapp
