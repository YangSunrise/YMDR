import { UndoableOperation } from '@/bindable/undo/undoable-operation';
import store from '@/store';
import { ComponentBase } from '@/bindable';
import { VueInstance } from '@/main';
import { fromJSON } from '@/component-templates/fromJSON';
import { LayerManagement } from '@/components/ts/LayerMannagement';

/**
 *
 */
export class AddComponentByInstanceOperation extends UndoableOperation {
    constructor(instance: ComponentBase) {
        super();
        this.instance = instance;
        this.componentKey = instance.key;
        this.componentJson = JSON.stringify(instance);
    }
    /** */
    componentKey = '';
    /** */
    componentJson: string;
    /** */
    instance: ComponentBase;
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
        VueInstance.$set(store.getters.getCompsData, this.instance.key, this.instance);
        LayerManagement.addLayer(this.componentKey);
    }
}
