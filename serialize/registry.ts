import { Type } from '../interfaces';
import { Registry, ReadonlyRegistry } from '../registry';
import { serialize } from './serialize';
import { JsonValue } from 'type-fest';

export const registry = new Registry('Serializable');

const ignoreTypes: readonly Type[] = [
    // 默认处理器能够正确处理
    Object,
    // 直接报错
    Function,
    String,
    Number,
    Symbol,
    Boolean,
    Map,
    Set,
    // 已经添加特殊处理
    Array,
];

registry.add(Object);

// primitive types
registry.add(String);
registry.add(Number);
registry.add(Boolean);
registry.add(Symbol);

/**
 * 调用序列化逻辑
 */

/**
 *
 */
function toJSON(this: unknown): JsonValue {
    return serialize(this, {});
}

/**
 * 注册类型以便其能够正确反序列化
 */
export function register(type: Type): void {
    if (ignoreTypes.includes(type)) return;
    if (!registry.has(type)) {
        registry.add(type);
        Object.defineProperty(type.prototype, 'toJSON', {
            value: toJSON,
        });
    }
}

export const readonlyRegistry: ReadonlyRegistry<object> = registry;
