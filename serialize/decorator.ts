import { Type } from '../interfaces';
import { SERIALIZABLE, ignore, Serialization } from './internal';
import { register } from './registry';

/** 表示一个类可以进行序列化和反序列化 */
export function Serializable<T extends object = object>(serializer?: Partial<Serialization<T>>): (target: Type<T>) => void {
    return (target) => {
        if (serializer) {
            Object.defineProperty(target, SERIALIZABLE, {
                value: new Serialization(serializer),
            });
        }
        register(target);
    };
}

/** 当使用默认的序列化器时，忽略指定的属性 */
export function Ignore(): PropertyDecorator {
    return (target, key) => {
        if (typeof key === 'symbol') throw new Error('Symbol prop is not allowed');
        ignore(target.constructor)[key] = true;
    };
}

/** 当使用默认的序列化器时，包含指定的属性 */
export function Include(): PropertyDecorator {
    return (target, key) => {
        if (typeof key === 'symbol') throw new Error('Symbol prop is not allowed');
        ignore(target.constructor)[key] = false;
    };
}
