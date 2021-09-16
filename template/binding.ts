import { ValueConverterKey } from '../converter';
import { Serializable } from '../serialize';
import { DefaultConverter } from '../converter/implements';
import { BindingBase, ElementBinding, BidirectionalElementBinding } from '../binding';
import { loaders } from './loader';

/**
 * 用于 @see TemplatedProperty 的模板绑定，将编译为 @see ElementBinding
 */
@Serializable()
export class ElementBindingTemplate<TP> extends BindingBase<TP> {
    constructor(
        readonly path?: ReadonlyArray<string | number>,
        readonly converter: ValueConverterKey = ValueConverterKey(DefaultConverter),
        readonly converterParameter?: string,
    ) {
        super(converter);
    }
    /**
     * 不实现，必须加载后使用
     */
    exec(): boolean {
        return false;
    }
}

loaders.set(ElementBindingTemplate.name, (template, context) => {
    const path = (template.path ?? []) as ReadonlyArray<string | number>;
    return {
        ...template,
        __type__: ElementBinding.name,
        sourceKey: context.source,
        path: [...context.sourceProperty, ...path],
    };
});

/**
 * 用于 @see TemplatedProperty 的模板绑定，将编译为 @see BidirectionalElementBinding
 */
@Serializable()
export class BidirectionalElementBindingTemplate<TP> extends ElementBindingTemplate<TP> {}

loaders.set(BidirectionalElementBindingTemplate.name, (template, context) => {
    const path = (template.path ?? []) as ReadonlyArray<string | number>;
    return {
        ...template,
        __type__: BidirectionalElementBinding.name,
        sourceKey: context.source,
        path: [...context.sourceProperty, ...path],
    };
});
