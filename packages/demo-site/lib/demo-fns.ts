import {
  VerificationInfoResponse,
  verificationResult
} from "@centre/verity/dist"
import { Contract, Wallet } from "ethers"
import { User } from "./database"
import {
  getProvider,
  verityTokenContractAddress,
  verityTokenContractArtifact
} from "./eth-fns"

export type Transaction = {
  amount: string
  address: string
}

export async function send(
  user: User,
  transaction: Transaction,
  verification?: VerificationInfoResponse
): Promise<boolean> {
  if (!transaction) {
    return false
  }

  const provider = getProvider()
  const wallet = Wallet.fromMnemonic(user.mnemonic).connect(provider)
  const contract = new Contract(
    verityTokenContractAddress(),
    verityTokenContractArtifact().abi,
    wallet
  )

  // In a production environment, one would need to call out to a verifier to get a result
  if (!verification) {
    verification = await verificationResult(
      wallet.address,
      verityTokenContractAddress(),
      process.env.VERIFIER_PRIVATE_KEY,
      parseInt(process.env.NEXT_PUBLIC_ETH_NETWORK, 10)
    )
  }

  const tx = await contract.validateAndTransfer(
    transaction.address,
    parseInt(transaction.amount, 10),
    verification.verificationInfo,
    verification.signature
  )
  const receipt = await tx.wait()

  return receipt.status !== 0
}
