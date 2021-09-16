import { Serializable, Ignore } from '../serialize';
import { EventEmitted, EventRuntimeInfo, Task } from './interfaces';
import { BindableObject } from '../object';
import { messaging, getComp, designMode } from '../messaging';

/**
 * 表示一个事件
 */
@Serializable({
    deserialize(type, json, context) {
        const result = super.deserialize(type, json, context);
        if (context.object && context.object instanceof BindableObject && context.key) {
            Reflect.set(result, 'owner', context.object);
            Reflect.set(result, 'name', context.key);
        }
        return result;
    },
})
export class BindableEvent {
    /** 事件所属的元素 */
    @Ignore()
    readonly owner!: BindableObject;
    /** 事件所属的元素的声明名称 */
    @Ignore()
    readonly name!: string;

    /** 表示事件触发后要进行的操作 */
    tasks: Task[] = new Array<Task>();

    /**
     * 执行操作
     */
    private static execute(task: Task, args: EventEmitted<BindableObject>): Promise<void> {
        const comp = getComp(task.sourceKey);
        if (!comp) {
            console.warn(`${task.sourceKey} 未找到`, task);
            return Promise.resolve();
        }
        const action = Reflect.get(comp, task.actionName) as (args: EventEmitted<BindableObject>) => void | Promise<void>;
        if (typeof action != 'function') {
            console.error(`${task.actionName} 不是一个操作`, { task, comp });
            return Promise.reject(new Error(`${task.actionName} 不是一个操作`));
        }
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                Promise.resolve(action.call(comp, args)).then(resolve, reject);
            }, 0);
        });
    }
    /**
     * 触发事件
     */
    async emit(): Promise<void> {
        const args: EventEmitted<BindableObject> = {
            sender: this.owner,
            eventName: name,
            event: this,
        };
        if (designMode.value) {
            console.warn('事件在设计模式下触发', args);
            return;
        }
        messaging().$emit('eventEmitted', args);
        const tasks = this.tasks;
        if (!tasks || tasks.length === 0) return;

        await Promise.all(tasks.map((task) => BindableEvent.execute(task, args)));
    }

    /** 创建事件的实例 */
    static create(info: EventRuntimeInfo, owner: BindableObject): BindableEvent {
        const ev = info.factory(owner, info.key);
        Reflect.set(ev, 'owner', owner);
        Reflect.set(ev, 'name', info.key);
        return ev;
    }
}
