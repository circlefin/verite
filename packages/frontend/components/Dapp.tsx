import React from "react";

// use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";

// import the contract's artifacts and address
import TokenArtifact from "../contracts/Token.json";
import contractAddress from "../contracts/contract-address.json";

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import NoWalletDetected from "./NoWalletDetected";
import ConnectWallet from "./ConnectWallet";
import Loading from "./Loading";
import Transfer from "./Transfer";
import TransactionErrorMessage from "./TransactionErrorMessage";
import WaitingForTransactionMessage from "./WaitingForTransactionMessage";
import NoTokensMessage from "./NoTokensMessage";
import TransferStatus from "./TransferStatus";

// This type defines the verification result and related metadata returned 
// by a verifier to this dapp
import { VerificationInfoResponse } from "types/VerificationInfo";

// This is the Hardhat Network id, you might change it in the hardhat.config.js
// Here's a list of network ids https://docs.metamask.io/guide/ethereum-provider.html#properties
// to use when deploying to other networks.
const HARDHAT_NETWORK_ID = "1337";

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

interface EthereumProvider {
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

declare let window: any;

// This component is based on the ethers boilerplate project.
// It does these things:
//   1. Connects to the user's wallet
//   2. Initializes ethers and the Token contract
//   3. Polls the user balance and verification status to keep them updated
//   4. Transfers tokens by sending transactions
//   5. Renders the whole application
//
// Note that (3) and (4) are specific of this sample application, but they show
// you how to keep your Dapp and contract's state in sync, and how to send a
// transaction.
export default class Dapp extends React.Component<any, any> {
  private _provider: ethers.providers.Web3Provider | undefined;
  private _token: any | undefined;
  private _pollDataInterval: NodeJS.Timeout | undefined;
  private _pollVerificationInterval: NodeJS.Timeout | undefined;

  constructor(props: any) {
    super(props);
    this.state = {
      // token name and symbol
      tokenData: undefined,
      // dapp user's address and balance
      selectedAddress: undefined, 
      balance: undefined,
      // transactions being sent and any error with them
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
      // non-error status message for rendering
      statusMessage: undefined,
      // verification-related state
      isVerifying: undefined,
      verificationInfoSet: undefined,
      verification: undefined,
      verificationStatus: undefined
    };
  }

  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install MetaMask.
    if (typeof window !== "undefined" && window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    // The next thing we need to do is ask the user to connect the wallet.
    // When the wallet gets connected, we are going to save the users's address
    // in the component's state. So if it hasn't been saved yet, we show the
    // ConnectWallet component.
    //
    // Note that we pass it a callback that is going to be called when the user
    // clicks a button. This callback just calls the _connectWallet method.
    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet
          connectWallet={() => this._connectWallet()}
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    // If the token data or the user's balance hasn't loaded yet, we show
    // a loading component
    if (!this.state.tokenData || !this.state.balance) {
      return <Loading />;
    }

    // If everything is loaded, we render the application.
    return (
      <div className="container p-4">
        <div className="row">
          <div className="col-12">
            <h1>
              {this.state.tokenData.name} ({this.state.tokenData.symbol})
            </h1>
            <p>
              Welcome <b>{this.state.selectedAddress}</b>, you have{" "}
              <b>
                {this.state.balance.toString()} {this.state.tokenData.symbol}
              </b>
              .
            </p>
            <p>In this demo, transfers of 10 or more VUSDC require proof of KYC.</p>
            <p>Other DeFi use cases include credit/risk credentials for lower 
              collateralization and improved borrowing terms.</p>
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
            {this.state.txBeingSent && (
              <WaitingForTransactionMessage txHash={this.state.txBeingSent} />
            )}

            {/* 
              Sending a transaction can fail in multiple ways. 
              If that happened, we show a message here.
            */}
            {this.state.transactionError && (
              <TransactionErrorMessage
                message={this._getRpcErrorMessage(this.state.transactionError)}
                dismiss={() => this._dismissTransactionError()}
              />
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            {/*
              If the user has no tokens, we don't show the Transfer form
            */}
            {this.state.balance.eq(0) && (
              <NoTokensMessage selectedAddress={this.state.selectedAddress} />
            )}

            {/*
              This component displays a form that the user can use to send a 
              transaction and transfer some tokens.
              The component doesn't have logic, it just calls the transferTokens
              callback.
            */}
            {this.state.balance.gt(0) && (
              <Transfer
                transferTokens={(to: any, amount: any) =>
                  this._transferTokens(to, amount)
                }
                tokenSymbol={this.state.tokenData.symbol}
              />
            )}
            {this.state.statusMessage && <hr />}
          </div>
        </div>
        {/*
          If we have transfer or verification status to report, we do so here.
        */}
        <div className="row">
          <div className="col-12">
            {(this.state.statusMessage || this.state.isVerifying) && (
              <TransferStatus
                statusMessage={this.state.statusMessage}
                isVerifying={this.state.isVerifying}
                simulateFunction={() => this._getVerificationResult()}
                verifyFunction={() => this._createVerification()}
                verification={this.state.verification}
                verificationStatus={this.state.verificationStatus}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    // We poll the user's balance, and stop when the component is unmounted.
    this._stopPollingData();
    this._stopPollingVerification();
  }

  async _connectWallet() {
    // This method is run when the user clicks the ConnectWallet button. 
    // It returns a promise that will resolve to the user's address.
    //   Note this legacy deprecated method, which may still be needed for some providers:
    //   const [selectedAddress] = await window.ethereum.enable();
    const [selectedAddress] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    // Once we have the address, we can initialize the application:

    // First we check the network
    if (!this._checkNetwork()) {
      return;
    }

    // Then we set state, initialize ethers, get our token data, and start polling for updates
    this._initialize(selectedAddress);

    // We reinitialize whenever the user changes the MetaMask account
    window.ethereum.on("accountsChanged", (newAddress: string) => {
      this._stopPollingData();
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state
      if (newAddress === undefined) {
        return this._resetState();
      }
      this._initialize(newAddress);
    });

    // We reset the dapp state if the network is changed.
    //   Note this legacy depreceated method, which may still be needed for some providers:
    //   window.ethereum.on("networkChanged", (networkId: any) => {
    window.ethereum.on("chainChanged", (chainId: any) => {
      this._stopPollingData();
      this._resetState();
    });
  }

  _initialize(userAddress: any) {

    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    });

    // Then, we initialize ethers, fetch the token's data, and start polling 
    // for updates. Fetching the token data and the user's balance are specific 
    // to this sample project, but you can reuse the same initialization pattern.
    this._intializeEthers();
    this._getTokenData();
    this._startPollingData();
  }

  async _intializeEthers() {
    // We initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    // Then we initialize the contract using that provider and the token's
    // artifact. You can do this same thing with your contracts.
    this._token = new ethers.Contract(
      contractAddress.Token,
      TokenArtifact.abi,
      this._provider.getSigner(0)
    );
  }

  // The next two methods are needed to start and stop polling data. While
  // the data being polled here is specific to this example, you can use this
  // pattern to read any data from your contracts.
  //
  // Note that if you don't need it to update in near real time, you probably
  // don't need to poll it. If that's the case, you can just fetch it when you
  // initialize the app, as we do with the token data.
  _startPollingData() {
    this._pollDataInterval = setInterval(() => this._updateFromContract(), 1000);
    // run it once immediately so we don't have to wait for it
    this._updateFromContract();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval as unknown as number);
    this._pollDataInterval = undefined;
  }

  // The next two methods read from the contract and store results in component state.
  async _getTokenData() {
    const name = await this._token.name();
    const symbol = await this._token.symbol();

    this.setState({ tokenData: { name, symbol } });
  }

  async _updateFromContract() {
    // update balance
    const balance = await this._token.balanceOf(this.state.selectedAddress);
    this.setState({ balance });
  }


  // Start verification via demo-site verifier.
  async _createVerification() {
    try {
      // Stop polling just in case
      this._stopPollingVerification()

      // Create a Verification Request
      const resp = await fetch(`http://localhost:3000/api/verification/create?type=kyc&subjectAddress=${this.state.selectedAddress}&contractAddress=${contractAddress.Token}`, { method: "POST" })
      const verification = await resp.json()
      this.setState({ verification: verification })
      this.setState({ isVerifying: true })

      // Poll for status
      this._startPollingVerification(verification.id)
    } catch(e) {
      this.setState({ verification: undefined })
      this.setState({ isVerifying: false })
      this.setState({ statusMessage: "API call to Verifier failed. Are you running demo-site?"})
      this._stopPollingVerification()
    }
  }

  async _fetchVerificationStatus(id: string) {
    try {
      const resp = await fetch(`http://localhost:3000/api/verification/${id}/status`, { method: "POST" })
      const verification = await resp.json()
      this.setState({ verificationStatus: verification })

      if (verification.status === "approved") {
        this.setState({ verification: undefined })
        this.setState({ verificationInfoSet: verification.result });
        this.setState({ isVerifying: false });
        this.setState({ statusMessage: "Verification complete." });
        this._stopPollingVerification()
      } else if (verification.status === "rejected") {
        this.setState({ verification: undefined })
        this.setState({ verificationInfoSet: undefined })
        this.setState({ isVerifying: false });
        this.setState({ statusMessage: "Verification failed." });
        this._stopPollingVerification()
      }
    } catch (e) {
      this.setState({ verification: undefined })
      this.setState({ verificationInfoSet: undefined })
      this.setState({ isVerifying: false })
      this.setState({ statusMessage: "API call to Verifier failed. Are you running demo-site?"})
      this._stopPollingVerification()
    }
  }

  _startPollingVerification(id: string) {
    this._pollVerificationInterval = setInterval(() => this._fetchVerificationStatus(id), 1000)
    this._fetchVerificationStatus(id)
  }

  _stopPollingVerification() {
    clearInterval(this._pollVerificationInterval as unknown as number)
    this._pollVerificationInterval = undefined
  }
  // End demo-site verifier

  async _getVerificationResult() {
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
      subjectAddress: this.state.selectedAddress,
      contractAddress: contractAddress.Token
    };
    const res = await fetch("/api/verifier", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
    const verificationInfoSet: VerificationInfoResponse = await res.json();

    // For now the verifier is merely returning a signed result as if verification succeeded.
    // What should happen is that this component polls the verifier to see when verification
    // has succeeded (or failed).

    this.setState({ verificationInfoSet: verificationInfoSet });
    this.setState({ isVerifying: false });
    this.setState({ statusMessage: "Verification complete." });
  }

  async _transferTokens(to: any, amount: any) {
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
      this._dismissTransactionError();

      // send the transfer, either with verification or without
      let tx: any;
      const t = await this._token.verificationThreshold();
      if (t <= amount && this.state.verificationInfoSet !== undefined) {
        tx = await this._token.validateAndTransfer(
          to,
          amount,
          this.state.verificationInfoSet.verificationInfo,
          this.state.verificationInfoSet.signature
        );
        // uncomment the following line to force verification to expire with each transfer instead of timing out:
        //this.setState({ verificationInfoSet: undefined });
      } else {
        tx = await this._token.transfer(to, amount);
      }

      // save the transaction's hash in the Dapp's state. This
      // way we can indicate that we are waiting for it to be mined.
      this.setState({ txBeingSent: tx.hash });

      // We use .wait() to wait for the transaction to be mined. This method
      // returns the transaction's receipt.
      const receipt = await tx.wait();

      // The receipt contains a status flag, which is 0 to indicate an error.
      if (receipt.status === 0) {
        // We can't know the exact error that made the transaction fail when it
        // was mined, so we throw this generic one.
        throw new Error("TX failed");
      }

      // If we got here, the transaction was successful, so update Dapp state.
      await this._updateFromContract();
      this.setState({ statusMessage: "Transaction Succeeded" });
      this.setState({ isVerifying: false });
    } catch (error) {
      console.error(error);

      // We check the error code to see if this error was produced because the
      // user rejected a tx. If that's the case, we do nothing.
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }

      // if the error is verification-related, we prompt -- this would be better handled
      // up front before the transfer, but for the sake of example, we show that
      // the contract is not relying solely on the web frontend to fire the error
      if (error.data && error.data.message.indexOf("Verifiable Credential") !== -1) {
        this.setState({ isVerifying: true });
        return;
      }

      // Other errors are logged and stored in the Dapp's state. This is used to
      // show them to the user, and for debugging.
      this.setState({ transactionError: error });
    } finally {
      // If we leave the try/catch, we aren't sending a tx anymore, so we clear
      // this part of the state.
      this.setState({ txBeingSent: undefined });
    }
  }

  // This method just clears part of the state
  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
    this.setState({ statusMessage: undefined });
  }

  // This method just clears part of the state
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that makes an RPC error human readable
  _getRpcErrorMessage(error: { data: { message: any }; message: any }) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState({
      tokenData: undefined,
      selectedAddress: undefined,
      balance: undefined,
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
      statusMessage: undefined,
      isVerifying: undefined,
      verificationInfoSet: undefined
    });
  }

  // This method checks whether the Metamask selected network is localhost:8545
  _checkNetwork() {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      return true;
    }

    this.setState({
      networkError: "Please connect Metamask to localhost:8545",
    });

    return false;
  }
}
