import { BindableEvent } from './base';
import { Ignore, Serializable } from '../serialize';

/**
 * 表示一个 DOM 事件
 */
@Serializable()
export class BindableDomEvent<T extends HTMLElement = HTMLElement> extends BindableEvent {
    constructor(domEventName: keyof HTMLElementEventMap);
    constructor(domEventName: string);
    constructor(readonly domEventName: string) {
        super();
    }

    /** 绑定到的DOM元素 */
    @Ignore()
    private _element?: T;

    /**
     * 绑定到的DOM元素
     */
    get element(): T | undefined {
        return this._element;
    }
    set element(value: T | undefined) {
        if (this._element) {
            this._element.removeEventListener(this.domEventName, this.domListener);
        }
        if (value) {
            value.addEventListener(this.domEventName, this.domListener);
        }
        Reflect.set(this, '_element', value);
    }

    /** */
    @Ignore()
    private domListener = (): void => {
        this.emit().catch((x) => x);
    };
}
