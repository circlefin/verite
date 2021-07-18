import { CredentialSigner } from "./verity"

const did = process.env.ISSUER_DID
const secret = process.env.ISSUER_SECRET

export const credentialSigner = new CredentialSigner(did, secret)
