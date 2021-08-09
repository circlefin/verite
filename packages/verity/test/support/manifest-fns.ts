import {
  createCreditScoreManifest,
  createKycAmlManifest
} from "../../lib/issuer/manifest"
import { didKeyToIssuer, randomDidKey } from "../../lib/utils/did-fns"
import { CredentialManifest } from "../../types/CredentialManifest"
import { Issuer } from "../../types/W3C"

type GenerateManifestAndIssuer = {
  manifest: CredentialManifest
  issuer: Issuer
}

export async function generateManifestAndIssuer(
  manifestType = "kyc"
): Promise<GenerateManifestAndIssuer> {
  const issuerDidKey = await randomDidKey()
  const issuer = didKeyToIssuer(issuerDidKey)
  const credentialIssuer = { id: issuer.did, name: "Verity" }
  const manifest =
    manifestType === "kyc"
      ? createKycAmlManifest(credentialIssuer)
      : createCreditScoreManifest(credentialIssuer)

  return { manifest, issuer }
}
