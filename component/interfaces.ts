import type { VueConstructor } from 'vue';
import { ObjectMetadata } from '../object';
import { ComponentBase } from './base';

/**
 * 控件的元数据
 */
export interface CompInfo {
    /**
     *
     */
    vueComponent?: VueConstructor;
    /**
     *
     */
    desc?: string;
    /**
     *
     */
    icon?: string;

    /**
     *不显示，当一个组件预览模式完全不需要显示的时候，此属性应该为true
     */
    isNoDisplay?: boolean;
}

/**
 * 控件的完整元数据
 */
export interface CompMetadata<T extends ComponentBase = ComponentBase> extends CompInfo, ObjectMetadata<T> {}
