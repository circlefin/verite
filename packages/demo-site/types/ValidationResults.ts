/**
 * Results of a path evaluation.
 */
 export type PathEvaluation = {
  path: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any
}

export type RuleEvaluationResult = {
  constraint: any
  match?: PathEvaluation
  failures?: PathEvaluation[]
}

export type CredentialMatch = {
  inputDescriptorId: string
  credentialId: string
  results: RuleEvaluationResult[]
}

export type ValidationFailure = {
  status?: number
  //source?: {
  //  pointer: string // or path...
  //}
  message: string
  details: string
  detailedResults?: RuleEvaluationResult[]
}

export type EvalationResults = {
  errors?: ValidationFailure[]
  matches?: RuleEvaluationResult[]
}

export class ValidationError extends Error {
  failures: ValidationFailure[]
  cause?: Error

  constructor(
    message: string,
    failures: ValidationFailure | ValidationFailure[],
    cause?: Error
  ) {
    super(message)
    this.name = "ValidationError"
    this.failures = Array.isArray(failures) ? failures : [failures]
    this.cause = cause
  }
}
