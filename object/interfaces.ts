import { BindableObject } from './base';
import { Type } from '../interfaces';
import { PropInfoMap } from '../property';
import { EventInfoMap } from '../event';
import { ActionInfoMap } from '../action';

/**
 * 对象的元数据
 */
export interface ObjectMetadata<T extends BindableObject = BindableObject> {
    /** 类名 */
    name: string;
    /** 类型 */
    type: Type<T>;
    /**
     * 属性定义
     */
    properties: PropInfoMap<T>;
    /** 图标 */
    icon?: string;
    /**
     *是否不需要显示
     */
    isNoDisplay?: boolean;
    /**
     * 事件定义
     */
    events: EventInfoMap<T>;
    /** 操作定义 */
    actions: ActionInfoMap<T>;
}
