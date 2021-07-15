import { NextApiResponse } from "next"
import { VerificationError, VerificationObject } from "lib/verity"

export type ApiError = {
  status: number
  message: string
}

export function apiError(
  res: NextApiResponse,
  status: number,
  message: string,
  errors?: VerificationObject[]
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
  if (error instanceof VerificationError) {
    apiError(res, 400, error.message, error.errors)
  } else {
    apiError(res, 400, error.message)
  }
}
