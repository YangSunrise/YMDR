import type { Type, FieldInfo, FieldRuntimeInfo, FieldInfoMap, KeyOf } from '../interfaces';
import type { BindableObject } from '../object';
import { Primitive } from 'type-fest';
import { EnumClass } from '../enum-class';

/**
 * 表示属性的元数据
 */
export interface PropInfo extends FieldInfo {
    /**
     * 默认值或生成默认值的工厂方法
     * 对于对象类型，必须使用后者
     */
    def?: Primitive | EnumClass | (() => unknown);
    /** 是否对该属性使用双向绑定 */
    preferBidirectional?: boolean;
    /**
     * 属性的类型，留空使用 TS 反射的元数据
     */
    type?: Type;
    /** 标识模板属性 */
    templated?: boolean;
}
/**
 * 属性当前状态
 */
export type PropState = 'local' | 'default' | 'binding';

/**
 * 表示属性的完整元数据
 */
export interface PropRuntimeInfo extends PropInfo, FieldRuntimeInfo {
    /**
     * 属性当前状态
     */
    state: PropState;
    /** @inheritdoc */
    type: Type;
    /** @inheritdoc */
    fieldType: 'prop';
}

/**
 * 属性元数据 Map
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PropInfoMap<T = any> = FieldInfoMap<PropRuntimeInfo, T>;

/**
 * 属性更改事件
 */
export interface PropertyChanged<T extends BindableObject = BindableObject, P extends KeyOf<T> = KeyOf<T>> {
    /**
     * 属性更改的元素
     */
    sender: T;
    /**
     * 更改的属性
     */
    property: P;
    /**
     * 属性值
     */
    value: T[P];
}
