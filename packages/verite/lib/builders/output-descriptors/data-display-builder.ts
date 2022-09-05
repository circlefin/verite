/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { cloneDeep, isEmpty } from "lodash"

import {
  DataDisplay,
  DataMappingSchema,
  DisplayMapping,
  LabeledDisplayMapping
} from "../../../types"
import {
  Action,
  DATE_TIME_SCHEMA,
  NUMBER_SCHEMA,
  STRING_SCHEMA,
  AsDisplayMapping
} from "../common"
import { LabeledDisplayMappingBuilder } from "./labeled-display-mapping-builder"

export class DataDisplayBuilder {
  private readonly _builder: Partial<DataDisplay>
  constructor(initialValues: Partial<DataDisplay>) {
    this._builder = {
      properties: [],
      ...cloneDeep(initialValues)
    }
  }

  title(title: string | DisplayMapping): DataDisplayBuilder {
    this._builder.title = AsDisplayMapping(title)
    return this
  }

  subtitle(path: string[] | DisplayMapping): DataDisplayBuilder {
    this._builder.subtitle = AsDisplayMapping(path)
    return this
  }

  description(description: string | DisplayMapping): DataDisplayBuilder {
    this._builder.description = AsDisplayMapping(description)
    return this
  }

  properties(properties: LabeledDisplayMapping[]): DataDisplayBuilder {
    this._builder.properties = properties
    return this
  }

  addProperty(
    label: string,
    schema: DataMappingSchema,
    itemBuilder: Action<LabeledDisplayMappingBuilder>
  ): DataDisplayBuilder {
    const b = new LabeledDisplayMappingBuilder(label, schema)
    itemBuilder(b)
    this._builder.properties!.push(b.build())
    return this
  }

  addNumberProperty(
    label: string,
    itemBuilder: Action<LabeledDisplayMappingBuilder>
  ): DataDisplayBuilder {
    return this.addProperty(label, NUMBER_SCHEMA, itemBuilder)
  }

  addDateTimeProperty(
    label: string,
    itemBuilder: Action<LabeledDisplayMappingBuilder>
  ): DataDisplayBuilder {
    return this.addProperty(label, DATE_TIME_SCHEMA, itemBuilder)
  }

  addStringProperty(
    label: string,
    itemBuilder: Action<LabeledDisplayMappingBuilder>
  ): DataDisplayBuilder {
    return this.addProperty(label, STRING_SCHEMA, itemBuilder)
  }

  build(): DataDisplay {
    if (isEmpty(this._builder.properties)) {
      delete this._builder.properties
    }
    return this._builder as DataDisplay
  }
}
