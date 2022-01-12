"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class JsonConverter {
    constructor(schemaDef) {
        this.schemaDef = schemaDef;
    }
    toJsonData(entityData) {
        for (let field in this.schemaDef) {
            const fieldType = this.schemaDef[field].type;
            const value = entityData[field];
            if (fieldType === 'relation') {
                if (typeof entityData[field] === 'string')
                    continue;
                entityData[field] = entityData[field].entityId;
            }
            else if (fieldType === 'relation-array') {
                if (Array.isArray(value)) {
                    entityData[field] = value.map((v) => typeof (v) === 'string' ? v : v.entityId);
                }
            }
        }
        return entityData;
    }
    toEntityData(jsonData) {
        let entityData = {};
        if (jsonData === null)
            return entityData;
        for (let field in this.schemaDef) {
            let value = jsonData[field];
            if (value !== undefined && value !== null)
                entityData[field] = value;
        }
        return entityData;
    }
}
exports.default = JsonConverter;
