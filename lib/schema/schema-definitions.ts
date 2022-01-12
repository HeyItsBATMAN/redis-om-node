import Repository from '../repository/repository';
import { EntityConstructor } from '../entity/entity';

/** Base interface for all fields. */
export interface Field {
  /**
   * The default field name in Redis is the key name defined in the 
   * {@link SchemaDefinition}. Overrides the Redis key name if set.
   */
  alias?: string;

  /**
   * Fields that are hidden will be ignored by the `toJSON` method of an `Entity`
   */
  hidden?: boolean;
}

/** Base interface for Fields that need a sepeartor for RediSearch */
export interface Seperatable {
  /**
   * Due to how RediSearch works, non-full-text strings and arrays are sometimes stored the same
   * in Redis, as a simple string. This is the separator used to split those strings when it is an
   * array. If your StringField contains this separator, this can cause problems. You can change it
   * here to avoid those problems. Defaults to `|`.
   */
  separator?: string;
}

/** Base interface for Fields that can be populated */
export interface WithRepository {
  /** EntityConstructor of the repository that will be used to populate instances of Entity */
  repository: EntityConstructor<any>;
}

/** A field representing a number. */
export interface NumericField extends Field {
  /** Yep. It's a number. */
  type: 'number';
}

/** A field representing a string. */
export interface StringField extends Field, Seperatable {
  /** Yep. It's a string. */
  type: 'string';

  /** Enables full-text search on this field when set to `true`. Defaults to `false`. */
  textSearch?: boolean;
}

/** A field representing a boolean. */
export interface BooleanField extends Field {
  /** Yep. It's a boolean. */
  type: 'boolean';
}

/** A field representing an array of strings. */
export interface ArrayField extends Field, Seperatable {
  /** Yep. It's an array. */
  type: 'array';
}

/** A field representing a single relation to an entity from a single repository via entityId */
export interface RelationField extends Field, WithRepository {
  type: 'relation';
}

/** A field representing multiple relations to multiple entities from a single repository via entityId */
export interface ManyRelationField extends Field, Seperatable, WithRepository {
  type: 'relation-array';
}

/** Contains instructions telling how to map a property on an {@link Entity} to Redis. */
export type FieldDefinition = NumericField | StringField | BooleanField | ArrayField | RelationField | ManyRelationField;

/**
* Group of {@link FieldDefinition}s that define the schema for an {@link Entity}.
 */
export type SchemaDefinition = Record<string, FieldDefinition>;

/** A function that generates random {@link Entity.entityId | Entity IDs}. */
export type IdStrategy = () => string;

/** Valid values for how to use stop words for a given {@link Schema}. */
export type StopWordOptions = 'OFF' | 'DEFAULT' | 'CUSTOM';
