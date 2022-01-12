import { SchemaDefinition } from "..";
export declare type EntityData = Record<string, number | boolean | string | string[]>;
export declare type EntityConstructor<TEntity> = new (schemaDef: SchemaDefinition, id: string, data?: EntityData) => TEntity;
export default abstract class Entity {
    readonly entityId: string;
    readonly entityData: EntityData;
    private schemaDef;
    constructor(schemaDef: SchemaDefinition, id: string, data?: EntityData);
    toJSON(): Record<string, any>;
    populate(fields: string[]): Promise<void>;
}
