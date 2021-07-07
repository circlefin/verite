import { NextApiResponse } from "next"

export type ApiError = {
  status: number
  message: string
}

export function notFound(res: NextApiResponse): void {
  res.status(404).json({ status: 404, message: "Not found" })
}

export function methodNotAllowed(res: NextApiResponse): void {
  res.status(405).json({ status: 405, message: "Method not allowed" })
}
