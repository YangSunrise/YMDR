import type { Type } from '../interfaces';
import type { BindableObject } from '../object';
import type { ActionInfoMap, ActionInfo, ActionRuntimeInfo } from './interfaces';
import { getOrDefineMap } from '../utils';

const ACTION = Symbol('Action');

/**
 *
 */
export function getActionMap(target: Type): ActionInfoMap {
    return getOrDefineMap(target, ACTION);
}

/**
 * 定义一个组件的操作
 *
 * ```
 * @Component()
 * class Form extends FrameworkElement {
 *      @Action({ desc: "提交", tag: 'aa' })
 *      submit(): Promise<void> {
 *          // ...
 *     }
 * }
 * ```
 */
export function Action(info: ActionInfo): MethodDecorator {
    const deco = (target: BindableObject, key: string | symbol, _descriptor: PropertyDescriptor): void => {
        if (typeof key === 'symbol') throw new Error('Symbol prop is not allowed');
        const returnType = info.returnType ?? (Reflect.getMetadata('design:returntype', target, key) as Type) ?? Object;
        const paramTypes = [...((Reflect.getMetadata('design:paramtypes', target, key) as Type[]) ?? [])];
        info.paramTypes?.forEach((v, i) => {
            if (v) paramTypes[i] = v;
        });
        const rtInfo: ActionRuntimeInfo = {
            ...info,
            key,
            returnType,
            paramTypes,
            fieldType: 'action',
            type: Function,
        };
        getActionMap(target.constructor)[key as keyof BindableObject] = Object.freeze(rtInfo);
    };
    return deco as MethodDecorator;
}
