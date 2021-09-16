import { UndoableOperation } from './undoable-operation';
/**
 *撤销栈管理器
 */
export class UndoStackManager {
    /**撤销栈 */
    static undoStack = new Array<UndoableOperation>();
    /** 恢复栈*/
    static redoStack = new Array<UndoableOperation>();
    /**
     *添加操作
     */
    static pushOperation(operation: UndoableOperation): void {
        operation.do();
        this.redoStack.length = 0;
        this.undoStack.push(operation);
        if (this.undoStack.length > 999) {
            this.undoStack.shift();
        }
    }

    /**
     *撤销
     */
    static undo(): void {
        const operation = this.undoStack.pop();
        if (operation) {
            operation.undo();
            this.redoStack.push(operation);
        }
    }

    /**
     *恢复
     */
    static redo(): void {
        const operation = this.redoStack.pop();
        if (operation) {
            operation.redo();
            this.undoStack.push(operation);
        }
    }

    /**
     *获取栈长
     */
    static getUndoStackLength(): number {
        return this.undoStack.length;
    }
}
