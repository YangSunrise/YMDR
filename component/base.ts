import { Component, getCompInfo } from './decorator';
import { BindableObject, ObjectMetadata } from '../object';
import { BindableDomEvent, EventBinding, Property } from '@/bindable';
import { CompMetadata } from '@/bindable';
import { Trigger } from '@/component-templates/render-type/trigger';

/**
 *树节点
 */
export class BindableTreeNode extends BindableObject {
    /**
     *
     */
    static get info(): CompMetadata {
        return {
            ...(super.info as ObjectMetadata<ComponentBase>),
            ...getCompInfo(this),
        };
    }
    /** */
    @Property({ desc: '名称' })
    name!: string;
    /** */
    @Property({ desc: 'zIndex', def: 1 })
    zIndex!: number;
    /** */
    @Property({ desc: '父节点id', def: 'Config' })
    parentId!: string;
    /** */
    @Property({ desc: '隐藏 / 显示', def: true, tag: '基础', type: Trigger })
    display!: boolean;
    /** */
    @Property({ desc: '设计模式显示 / 隐藏', def: true })
    designModeDisplay!: boolean;
}

/**
 *
 */
@Component({})
export class ComponentBase extends BindableTreeNode {
    /**
     *
     */
    static get info(): CompMetadata {
        return {
            ...(super.info as ObjectMetadata<ComponentBase>),
            ...getCompInfo(this),
        };
    }

    constructor() {
        super();
        const objInfo = new.target.info;
        if (objInfo.vueComponent == null) {
            throw new TypeError('Abstract class');
        }
    }

    /** */
    @Property({ desc: '名称' })
    name!: string;
    /** */
    @Property({ desc: 'zIndex', def: 1 })
    zIndex!: number;
    /** */
    @Property({ desc: '标题', def: '' })
    title!: string;
    /** */
    @Property({ desc: '宽度', def: 300, tag: '基础' })
    width!: number;
    /** */
    @Property({ desc: '高度', def: 300, tag: '基础' })
    height!: number;
    /** */
    @Property({ desc: '纵坐标', def: 0, tag: '基础' })
    top!: number;
    /** */
    @Property({ desc: '横坐标', def: 0, tag: '基础' })
    left!: number;

    /** */
    @EventBinding({ desc: '单击' }, () => new BindableDomEvent('click'))
    click!: BindableDomEvent;
    /** */
    @EventBinding({ desc: '双击' }, () => new BindableDomEvent('dblclick'))
    dblclick!: BindableDomEvent;
}
