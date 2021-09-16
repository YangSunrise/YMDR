import type { EventInfo, EventInfoMap, EventRuntimeInfo } from './interfaces';
import type { BindableObject } from '../object';
import type { Type, Constructable } from '../interfaces';
import type { BindableEvent } from './base';
import { getOrDefineMap } from '../utils';
import { Include } from '../serialize';

const EVENT = Symbol('Event');

/**
 *
 */
export function getEventMap(target: Type<BindableObject>): EventInfoMap {
    return getOrDefineMap(target, EVENT);
}

/**
 *
 * 事件定义
 * 定义一个组件的事件
 *
 * ```
 * @Component()
 * class Button extends FrameworkElement {
 *      @EventBinding({ desc: "单击", tag: 'aa' }, (obj) => new BindableDomEvent('click'))
 *      click!: BindableDomEvent;
 * }
 *
 * ```
 * */
export function EventBinding<T extends Constructable<BindableEvent>>(
    info: EventInfo,
    factory: (obj: BindableObject, key: string) => InstanceType<T>,
): PropertyDecorator {
    const deco = (target: BindableObject, key: string | symbol): void => {
        if (typeof key === 'symbol') throw new Error('Symbol prop is not allowed');
        const type = info.type ?? (Reflect.getMetadata('design:type', target, key) as Constructable<BindableEvent>) ?? Object;
        const rtInfo: EventRuntimeInfo = {
            ...info,
            type,
            key,
            factory,
            fieldType: 'event',
        };
        getEventMap(target.constructor)[key as keyof BindableObject] = Object.freeze(rtInfo);

        // 序列化事件
        Include()(target, key);
    };
    return deco as PropertyDecorator;
}
