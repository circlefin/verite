import "react-native-get-random-values"
import "@ethersproject/shims"

// TextEncoded / TextDecoder polyfill
import "fastestsmallesttextencoderdecoder"

// Buffer polyfill
import { Buffer } from "buffer"
global.Buffer = Buffer
