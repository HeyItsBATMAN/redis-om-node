import { SchemaDefinition } from "..";
export interface ToJSONOptions {
    clean: boolean;
    hide: boolean;
}
export declare type EntityData = Record<string, number | boolean | string | string[]>;
export declare type EntityConstructor<TEntity> = new (schemaDef: SchemaDefinition, id: string, data?: EntityData) => TEntity;
export default abstract class Entity {
    readonly entityId: string;
    readonly entityData: EntityData;
    private schemaDef;
    constructor(schemaDef: SchemaDefinition, id: string, data?: EntityData);
    toJSON(opts?: ToJSONOptions): Record<string, any>;
    populate(fields: string[], jsonOpts?: ToJSONOptions): Promise<void>;
}
