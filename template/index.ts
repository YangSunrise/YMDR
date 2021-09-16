import { JsonValue } from 'type-fest';
import { BindableObject, isObjectKey, ObjectKey } from '../object';
import { deserialize, serialize } from '../serialize';
import { compileTemplate, LoaderContext } from './loader';

/**
 * 模板加载选项
 */
export interface LoadOptions {
    /**
     * 绑定到的对象
     */
    source: BindableObject | ObjectKey;
    /**
     * 绑定到的属性路径
     */
    sourceProperty: ReadonlyArray<string | number>;
}

/**
 * 表示一个序列化的模板
 */
export class Template<T extends BindableObject> {
    constructor(template: T) {
        console.log(serialize);
        this.template = serialize(template, {});
    }
    /** 序列化后的模板内容 */
    readonly template: JsonValue;

    /**
     * 编译模板
     */
    load(options: LoadOptions): T {
        console.log('load template');
        const context: LoaderContext = {
            ...options,
            source: isObjectKey(options.source) ? options.source : options.source.key,
        };
        const t = compileTemplate(this.template, context);
        return deserialize(t as JsonValue, { new: true }) as T;
    }
}

export * from './binding';
export * from './decorator';
