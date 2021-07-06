export type ManifestStyle = Record<string, unknown>

export type StyleImage = {
  uri: string
  alt: string
}

export type StyleColor = {
  color: string
}

export type ManifestIssuer = {
  id: string
  comment?: string
  name: string
  styles: ManifestStyle
}

export type ManifestFormatKind = {
  alg: string[]
}

export type ManifestFormat = {
  jwt_vc?: ManifestFormatKind
  jwt_vp?: ManifestFormatKind
}

export type Schema = {
  uri: string
}

export type OutputDescriptorDisplayPathWithFallback = {
  path: string[]
  fallback: string
}

export type OutputDescriptorDisplay = {
  title: OutputDescriptorDisplayPathWithFallback | string
  subtitle: OutputDescriptorDisplayPathWithFallback | string
  description: { text: string }
}

export type OutputDescriptorStyle = {
  thumbnail?: StyleImage
  hero?: StyleImage
  background?: StyleColor
  text?: StyleColor
}

export type OutputDescriptor = {
  id: string
  schema: Schema[]
  name: string
  description: string
  display: OutputDescriptorDisplay
  styles?: OutputDescriptorStyle
}

export type InputDescriptor = {
  id: string
  name: string
  purpose: string
  schema: Schema[]
}

export type PresentationDefinition = {
  id: string
  format: ManifestFormat & { input_descriptors: InputDescriptor[] }
}

export type Manifest = {
  id: string
  version: string
  issuer: ManifestIssuer
  format: ManifestFormat
  output_descriptors: OutputDescriptor[]
  presentation_definition: PresentationDefinition
}

export type ManifestUrlObject = {
  manifestUrl: string
  version: string
}
