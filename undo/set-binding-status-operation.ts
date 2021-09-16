import { UndoableOperation } from '@/bindable/undo/undoable-operation';
import { BindableObject, BindingBase, ElementBinding, KeyOf } from '@/bindable';
import { get } from 'lodash-es';
import store from '@/store';
import { Opaque } from 'type-fest';

/**
 *设置绑定状态
 */
export class SetBindingStatusOperation extends UndoableOperation {
    constructor(path: Array<string | number>, status: 'binding' | 'local' | 'default', targetClass?: BindingBase<number | Opaque<string, BindableObject>>) {
        super();
        this.path = [...path];
        this.key = this.path.pop() as KeyOf<BindableObject>;
        this.targetClass = targetClass;
        this.newStatus = status;
        const instance = get(store.getters.getCompsData, this.path) as BindableObject;
        //判定之前绑定状态
        if (instance.bindings[this.key] instanceof ElementBinding) {
            this.oldStatus = 'binding';
            this.oldTargetClass = instance.bindings[this.key];
        } else if (instance.bindings[this.key] === undefined) {
            this.oldStatus = 'local';
            this.oldValue = instance[this.key] as never;
        } else {
            this.oldStatus = 'default';
        }
    }

    /** */
    path: Array<string | number>;
    /** */
    key: KeyOf<BindableObject>;
    /** */
    targetClass: BindingBase<number | Opaque<string, BindableObject>> | undefined;

    /** */
    oldTargetClass: BindingBase<BindableObject['id']> | null | undefined | BindingBase<BindableObject['key']>;
    /** */
    newStatus: 'binding' | 'local' | 'default';
    /** */
    oldStatus: 'binding' | 'local' | 'default';
    /** */
    oldValue: never;
    /**
     *撤销
     */
    undo(): void {
        const instance = get(store.getters.getCompsData, this.path) as BindableObject;
        if (this.oldStatus === 'binding') {
            if (this.oldTargetClass) {
                instance.bind(this.key, this.oldTargetClass as BindingBase<number | Opaque<string, BindableObject>>);
            }
        } else if (this.oldStatus === 'local') {
            instance.set(this.key, this.oldValue);
        } else {
            instance.unset(this.key);
        }
    }
    /**
     *恢复
     */
    redo(): void {
        const instance = get(store.getters.getCompsData, this.path) as BindableObject;
        if (this.newStatus === 'binding') {
            if (this.targetClass) {
                instance.bind(this.key, this.targetClass);
            }
        } else if (this.newStatus === 'local') {
            instance.set(this.key, instance[this.key]);
        } else if (this.newStatus === 'default') {
            instance.unset(this.key);
        }
    }
    /**
     *执行
     */
    do(): void {
        this.redo();
    }
}
