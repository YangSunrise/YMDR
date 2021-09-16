import { UndoableOperation } from './undoable-operation';
import { BindableObject, KeyOf } from '@/bindable';
import { get } from 'lodash-es';
import store from '@/store';
/**
 *设置组件属性的可撤销类
 */
export class SetComponentPropertyOperation extends UndoableOperation {
    constructor(path: Array<string | number>, value: never) {
        super();
        this.path = [...path];
        this.key = this.path.pop() as KeyOf<BindableObject>;
        const components = store.getters.getCompsData;
        this.oldValue = get(components, this.path)[this.key] as never;
        this.newValue = value;
    }
    /** */
    path: Array<string | number>;

    /** */
    key: KeyOf<BindableObject>;
    /** */
    newValue: never;
    /** */
    oldValue: never;

    /**
     *撤销
     */
    undo(): void {
        (get(store.getters.getCompsData, this.path) as BindableObject).set(this.key, this.oldValue);
    }
    /**
     *恢复
     */
    redo(): void {
        (get(store.getters.getCompsData, this.path) as BindableObject).set(this.key, this.newValue);
    }

    /**
     *执行
     */
    do(): void {
        this.redo();
    }
}
