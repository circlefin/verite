import { ClaimFormatDesignation, CredentialIssuer, CredentialManifest, OutputDescriptor, PresentationDefinition } from "../../types"
import {
  CREDENTIAL_MANIFEST_SPEC_VERSION_1_0_0,
  IsEmpty,
  OutputDescriptorBuilder
} from "../utils"
import { Action, JWT_CLAIM_FORMAT_DESIGNATION } from "./common"
import { PresentationDefinitionBuilder } from "./presentation-definition-builder"



export class CredentialManifestBuilder {
  _builder: Partial<CredentialManifest>
  constructor(id: string) {
    this._builder = {
      id: id,
      spec_version: CREDENTIAL_MANIFEST_SPEC_VERSION_1_0_0
    }
  }

  issuer(issuer: CredentialIssuer): CredentialManifestBuilder {
    this._builder.issuer = issuer
    return this
  }

  format(format: ClaimFormatDesignation): CredentialManifestBuilder {
    this._builder.format = format
    return this
  }

  output_descriptors(output_descriptors: OutputDescriptor[]) {
    this._builder.output_descriptors = output_descriptors
    return this
  }

  withOutputDescriptor(id: string, itemBuilder: Action<OutputDescriptorBuilder>): CredentialManifestBuilder {
    if (IsEmpty(this._builder.output_descriptors)) {
      this._builder.output_descriptors = []
    }
    const b = new OutputDescriptorBuilder(id)
    itemBuilder(b)
    const result = b.build()
    if (Object.keys(result).length === 0)
      return this
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._builder.output_descriptors!.push(b.build())
    return this
  }

  presentation_definition(presentation_definition: PresentationDefinition): CredentialManifestBuilder {
    this._builder.presentation_definition = presentation_definition
    return this
  }

  withPresentationDefinitionBuilder(id: string, pdBuilder: Action<PresentationDefinitionBuilder>) : CredentialManifestBuilder {
    const b = new PresentationDefinitionBuilder(id)
    pdBuilder(b)
    this._builder.presentation_definition = b.build()
    return this
  }

  build(): CredentialManifest {
    return this._builder as CredentialManifest
  }
}


export function buildManifest(
  manifestId: string,
  issuer: CredentialIssuer,
  outputDescriptors: OutputDescriptor[],
  presentationDefinition: PresentationDefinition,
  format: ClaimFormatDesignation = JWT_CLAIM_FORMAT_DESIGNATION
): CredentialManifest {

  const manifest = new CredentialManifestBuilder(manifestId)
  .issuer(issuer)
  .output_descriptors(outputDescriptors)
  .presentation_definition(presentationDefinition)
  .format(format)
  .build()

  return manifest
}