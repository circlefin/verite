import * as anchor from "@project-serum/anchor"
import { Program } from "@project-serum/anchor"
import * as borsh from "@project-serum/borsh"
import { PublicKey } from "@solana/web3.js"
import { expect } from "chai"
import { keccak_256 } from "js-sha3"
import { ecdsaSign } from "secp256k1"

import { Verity } from "../target/types/verity"

type Message = {
  name: string
  version: number
  cluster: string
  subject: PublicKey
  expiration: anchor.BN
  schema: string
}

const LAYOUT: borsh.Layout<Message> = borsh.struct([
  borsh.str("name"),
  borsh.u8("version"),
  borsh.str("cluster"),
  borsh.publicKey("subject"),
  borsh.i64("expiration"),
  borsh.str("schema")
])

describe("verity", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env())

  const program = anchor.workspace.Verity as Program<Verity>

  const from = anchor.web3.Keypair.generate()
  const connection = anchor.getProvider().connection

  before(async function () {
    await connection.confirmTransaction(
      await connection.requestAirdrop(
        from.publicKey,
        10 * anchor.web3.LAMPORTS_PER_SOL
      )
    )
  })

  it("Is initialized!", async () => {
    await program.rpc.initialize({})
  })

  it("passes if verified", async () => {
    // Verifier:
    // This key will be used to sign the verification result
    const verifier = Buffer.from([
      203, 130, 240, 71, 57, 83, 172, 48, 120, 59, 41, 88, 207, 209, 1, 232,
      252, 67, 245, 125, 108, 162, 166, 116, 133, 157, 170, 245, 177, 84, 59, 1
    ])

    // Alice will be the subject
    const alice = anchor.web3.Keypair.generate()

    /**
     * Setup message contents.
     *
     * The combination of name, version, and cluster form a domain
     * discriminator. In this manner, verification results from one
     * cluster, e.g. devnet cannot be reused on mainnet-beta.
     *
     * Solana uses unix timestamp for clock time, whereas javascript uses
     * milliseconds. This example uses 1 minute in the future
     */
    const expiration = new anchor.BN(Date.now() / 1000 + 6000)
    const data = {
      name: "VerificationRegistry", // 24 bytes
      version: 1, // 1 byte
      cluster: "localnet", // 12 bytes
      subject: alice.publicKey, // 32 bytes
      expiration, // 8 bytes
      schema: "centre.io/credentials/kyc" // 29 bytes
    }

    // Allocate buffer for the message and borsh encode the data. Each type has
    // a distinct storage requirement:
    // Public Key - 32 bytes
    // i64 - 8 bytes
    // strings - the length of the string plus 4 bytes to store its length
    const message = Buffer.alloc(106)
    LAYOUT.encode(data, message)

    // Create Signature from the message
    const messageHash = Buffer.from(keccak_256.update(message).digest())
    const { signature, recid: recoveryId } = ecdsaSign(messageHash, verifier)

    // Make RPC call to verify
    await program.rpc.verify(signature, recoveryId, data, {
      accounts: {
        subject: alice.publicKey,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY
      },
      signers: [alice]
    })
  })

  it("borsh encoded messages can be decoded", async () => {
    const keypair = anchor.web3.Keypair.generate()
    const expiration = new anchor.BN(Date.now())

    const message = {
      name: "VerificationRegistry",
      version: 1,
      cluster: "devnet",
      subject: keypair.publicKey,
      expiration,
      schema: "hello, world"
    }

    const buffer = Buffer.alloc(128)
    LAYOUT.encode(message, buffer)

    const decoded = LAYOUT.decode(buffer)
    expect(decoded.name).to.eq("VerificationRegistry")
    expect(decoded.version).to.eq(1)
    expect(decoded.cluster).to.eq("devnet")
    expect(decoded.subject.equals(keypair.publicKey)).to.be.true
    expect(decoded.expiration.eq(expiration)).to.be.true
    expect(decoded.schema).to.eq("hello, world")
    expect(decoded.cluster).to.eq("devnet")
  })
})
