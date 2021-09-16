import { BindableObject } from './object';

/**
 * 表示一个抽象类型
 */
export interface Abstract<T extends object = object> extends Function {
    /** 实例原型 */
    readonly prototype: T;
}

/**
 * 表示一个可构造类型
 */
export interface Constructable<T extends object = object> extends Abstract<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): T;
}

/**
 * 表示一个 class
 */
export type Class<T extends object = object> = Abstract<T> | Constructable<T>;

/**
 * 基础类型的表示
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Primitive<T = any> = T extends string
    ? typeof String
    : T extends number
    ? typeof Number
    : T extends boolean
    ? typeof Boolean
    : T extends symbol
    ? typeof Symbol // : T extends bigint ? typeof BigInt
    : never;

/**
 * 表示一个类型
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Type<T = any> = T extends object ? Class<T> : Primitive<T>;

/**
 * 包含基础类型在内的可构造类型
 */
export type ConstructorOf<T> = T extends String // eslint-disable-line @typescript-eslint/ban-types
    ? typeof String
    : T extends Number // eslint-disable-line @typescript-eslint/ban-types
    ? typeof Number
    : T extends Boolean // eslint-disable-line @typescript-eslint/ban-types
    ? typeof Boolean
    : T extends Symbol // eslint-disable-line @typescript-eslint/ban-types
    ? typeof Symbol
    : T extends BigInt // eslint-disable-line @typescript-eslint/ban-types
    ? typeof BigInt
    : T extends Object // eslint-disable-line @typescript-eslint/ban-types
    ? Constructable<T> // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : never;

/**
 * 字段的元数据信息
 */
export interface FieldInfo {
    /**
     * 描述
     */
    desc: string;
    /** 详细描述 */
    details?: string;
    /**
     * 一级标签
     */
    tag?: string;
    /**
     * 二级标签
     */
    subTag?: string;
}
/**
 * 字段的完整元数据信息
 */
export interface FieldRuntimeInfo extends FieldInfo {
    /**
     * 字段的键名
     */
    key: string;
    /** 字段类型 */
    fieldType: string;
    /** 字段数据类型 */
    type: Type;
}

/**
 * 表示字段元数据的 map
 */
export type FieldInfoMap<U, T> = Record<keyof T, U>;

/**
 * BindableObject 的键名
 */
export type KeyOf<T extends BindableObject> = Exclude<keyof T, keyof BindableObject> | 'id' | 'key';
