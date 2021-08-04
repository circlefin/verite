import { createKycAmlManifest } from "../../lib/issuer/manifest"
import { didKeyToIssuer } from "../../lib/utils/did-fns"
import { CredentialManifest } from "../../types/CredentialManifest"
import { Issuer } from "../../types/W3C"
import { randomDidKey } from "./did-fns"

type GenerateManifestAndIssuer = {
  manifest: CredentialManifest
  issuer: Issuer
}

export async function generateManifestAndIssuer(): Promise<GenerateManifestAndIssuer> {
  const issuerDidKey = await randomDidKey()
  const issuer = didKeyToIssuer(issuerDidKey)
  const credentialIssuer = { id: issuer.did, name: "Verity" }
  const manifest = createKycAmlManifest(credentialIssuer)

  return { manifest, issuer }
}
