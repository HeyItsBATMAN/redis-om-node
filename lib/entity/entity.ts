import { SchemaDefinition } from "..";

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
      if (fieldDef.type !== 'relation') continue;
      const value = (this as Record<string, any>)[field];
      if (!value || typeof value !== 'string') continue;
      const fetchResult = await fieldDef.repository.fetch(value);
      this.entityData[field] = fetchResult.toJSON();
    }
  }
}
