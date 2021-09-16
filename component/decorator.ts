import { CompInfo } from '@/bindable';
import { BindableObject } from '../object';
import { Type } from '@/bindable';
import { Components } from '@/bindable';
import { ComponentBase } from './base';
import { getOrDefineField } from '../utils';
import { register } from '../serialize';

const COMPONENT = Symbol('Component');

/**
 * 获取元件信息
 */
export function getCompInfo(target: Type<BindableObject>): CompInfo {
    return getOrDefineField(target, COMPONENT, {} as CompInfo);
}

/**
 * 类装饰器
 * 定义一个组件，并将组件存储到全局的 `Components`
 * ```
 * @Component({ abstract: true })
 * class Button extends FrameworkElement {
 *      @Property({ desc: "前景色", def: "#FFFFFF", tag: 'aa' })
 *      foreground!: string;
 * }
 *
 * ```
 * */
export function Component(compInfo: CompInfo): ClassDecorator {
    const deco = (target: typeof ComponentBase): void => {
        const base = Object.getPrototypeOf(target) as Type<BindableObject>;
        const baseInfo = getCompInfo(base);
        getOrDefineField<CompInfo, typeof ComponentBase>(target, COMPONENT, {
            ...baseInfo,
            ...compInfo,
        });

        if (compInfo.vueComponent) Components.add(target);
        register(target);
    };
    return deco as ClassDecorator;
}
