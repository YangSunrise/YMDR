import type { Constructable, Type } from '../interfaces';
import type { ValueConverter } from './base';
import { Opaque } from 'type-fest';
import { ConverterInfo } from './interfaces';

/** 转换器的类名 */
export type ValueConverterKey = Opaque<string, ValueConverter>;
/** 转换器的类名 */
export function ValueConverterKey(k: string | Type<ValueConverter>): ValueConverterKey {
    if (typeof k == 'function') return k.name as ValueConverterKey;
    if (typeof k == 'string' && k) return k as ValueConverterKey;
    throw new Error(`"${k}" is not a valid ValueConverterKey`);
}

const _converters = new Map<string, ValueConverter>();
export const converters = (_converters as unknown) as ReadonlyMap<ValueConverterKey, ValueConverter>;

/**
 * 生成错误信息中的名称
 */
function n(t?: Type): string {
    if (t == null) return '<undefined>';
    return t?.name ?? String(t);
}

/**
 * 注册一个转换器
 */
export function Converter(info: ConverterInfo): (target: Constructable<ValueConverter>) => void {
    return (target) => {
        if (_converters.has(target.name)) {
            throw new Error(`名为 ${target.name} 的转换器已经注册`);
        }
        const from = ((Reflect.getMetadata('design:paramtypes', target.prototype, 'convert') as Type[]) ?? [])[0];
        const to = Reflect.getMetadata('design:returntype', target.prototype, 'convert') as Type;
        if (!(from && to)) {
            throw new Error(`转换器 ${target.name} 的 convert(${n(from)} => ${n(to)}) 定义错误`);
        }

        if (target.prototype.multi) {
            const bFrom = ((Reflect.getMetadata('design:paramtypes', target.prototype, 'multiConvert') as Type[]) ?? [])[0];
            const bTo = Reflect.getMetadata('design:returntype', target.prototype, 'multiConvert') as Type;
            if (bTo !== to) {
                throw new Error(`转换器 ${target.name} 的 multiConvert(${n(from)} => ${n(to)}) 和 convert(${n(bFrom)} => ${n(bTo)}) 不匹配`);
            }
        }

        if (target.prototype.bidirectional) {
            const bFrom = ((Reflect.getMetadata('design:paramtypes', target.prototype, 'convertBack') as Type[]) ?? [])[0];
            const bTo = Reflect.getMetadata('design:returntype', target.prototype, 'convertBack') as Type;
            if (bFrom !== to || bTo !== from) {
                throw new Error(`转换器 ${target.name} 的 convert(${n(from)} => ${n(to)}) 和 convertBack(${n(bFrom)} => ${n(bTo)}) 不匹配`);
            }
        }

        const baseInfo = Object.getPrototypeOf(target.prototype)?.info;
        Object.defineProperties(target.prototype, {
            info: { value: { ...baseInfo, ...info } },
            from: { value: from },
            to: { value: to },
        });
        _converters.set(target.name, new target());
    };
}

/**
 * 修饰 convert 和 multiConvert 方法
 */
const Convert = function (resultType?: 'scalar' | 'object'): MethodDecorator {
    return ((target, key, desc: TypedPropertyDescriptor<(value: unknown, parameter?: string, targetType?: Type) => unknown>) => {
        const converter = desc.value;
        //如果为转换值为标量，覆写方法，值为数组则遍历数组
        if (resultType === 'scalar' && converter) {
            desc.value = function (value: unknown, parameter?: string, targetType?: Type): unknown {
                if (value != null && typeof value == 'object') {
                    if (Array.isArray(value)) {
                        return value.map((v) => converter.call(this, v, parameter, targetType));
                    } else {
                        const r: Record<string, unknown> = {};
                        for (const k in value) {
                            r[k] = converter.call(this, (value as Record<string, unknown>)[k], parameter, targetType);
                        }
                        return r;
                    }
                } else {
                    return converter.call(this, value, parameter, targetType);
                }
            };
        }
        return desc;
    }) as MethodDecorator;
};
/**
 * 修饰 convertBack 方法
 */
const ConvertBack = Convert;
export { Convert, ConvertBack };
