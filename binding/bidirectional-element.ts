import { BindableObject } from '../object';
import { ValueConverter, ValueConverterKey } from '../converter';
import { ObjectKey } from '../object/key';
import { Serializable } from '../serialize';
import { DefaultConverter } from '../converter/implements';
import { BidirectionalBinding } from './bidirectional';
import { ElementBinding } from './element';
import { KeyOf } from '../interfaces';

/**
 * 双向绑定到其他 @see BindableObject 的属性上
 */
@Serializable()
export class BidirectionalElementBinding<TP, TSource extends BindableObject> extends ElementBinding<TP, TSource> implements BidirectionalBinding<TP> {
    constructor(
        source?: TSource | ObjectKey,
        path?: ReadonlyArray<string | number>,
        converter: ValueConverterKey = ValueConverterKey(DefaultConverter),
        converterParameter?: string,
    ) {
        super(source, path, converter, converterParameter);
    }

    /** @inheritdoc */
    updateSource(targetValue: TP): boolean {
        // 找到需要赋值的对象
        const path = this.path;
        if (path.length <= 0) return false;
        let sourceComp: BindableObject | undefined = this.getComp();
        let updateComp: BindableObject = sourceComp as BindableObject;
        let updateKey: string | number = path[0];
        for (let index = 0; index < path.length - 1; index++) {
            if (!sourceComp) return false;
            sourceComp = (sourceComp[path[index] as KeyOf<BindableObject>] as unknown) as BindableObject;
            if (sourceComp instanceof BindableObject) {
                updateComp = sourceComp;
                updateKey = path[index + 1];
            }
        }
        if (!sourceComp) return false;

        // 计算需要设置的值
        let sv: unknown = targetValue;
        const converter = this._converter;
        if (converter) {
            if (!converter.convertBack) {
                console.warn(`${this.converter} is not bidirectional.`);
                return false;
            }
            sv = converter.convertBack(targetValue, this.converterParameter, undefined);
        }
        if (ValueConverter.isFailedValue(sv)) return false;

        // 赋值
        if (sourceComp instanceof BindableObject) {
            sourceComp.update(path[path.length - 1] as KeyOf<BindableObject>, sv as BindableObject[KeyOf<BindableObject>]);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sourceComp as any)[path[path.length - 1]] = sv;
            updateComp.update(updateKey as KeyOf<BindableObject>, updateComp[updateKey as KeyOf<BindableObject>]);
        }
        return true;
    }
}
