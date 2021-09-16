import { BindableObject } from '../object';
import { BindingBase } from './base';
import { ValueConverter, ValueConverterKey } from '../converter';
import { PropertyChanged } from '../property';
import { ObjectKey, isObjectKey } from '../object/key';
import { messaging, getComp } from '../messaging';
import { Ignore, Serializable, Include } from '../serialize';
import { DefaultConverter } from '../converter/implements';

/**
 * 绑定到其他 @see BindableObject 的属性上
 */
@Serializable()
export class ElementBinding<TP, TSource extends BindableObject> extends BindingBase<TP> {
    constructor(
        source?: TSource | ObjectKey,
        path?: ReadonlyArray<string | number>,
        converter: ValueConverterKey = ValueConverterKey(DefaultConverter),
        readonly converterParameter?: string,
    ) {
        super(converter);
        Object.defineProperty(this, '_path', { writable: true });
        if (source) {
            if (isObjectKey(source)) this.sourceKey = source;
            else this.sourceKey = source.key;
        }
        if (path) {
            this.path = path;
        }
        messaging<TSource>().$on('propertyChanged', (ev) => this.onBindableObject(ev));
    }
    /** 绑定源 */
    public sourceKey!: ObjectKey;

    /** 解析后的路径 */
    @Ignore()
    private segments: Array<[string | number, ObjectKey | undefined]> = [];
    /** 属性路径 */
    @Ignore()
    private _path!: ReadonlyArray<string | number>;
    /** 属性路径 */
    @Include()
    public get path(): ReadonlyArray<string | number> {
        return this._path;
    }
    public set path(value: ReadonlyArray<string | number>) {
        if (this._path === value) return;
        this._path = value;
        this.updatePath();
    }

    /** 更新属性路径 */
    private updatePath(source?: TSource): void {
        const prop = this._path;
        this.segments = prop.map((s) => [s, undefined]);
        source = source ?? this.getComp();
        if (!source) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let current: any = source;
        for (const iterator of this.segments) {
            current = current[iterator[0]];
            if (current == null) break;
            if (current instanceof BindableObject) {
                iterator[1] = current.key;
            }
        }
    }
    /** 进行转换，调用回调 */
    private handle(value: unknown): boolean {
        if (!this.onChanged) return false;
        const cv = this._converter ? this._converter.convert(value, this.converterParameter, this.targetType) : (value as TP);
        if (cv === ValueConverter.FAILED) {
            console.warn(`ElementBinding 转换失败`, { binding: this, value });
            return false;
        }
        this.onChanged(cv);
        return true;
    }

    /**
     * 监听属性更改事件
     */
    private onBindableObject(ev: PropertyChanged<TSource>): void {
        if (this.sourceKey == null || this.segments == null || this.segments.length <= 0) {
            return;
        }
        let key: ObjectKey | undefined = this.sourceKey;
        let prop = this.segments[0][0];
        for (let i = -1; i < this.segments.length - 1; ) {
            if (ev.sender.key === key && ev.property === prop) {
                this.exec(ev.sender.key === this.sourceKey ? ev.sender : undefined);
                break;
            }
            i++;
            key = this.segments[i][1];
            prop = this.segments[i + 1]?.[0];
        }
    }

    /**
     * @inheritdoc
     */
    exec(source?: TSource): boolean {
        if (!this.onChanged) return false;
        source = source ?? this.getComp();
        if (!source) return false;
        this.updatePath(source);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let current: any = source;
        for (const iterator of this.segments) {
            current = current[iterator[0]];
            if (current == null) break;
        }
        return this.handle(current);
    }

    /**
     * 获取绑定源
     */
    protected getComp(): TSource | undefined {
        return getComp(this.sourceKey) as TSource;
    }
}
