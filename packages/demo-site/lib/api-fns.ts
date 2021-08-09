import { promisify } from "util"
import { ValidationError, VerificationError } from "@centre/verity/dist"
import Cors from "cors"
import { NextApiHandler, NextApiRequest } from "next"
import { MethodNotAllowedError } from "./errors"

const cors = promisify(
  Cors({
    methods: ["GET", "HEAD"]
  })
)

type ApiErrorResponse = {
  status: number
  message: string
  details?: string
}

/**
 * Require a certain method to be used in for an API route
 */
export function requireMethod(req: NextApiRequest, method: string): void {
  if (req.method.toLowerCase() !== method.toLowerCase()) {
    throw new MethodNotAllowedError(`Only ${method} requests are allowed`)
  }
}

/**
 * Wrapper for API requests which handles API Errors and includes basic logging
 *
 * @remark This method is a wrapper around your existing api handler
 *
 * @example
 * export default apiHandler(async (req, res) => { ... })
 * export default apiHandler<ResponseType>(async (req, res) => { ... })
 */
export function apiHandler<T>(
  handler: NextApiHandler<T | ApiErrorResponse>
): NextApiHandler<T | ApiErrorResponse> {
  return async (req, res) => {
    await cors(req, res)

    // Log the HTTP request, but not in test environments
    if (process.env.NODE_ENV !== "test") {
      console.info(`> ${req.method} ${req.url}`)
    }

    try {
      // Call the original API method
      await handler(req, res)
    } catch (e) {
      const status = errorStatusCode(e)
      const message = e.message || "Something went wrong"
      const details = e.details

      res.status(status).json({
        status,
        message,
        details
      })
    }
  }
}

function errorStatusCode(error): number {
  if (error.status) {
    return error.status
  }

  if (error instanceof VerificationError || error instanceof ValidationError) {
    return 400
  }

  return 500
}
