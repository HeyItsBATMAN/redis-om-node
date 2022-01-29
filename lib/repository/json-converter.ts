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
      const fieldType = this.schemaDef[field].type;
      const value = entityData[field];
      if (!value) continue;
      if (fieldType === 'relation') {
        // If we encounter a string, assume it's already an entityId
        if (typeof entityData[field] === 'string') continue;
        entityData[field] = ((entityData[field] as unknown) as Entity).entityId;
      } else if (fieldType === 'relation-array') {
        if (Array.isArray(value)) {
          entityData[field] = value.map((v: string | Entity) => typeof(v) === 'string' ? v : v.entityId);
        }
      }
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
