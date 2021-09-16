import { JsonValue } from 'type-fest';
import { defaultSerialization, SERIALIZABLE, Serialization } from './internal';
import { SerializeContext } from './interfaces';
import { register } from './registry';

/**
 * 序列化
 */
export function serialize(obj: unknown, context: SerializeContext): JsonValue {
    if ((obj && typeof obj == 'object') || typeof obj == 'function') {
        if (Array.isArray(obj)) {
            return obj.map((o) => serialize(o, context));
        }
        const serializer = Reflect.get(obj.constructor, SERIALIZABLE) as Serialization<object> | undefined;
        const serialized = serializer?.serialize ? serializer.serialize(obj, context) : defaultSerialization.serialize(obj, context);
        serialized.__type__ = obj.constructor.name;
        register(obj.constructor);
        return serialized;
    } else {
        return obj as JsonValue;
    }
}

/**
 * 序列化
 */
export function serializeJSON(obj: unknown, context: SerializeContext = {}): string {
    const json = serialize(obj, context);
    return JSON.stringify(json);
}
