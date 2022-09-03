import {
  DataMappingPath,
  DataMappingSchema, LabeledDisplayMapping
} from "../../../types";
import { IsEmpty } from "../../utils/collection-utils";


export class LabeledDisplayMappingBuilder {
  private readonly _builder: Partial<LabeledDisplayMapping & DataMappingPath>;
  constructor(label: string, schema?: DataMappingSchema) {
    this._builder = {
      label: label
    }
    if (schema) {
      this._builder.schema = schema
    }
  }

  schema(schema: DataMappingSchema): LabeledDisplayMappingBuilder {
    this._builder.schema = schema;
    return this;
  }

  path(path: string[]): LabeledDisplayMappingBuilder {
    if (IsEmpty(path)) return this
    this._builder.path = path;
    return this;
  }

  fallback(fallback: string): LabeledDisplayMappingBuilder {
    this._builder.fallback = fallback;
    return this;
  }

  build(): LabeledDisplayMapping {
    return this._builder as LabeledDisplayMapping;
  }
}
