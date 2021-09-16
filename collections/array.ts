import { Abstract, Type } from '../interfaces';

/**
 *
 */
interface TypedArrayConstructor<T> extends Abstract<T[]> {
    /**
     *
     */
    readonly elementType: Type<T>;
    new (arrayLength: number): T[];
    new (...items: T[]): T[];
}

const cache = new Map<Type, TypedArrayConstructor<unknown>>();

/**
 *
 */
export function TypedArray<T>(elementType: Type<T>): TypedArrayConstructor<T> {
    const cached = cache.get(elementType);
    if (cached) return cached as TypedArrayConstructor<T>;
    const built = class TypedArray extends Array<T> {
        /** */
        static elementType = elementType;
    };
    Object.defineProperty(built, 'name', {
        value: `${elementType.name}Array`,
    });
    cache.set(elementType, (built as unknown) as TypedArrayConstructor<unknown>);
    return built;
}

const ObjectArray = TypedArray<object>(Object);
/**
 *
 */
export type TypedObjectArray = typeof ObjectArray;
