import { BindingBase } from './base';
import { ValueConverter, ValueConverterKey } from '../converter';
import { Ignore, Include, Serializable } from '../serialize';
import { DefaultConverter } from '../converter/implements';

/**
 * 绑定到多个绑定源
 */
@Serializable()
export class MultiBinding<TP> extends BindingBase<TP> {
    constructor(
        sources: ReadonlyArray<BindingBase<TP>>,
        converter: ValueConverterKey = ValueConverterKey(DefaultConverter),
        readonly converterParameter?: string,
    ) {
        super(converter);
        this.sources = sources;
    }

    /** 多个绑定数据源 */
    @Ignore()
    _sources: ReadonlyArray<BindingBase<TP>> = [];
    /** 多个绑定数据源 */
    @Include()
    get sources(): ReadonlyArray<BindingBase<TP>> {
        return this._sources;
    }
    /** 多个绑定数据源 */
    set sources(value: ReadonlyArray<BindingBase<TP>>) {
        if (!value) value = [];
        value.forEach((s, i) => {
            if (s.onChanged) throw new Error(`the binding sources[${i}] has bond to ${String(s.onChanged)}`);
        });

        this._sources.forEach((s) => (s.onChanged = undefined));
        this.values.length = 0;

        this._sources = Array.from(value);
        this._sources.forEach((s, i) => {
            s.onChanged = this.onSourceChanged.bind(this, i);
        });
        this.values.length = this._sources.length;
    }

    /** 绑定的当前值 */
    @Ignore()
    private readonly values: unknown[] = [];
    /** 防止重入 */
    @Ignore()
    private reentering = false;
    /**
     * 处理绑定源更新
     */
    private onSourceChanged(index: number, value: unknown): void {
        this.values[index] = value;
        if (this.reentering) return;
        this.update();
    }
    /**
     * 更新绑定值
     */
    private update(): void {
        if (!this.onChanged) return;
        const converter = this._converter;
        const values = Array.from(this.values);
        let cv: TP;
        if (!converter) {
            cv = (values as unknown) as TP;
        } else if (converter.multiConvert) {
            cv = converter.multiConvert(values, this.converterParameter, this.targetType);
        } else {
            cv = converter.convert(values, this.converterParameter, this.targetType);
        }
        if (cv !== ValueConverter.FAILED) {
            this.onChanged(cv);
        } else {
            console.warn(`MultiBinding 转换失败`, { binding: this, value: values });
        }
    }

    /**
     * @inheritdoc
     */
    exec(): boolean {
        try {
            this.reentering = true;
            const succeed = this.sources.every((s) => s.exec());
            if (succeed) {
                this.update();
            }
            return succeed;
        } finally {
            this.reentering = false;
        }
    }
}
