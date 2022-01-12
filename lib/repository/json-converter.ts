import { JsonData } from "../client";
import Entity, { EntityData } from '../entity/entity';
import { SchemaDefinition } from "../schema/schema-definitions";

export default class JsonConverter {

  private schemaDef: SchemaDefinition

  constructor(schemaDef: SchemaDefinition) {
    this.schemaDef = schemaDef;
  }

  toJsonData(entityData: EntityData): JsonData {
    for (let field in this.schemaDef) {
      if (this.schemaDef[field].type !== 'relation') continue;
      if (typeof entityData[field] === 'string') continue;
      entityData[field] = ((entityData[field] as unknown) as Entity).entityId;
    }
    return entityData;
  }

  toEntityData(jsonData: JsonData): EntityData {
    let entityData: EntityData = {};

    if (jsonData === null) return entityData;
    for (let field in this.schemaDef) {
      let value = jsonData[field];
      if (value !== undefined && value !== null) entityData[field] = value;
    }

    return entityData;
  }
}
