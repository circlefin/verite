export type DescriptorMap = {
  id: string
  format: "jwt" | "jwt_vc" | "jwt_vp" | "ldp_vc" | "ldp_vp" | "ldp"
  path: string
  path_nested?: DescriptorMap
}
