import type { PropInfo, PropInfoMap, PropRuntimeInfo } from './interfaces';
import type { Type } from '../interfaces';
import type { BindableObject } from '../object';
import { getOrDefineMap } from '../utils';

const PROPERTY = Symbol('Property');

/**
 *
 */
export function getPropMap(target: Type): PropInfoMap {
    return getOrDefineMap(target, PROPERTY);
}

/**
 *
 * 属性定义
 * 定义一个组件的属性
 *
 * ```
 * @Component()
 * class Button extends FrameworkElement {
 *      @Property({ desc: "前景色", def: "#FFFFFF", tag: 'aa' })
 *      foreground!: string;
 * }
 *
 * ```
 * */
export function Property(info: PropInfo): PropertyDecorator {
    const prop = (target: BindableObject, key: string | symbol): void => {
        if (typeof key === 'symbol') throw new Error('Symbol prop is not allowed');
        const type = info.type ?? (Reflect.getMetadata('design:type', target, key) as Type) ?? Object;
        const rtInfo: PropRuntimeInfo = {
            ...info,
            key,
            state: 'default',
            type,
            fieldType: 'prop',
        };
        getPropMap(target.constructor)[key as keyof BindableObject] = Object.freeze(rtInfo);
    };
    return prop as PropertyDecorator;
}
