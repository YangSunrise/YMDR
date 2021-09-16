import type { FieldInfo, FieldRuntimeInfo, FieldInfoMap, KeyOf, Constructable } from '../interfaces';
import type { BindableObject } from '../object';
import type { BindableEvent } from './base';
import { ObjectKey } from '../object/key';

/**
 * 表示事件的元数据
 */
export interface EventInfo extends FieldInfo {
    /**
     * 事件的类型
     */
    type?: Constructable<BindableEvent>;
}

/**
 * 表示事件的完整元数据
 */
export interface EventRuntimeInfo extends EventInfo, FieldRuntimeInfo {
    /** @inheritdoc */
    type: Constructable<BindableEvent>;
    /** @inheritdoc */
    fieldType: 'event';
    /**
     * 用于构造事件的方法
     */
    factory: (obj: BindableObject, key: string) => BindableEvent;
}

/**
 * 事件元数据 Map
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventInfoMap<T = any> = FieldInfoMap<EventRuntimeInfo, T>;

/**
 *
 */
export interface EventEmitted<T extends BindableObject = BindableObject, P extends KeyOf<T> = KeyOf<T>> {
    /** 触发事件的源 BindableObject */
    sender: T;
    /** 事件的名称 */
    eventName: P;
    /** 事件的定义，即 `sender[eventName]` */
    event: BindableEvent;
}

/** */
export interface Task {
    /** 操作所在 @see BindableObject 的 key */
    sourceKey: ObjectKey;
    /** 操作的名称 */
    actionName: string;
}
