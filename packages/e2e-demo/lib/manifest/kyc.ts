import { buildKycAmlManifest } from "verite"
import type { CredentialManifest } from "verite"
import { fullURL } from "../utils"
import { manifestIssuer } from "./issuer"

export const kycManifest: CredentialManifest = buildKycAmlManifest(
  manifestIssuer,
  {
    thumbnail: {
      uri: fullURL("/img/kyc-aml-thumbnail.png"),
      alt: "Verite Logo"
    },
    hero: {
      uri: fullURL("/img/kyc-aml-hero.png"),
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
