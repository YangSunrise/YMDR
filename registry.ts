import { Type } from './interfaces';
import { ComponentBase } from './component';

/** 表示注册表的只读部分接口 */
export interface ReadonlyRegistry<T extends object, V extends Type<T> = Type<T>> {
    /**
     *
     */
    get(key: string): V | undefined;
    /**
     *
     */
    has(key: string): boolean;
    /**
     *
     */
    has(value: V): boolean;
    /**
     *
     */
    forEach(callbackfn: (value: V, key: string, registry: this) => void, thisArg?: unknown): void;
    /**
     *
     */
    readonly size: number;
    /** Returns an iterable of entries in the map. */
    [Symbol.iterator](): IterableIterator<[string, V]>;

    /**
     * Returns an iterable of key, value pairs for every entry in the map.
     */
    entries(): IterableIterator<[string, V]>;

    /**
     * Returns an iterable of keys in the map
     */
    keys(): IterableIterator<string>;

    /**
     * Returns an iterable of values in the map
     */
    values(): IterableIterator<V>;
}

/** 表示一个类型的注册表 */
export class Registry<T extends object, V extends Type<T> = Type<T>> implements ReadonlyRegistry<T, V> {
    /** 已经建立的注册表集合 */
    private static readonly _registries: Record<string, Registry<object>> = {};
    /** 已经建立的注册表集合 */
    static get registries(): Readonly<Record<string, ReadonlyRegistry<object>>> {
        return this._registries;
    }

    /** 创建一个注册表，并放入 @see Registry.registries */
    constructor(
        /** 注册表的名字 */
        readonly name: string,
        /** 校验加入注册表元素合法性的校验函数 */
        readonly predicate?: (value: V) => boolean,
    ) {
        if (name in Registry._registries) {
            throw new Error(`Registry with name '${name}' has been created`);
        }
        Registry._registries[name] = (this as unknown) as Registry<object>;
    }

    /** */
    private storage = new Map<string, V>();

    /**
     *
     */
    add(value: V): string {
        const key = value.name;
        if (this.predicate?.(value) === false) {
            throw new Error(`${name} registry: class with name ${key} is not allowed by predicate`);
        }
        if (this.storage.has(key)) {
            throw new Error(`${name} registry: class with name ${key} has been registered`);
        }
        this.storage.set(key, value);
        return key;
    }
    /**
     *
     */
    get(key: string): V | undefined {
        return this.storage.get(key);
    }

    has(key: string): boolean;
    has(value: V): boolean;
    /**
     *
     */
    has(obj: string | V): boolean {
        if (typeof obj === 'function') {
            const store = this.storage.get(obj.name);
            return store === obj;
        } else {
            return this.storage.has(obj);
        }
    }
    /**
     *
     */
    clear(): void {
        this.storage.clear();
    }
    delete(key: string): boolean;
    delete(value: V): boolean;
    /**
     *
     */
    delete(obj: string | V): boolean {
        if (typeof obj === 'function') {
            const store = this.storage.get(obj.name);
            if (store === obj) {
                return this.storage.delete(obj.name);
            }
            return false;
        } else {
            return this.storage.delete(obj);
        }
    }
    /**
     *
     */
    forEach(callbackfn: (value: V, key: string, registry: this) => void, thisArg?: unknown): void {
        this.storage.forEach((v, k) => {
            callbackfn.call(thisArg, v, k, this);
        });
    }
    /**
     *
     */
    get size(): number {
        return this.storage.size;
    }
    /** Returns an iterable of entries in the map. */
    [Symbol.iterator](): IterableIterator<[string, V]> {
        return this.storage[Symbol.iterator]();
    }

    /**
     * Returns an iterable of key, value pairs for every entry in the map.
     */
    entries(): IterableIterator<[string, V]> {
        return this.storage.entries();
    }

    /**
     * Returns an iterable of keys in the map
     */
    keys(): IterableIterator<string> {
        return this.storage.keys();
    }

    /**
     * Returns an iterable of values in the map
     */
    values(): IterableIterator<V> {
        return this.storage.values();
    }
}

export const Components = new Registry<ComponentBase, typeof ComponentBase>('Components');
