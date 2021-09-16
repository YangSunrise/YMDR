import { BindableObject } from '../object';

/**
 * 用于序列化和反序列化时的上下文
 */
export interface SerializeContext {
    /**
     * 正在序列化/反序列化的对象
     */
    object?: BindableObject;
    /**
     * 正在序列化/反序列化的属性名称
     */
    key?: string;
    /**
     * 反序列化时忽略 BindableObject 的 id 和 key，使用自动生成的新值
     */
    new?: boolean;
    /**
     * 序列化时忽略默认值
     */
    excludeDefaults?: boolean;
    /**
     * 序列化时忽略绑定值的当前内容
     */
    excludeBindings?: boolean;
    [k: string]: unknown;
}
