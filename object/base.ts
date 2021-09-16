import { PropInfoMap, getPropMap, Property, PropertyChanged, PropRuntimeInfo } from '../property';
import { getEventMap, BindableEvent, EventRuntimeInfo } from '../event';
import { Serializable, Include, deserialize } from '../serialize';
import { KeyOf, Type } from '../interfaces';
import { BindingBase } from '../binding';
import { ObjectMetadata } from './interfaces';
import { ObjectKey } from './key';
import { messaging } from '../messaging';
import { getActionMap, ActionRuntimeInfo } from '../action';
import { defaultSerialization } from '../serialize/internal';
import { isScalar } from '../types';

/**
 * 表示当前绑定的状态，分别表示绑定值，默认值，本地值
 */
export type BindingsRecord<T extends BindableObject = BindableObject> = {
    [K in KeyOf<T>]: BindingBase<T[K]> | null | undefined;
};

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
const BindingsRecord = class BindingsRecord {};
Serializable()(BindingsRecord);

/**
 * 获取属性默认值
 */
function defaults(info: PropRuntimeInfo): unknown {
    if (typeof info.def != 'function') return info.def;
    return info.def();
}

/**
 * 表示可绑定的对象基类
 */
@Serializable<BindableObject>({
    /** @inheritdoc */
    serialize(value, context) {
        context.object = value;
        const result = defaultSerialization.serialize(value, context);
        if (context.excludeBindings || context.excludeDefaults) {
            const info = value.info();
            for (const key in info.properties) {
                const pInfo = info.properties[key as KeyOf<BindableObject>];
                if ((context.excludeBindings && pInfo.state === 'binding') || (context.excludeDefaults && pInfo.state === 'default')) {
                    result[key] = undefined;
                }
            }
        }
        return result;
    },
    /** @inheritdoc */
    deserialize(target, obj, context) {
        const instance = new target();
        context.object = instance;
        const bindingsJson = obj.bindings;
        const bindings = bindingsJson ? (deserialize(bindingsJson, context) as BindingsRecord<BindableObject>) : instance.bindings;
        Object.defineProperty(instance, 'bindings', { value: bindings, configurable: true });
        const info = (target as typeof BindableObject).info;
        const events = Object.keys(info.events);
        for (const attr in obj) {
            const key = attr as KeyOf<BindableObject>;
            context.key = key;
            const json = obj[key];
            if (events.includes(key) && json !== undefined) {
                const event = deserialize(json, context) as BindableEvent;
                Object.defineProperty(instance, key, { value: event, configurable: true });
                continue;
            }
            if (attr === 'bindings') {
                continue;
            }
            if ((key === 'id' || key === 'key') && context.new) {
                continue;
            }
            const binding = bindings[key];
            if (binding === null) {
                // 默认值
                // instance.unset(key);
            } else if (binding === undefined) {
                // 本地值
                if (json !== undefined) {
                    const prop = deserialize(json, context) as BindableObject[KeyOf<BindableObject>];
                    instance.set(key, prop);
                } else {
                    instance.set(key, instance[key]);
                }
            } else {
                // 绑定值
                if (json !== undefined) {
                    Reflect.set(instance, key, deserialize(json, context));
                }
                instance.bind(key, binding as BindingBase<BindableObject[KeyOf<BindableObject>]>);
            }
        }
        return instance;
    },
})
/** */
export class BindableObject {
    /** 获取对象的静态元数据 */
    static get info(): ObjectMetadata {
        return {
            type: this,
            name: this.name,
            properties: getPropMap(this),
            events: getEventMap(this),
            actions: getActionMap(this),
        };
    }
    /** ID 分配计数 */
    private static id = 0;
    /** ID */
    @Property({ desc: '序列号' })
    id!: number;
    /** UUID */
    @Property({ desc: 'uuid', type: String })
    key!: ObjectKey;

    constructor() {
        const objInfo = new.target.info as ObjectMetadata<this>;
        const bindings = new BindingsRecord() as BindingsRecord<this>;
        Object.defineProperty(this, 'bindings', { value: bindings, configurable: true });
        for (const k in objInfo.properties) {
            const key = (k as unknown) as KeyOf<this>;
            const info = objInfo.properties[key];
            this[key] = defaults(info) as this[typeof key];
            bindings[key] = null;
        }
        for (const k in objInfo.events) {
            const key = (k as unknown) as KeyOf<this>;
            const info = objInfo.events[key];
            Object.defineProperty(this, key, { value: BindableEvent.create(info, this), configurable: true });
        }

        this.set('id', ++BindableObject.id);
        this.set('key', ObjectKey());
    }
    /** 获取静态元数据 */
    private meta(): ObjectMetadata<this> {
        return (this.constructor as typeof BindableObject).info as ObjectMetadata<this>;
    }

    /** 记录绑定信息 */
    @Include()
    bindings!: BindingsRecord<this>;

    /** 获取全部元数据 */
    info(): ObjectMetadata<this>;
    /**
     * 获取属性、事件的元数据
     */
    info<P extends KeyOf<this>>(key: P): PropRuntimeInfo | EventRuntimeInfo | ActionRuntimeInfo;
    /**
     * 获取元数据
     */
    info(k?: KeyOf<this>): unknown {
        const meta = this.meta();
        if (k) {
            if (meta.properties[k]) {
                return { ...meta.properties[k], state: this.state(k) };
            } else if (meta.events[k]) {
                return meta.events[k];
            } else {
                return meta.actions[k];
            }
        }
        const propList = {} as PropInfoMap;
        for (const key in meta.properties) {
            const staticPropInfo = meta.properties[key];
            propList[key] = {
                ...staticPropInfo,
                state: this.state((key as unknown) as KeyOf<this>),
            };
        }
        return {
            ...meta,
            properties: propList,
        };
    }

    /** 获取属性的状态 */
    state(key: KeyOf<this>): 'default' | 'binding' | 'local' {
        if (this.bindings[key] === null) return 'default';
        if (this.bindings[key]) return 'binding';
        return 'local';
    }

    /**
     * 更改属性并按需触发属性更改事件
     *
     * @param force 强制触发更改
     * @returns 是否触发了属性更改事件
     */
    protected changeProperty<P extends KeyOf<this>>(key: P, value: this[P], force = false): boolean {
        if (!force) {
            const oldValue = this[key];
            if (oldValue === value && isScalar(value)) {
                return false;
            }
        }
        this[key] = value;
        const args: PropertyChanged<this, P> = {
            sender: this,
            property: key,
            value,
        };
        messaging<this>().$emit('propertyChanged', args);
        return true;
    }
    /**
     * 设置绑定状态
     */
    private setBinding<P extends KeyOf<this>>(key: P, value: BindingsRecord<this>[P]): void {
        if (this.bindings[key] instanceof BindingBase) {
            const binding = this.bindings[key] as BindingBase<this[P]>;
            binding.onChanged = undefined;
            binding.targetType = undefined;
        }
        this.bindings[key] = value;
    }

    /**
     * 将属性设置为默认值
     */
    unset<P extends KeyOf<this>>(key: P): void {
        this.setBinding(key, null);
        this.changeProperty(key, defaults(this.meta().properties[key]) as this[P]);
    }

    /**
     * 将属性设置为本地值
     */
    set<P extends KeyOf<this>>(key: P, value: this[P]): void {
        this.setBinding(key, undefined);
        this.changeProperty(key, value);
    }

    /**
     * 更新属性的值，默认值、本地值及不支持双向绑定的绑定值会被直接更新为新的本地值，双向绑定将会触发绑定源更新。
     */
    update<P extends KeyOf<this>>(key: P, value: this[P]): void {
        const currentBinding = this.bindings[key];
        if (!currentBinding) return this.set(key, value);
        const bidirectional = currentBinding.asBidirectional();
        if (!bidirectional) return this.set(key, value);

        if (this.changeProperty(key, value)) {
            bidirectional.updateSource(value);
        }
    }

    /**
     * 将属性设置为绑定值
     */
    bind<P extends KeyOf<this>>(key: P, value: BindingBase<this[P]>): void {
        if (value.onChanged) {
            throw new Error(`the binding has bond to ${String(value.onChanged)}`);
        }
        this.setBinding(key, value);
        value.onChanged = (value) => {
            this.changeProperty(key, value);
        };
        if (this.info(key)) {
            value.targetType = (this.info(key).type as Type<unknown>) as Type<this[P]>;
        }
        value.exec();
    }
}
