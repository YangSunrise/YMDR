import { UndoableOperation } from '@/bindable/undo/undoable-operation';
import { BindableDomEvent, ComponentBase, KeyOf, messaging, Task } from '@/bindable';
import store from '@/store';
/**
 *给组件设置任务
 */
export class SetComponentEventTaskOperation extends UndoableOperation {
    constructor(key: string, eventName: string, taskList: Task[]) {
        super();
        this.key = key;
        this.eventName = eventName;
        this.newTaskList = taskList;
        const instance = store.getters.getCompsDataByKey(this.key) as ComponentBase;
        this.oldTaskList = ((instance[this.eventName as KeyOf<ComponentBase>] as unknown) as BindableDomEvent).tasks ?? [];
    }
    /** */
    key: string;
    /** */
    eventName: string;
    /** */
    newTaskList: Task[];
    /** */
    oldTaskList: Task[];
    /**
     *撤销
     */
    undo(): void {
        const instance = store.getters.getCompsDataByKey(this.key) as ComponentBase;
        ((instance[this.eventName as KeyOf<ComponentBase>] as unknown) as BindableDomEvent).tasks = this.oldTaskList;
        //手动触发vue更新视图
        messaging().$emit(`refreshTaskList`, this.key);
    }

    /**
     *恢复
     */
    redo(): void {
        const instance = store.getters.getCompsDataByKey(this.key) as ComponentBase;
        ((instance[this.eventName as KeyOf<ComponentBase>] as unknown) as BindableDomEvent).tasks = this.newTaskList;
        //手动触发vue更新视图
        messaging().$emit(`refreshTaskList`, this.key);
    }

    /**
     *执行
     */
    do(): void {
        this.redo();
    }
}
