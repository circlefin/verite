export enum ClaimFormat {
  Jwt = "jwt",
  JwtVc = "jwt_vc",
  JwtVp = "jwt_vp",
  LdpVc = "ldp_vc",
  LdpVp = "ldp_vp",
  Ldp = "ldp"
}

export type DescriptorMap = {
  id: string
  format: ClaimFormat
  path: string
  path_nested?: DescriptorMap
}
