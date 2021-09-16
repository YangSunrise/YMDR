import { Opaque } from 'type-fest';
import { v4 as uuidV4 } from 'uuid';
import type { BindableObject } from './base';

/**
 * 用于标记 @see BindableObject 的 UUID
 */
export type ObjectKey = Opaque<string, BindableObject>;
/**
 * 生成一个 UUID
 */
export function ObjectKey(): ObjectKey {
    return uuidV4() as ObjectKey;
}
/**
 * 检查一个 UUID
 */
export function isObjectKey(key: unknown): key is ObjectKey {
    return typeof key === 'string';
}
