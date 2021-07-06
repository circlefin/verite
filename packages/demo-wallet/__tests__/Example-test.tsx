/**
 * @format
 */

import "react-native"
import React from "react"
import Example from "../components/Example"

// Note: test renderer must be required after react-native.
import renderer from "react-test-renderer" // eslint-disable-line import/order

it("renders correctly", () => {
  renderer.create(<Example />)
})
