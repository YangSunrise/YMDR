import { Serializable, Ignore } from '../serialize';
import { Type } from '../interfaces';
import { converters, ValueConverter, ValueConverterKey } from '../converter';
import { DefaultConverter } from '../converter/implements';
import { BidirectionalBinding } from './bidirectional';

/**
 * 表示一个绑定
 */
@Serializable()
export abstract class BindingBase<TP> {
    /** 绑定源的值更改时调用的回调，设置绑定时由绑定目标设置 */
    @Ignore()
    onChanged?: (newValue: TP) => void;
    /** 目标属性类型，设置绑定时由绑定目标设置 */
    @Ignore()
    targetType?: Type<TP>;
    /**
     * 主动触发回调以更新属性
     *
     * @returns 更新是否成功
     */
    abstract exec(): boolean;

    constructor(readonly converter: ValueConverterKey = ValueConverterKey(DefaultConverter)) {}

    /** 转换器 */
    protected get _converter(): ValueConverter<unknown, TP> | undefined {
        return this.converter ? (converters.get(this.converter) as ValueConverter<unknown, TP>) : undefined;
    }

    /** 检查当前绑定是否为双向绑定 */
    asBidirectional(): (this & BidirectionalBinding<TP>) | undefined {
        if (typeof ((this as unknown) as BidirectionalBinding<TP>).updateSource == 'function') {
            return this as this & BidirectionalBinding<TP>;
        }
        return undefined;
    }
}
