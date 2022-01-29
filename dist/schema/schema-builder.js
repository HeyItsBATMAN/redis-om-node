"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SchemaBuilder {
    constructor(schema) {
        this.schema = schema;
    }
    get redisSchema() {
        if (this.schema.dataStructure === 'JSON')
            return this.buildJsonSchema();
        if (this.schema.dataStructure === 'HASH')
            return this.buildHashSchema();
        throw Error("'FOO' in an invalid data structure. Valid data structures are 'HASH' and 'JSON'.");
    }
    buildHashSchema() {
        let redisSchema = [];
        for (let field in this.schema.definition) {
            redisSchema.push(...this.buildHashSchemaEntry(field));
        }
        return redisSchema;
    }
    buildJsonSchema() {
        let redisSchema = [];
        for (let field in this.schema.definition) {
            redisSchema.push(...this.buildJsonSchemaEntry(field));
        }
        return redisSchema;
    }
    buildHashSchemaEntry(field) {
        var _a, _b, _c;
        let schemaEntry = [];
        let fieldDef = this.schema.definition[field];
        let fieldType = fieldDef.type;
        let fieldAlias = (_a = fieldDef.alias) !== null && _a !== void 0 ? _a : field;
        schemaEntry.push(fieldAlias);
        if (fieldType === 'boolean')
            schemaEntry.push('TAG');
        if (fieldType === 'number')
            schemaEntry.push('NUMERIC');
        if (fieldType === 'array')
            schemaEntry.push('TAG', 'SEPARATOR', (_b = fieldDef.separator) !== null && _b !== void 0 ? _b : '|');
        if (fieldType === 'string' || fieldType === 'relation') {
            if (fieldDef.textSearch)
                schemaEntry.push('TEXT');
            else
                schemaEntry.push('TAG', 'SEPARATOR', (_c = fieldDef.separator) !== null && _c !== void 0 ? _c : '|');
        }
        return schemaEntry;
    }
    buildJsonSchemaEntry(field) {
        var _a, _b;
        let schemaEntry = [];
        let fieldDef = this.schema.definition[field];
        let fieldType = fieldDef.type;
        let fieldAlias = (_a = fieldDef.alias) !== null && _a !== void 0 ? _a : field;
        let fieldPath = `\$.${fieldAlias}${fieldType === 'array' ? '[*]' : ''}`;
        schemaEntry.push(fieldPath, 'AS', fieldAlias);
        if (fieldType === 'boolean')
            schemaEntry.push('TAG');
        if (fieldType === 'number')
            schemaEntry.push('NUMERIC');
        if (fieldType === 'array' || fieldType === 'relation-array')
            schemaEntry.push('TAG');
        if (fieldType === 'string' || fieldType === 'relation') {
            if (fieldDef.textSearch)
                schemaEntry.push('TEXT');
            else
                schemaEntry.push('TAG', 'SEPARATOR', (_b = fieldDef.separator) !== null && _b !== void 0 ? _b : '|');
        }
        return schemaEntry;
    }
}
exports.default = SchemaBuilder;