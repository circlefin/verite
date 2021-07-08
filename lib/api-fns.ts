import { NextApiResponse } from "next"

export type ApiError = {
  status: number
  message: string
}

export function apiError(res, status: number, message: string): void {
  res.status(status).json({
    status,
    message
  })
}

export function notFound(res: NextApiResponse): void {
  apiError(res, 404, "Not found")
}

export function methodNotAllowed(res: NextApiResponse): void {
  apiError(res, 405, "Method not allowed")
}

export function validationError(res: NextApiResponse, error: Error): void {
  apiError(res, 400, error.message)
}
