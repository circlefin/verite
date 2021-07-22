export type ClaimFormatDesignationAlg = {
  alg: string[]
}

export type ClaimFormatDesignationProof = {
  proof_type: string[]
}

export type ClaimFormatDesignation = {
  jwt?: ClaimFormatDesignationAlg
  jwt_vc?: ClaimFormatDesignationAlg
  jwt_vp?: ClaimFormatDesignationAlg
  ldp_vc?: ClaimFormatDesignationProof
  ldp_vp?: ClaimFormatDesignationProof
  ldp?: ClaimFormatDesignationProof
}
