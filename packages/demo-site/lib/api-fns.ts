import { NextApiResponse } from "next"
import { ValidationError, ValidationFailure } from "types"

export type ApiError = {
  status: number
  message: string
}

export function apiError(
  res: NextApiResponse,
  status: number,
  message: string,
  errors?: ValidationFailure[]
): void {
  res.status(status).json({
    status,
    message,
    errors
  })
}

export function notFound(res: NextApiResponse): void {
  apiError(res, 404, "Not found")
}

export function methodNotAllowed(res: NextApiResponse): void {
  apiError(res, 405, "Method not allowed")
}

export function validationError(res: NextApiResponse, error: Error): void {
  if (error instanceof ValidationError) {
    apiError(res, 400, error.message, error.failures)
  } else {
    apiError(res, 400, error.message)
  }
}
