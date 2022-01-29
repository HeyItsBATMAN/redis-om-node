"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ulid_1 = require("ulid");
const __1 = require("..");
const schema_builder_1 = __importDefault(require("./schema-builder"));
class Schema {
    constructor(ctor, schemaDef, options) {
        this.entityCtor = ctor;
        this.definition = schemaDef;
        this.options = options;
        this.validateOptions();
        this.defineProperties();
    }
    get prefix() { var _a, _b; return (_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.prefix) !== null && _b !== void 0 ? _b : this.entityCtor.name; }
    get indexName() { var _a, _b; return (_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.indexName) !== null && _b !== void 0 ? _b : `${this.prefix}:index`; }
    get dataStructure() { var _a, _b; return (_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.dataStructure) !== null && _b !== void 0 ? _b : 'HASH'; }
    get useStopWords() { var _a, _b; return (_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.useStopWords) !== null && _b !== void 0 ? _b : 'DEFAULT'; }
    get stopWords() { var _a, _b; return (_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.stopWords) !== null && _b !== void 0 ? _b : []; }
    get redisSchema() { return new schema_builder_1.default(this).redisSchema; }
    generateId() {
        var _a, _b;
        let ulidStrategy = () => (0, ulid_1.ulid)();
        return ((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.idStrategy) !== null && _b !== void 0 ? _b : ulidStrategy)();
    }
    defineProperties() {
        var _a;
        let entityName = this.entityCtor.name;
        for (let field in this.definition) {
            this.validateFieldDef(field);
            let fieldDef = this.definition[field];
            let fieldType = fieldDef.type;
            let fieldAlias = (_a = fieldDef.alias) !== null && _a !== void 0 ? _a : field;
            Object.defineProperty(this.entityCtor.prototype, field, {
                configurable: true,
                get: function () {
                    var _a;
                    return (_a = this.entityData[fieldAlias]) !== null && _a !== void 0 ? _a : null;
                },
                set: function (value) {
                    if (value === undefined) {
                        throw Error(`Property '${field}' on entity of type '${entityName}' cannot be set to undefined. Use null instead.`);
                    }
                    else if (value === null) {
                        delete this.entityData[fieldAlias];
                    }
                    else {
                        let isArray = Array.isArray(value);
                        let valueType = isArray ? 'array' : typeof (value);
                        if (fieldType === valueType) {
                            if (isArray) {
                                this.entityData[fieldAlias] = value.map((v) => v.toString());
                            }
                            else {
                                this.entityData[fieldAlias] = value;
                            }
                        }
                        else if (fieldType === 'relation' && valueType === 'object') {
                            if (value.entityId) {
                                this.entityData[fieldAlias] = value.entityId;
                            }
                            else {
                                throw new __1.RedisError(`Attempted to save type of 'relation' at property ${field} but found no entityId`);
                            }
                        }
                        else if (fieldType === 'relation-array') {
                            if (isArray) {
                                this.entityData[fieldAlias] = value.map((v) => v.entityId);
                            }
                            else {
                                throw new __1.RedisError(`Expected array of entityIds for type 'relation-array' but got ${value} instead`);
                            }
                        }
                        else {
                            throw new __1.RedisError(`Property '${field}' expected type of '${fieldType}' but received type of '${valueType}'.`);
                        }
                    }
                }
            });
        }
    }
    validateOptions() {
        var _a;
        if (!['HASH', 'JSON'].includes(this.dataStructure))
            throw Error(`'${this.dataStructure}' in an invalid data structure. Valid data structures are 'HASH' and 'JSON'.`);
        if (!['OFF', 'DEFAULT', 'CUSTOM'].includes(this.useStopWords))
            throw Error(`'${this.useStopWords}' in an invalid value for stop words. Valid values are 'OFF', 'DEFAULT', and 'CUSTOM'.`);
        if (((_a = this.options) === null || _a === void 0 ? void 0 : _a.idStrategy) && !(this.options.idStrategy instanceof Function))
            throw Error("ID strategy must be a function that takes no arguments and returns a string.");
        if (this.prefix === '')
            throw Error(`Prefix must be a non-empty string.`);
        if (this.indexName === '')
            throw Error(`Index name must be a non-empty string.`);
    }
    validateFieldDef(field) {
        let fieldDef = this.definition[field];
        if (!['array', 'boolean', 'number', 'string', 'relation', 'relation-array'].includes(fieldDef.type))
            throw Error(`The field '${field}' is configured with a type of '${fieldDef.type}'. Valid types include 'array', 'boolean', 'number', 'string', 'relation' and 'relation-array'.`);
    }
}
exports.default = Schema;