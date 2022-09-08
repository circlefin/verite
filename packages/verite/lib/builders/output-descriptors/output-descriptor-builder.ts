import { DataDisplay, EntityStyle, OutputDescriptor } from "../../../types"
import { Action, AsDisplayMapping } from "../common"
import { DataDisplayBuilder } from "./data-display-builder"

export class OutputDescriptorBuilder {
  private readonly _builder: Partial<OutputDescriptor>

  constructor(id?: string) {
    this._builder = {}
    if (id) {
      this._builder.id = id
    }
  }

  id(id: string): OutputDescriptorBuilder {
    this._builder.id = id
    return this
  }

  name(name: string): OutputDescriptorBuilder {
    this._builder.name = name
    return this
  }

  description(description: string): OutputDescriptorBuilder {
    this._builder.description = description
    return this
  }

  schema(schema: string): OutputDescriptorBuilder {
    this._builder.schema = schema
    return this
  }

  styles(styles: EntityStyle): OutputDescriptorBuilder {
    this._builder.styles = styles
    return this
  }

  display(display: DataDisplay): OutputDescriptorBuilder {
    this._builder.display = display
    return this
  }

  withDisplay(
    title: string,
    action: Action<DataDisplayBuilder>
  ): OutputDescriptorBuilder {
    const b = new DataDisplayBuilder({
      ...this._builder.display,
      title: AsDisplayMapping(title)
    })
    action(b)
    this._builder.display = b.build()
    return this
  }

  build(): OutputDescriptor {
    return this._builder as OutputDescriptor
  }
}
