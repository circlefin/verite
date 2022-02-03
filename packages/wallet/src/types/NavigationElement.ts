/* eslint-disable @typescript-eslint/no-explicit-any */
type NavigationParams<T> = {
  navigation: any
  route: any
} & T

export type NavigationElement<T = Record<string, never>> = (
  arg0: NavigationParams<T>
) => JSX.Element
