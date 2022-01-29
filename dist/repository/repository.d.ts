import Schema from "../schema/schema";
import Client from "../client";
import Entity, { EntityConstructor } from '../entity/entity';
import Search from '../search/search';
export declare type EntityCreationData = Record<string, number | boolean | string | string[] | null>;
export default class Repository<TEntity extends Entity> {
    private schema;
    private client;
    private jsonConverter;
    private hashConverter;
    private static Map;
    constructor(schema: Schema<TEntity>, client: Client);
    static get<T extends Entity>(entityCtor: EntityConstructor<T>): Repository<T>;
    all(): Promise<TEntity[]>;
    createIndex(): Promise<void>;
    dropIndex(): Promise<void>;
    createEntity(data?: EntityCreationData): TEntity;
    save(entity: TEntity): Promise<string>;
    createAndSave(data?: EntityCreationData): Promise<TEntity>;
    fetch(id: string): Promise<TEntity>;
    remove(id: string): Promise<void>;
    search(): Search<TEntity>;
    private makeKey;
}