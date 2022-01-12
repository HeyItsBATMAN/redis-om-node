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
    toJSON() {
        let json = { entityId: this.entityId };
        for (let key in this.schemaDef) {
            if (this.schemaDef[key].hidden)
                continue;
            json[key] = this[key];
        }
        return json;
    }
    async populate(fields) {
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
                this.entityData[field] = fetchResult.toJSON();
            }
            else if (fieldType === 'relation-array') {
                const repository = repository_1.default.get(fieldDef.repository);
                if (!repository)
                    continue;
                const fetchResults = await Promise.all(value.map((v) => repository.fetch(v)));
                this.entityData[field] = fetchResults.map((v) => v.toJSON());
            }
        }
    }
}
exports.default = Entity;
