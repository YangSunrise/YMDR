/**
 *可撤销操作抽象类
 */
export abstract class UndoableOperation {
    /**
     *撤销
     */
    abstract undo(): void;

    /**
     *恢复
     */
    abstract redo(): void;

    /**
     *执行
     */
    abstract do(): void;
}
