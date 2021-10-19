import {
  createCreditScoreManifest,
  createKycAmlManifest
} from "../../lib/issuer/manifest"
import { buildIssuer, randomDidKey } from "../../lib/utils/did-fns"
import { CredentialManifest } from "../../types/CredentialManifest"
import { Issuer } from "../../types/DidJwt"

type GenerateManifestAndIssuer = {
  manifest: CredentialManifest
  issuer: Issuer
}

export async function generateManifestAndIssuer(
  manifestType = "kyc"
): Promise<GenerateManifestAndIssuer> {
  const issuerDidKey = await randomDidKey()
  const issuer = buildIssuer(issuerDidKey.subject, issuerDidKey.privateKey)
  const credentialIssuer = { id: issuer.did, name: "Verity" }
  const manifest =
    manifestType === "kyc"
      ? createKycAmlManifest(credentialIssuer)
      : createCreditScoreManifest(credentialIssuer)

  return { manifest, issuer }
}
