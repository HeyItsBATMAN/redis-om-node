"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
class HashConverter {
    constructor(schemaDef) {
        this.schemaDef = schemaDef;
    }
    toHashData(entityData) {
        var _a, _b;
        let hashData = {};
        for (let field in this.schemaDef) {
            let value = entityData[field];
            const typeValue = typeof (value);
            if (value === undefined)
                continue;
            let fieldDef = this.schemaDef[field];
            if (fieldDef.type === 'number')
                hashData[field] = value.toString();
            if (fieldDef.type === 'boolean')
                hashData[field] = value ? '1' : '0';
            if (fieldDef.type === 'array')
                hashData[field] = value.join((_a = fieldDef.separator) !== null && _a !== void 0 ? _a : '|');
            if (fieldDef.type === 'relation-array') {
                hashData[field] = value.map(v => typeof (v) === 'string' ? v : v.entityId).join((_b = fieldDef.separator) !== null && _b !== void 0 ? _b : '|');
            }
            if (fieldDef.type === 'string')
                hashData[field] = value;
            if (fieldDef.type === 'relation') {
                if (typeValue === 'string')
                    hashData[field] = value;
                else if (typeValue === 'object')
                    hashData[field] = value.entityId;
                else
                    throw new __1.RedisError(`Value of type ${typeValue} does not match expected types 'object' or 'string' needed for field type 'relation'`);
            }
        }
        return hashData;
    }
    toEntityData(hashData) {
        let entityData = {};
        for (let field in this.schemaDef) {
            let value = hashData[field];
            if (value !== undefined) {
                let fieldDef = this.schemaDef[field];
                if (fieldDef.type === 'number')
                    this.addNumber(field, entityData, value);
                if (fieldDef.type === 'boolean')
                    this.addBoolean(field, entityData, value);
                if (fieldDef.type === 'array' || fieldDef.type === 'relation-array')
                    this.addArray(field, fieldDef, entityData, value);
                if (fieldDef.type === 'string' || fieldDef.type === 'relation')
                    this.addString(field, entityData, value);
            }
        }
        return entityData;
    }
    addNumber(field, entityData, value) {
        let parsed = Number.parseFloat(value);
        if (Number.isNaN(parsed))
            throw Error(`Non-numeric value of '${value}' read from Redis for number field '${field}'`);
        entityData[field] = Number.parseFloat(value);
    }
    addBoolean(field, entityData, value) {
        if (value === '0') {
            entityData[field] = false;
        }
        else if (value === '1') {
            entityData[field] = true;
        }
        else {
            throw Error(`Non-boolean value of '${value}' read from Redis for boolean field '${field}'`);
        }
    }
    addArray(field, fieldDef, entityData, value) {
        var _a;
        entityData[field] = value.split((_a = fieldDef.separator) !== null && _a !== void 0 ? _a : '|');
    }
    addString(field, entityData, value) {
        entityData[field] = value;
    }
}
exports.default = HashConverter;
