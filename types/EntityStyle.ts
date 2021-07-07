// https://identity.foundation/credential-manifest/wallet-rendering/#entity-styles

export type EntityStyleImage = {
  uri: string
  alt?: string
}

export type EntityStyleColor = {
  color: string
}

export type EntityStyle = {
  thumbnail?: EntityStyleImage
  hero?: EntityStyleImage
  background?: EntityStyleColor
  text?: EntityStyleColor
}
