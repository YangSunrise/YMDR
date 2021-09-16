import { UndoableOperation } from '@/bindable/undo/undoable-operation';
import store from '@/store';
import { VueInstance } from '@/main';
import { fromJSON } from '@/component-templates/fromJSON';
import { compDict } from '@/store/interface';
import { LayerManagement } from '@/components/ts/LayerMannagement';

/**
 *通过组件名添加组件
 */
export class AddComponentByNameOperation extends UndoableOperation {
    constructor(componentName: keyof typeof compDict) {
        super();
        this.componentName = componentName;
    }
    /** */
    componentKey = '';
    /** */
    componentName: keyof typeof compDict;

    /** */
    componentJson = '';
    /**
     *撤销
     */
    undo(): void {
        store.commit('destructionCompDataUndoUnable', this.componentKey);
        LayerManagement.deleteLayer(this.componentKey);
    }
    /**
     *恢复
     */
    redo(): void {
        const instance = fromJSON(this.componentJson);
        VueInstance.$set(store.getters.getCompsData, instance.key, instance);
        LayerManagement.addLayer(this.componentKey);
    }

    /**
     *执行
     */
    do(): void {
        const instance: InstanceType<typeof compDict[keyof typeof compDict]> = new compDict[this.componentName]();
        this.componentKey = instance.key;
        VueInstance.$set(store.getters.getCompsData, instance.key, instance);
        this.componentJson = JSON.stringify(instance);
        LayerManagement.addLayer(this.componentKey);
    }
}
