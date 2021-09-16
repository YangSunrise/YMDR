import { ConverterInfo } from './interfaces';
import { Primitive, Type } from '../interfaces';
import { Serializable } from '@/bindable';

/**
 * 表示一个值转换器。
 *
 * 声明的转换器需要用 `@Converter()` 修饰才能使用。
 * `convert`、`multiConvert` 和 `convertBack` 需要分别用 `@Convert()` 和 `@ConvertBack()` 修饰。
 */
@Serializable()
export abstract class ValueConverter<F = unknown, T = unknown> {
    /** 转换数据 */
    abstract convert(value: F, parameter?: string, targetType?: Type<T>): T;
    /** 转换多重绑定数据 */
    multiConvert?(value: readonly F[], parameter?: string, targetType?: Type<T>): T;
    /** 反向转换，对于双向绑定，必须实现 */
    convertBack?(value: T, parameter?: string, targetType?: Type<T>): F;

    /** 是否支持双向转换 */
    get bidirectional(): boolean {
        return typeof this.convertBack == 'function';
    }

    /** 是否支持多重绑定转换 */
    get multi(): boolean {
        return typeof this.multiConvert == 'function';
    }

    /** 表示转换失败的值，指当前的 `value` 无法转换为目标值，但是 `value` 更新后转换可能成功 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static readonly FAILED: any = Symbol('Conversion failed');

    /** 表示转换失败的值，指当前 `parameter` 对该转换器无效，即使用当前 `parameter` 无论 `value` 输入何值转换均不会成功 */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static readonly INVALID_PARAMETER: any = Symbol('Invalid converter parameter');

    /** 检查输入是否为预定义的无效值 */
    static isFailedValue(value: unknown): boolean {
        return value === this.FAILED || value === this.INVALID_PARAMETER;
    }

    /** 转换器的信息 */
    info!: ConverterInfo;

    /** 转换器的信息 */
    from!: Type | Primitive;

    /** 转换器的信息 */
    to!: Type | Primitive;
}
