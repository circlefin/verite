import { createKycAmlManifest } from "@centre/verity"
import type { CredentialManifest } from "@centre/verity"
import { publicUrl } from "../api-fns"
import { manifestIssuer } from "./issuer"

export const kycManifest: CredentialManifest = createKycAmlManifest(
  manifestIssuer,
  {
    thumbnail: {
      uri: publicUrl(`/img/kyc-aml-thumbnail.png`),
      alt: "Verity Logo"
    },
    hero: {
      uri: publicUrl(`/img/kyc-aml-hero.png`),
      alt: "KYC+AML Visual"
    },
    background: {
      color: "#EC4899"
    },
    text: {
      color: "#FFFFFF"
    }
  }
)
