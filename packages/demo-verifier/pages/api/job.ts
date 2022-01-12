import { challengeTokenUrlWrapper, PresentationDefinition } from "verite"
import jwt from "jsonwebtoken"
import { NextApiRequest, NextApiResponse } from "next"

export default async function job(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  /**
   * Since the request will be fulfilled by a mobile wallet, that does not
   * necessarily share the same authentication as the browser, we will include
   * a JWT in the request to tie the two clients together.
   */
  const token = jwt.sign({}, process.env.JWT_SECRET, {
    subject: req.query.subjectAddress as string,
    algorithm: "HS256",
    expiresIn: "1h"
  })

  const challenge = challengeTokenUrlWrapper(
    `${process.env.NEXT_PUBLIC_BASEURL}/api/verifications/${token}`
  )

  res.status(200).json(challenge)
}
