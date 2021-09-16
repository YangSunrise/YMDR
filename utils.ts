/**
 * 在类上注册字段，或获取已经注册的字段
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function getOrDefineField<U, T extends Function>(target: T, key: symbol, def: U): U {
    if (!Object.prototype.hasOwnProperty.call(target, key)) {
        if (def === undefined) return (undefined as unknown) as U;
        Object.defineProperty(target, key, {
            configurable: true,
            value: def,
        });
    }
    return Reflect.get(target, key) as U;
}

/**
 * 在类上注册Map字段，或获取已经注册的Map字段，并自动集成基类信息
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function getOrDefineMap<U, T extends Function>(target: T, key: symbol): Record<string, U> {
    if (!Object.prototype.hasOwnProperty.call(target, key)) {
        Object.defineProperty(target, key, {
            configurable: true,
            value: { ...Reflect.get(target, key) },
        });
    }
    return Reflect.get(target, key) as Record<string, U>;
}
