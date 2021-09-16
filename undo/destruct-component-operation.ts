import { BindableTreeNode, UndoableOperation } from '@/bindable';
import store from '@/store';
import { LayerManagement } from '@/components/ts/LayerMannagement';
import { VueInstance } from '@/main';
/**
 *
 */
export class DestructComponentOperation extends UndoableOperation {
    constructor(key: string) {
        super();
        this.key = key;
        this.treeNode = store.getters.getCompsData[this.key] as BindableTreeNode;
        for (const item in store.getters.getCompsData) {
            if (store.getters.getCompsData[item].parentId === this.key) {
                this.childrenKeyList.push(item);
            }
        }
    }
    /** */
    key: string;

    /** */
    childrenKeyList = new Array<string>();

    /** 用于存储被删除的组件 */
    treeNode: BindableTreeNode;
    /**
     *
     *撤销
     */
    undo(): void {
        if (this.key === 'Config') return;
        const instance = this.treeNode;
        const componentList = store.getters.getCompsData as Record<string, BindableTreeNode>;
        VueInstance.$set(store.getters.getCompsData, instance.key, instance);
        for (const item of this.childrenKeyList) {
            componentList[item].set('parentId', this.key);
        }
        LayerManagement.addLayer(this.key, instance.zIndex);
    }
    /**
     *恢复
     */
    redo(): void {
        store.commit('destructionCompDataUndoUnable', this.key);
        LayerManagement.deleteLayer(this.key);
    }
    /**
     *执行
     */
    do(): void {
        this.redo();
    }
}
