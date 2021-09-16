import { cloneDeep, isObject } from 'lodash-es';
import { JsonObject, JsonValue } from 'type-fest';
import { ObjectKey } from '../object';

export const loaders = new Map<string, (template: JsonObject, context: LoaderContext) => JsonValue>();

/**
 * 编译模板需要的上下文
 */
export interface LoaderContext {
    /**
     * 绑定到的对象 key
     */
    source: ObjectKey;
    /**
     * 绑定到的属性路径
     */
    sourceProperty: ReadonlyArray<string | number>;
}

/**
 * 编译模板
 */
export function compileTemplate(template: JsonValue | undefined, context: LoaderContext): JsonValue | undefined {
    if (!isObject(template)) return template;
    if (Array.isArray(template)) {
        return template.map((v) => compileTemplate(v, context) ?? null);
    }
    template = cloneDeep(template);
    const loader = loaders.get(template.__type__ as string);
    if (!loader) {
        for (const key in template) {
            const v = compileTemplate(template[key], context);
            if (v) template[key] = v;
        }
        return template;
    }
    return loader(template, context);
}
