/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { isEmpty } from "lodash"

import {
  ClaimFormatDesignation,
  CredentialIssuer,
  CredentialManifest,
  OutputDescriptor,
  PresentationDefinition
} from "../../types"
import {
  Action,
  CREDENTIAL_MANIFEST_SPEC_VERSION_1_0_0,
  JWT_VC_CLAIM_FORMAT_DESIGNATION
} from "./common"
import { OutputDescriptorBuilder } from "./output-descriptors"
import { PresentationDefinitionBuilder } from "./presentation-definition-builder"

export class CredentialManifestBuilder {
  _builder: Partial<CredentialManifest>
  constructor(id: string) {
    this._builder = {
      id: id,
      spec_version: CREDENTIAL_MANIFEST_SPEC_VERSION_1_0_0,
      output_descriptors: [],
      format: JWT_VC_CLAIM_FORMAT_DESIGNATION
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

  addOutputDescriptor(
    id: string,
    itemBuilder: Action<OutputDescriptorBuilder>
  ): CredentialManifestBuilder {
    const b = new OutputDescriptorBuilder(id)
    itemBuilder(b)
    const result = b.build()
    if (!isEmpty(result)) {
      this._builder.output_descriptors!.push(result)
    }
    return this
  }

  name(name: string): CredentialManifestBuilder {
    this._builder.name = name
    return this
  }

  description(description: string): CredentialManifestBuilder {
    this._builder.description = description
    return this
  }

  presentation_definition(
    presentation_definition: PresentationDefinition
  ): CredentialManifestBuilder {
    this._builder.presentation_definition = presentation_definition
    return this
  }

  withPresentationDefinitionBuilder(
    id: string,
    pdBuilder: Action<PresentationDefinitionBuilder>
  ): CredentialManifestBuilder {
    const b = new PresentationDefinitionBuilder({
      ...this._builder.presentation_definition,
      id: id
    })
    pdBuilder(b)
    this._builder.presentation_definition = b.build()
    return this
  }

  build(): CredentialManifest {
    if (isEmpty(this._builder.output_descriptors)) {
      delete this._builder.output_descriptors
    }
    return this._builder as CredentialManifest
  }
}

export function buildManifest(
  manifestId: string,
  issuer: CredentialIssuer,
  outputDescriptors: OutputDescriptor[],
  presentationDefinition?: PresentationDefinition,
  format: ClaimFormatDesignation = JWT_VC_CLAIM_FORMAT_DESIGNATION
): CredentialManifest {
  let manifestBuilder = new CredentialManifestBuilder(manifestId)
    .issuer(issuer)
    .output_descriptors(outputDescriptors)
    .format(format)

  if (presentationDefinition) {
    manifestBuilder = manifestBuilder.presentation_definition(
      presentationDefinition
    )
  }

  const manifest = manifestBuilder.build()

  return manifest
}
