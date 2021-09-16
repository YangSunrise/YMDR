import { Type } from '../interfaces';
import { EnumClass } from '../enum-class';
import { isObject } from 'lodash-es';

// eslint-disable-next-line @typescript-eslint/unbound-method
const isPrototypeOf = Object.prototype.isPrototypeOf;
/**
 * d 是否为 b 的字类
 */
export function isStrictExtends<B extends Type>(d: Type, b: B): d is B {
    return isPrototypeOf.call(b, d);
}

/**
 * d 是否为 b 的字类或 d === b
 */
export function isExtends<B extends Type>(d: Type, b: B): d is B {
    return d === b || isStrictExtends(d, b);
}

/**
 * 是否为枚举类
 */
export function isEnumClass(type: Type): type is typeof EnumClass {
    return isStrictExtends(type, EnumClass);
}

/**
 * 是否为不可更改的标量类型
 */
export function isScalar(value: unknown): boolean {
    if (!isObject(value)) return true;
    if (value instanceof EnumClass) return true;

    return false;
}
