import { EntityConstructor } from '../entity/entity';
export interface Field {
    alias?: string;
    hidden?: boolean;
}
export interface Seperatable {
    separator?: string;
}
export interface WithRepository {
    repository: EntityConstructor<any>;
}
export interface NumericField extends Field {
    type: 'number';
}
export interface StringField extends Field, Seperatable {
    type: 'string';
    textSearch?: boolean;
}
export interface BooleanField extends Field {
    type: 'boolean';
}
export interface ArrayField extends Field, Seperatable {
    type: 'array';
}
export interface RelationField extends Field, WithRepository {
    type: 'relation';
}
export interface ManyRelationField extends Field, Seperatable, WithRepository {
    type: 'relation-array';
}
export declare type FieldDefinition = NumericField | StringField | BooleanField | ArrayField | RelationField | ManyRelationField;
export declare type SchemaDefinition = Record<string, FieldDefinition>;
export declare type IdStrategy = () => string;
export declare type StopWordOptions = 'OFF' | 'DEFAULT' | 'CUSTOM';
