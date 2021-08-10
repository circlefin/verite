import type { Verifiable, W3CCredential } from "./W3C"

/**
 * Results of a path evaluation.
 */
export type PathEvaluation = {
  path: string
  match: boolean
  value?: any
}

type RuleEvaluationResult = {
  constraint: any
  match?: PathEvaluation
  failures?: PathEvaluation[]
}

export type CredentialMatch = {
  inputDescriptorId: string
  credential: Verifiable<W3CCredential>
  results: RuleEvaluationResult[]
}

export type ValidationFailure = {
  status?: number
  // source?: {
  //   path: string // or path...
  // }
  message: string
  details: string
  detailedResults?: RuleEvaluationResult[]
}
