import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Verity } from '../target/types/verity';
import {keccak_256} from 'js-sha3';
import {privateKeyVerify, ecdsaSign, publicKeyCreate} from 'secp256k1';
import { sendAndConfirmTransaction, Secp256k1Program, Transaction } from "@solana/web3.js"


const randomPrivateKey = () => {
  let privateKey;
  do {
    privateKey = anchor.web3.Keypair.generate().secretKey.slice(0, 32);
  } while (!privateKeyVerify(privateKey));
  return privateKey;
};

describe('verity', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Verity as Program<Verity>;

  const from = anchor.web3.Keypair.generate();
  const connection = anchor.getProvider().connection;

  before(async function () {
    await connection.confirmTransaction(
      await connection.requestAirdrop(from.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL),
    );
  });
  
  it('Is initialized!', async () => {
    const tx = await program.rpc.initialize({});
  });

  it("passes if verified", async () => {
    // Eth Address (Verifier)
    const privateKey = Buffer.from([
      203, 130, 240,  71,  57,  83, 172,  48,
      120,  59,  41,  88, 207, 209,   1, 232,
      252,  67, 245, 125, 108, 162, 166, 116,
      133, 157, 170, 245, 177,  84,  59,   1
    ])
    const publicKey = publicKeyCreate(privateKey, false).slice(1);
    const ethAddress = Secp256k1Program.publicKeyToEthAddress(publicKey);

    // Message
    const message = Buffer.from('string address');
    const messageHash = Buffer.from(keccak_256.update(message).digest());

    // Signature
    const {signature, recid: recoveryId} = ecdsaSign(messageHash, privateKey);
    
    await program.rpc.verify(
      signature,
      recoveryId,
      message,
      {}
    );
  })
});
