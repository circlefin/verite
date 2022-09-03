import {
  DataDisplay,
  DataMappingSchema
} from "../../../types"
import { IsEmpty } from "../../utils/collection-utils"
import { Action, DATE_TIME_SCHEMA, NUMBER_SCHEMA, STRING_SCHEMA } from "../common"
import { LabeledDisplayMappingBuilder } from "./labeled-display-mapping-builder"

export class DataDisplayBuilder {
  private readonly _builder: Partial<DataDisplay>
  constructor(title?: string) {
    this._builder = {}
    if (title) {
      this._builder.title = {
        text: title
     }
    }
  }

  title(title: string): DataDisplayBuilder {
    this._builder.title = {
      text: title
    }
    return this
  }

  subtitle(path: string[], fallback?: string): DataDisplayBuilder {
    this._builder.subtitle = {
      path: path,
      fallback: fallback
    }
    return this
  }

  description(description: string): DataDisplayBuilder {
    this._builder.description = {
      text: description
    }
    return this
  }

  withSchemaProperty(label: string, schema: DataMappingSchema, itemBuilder: Action<LabeledDisplayMappingBuilder>
  ): DataDisplayBuilder {
    if (IsEmpty(this._builder.properties)) {
      this._builder.properties = []
    }
    const b = new LabeledDisplayMappingBuilder(label, schema)
    itemBuilder(b)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._builder.properties!.push(b.build())
    return this
  }

  withNumberProperty(label: string, itemBuilder: Action<LabeledDisplayMappingBuilder>
  ): DataDisplayBuilder {
    return this.withSchemaProperty(label, NUMBER_SCHEMA, itemBuilder)
  }

  withDateTimeProperty(label: string, itemBuilder: Action<LabeledDisplayMappingBuilder>
  ): DataDisplayBuilder {
    return this.withSchemaProperty(label, DATE_TIME_SCHEMA, itemBuilder)
  }

  withStringProperty(label: string, itemBuilder: Action<LabeledDisplayMappingBuilder>
  ): DataDisplayBuilder {
    return this.withSchemaProperty(label, STRING_SCHEMA, itemBuilder)
  }

  withProperty(label: string, itemBuilder: Action<LabeledDisplayMappingBuilder>
  ): DataDisplayBuilder {
    if (IsEmpty(this._builder.properties)) {
      this._builder.properties = []
    }
    const b = new LabeledDisplayMappingBuilder(label)
    itemBuilder(b)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._builder.properties!.push(b.build())
    return this
  }

  build(): DataDisplay {
    return this._builder as DataDisplay
  }
}
