// This type defines the verification result and related metadata returned
// by a verifier to this dapp
import type { VerificationInfoResponse } from "@centre/verity"
import { Web3Provider } from "@ethersproject/providers"
import { useWeb3React } from "@web3-react/core"
import { BigNumber, Contract } from "ethers"
import React, { FC, useEffect, useState } from "react"

// import the contract's artifacts and address
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import TokenArtifact from "../../contracts/Token.json"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import contractAddress from "../../contracts/contract-address.json"

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import ConnectWallet from "./ConnectWallet"
import Loading from "./Loading"
import NoTokensMessage from "./NoTokensMessage"
import TransactionErrorMessage from "./TransactionErrorMessage"
import Transfer from "./Transfer"
import TransferStatus from "./TransferStatus"
import WaitingForTransactionMessage from "./WaitingForTransactionMessage"

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

  // token name and symbol
  const [tokenData, setTokenData] = useState<{ name: string; symbol: string }>()

  // dapp user's address and balance
  // const [account, setSelectedAddress] = useState(account || "")
  const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0))

  // transactions being sent and any error with them
  const [txBeingSent, setTxBeingSent] = useState("")
  const [transactionError, setTransactionError] = useState(null)
  const [networkError, setNetworkError] = useState(null)

  // non-error status message for rendering
  const [statusMessage, setStatusMessage] = useState("")
  // verification-related state
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationInfoSet, setVerificationInfoSet] = useState(null)
  const [verification, setVerification] = useState(null)
  const [verificationStatus, setVerificationStatus] = useState()

  const [token, setToken] = useState<Contract>(null)
  const [pollDataInterval, setPollDataInterval] = useState(null)
  const [pollVerificationInterval, setPollVerificationInterval] = useState(null)

  /**
   * When the active eth account changes, we should initialize ethers to
   * find the latest contract
   */
  useEffect(() => {
    stopPollingData()

    if (!account) {
      return resetState()
    }

    intializeEthers()
  }, [account])

  /**
   * When we have an active contract, fetch the token's data, and start polling
   * for updates. Fetching the token data and the user's balance are specific
   * to this sample project, but you can reuse the same initialization pattern
   */
  useEffect(() => {
    if (token) {
      getTokenData()
      startPollingData()
    }
  }, [token])

  /**
   * Initialize the contract using that provider and the token's
   * artifact. You can do this same thing with your contracts.
   */
  const intializeEthers = async () => {
    setToken(
      new Contract(
        contractAddress.Token,
        TokenArtifact.abi,
        library.getSigner(0)
      )
    )
  }

  // The next two methods are needed to start and stop polling data. While
  // the data being polled here is specific to this example, you can use this
  // pattern to read any data from your contracts.
  //
  // Note that if you don't need it to update in near real time, you probably
  // don't need to poll it. If that's the case, you can just fetch it when you
  // initialize the app, as we do with the token data.
  const startPollingData = () => {
    setPollDataInterval(setInterval(() => updateFromContract(), 1000))
    // run it once immediately so we don't have to wait for it
    updateFromContract()
  }

  const stopPollingData = () => {
    clearInterval(pollDataInterval as unknown as number)
    setPollDataInterval(null)
  }

  // The next two methods read from the contract and store results in component state.
  const getTokenData = async () => {
    const name: string = await token.name()
    const symbol: string = await token.symbol()

    setTokenData({ name, symbol })
  }

  const updateFromContract = async () => {
    // update balance
    const balance = await token.balanceOf(account)
    setBalance(balance)
  }

  /**
   * Start verification via demo-site verifier.
   */
  const createVerification = async () => {
    try {
      // Stop polling just in case
      stopPollingVerification()

      // Create a Verification Request
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_HOST}/api/verification?type=kyc&subjectAddress=${account}&contractAddress=${contractAddress.Token}`,
        { method: "POST" }
      )
      const verification = await resp.json()
      setVerification(verification)
      setIsVerifying(true)

      // Poll for status
      startPollingVerification(verification.id)
    } catch (e) {
      setVerification(undefined)
      setIsVerifying(false)
      setStatusMessage(
        "API call to Verifier failed. Are you running demo-site?"
      )
      stopPollingVerification()
    }
  }

  const fetchVerificationStatus = async (id: string) => {
    try {
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_HOST}/api/verification/${id}/status`,
        { method: "POST" }
      )
      const verification = await resp.json()
      setVerificationStatus(verification)

      if (verification.status === "approved") {
        setVerification(undefined)
        setVerificationInfoSet(verification.result)
        setIsVerifying(false)
        setStatusMessage("Verification complete.")
        stopPollingVerification()
      } else if (verification.status === "rejected") {
        setVerification(undefined)
        setVerificationInfoSet(undefined)
        setIsVerifying(false)
        setStatusMessage("Verification failed.")
        stopPollingVerification()
      }
    } catch (e) {
      setVerification(undefined)
      setVerificationInfoSet(undefined)
      setIsVerifying(false)

      setStatusMessage(
        "API call to Verifier failed. Are you running demo-site?"
      )
      stopPollingVerification()
    }
  }

  const startPollingVerification = async (id: string) => {
    setPollVerificationInterval(
      setInterval(() => fetchVerificationStatus(id), 1000)
    )
    fetchVerificationStatus(id)
  }

  const stopPollingVerification = async () => {
    clearInterval(pollVerificationInterval as unknown as number)
    setPollVerificationInterval(undefined)
  }
  // End demo-site verifier

  const getVerificationResult = async () => {
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
      contractAddress: contractAddress.Token
    }
    const res = await fetch("/api/demo/simulate-verification", {
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
    setStatusMessage("Verification complete.")
  }

  const transferTokens = async (to: string, amount: string) => {
    console.log("amount", amount)
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
      let tx: any
      const t = await token.verificationThreshold()
      if (t <= amount && verificationInfoSet !== undefined) {
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
      await updateFromContract()
      setStatusMessage("Transaction Succeeded")
      setIsVerifying(false)
    } catch (error) {
      console.error(error)

      // We check the error code to see if this error was produced because the
      // user rejected a tx. If that's the case, we do nothing.
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return
      }

      // if the error is verification-related, we prompt -- this would be better handled
      // up front before the transfer, but for the sake of example, we show that
      // the contract is not relying solely on the web frontend to fire the error
      if (
        error.data &&
        error.data.message.indexOf("Verifiable Credential") !== -1
      ) {
        setIsVerifying(true)
        return
      }

      // Other errors are logged and stored in the Dapp's state. This is used to
      // show them to the user, and for debugging.
      setTransactionError(error)
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

  // This method just clears part of the state
  const dismissNetworkError = () => {
    setNetworkError(undefined)
  }

  // This is an utility method that makes an RPC error human readable
  const getRpcErrorMessage = (error: {
    data: { message: any }
    message: any
  }) => {
    if (error.data) {
      return error.data.message
    }

    return error.message
  }

  // This method resets the state
  const resetState = () => {
    setTokenData(undefined)
    setBalance(undefined)
    setTxBeingSent(undefined)
    setTransactionError(undefined)
    setNetworkError(undefined)
    setStatusMessage(undefined)
    setIsVerifying(undefined)
    setVerificationInfoSet(undefined)
  }

  // This method checks whether the Metamask selected network is localhost:8545
  // const checkNetwork = () => {
  //   if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
  //     return true
  //   }

  //   setNetworkError("Please connect Metamask to localhost:8545")

  //   return false
  // }

  // Ethereum wallets inject the window.ethereum object. If it hasn't been
  // injected, we instruct the user to install MetaMask.
  // if (typeof window !== "undefined" && window.ethereum === undefined) {
  //   return <NoWalletDetected />;
  // }

  // The next thing we need to do is ask the user to connect the wallet.
  // When the wallet gets connected, we are going to save the users's address
  // in the component's state. So if it hasn't been saved yet, we show the
  // ConnectWallet component.
  //
  // Note that we pass it a callback that is going to be called when the user
  // clicks a button. This callback just calls the _connectWallet method.
  if (!account) {
    return (
      <ConnectWallet
        networkError={networkError}
        dismiss={() => dismissNetworkError()}
      />
    )
  }

  // If the token data or the user's balance hasn't loaded yet, we show
  // a loading component
  if (!tokenData || !balance) {
    return <Loading />
  }

  return (
    <div className="container p-4">
      <div className="row">
        <div className="col-12">
          <h1>
            {tokenData.name} ({tokenData.symbol})
          </h1>
          <p>
            Welcome <b>{account}</b>, you have{" "}
            <b>
              {balance.toString()} {tokenData.symbol}
            </b>
            .
          </p>
          <p>
            In this demo, transfers of 10 or more VUSDC require proof of KYC.
          </p>
          <p>
            Other DeFi use cases include credit/risk credentials for lower
            collateralization and improved borrowing terms.
          </p>
        </div>
      </div>

      <hr />

      <div className="row">
        <div className="col-12">
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
              message={getRpcErrorMessage(transactionError)}
              dismiss={() => dismissTransactionError()}
            />
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          {/*
        If the user has no tokens, we don't show the Transfer form
      */}
          {balance.eq(0) && <NoTokensMessage selectedAddress={account} />}

          {/*
        This component displays a form that the user can use to send a
        transaction and transfer some tokens.
        The component doesn't have logic, it just calls the transferTokens
        callback.
      */}
          {balance.gt(0) && (
            <Transfer
              transferTokens={(to, amount) => transferTokens(to, amount)}
              tokenSymbol={tokenData.symbol}
            />
          )}
          {statusMessage && <hr />}
        </div>
      </div>
      {/*
    If we have transfer or verification status to report, we do so here.
  */}
      <div className="row">
        <div className="col-12">
          {(statusMessage || isVerifying) && (
            <TransferStatus
              statusMessage={statusMessage}
              isVerifying={isVerifying}
              simulateFunction={() => getVerificationResult()}
              verifyFunction={() => createVerification()}
              verification={verification}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Dapp
