import Vue from 'vue';
import { ObjectKey } from './object/key';
import { BindableObject } from './object';
import { eventBus } from '@/main';
import { BehaviorSubject } from 'rxjs';
import { PropertyChanged } from './property';
import { EventEmitted } from './event';
const _messaging = new Vue();
/**
 *
 */
export type BindableMessageMap<T extends BindableObject> = {
    propertyChanged: PropertyChanged<T>;
    eventEmitted: EventEmitted<T>;
};

/**
 * 消息总线接口
 */
interface Messaging<T extends BindableObject> extends Vue {
    /** 监听事件 */
    $on<E extends keyof BindableMessageMap<T>>(event: E, handler: (args: BindableMessageMap<T>[E]) => unknown): this;
    /** 监听事件 */
    $on(event: string | string[], handler: (...args: never[]) => unknown): this;
    /** */
    $once<E extends keyof BindableMessageMap<T>>(event: E, handler: (args: BindableMessageMap<T>[E]) => unknown): this;
    /** */
    $once(event: string | string[], handler: (...args: never[]) => unknown): this;
    /** 取消监听事件 */
    $off<E extends keyof BindableMessageMap<T>>(event: E, handler: (args: BindableMessageMap<T>[E]) => unknown): this;
    /** 取消监听事件 */
    $off(event?: string | string[], handler?: (...args: never[]) => unknown): this;
    /** 触发事件 */
    $emit<E extends keyof BindableMessageMap<T>>(event: E, args: BindableMessageMap<T>[E]): this;
    /** 触发事件 */
    $emit(event: string, ...args: unknown[]): this;
}

export const messaging = <T extends BindableObject = BindableObject>(): Messaging<T> => _messaging;

// TODO:
/**
 *
 */
export function getComp(key: ObjectKey): BindableObject | undefined {
    const comp = eventBus.$store.getters.getCompsDataByKey(key) as BindableObject;
    return comp;
}
/** 是否处于设计模式 */
export const designMode = new BehaviorSubject(true);
