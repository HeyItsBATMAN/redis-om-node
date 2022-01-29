"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const repository_1 = __importDefault(require("../repository/repository"));
class Entity {
    constructor(schemaDef, id, data = {}) {
        this.schemaDef = schemaDef;
        this.entityId = id;
        this.entityData = data;
    }
    toJSON(opts) {
        opts = { clean: true, hide: true, ...opts };
        const { clean, hide } = opts;
        let json = { entityId: this.entityId };
        for (let key in this.schemaDef) {
            if (hide && this.schemaDef[key].hidden)
                continue;
            const value = this[key];
            if (clean && (value === undefined || value === null))
                continue;
            json[key] = value;
        }
        return json;
    }
    async populate(fields, jsonOpts) {
        for (const field of fields) {
            if (!this.schemaDef.hasOwnProperty(field))
                continue;
            const fieldDef = this.schemaDef[field];
            const fieldType = fieldDef.type;
            const value = this[field];
            if (fieldType === 'relation') {
                if (!value || typeof value !== 'string')
                    continue;
                const repository = repository_1.default.get(fieldDef.repository);
                if (!repository)
                    continue;
                const fetchResult = await repository.fetch(value);
                this.entityData[field] = fetchResult.toJSON(jsonOpts);
            }
            else if (fieldType === 'relation-array') {
                const repository = repository_1.default.get(fieldDef.repository);
                if (!repository)
                    continue;
                const promises = value.map((v) => repository.fetch(v));
                const fetchResults = await Promise.all(promises);
                if (fetchResults.length === 0)
                    continue;
                this.entityData[field] = fetchResults.map((v) => v.toJSON(jsonOpts));
            }
        }
    }
}
exports.default = Entity;
