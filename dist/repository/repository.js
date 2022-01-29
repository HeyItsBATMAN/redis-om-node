"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const search_1 = __importDefault(require("../search/search"));
const hash_converter_1 = __importDefault(require("./hash-converter"));
const json_converter_1 = __importDefault(require("./json-converter"));
class Repository {
    constructor(schema, client) {
        Repository.Map.set(schema.entityCtor, this);
        this.schema = schema;
        this.client = client;
        this.jsonConverter = new json_converter_1.default(this.schema.definition);
        this.hashConverter = new hash_converter_1.default(this.schema.definition);
    }
    static get(entityCtor) {
        const repo = Repository.Map.get(entityCtor);
        if (!repo)
            throw new Error(`No repository found for ${entityCtor.name}`);
        return repo;
    }
    async all() {
        return this.search().all();
    }
    async createIndex() {
        let options = {
            indexName: this.schema.indexName,
            dataStructure: this.schema.dataStructure,
            prefix: `${this.schema.prefix}:`,
            schema: this.schema.redisSchema
        };
        if (this.schema.useStopWords === 'OFF')
            options.stopWords = [];
        if (this.schema.useStopWords === 'CUSTOM')
            options.stopWords = this.schema.stopWords;
        await this.client.createIndex(options);
    }
    async dropIndex() {
        try {
            await this.client.dropIndex(this.schema.indexName);
        }
        catch (e) {
            if (e instanceof Error && e.message === "Unknown Index name") {
            }
            else {
                throw e;
            }
        }
    }
    createEntity(data = {}) {
        let id = this.schema.generateId();
        let entity = new this.schema.entityCtor(this.schema.definition, id);
        for (let key in data) {
            if (this.schema.entityCtor.prototype.hasOwnProperty(key)) {
                entity[key] = data[key];
            }
        }
        return entity;
    }
    async save(entity) {
        let key = this.makeKey(entity.entityId);
        if (Object.keys(entity.entityData).length === 0) {
            await this.client.unlink(key);
            return entity.entityId;
        }
        if (this.schema.dataStructure === 'JSON') {
            let jsonData = this.jsonConverter.toJsonData(entity.entityData);
            await this.client.jsonset(key, jsonData);
        }
        else {
            let hashData = this.hashConverter.toHashData(entity.entityData);
            await this.client.hsetall(key, hashData);
        }
        return entity.entityId;
    }
    async createAndSave(data = {}) {
        let entity = this.createEntity(data);
        await this.save(entity);
        return entity;
    }
    async fetch(id) {
        let key = this.makeKey(id);
        let entityData = {};
        if (this.schema.dataStructure === 'JSON') {
            let jsonData = await this.client.jsonget(key);
            entityData = this.jsonConverter.toEntityData(jsonData);
        }
        else {
            let hashData = await this.client.hgetall(key);
            entityData = this.hashConverter.toEntityData(hashData);
        }
        let entity = new this.schema.entityCtor(this.schema.definition, id, entityData);
        return entity;
    }
    async remove(id) {
        let key = this.makeKey(id);
        await this.client.unlink(key);
    }
    search() {
        return new search_1.default(this.schema, this.client);
    }
    makeKey(id) {
        return `${this.schema.prefix}:${id}`;
    }
}
exports.default = Repository;
Repository.Map = new Map();