import { Type, Constructable } from '../interfaces';
import { getOrDefineMap } from '../utils';
import { SerializeContext } from './interfaces';
import { JsonObject } from 'type-fest';
import { serialize } from './serialize';
import { deserialize } from './deserialize';

/**
 *
 */
export function ignore(target: Type): Record<string, boolean | undefined> {
    return getOrDefineMap(target, IGNORE);
}

/**
 * 序列化和反序列化逻辑
 */
export class Serialization<T extends object = object> {
    constructor(impl?: Partial<Serialization<T>>) {
        if (!impl) return;
        if (Object.getPrototypeOf(impl) !== Object.prototype) {
            if (!impl.serialize) impl.serialize = this.serialize.bind(impl);
            if (!impl.deserialize) impl.deserialize = this.deserialize.bind(impl);
            return impl as Serialization<T>;
        }
        Object.setPrototypeOf(impl, new.target.prototype);
        return impl as Serialization<T>;
    }
    /**
     * 序列化
     */
    serialize(value: T, context: SerializeContext): JsonObject {
        const v = value as Record<string, unknown>;
        const copy: JsonObject = {};
        const ignores = ignore(v.constructor);
        const keys = new Set([...Object.keys(v), ...Object.keys(ignores)]);
        keys.forEach((k) => {
            if (!ignores[k]) {
                copy[k] = serialize(v[k], context);
            }
        });
        return copy;
    }
    /**
     * 反序列化
     */
    deserialize(type: Constructable<T>, json: JsonObject, context: SerializeContext): T {
        const value = new type();
        const v = value as Record<string, unknown>;
        for (const key in json) {
            const element = json[key];
            if (element !== undefined) {
                try {
                    v[key] = deserialize(element, context);
                } catch (e) {
                    console.log(e);
                }
            }
        }
        return value;
    }
}

export const defaultSerialization = new Serialization();

export const SERIALIZABLE = Symbol('Serializable');
export const IGNORE = Symbol('Ignore');
