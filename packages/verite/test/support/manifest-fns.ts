import { randomBytes } from "crypto"

import { proofOfControlPresentationDefinition } from "../../lib"
import { buildManifest } from "../../lib/builders/manifest-builder"
import {
  buildCreditScoreManifest,
  buildKycAmlManifest
} from "../../lib/sample-data/manifests"
import { buildIssuer, randomDidKey } from "../../lib/utils/did-fns"
import { CredentialManifest } from "../../types/CredentialManifest"
import { Issuer } from "../../types/DidJwt"

type GenerateManifestAndIssuer = {
  manifest: CredentialManifest
  issuer: Issuer
}

function buildHybridManifest(): CredentialManifest {
  const issuerDid = randomDidKey(randomBytes)
  const issuer = buildIssuer(issuerDid.subject, issuerDid.privateKey)

  const credentialIssuer = { id: issuer.did, name: "Verite" }
  const manifest1 = buildKycAmlManifest(credentialIssuer)
  const manifest2 = buildCreditScoreManifest(credentialIssuer)
  const ods = manifest1.output_descriptors.concat(manifest2.output_descriptors)

  const manifest = buildManifest(
    "HybridManifest",
    credentialIssuer,
    ods,
    proofOfControlPresentationDefinition()
  )
  return manifest
}

export async function generateManifestAndIssuer(
  manifestType = "kyc"
): Promise<GenerateManifestAndIssuer> {
  const issuerDidKey = await randomDidKey(randomBytes)
  const issuer = buildIssuer(issuerDidKey.subject, issuerDidKey.privateKey)
  const credentialIssuer = { id: issuer.did, name: "Verite" }
  let manifest
  if (manifestType === "kyc") {
    manifest = buildKycAmlManifest(credentialIssuer)
  } else if (manifestType === "hybrid") {
    manifest = buildHybridManifest()
  } else {
    manifest = buildCreditScoreManifest(credentialIssuer)
  }
  return { manifest, issuer }
}
