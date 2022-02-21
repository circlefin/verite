/**
 * Wrapper to expose secp256k1/elliptic as a module.
 */
declare module "secp256k1/elliptic" {
  import secp256k1 from "secp256k1"
  export = secp256k1
}
