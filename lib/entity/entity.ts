import { SchemaDefinition } from "..";
import Repository from '../repository/repository'

/**
 * A JavaScript object containing the underlying data of an {@link Entity}.
 */
export type EntityData = Record<string, number | boolean | string | string[]>;

/** 
 * A constructor that creates an {@link Entity} of type TEntity.
 * @template TEntity The {@link Entity} type.
 */
export type EntityConstructor<TEntity> = new (
  schemaDef: SchemaDefinition, 
  id: string,
  data?: EntityData) => TEntity;

/**
 * An Entity is the class from which objects that Redis OM maps to are made. You need
 * to subclass Entity in your application:
 * 
 * ```typescript
 * class Foo extends Entity {}
 * ```
 */
export default abstract class Entity {
  /** The generated entity ID. */
  readonly entityId: string;

  /** 
   * The underlying data to be written to Redis.
   * @internal
   */
  readonly entityData: EntityData;

  private schemaDef: SchemaDefinition;

  /** 
   * Creates an new Entity.
   * @internal
   */
  constructor(schemaDef: SchemaDefinition, id: string, data: EntityData = {}) {
    this.schemaDef = schemaDef;
    this.entityId = id;
    this.entityData = data;
  }

  toJSON() {
    let json: Record<string, any> = { entityId: this.entityId }
    for (let key in this.schemaDef) {
      json[key] = (this as Record<string, any>)[key];
    }
    return json;
  }

  async populate(fields: string[]) {
    for (const field of fields) {
      if (!this.schemaDef.hasOwnProperty(field)) continue;
      const fieldDef = this.schemaDef[field];
      const fieldType = fieldDef.type;
      const value = (this as Record<string, any>)[field];
      if (fieldType === 'relation') {
        if (!value || typeof value !== 'string') continue;
        const repository = Repository.get(fieldDef.repository);
        if (!repository) continue;
        const fetchResult = await repository.fetch(value);
        this.entityData[field] = fetchResult.toJSON();
      } else if (fieldType === 'relation-array') {
        const repository = Repository.get(fieldDef.repository);
        if (!repository) continue;
        const fetchResults = await Promise.all(value.map((v: string) => repository.fetch(v)))
        this.entityData[field] = fetchResults.map((v: any) => v.toJSON() as any);
      }
    }
  }
}
