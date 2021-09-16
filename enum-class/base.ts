import { Serializable } from '@/bindable';
import { EnumInfo } from '@/bindable';

/**
 * 枚举类型的基类
 */
@Serializable<EnumClass>({
    /** 序列化，仅保存类型名称和 key */
    serialize(v) {
        return { key: v.key };
    },
    deserialize(type, j) {
        const value = ((type as unknown) as typeof EnumClass).value(j.key as string);
        if (!value) throw new Error(`Unknown key ${j.key}`);
        return value;
    },
})
/**
 * 枚举类型
 */
export abstract class EnumClass {
    /** 获取该类型所有可能的取值 */
    static values(): Promise<readonly EnumClass[]> | readonly EnumClass[] {
        throw new Error('Must implement');
    }
    /** 获取该类型指定key的取值 */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static value(key: string): EnumClass | undefined {
        throw new Error('Must implement');
    }
    abstract info(): EnumInfo;
    /** 生成一个枚举的实例 */
    constructor(
        /** 枚举的 key */
        readonly key: string,
    ) {}
}
