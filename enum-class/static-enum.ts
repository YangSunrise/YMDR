import { EnumClass } from './base';
import { EnumInfo } from './interfaces';

/**
 * 用于 @see StaticEnum 的字类，声明一个枚举成员
 *
 * @example
 * ```ts
 * class MyEnum extends StaticEnum {
 *     @EnumValue({ description: '值1' })
 *     static value1: MyEnum;
 *     @EnumValue({ description: '值2' })
 *     static value2: MyEnum;
 *     @EnumValue({ description: '值3' })
 *     static value3: MyEnum;
 * }
 * ```
 */
export function EnumValue(info: EnumInfo): PropertyDecorator {
    /** 装饰器 */
    const decorator = (target: typeof StaticEnum, propertyKey: string | symbol): void => {
        const key = String(propertyKey);
        const k = (target as unknown) as {
            new (key: string): StaticEnum;
            _values: StaticEnum[];
            _info: Record<string, EnumInfo>;
        };
        if (!Object.prototype.hasOwnProperty.call(k, '_values')) k._values = k._values ? [...k._values] : [];
        if (!Object.prototype.hasOwnProperty.call(k, '_info')) k._info = k._info ? { ...k._info } : {};
        const instance = new k(key);
        Object.defineProperty(target, key, {
            value: instance,
            enumerable: true,
        });
        k._info[key] = info;
        k._values.push(instance);
    };
    return decorator as PropertyDecorator;
}

/**
 * 表示静态成员的枚举，所有枚举成员都是预先定义的
 * 使用 @see EnumValue 定义成员
 */
export abstract class StaticEnum extends EnumClass {
    /** */
    private static _values: StaticEnum[];
    /** */
    private static _info: Record<string, EnumInfo>;
    /** @inheritdoc */
    static values(): readonly StaticEnum[] {
        if (!this._values) throw new Error(`Can't use this class directly.`);
        return this._values;
    }
    /** @inheritdoc */
    static value(key: string): StaticEnum | undefined {
        if (key in this._info) {
            return ((this as unknown) as Record<string, StaticEnum>)[key];
        }
        return undefined;
    }
    /** @inheritdoc */
    info(): EnumInfo {
        return (Object.getPrototypeOf(this).constructor as typeof StaticEnum)._info[this.key];
    }
}
