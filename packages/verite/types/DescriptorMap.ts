export type ClaimFormat =
  | "jwt"
  | "jwt_vc"
  | "jwt_vp"
  | "ldp_vc"
  | "ldp_vp"
  | "ldp"

export type DescriptorMap = {
  id: string
  format: ClaimFormat
  path: string
  path_nested?: DescriptorMap
}
