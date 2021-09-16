import { UndoableOperation } from '@/bindable/undo/undoable-operation';
import { BindableObject, KeyOf } from '@/bindable';
import store from '@/store';
import { get } from 'lodash-es';

/**
 *批量设置组件属性
 */
export class BatchSetComponentPropertyOperation extends UndoableOperation {
    constructor(
        data: Array<{
            path: Array<string | number>;
            value: never;
        }>,
    ) {
        super();
        const components = store.getters.getCompsData;
        this.dataList = data.map((item) => {
            const path = [...item.path];
            const key = path.pop() as KeyOf<BindableObject>;
            return {
                path: path,
                key: key,
                oldValue: get(components, path)[key] as never,
                newValue: item.value,
            };
        });
    }
    /**批量操作数据列表*/
    dataList: Array<{
        key: KeyOf<BindableObject>;
        path: Array<string | number>;
        oldValue: never;
        newValue: never;
    }>;
    /**
     *撤销
     */
    undo(): void {
        this.dataList.forEach((item) => {
            (get(store.getters.getCompsData, item.path) as BindableObject).set(item.key, item.oldValue);
        });
    }
    /**
     *恢复
     */
    redo(): void {
        this.dataList.forEach((item) => {
            (get(store.getters.getCompsData, item.path) as BindableObject).set(item.key, item.newValue);
        });
    }

    /**
     *执行
     */
    do(): void {
        this.redo();
    }
}
