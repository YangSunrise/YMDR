import { JsonValue } from 'type-fest';
import { SERIALIZABLE, defaultSerialization, Serialization } from './internal';
import { SerializeContext } from './interfaces';
import { Constructable } from '../interfaces';
import { registry } from './registry';

/**
 * 反序列化
 */
export function deserialize(json: JsonValue, context: SerializeContext): unknown {
    if (json && (typeof json == 'function' || typeof json == 'object')) {
        if (Array.isArray(json)) {
            const result = [];
            for (const iterator of json) {
                result.push(deserialize(iterator, context));
            }
            return result;
        }
        const type = json.__type__;
        if (typeof type != 'string') {
            // 这是一个普通对象
            return json;
        }
        const constructor = registry.get(type);
        if (!constructor) {
            throw new Error(`Unknown type ${type}, missing @Serializable() on the class?`);
        }
        json.__type__ = undefined;
        const serializer = Reflect.get(constructor, SERIALIZABLE) as Serialization<object> | undefined;
        return serializer?.deserialize
            ? serializer.deserialize(constructor as Constructable, json, context)
            : defaultSerialization.deserialize(constructor as Constructable, json, context);
    } else {
        return json;
    }
}

/**
 * 反序列化
 */
export function deserializeJSON(json: string, context: SerializeContext = {}): unknown {
    const obj = JSON.parse(json);
    return deserialize(obj, context);
}
