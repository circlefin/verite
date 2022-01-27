import { createMocks as _createMocks } from "node-mocks-http"
import type { Mocks, RequestOptions, ResponseOptions } from "node-mocks-http"
import type { NextApiRequest, NextApiResponse } from "next"

export const createMocks = _createMocks as (
  reqOptions?: RequestOptions,
  resOptions?: ResponseOptions
  // @ts-ignore: https://github.com/howardabrams/node-mocks-http/issues/245
) => Mocks<NextApiRequest, NextApiResponse>
