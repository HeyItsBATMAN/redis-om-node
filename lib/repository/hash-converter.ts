import Entity, { EntityData } from '../entity/entity';
import { ArrayField, SchemaDefinition } from "../schema/schema-definitions";
import { HashData } from '../client';
import { RedisError } from '..';

export default class HashConverter {
  private schemaDef: SchemaDefinition

  constructor(schemaDef: SchemaDefinition) {
    this.schemaDef = schemaDef;
  }

  toHashData(entityData: EntityData): HashData {
    let hashData: HashData = {};

    for (let field in this.schemaDef) {
      let value = entityData[field];
      const typeValue = typeof(value);
      if (value === undefined) continue;
      let fieldDef = this.schemaDef[field];
      if (fieldDef.type === 'number') hashData[field] = value.toString();
      if (fieldDef.type === 'boolean') hashData[field] = value ? '1': '0';
      if (fieldDef.type === 'array') hashData[field] = (value as string[]).join(fieldDef.separator ?? '|');
      if (fieldDef.type === 'relation-array') {
        hashData[field] = (value as Array<string | Entity>).map(v => typeof(v) === 'string' ? v : v.entityId).join(fieldDef.separator ?? '|');
      }
      if (fieldDef.type === 'string') hashData[field] = value;
      if (fieldDef.type === 'relation') {
        if (typeValue === 'string') hashData[field] = value;
        else if (typeValue === 'object') hashData[field] = (value as unknown as Entity).entityId;
        else throw new RedisError(`Value of type ${typeValue} does not match expected types 'object' or 'string' needed for field type 'relation'`);
      }
    }
    return hashData;
  }

  toEntityData(hashData: HashData): EntityData{

    let entityData: EntityData = {};

    for (let field in this.schemaDef) {
      let value = hashData[field];
      if (value !== undefined) {
        let fieldDef = this.schemaDef[field]
        if (fieldDef.type === 'number') this.addNumber(field, entityData, value);
        if (fieldDef.type === 'boolean') this.addBoolean(field, entityData, value);
        if (fieldDef.type === 'array' || fieldDef.type === 'relation-array') this.addArray(field, fieldDef as ArrayField, entityData, value);
        if (fieldDef.type === 'string' || fieldDef.type === 'relation') this.addString(field, entityData, value);
      }
    }

    return entityData;
  }

  private addNumber(field: string, entityData: EntityData, value: string) {
    let parsed = Number.parseFloat(value);
    if (Number.isNaN(parsed)) throw Error(`Non-numeric value of '${value}' read from Redis for number field '${field}'`);
    entityData[field] = Number.parseFloat(value);
  }

  private addBoolean(field: string, entityData: EntityData, value: string) {
    if (value === '0') {
      entityData[field] = false;
    } else if (value === '1') {
      entityData[field] = true;
    } else {
      throw Error(`Non-boolean value of '${value}' read from Redis for boolean field '${field}'`);
    }
  }

  private addArray(field: string, fieldDef: ArrayField, entityData: EntityData, value: string) {
    entityData[field] = value.split(fieldDef.separator ?? '|');
  }

  private addString(field: string, entityData: EntityData, value: string) {
    entityData[field] = value;
  }
}
