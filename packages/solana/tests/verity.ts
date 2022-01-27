import * as anchor from "@project-serum/anchor"
import { Program } from "@project-serum/anchor"
import { Verity } from "../target/types/verity"
import { keccak_256 } from "js-sha3"
import { privateKeyVerify, ecdsaSign, publicKeyCreate } from "secp256k1"
import { Secp256k1Program, PublicKey } from "@solana/web3.js"
import * as borsh from "@project-serum/borsh"
import { expect } from "chai"

const randomPrivateKey = () => {
  let privateKey
  do {
    privateKey = anchor.web3.Keypair.generate().secretKey.slice(0, 32)
  } while (!privateKeyVerify(privateKey))
  return privateKey
}

type Message = {
  subject: PublicKey
  expiration: anchor.BN
}

const LAYOUT: borsh.Layout<Message> = borsh.struct([
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
    const tx = await program.rpc.initialize({})
  })

  it("passes if verified", async () => {
    // Eth Address (Verifier)
    const privateKey = Buffer.from([
      203, 130, 240, 71, 57, 83, 172, 48, 120, 59, 41, 88, 207, 209, 1, 232,
      252, 67, 245, 125, 108, 162, 166, 116, 133, 157, 170, 245, 177, 84, 59, 1
    ])
    const publicKey = publicKeyCreate(privateKey, false).slice(1)
    const ethAddress = Secp256k1Program.publicKeyToEthAddress(publicKey)

    // Alice will be the subject
    const alice = anchor.web3.Keypair.generate()

    // Setup message contents
    const expiration = new anchor.BN(Date.now() / 1000 + 6000)
    const data = {
      subject: alice.publicKey,
      expiration,
      schema: "centre.io/credentials/kyc"
    }

    // Allocate buffer for the message and borsh encode the data
    const message = Buffer.alloc(128)
    LAYOUT.encode(data, message)

    // Create Signature from the message
    const messageHash = Buffer.from(keccak_256.update(message).digest())
    const { signature, recid: recoveryId } = ecdsaSign(messageHash, privateKey)

    await program.rpc.verify(signature, recoveryId, message, {
      accounts: {
        subject: alice.publicKey,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY
      },
      signers: [alice]
    })
  })

  it("borsh", async () => {
    const keypair = anchor.web3.Keypair.generate()
    const expiration = new anchor.BN(Date.now())

    const message = {
      subject: keypair.publicKey,
      expiration,
      schema: "hello, world"
    }

    const buffer = Buffer.alloc(128)
    LAYOUT.encode(message, buffer)

    const decoded = LAYOUT.decode(buffer)
    expect(decoded.subject.equals(keypair.publicKey)).to.be.true
    expect(decoded.expiration.eq(expiration)).to.be.true
  })
})
