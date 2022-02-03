// This type defines the verification result and related metadata returned
// by a verifier to this dapp
import { TransactionResponse, Web3Provider } from "@ethersproject/providers"
import { InformationCircleIcon, XIcon } from "@heroicons/react/solid"
import { useWeb3React } from "@web3-react/core"
import { BigNumber, Contract } from "ethers"
import React, { FC, useEffect, useState } from "react"
import useSWR, { SWRResponse } from "swr"

import {
  contractFetcher,
  permissionedTokenContractAddress,
  permissionedTokenContractArtifact,
  registryContractAddress,
  registryContractArtifact
} from "../../../lib/eth-fns"
import { fullURL } from "../../../lib/utils"
import DepositModal from "./DepositModal"
import DappLayout from "./Layout"
import Loading from "./Loading"
import MarketList from "./MarketList"
import NoTokensMessage from "./NoTokensMessage"
import TransactionErrorMessage from "./TransactionErrorMessage"
import TransferStatus from "./TransferStatus"
import VerificationPrompt from "./VerificationPrompt"
import VerifierFaucet from "./VerifierFaucet"
import VerifierIsNotAVerifier from "./VerifierIsNotAVerifier"
import WaitingForTransactionMessage from "./WaitingForTransactionMessage"

import type { VerificationRequestResponse } from "../../../lib/verification-request"

export type Asset = {
  name: string
  market: string
  borrowed: string
  deposit: string
  borrow: string
  image: string
  // Address of the ERC-20 token used for deposits
  tokenAddress: string
  // Address where to transfer tokens
  depositAddress: string
}

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001

// This is our list of assets
// For the sake of the demo, only one asset has a tokenAddress and
// consequently, one will only be able to deposit assets to that one market.
const assets = [
  {
    name: "DAI",
    market: "$2.19B",
    borrowed: "$1.71B",
    deposit: "2.82%",
    borrow: "3.98%",
    tokenAddress: null,
    depositAddress: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    image:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iLjUiIHgyPSIuNSIgeTE9IjEuMTQyIiB5Mj0iLS4xMDUiIGdyYWRpZW50VW5pdHM9Im9iamVjdEJvdW5kaW5nQm94Ij48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmOWE2MDYiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmYmNjNWYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSIyNSIgY3k9IjI1IiByPSIyNSIgZmlsbD0idXJsKCNhKSIgZGF0YS1uYW1lPSJFbGxpcHNlIDEyNzEiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMzkuODI1IDIwLjg3NWgtMi45NjdjLTEuNjMzLTQuNTMzLTYuMDI1LTcuNjQyLTExLjgxNy03LjY0MmgtOS41MjV2Ny42NDJoLTMuMzA4djIuNzQyaDMuMzA4djIuODc1aC0zLjMwOHYyLjc0MWgzLjMwOHY3LjU1aDkuNTI1YzUuNzI1IDAgMTAuMDgzLTMuMDgzIDExLjc1OC03LjU1aDMuMDI1di0yLjc0MmgtMi4zNThhMTIuNDMzIDEyLjQzMyAwIDAwLjA5Mi0xLjQ4M3YtLjA2N2MwLS40NS0uMDI1LS44OTItLjA2Ny0xLjMyNWgyLjM0MnYtMi43NDJ6bS0yMS42NDItNS4yaDYuODU4YzQuMjUgMCA3LjQwOCAyLjA5MiA4Ljg2NyA1LjE5MkgxOC4xODN6bTYuODU4IDE4LjY0MmgtNi44NTh2LTUuMDkyaDE1LjcwOGMtMS40NjYgMy4wNS00LjYxNiA1LjA5MS04Ljg1IDUuMDkxem05Ljc1OC05LjI1YTkuODU5IDkuODU5IDAgMDEtLjEgMS40MTdIMTguMTgzdi0yLjg3NWgxNi41MjVhMTAuODQgMTAuODQgMCAwMS4wOTIgMS4zOTJ6IiBkYXRhLW5hbWU9IlBhdGggNzUzNiIvPjwvc3ZnPg=="
  },
  {
    name: "USDC",
    market: "$3.51B",
    borrowed: "$3.02B",
    deposit: "3.17%",
    borrow: "3.90%",
    tokenAddress: permissionedTokenContractAddress(),
    depositAddress: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
    image:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PGcgZmlsbD0ibm9uZSI+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMyNzc1QzkiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMTUuNzUgMjcuNUExMS43NSAxMS43NSAwIDExMjcuNSAxNS43NSAxMS43NSAxMS43NSAwIDAxMTUuNzUgMjcuNXptLS43LTE2LjExYTIuNTggMi41OCAwIDAwLTIuNDUgMi40N2MwIDEuMjEuNzQgMiAyLjMxIDIuMzNsMS4xLjI2YzEuMDcuMjUgMS41MS42MSAxLjUxIDEuMjJzLS43NyAxLjIxLTEuNzcgMS4yMWExLjkgMS45IDAgMDEtMS44LS45MS42OC42OCAwIDAwLS42MS0uMzloLS41OWEuMzUuMzUgMCAwMC0uMjguNDEgMi43MyAyLjczIDAgMDAyLjYxIDIuMDh2Ljg0YS43LjcgMCAwMDEuNDEgMHYtLjg1YTIuNjIgMi42MiAwIDAwMi41OS0yLjU4YzAtMS4yNy0uNzMtMi0yLjQ2LTIuMzdsLTEtLjIyYy0xLS4yNS0xLjQ3LS41OC0xLjQ3LTEuMTQgMC0uNTYuNi0xLjE4IDEuNi0xLjE4YTEuNjQgMS42NCAwIDAxMS41OS44MS44LjggMCAwMC43Mi40NmguNDdhLjQyLjQyIDAgMDAuMzEtLjUgMi42NSAyLjY1IDAgMDAtMi4zOC0ydi0uNjlhLjcuNyAwIDAwLTEuNDEgMHYuNzR6bS04LjExIDQuMzZhOC43OSA4Ljc5IDAgMDA2IDguMzNoLjE0YS40NS40NSAwIDAwLjQ1LS40NXYtLjIxYS45NC45NCAwIDAwLS41OC0uODcgNy4zNiA3LjM2IDAgMDEwLTEzLjY1LjkzLjkzIDAgMDAuNTgtLjg2di0uMjNhLjQyLjQyIDAgMDAtLjU2LS40IDguNzkgOC43OSAwIDAwLTYuMDMgOC4zNHptMTcuNjIgMGE4Ljc5IDguNzkgMCAwMC02LTguMzJoLS4xNWEuNDcuNDcgMCAwMC0uNDcuNDd2LjE1YTEgMSAwIDAwLjYxLjkgNy4zNiA3LjM2IDAgMDEwIDEzLjY0IDEgMSAwIDAwLS42Ljg5di4xN2EuNDcuNDcgMCAwMC42Mi40NCA4Ljc5IDguNzkgMCAwMDUuOTktOC4zNHoiLz48L2c+PC9zdmc+"
  },
  {
    name: "USDT",
    market: "$1.08B",
    borrowed: "$944.95M",
    deposit: "3.22%",
    borrow: "3.97%",
    tokenAddress: null,
    depositAddress: "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
    image:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzI2QTE3QiIvPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0xNy45MjIgMTcuMzgzdi0uMDAyYy0uMTEuMDA4LS42NzcuMDQyLTEuOTQyLjA0Mi0xLjAxIDAtMS43MjEtLjAzLTEuOTcxLS4wNDJ2LjAwM2MtMy44ODgtLjE3MS02Ljc5LS44NDgtNi43OS0xLjY1OCAwLS44MDkgMi45MDItMS40ODYgNi43OS0xLjY2djIuNjQ0Yy4yNTQuMDE4Ljk4Mi4wNjEgMS45ODguMDYxIDEuMjA3IDAgMS44MTItLjA1IDEuOTI1LS4wNnYtMi42NDNjMy44OC4xNzMgNi43NzUuODUgNi43NzUgMS42NTggMCAuODEtMi44OTUgMS40ODUtNi43NzUgMS42NTdtMC0zLjU5di0yLjM2Nmg1LjQxNFY3LjgxOUg4LjU5NXYzLjYwOGg1LjQxNHYyLjM2NWMtNC40LjIwMi03LjcwOSAxLjA3NC03LjcwOSAyLjExOCAwIDEuMDQ0IDMuMzA5IDEuOTE1IDcuNzA5IDIuMTE4djcuNTgyaDMuOTEzdi03LjU4NGM0LjM5My0uMjAyIDcuNjk0LTEuMDczIDcuNjk0LTIuMTE2IDAtMS4wNDMtMy4zMDEtMS45MTQtNy42OTQtMi4xMTciLz48L2c+PC9zdmc+"
  }
]

export const useBalance = (
  contractAddress: string
): SWRResponse<BigNumber, unknown> => {
  const { account, library } = useWeb3React<Web3Provider>()
  const result = useSWR([contractAddress, "balanceOf", account], {
    fetcher: contractFetcher(library, permissionedTokenContractArtifact().abi)
  })

  return result
}

export const useIsVerifier = (
  registryAddress: string,
  verifierAddress: string
): SWRResponse<boolean, unknown> => {
  const { library } = useWeb3React<Web3Provider>()
  const result = useSWR([registryAddress, "isVerifier", verifierAddress], {
    fetcher: contractFetcher(library, registryContractArtifact().abi)
  })

  return result
}

// Generic SWR fetcher for calling arbitrary methods.
const fetcher =
  (library) =>
  async (...args) => {
    const [method, ...params] = args
    return library[method](...params)
  }

// Hook to observe an address' ETH balance.
const useEthBalance = (
  library,
  address: string
): SWRResponse<BigNumber, unknown> => {
  const result = useSWR(["getBalance", address], {
    fetcher: fetcher(library),
    refreshInterval: 5000
  })

  // Refresh on each new block
  library.on("blockNumber", () => {
    result.mutate()
  })

  return result
}

type Props = {
  verifierAddress: string
}

const Demo6: FC<Props> = ({ verifierAddress }) => {
  const { account, library } = useWeb3React<Web3Provider>()
  const { data: balance, mutate } = useBalance(
    permissionedTokenContractAddress()
  )
  const { data: verifierEthBalance } = useEthBalance(library, verifierAddress)
  const { data: isVerifier } = useIsVerifier(
    registryContractAddress(),
    verifierAddress
  )

  // token name and symbol
  const [tokenData, setTokenData] = useState<{ name: string; symbol: string }>()

  // Clicking Deposit on the Market List will set the market
  // The Deposit Modal will be shown when there is a selected market.
  const [selected, setSelected] = useState<Asset>()

  // transactions being sent and any error with them
  const [txBeingSent, setTxBeingSent] = useState("")
  const [transactionError, setTransactionError] = useState(null)

  // non-error status message for rendering
  const [statusMessage, setStatusMessage] = useState("")
  // verification-related state
  const [verification, setVerification] =
    useState<VerificationRequestResponse>(null)

  // const [token, setToken] = useState<Contract>(null)
  const [pollVerificationInterval, setPollVerificationInterval] = useState(null)

  const token = new Contract(
    permissionedTokenContractAddress(),
    permissionedTokenContractArtifact().abi,
    library.getSigner(0)
  )

  // Simple page handler
  const [page, setPage] = useState(-1)

  // Initial setup
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
  })

  /**
   * When we have a verification, we'll poll on it
   */
  useEffect(() => {
    const startPollingVerification = (id: string) => {
      const i = setInterval(() => fetchVerificationStatus(id), 1000)
      setPollVerificationInterval(i)
    }

    const stopPollingVerification = () => {
      clearInterval(pollVerificationInterval as unknown as number)
      setPollVerificationInterval(null)
    }

    if (verification && !pollVerificationInterval) {
      startPollingVerification(verification.id)
    } else if (!verification) {
      stopPollingVerification()
    }

    return () => {
      if (pollVerificationInterval) {
        clearInterval(pollVerificationInterval)
      }
    }
  }, [verification, pollVerificationInterval])

  /**
   * Start verification via demos verifier.
   */
  const createVerification = async () => {
    try {
      // Create a Verification Request
      const resp = await fetch(
        fullURL(
          `/api/demos/verifier?type=kyc&subjectAddress=${account}&registryAddress=${registryContractAddress()}&verifierSubmit=true`
        ),
        { method: "POST" }
      )
      const verification = await resp.json()
      setVerification(verification)
    } catch (e) {
      setVerification(undefined)
      setStatusMessage("API call to Verifier failed. Are you running demos?")
    }
  }

  const fetchVerificationStatus = async (id: string) => {
    try {
      const resp = await fetch(fullURL(`/api/demos/verifier/${id}/status`), {
        method: "POST"
      })
      const verification = await resp.json()

      if (verification.status === "approved") {
        setVerification(undefined)
        setStatusMessage("Verification complete. You can now deposit funds.")
        setPage(2)
      } else if (verification.status === "rejected") {
        setVerification(undefined)
        setStatusMessage("Verification failed.")
        setPage(2)
      }
    } catch (e) {
      setVerification(undefined)

      setStatusMessage(
        "API call to Verifier failed. Are you running the demo server?"
      )
    }
  }
  // End demos verifier

  const simulateVerification = async () => {
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
      contractAddress: permissionedTokenContractAddress()
    }
    const response = await fetch(
      fullURL(
        `/api/demos/demo6/simulate-verification?registryAddress=${registryContractAddress()}`
      ),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(postData)
      }
    )

    // The simulate API call waits for the Verification Result to be mined.
    // Therefore, if we get a successful API call, we know it was successful.
    // This is not ideal for most use cases as it would require keeping the
    // API call alive for a relatively long time.
    // See the workflow that scans the QR code for a more robust solution that
    // polls the verifier for the verification status.
    const json = await response.json()
    if (json.signature && json.verificationResult) {
      setStatusMessage("Verification complete. You can now deposit funds.")
    } else {
      console.error(json)
      setTransactionError(
        `Simulating Verification Failed: ${JSON.stringify(json)}`
      )
    }

    setPage(2)
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

      // send the transfer
      const tx: TransactionResponse = await token.transfer(to, amount)

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
      if (
        message.indexOf("PermissionedToken:") !== -1 ||
        message.indexOf("VerificationRegistry:") != -1
      ) {
        setVerification(undefined)
      }

      // This is the error message to kick off the Verification workflow. We
      // special case it so it is not shown to the user.
      const sentinel = "PermissionedToken: Sender is not verified"
      if (message.indexOf(sentinel) === -1) {
        // Other errors are logged and stored in the Dapp's state. This is used to
        // show them to the user, and for debugging.
        setTransactionError(getRpcErrorMessage(error))
      } else {
        setPage(0)
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

  const ethFaucet = async (address: string): Promise<boolean> => {
    try {
      const resp = await fetch(fullURL("/api/demos/demo6/eth-faucet"), {
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

  const tokenFaucet = async (address: string): Promise<boolean> => {
    try {
      const resp = await fetch(fullURL("/api/demos/demo6/token-faucet"), {
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

  let children

  // Before we begin the demo, check that the verifier is properly configured.
  if (!isVerifier) {
    children = (
      <VerifierIsNotAVerifier
        registryAddress={registryContractAddress()}
        verifierAddress={verifierAddress}
      />
    )
  } else if (verifierEthBalance.eq(0)) {
    // Verifier needs ETH to pay fees
    children = (
      <VerifierFaucet
        faucetFunction={ethFaucet}
        selectedAddress={verifierAddress}
      />
    )
  } else if (page === -1 && balance.eq(0)) {
    // PUSDC faucet for the end-user so they have something to deposit
    children = (
      <NoTokensMessage faucetFunction={tokenFaucet} selectedAddress={account} />
    )
  } else if (page === -1 || page === 2) {
    children = (
      <MarketList assets={assets} setSelected={setSelected}></MarketList>
    )
  } else if (page === 0) {
    children = (
      <VerificationPrompt
        onDone={async () => {
          // After dismissing the Verification prompt, we create a Verification
          // Request and challenge the user to complete it.
          await createVerification()
          setPage(1)
        }}
      ></VerificationPrompt>
    )
  } else if (page === 1) {
    children = (
      <TransferStatus
        simulateFunction={simulateVerification}
        verification={verification}
      ></TransferStatus>
    )
  }

  return (
    <DappLayout>
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
          <div className="mb-8">
            <TransactionErrorMessage
              message={transactionError}
              dismiss={() => dismissTransactionError()}
            />
          </div>
        )}

        {statusMessage && (
          <div className="p-4 mb-8 rounded-md bg-blue-50">
            <div className="flex">
              <div className="flex-shrink-0">
                <InformationCircleIcon
                  className="w-5 h-5 text-blue-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3 overflow-scroll">
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

      <div>{children}</div>

      <DepositModal
        asset={selected}
        open={!!selected}
        onClose={() => setSelected(undefined)}
        transferTokens={transferTokens}
      ></DepositModal>
    </DappLayout>
  )
}

export default Demo6
