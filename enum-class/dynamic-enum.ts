import { EnumClass } from './base';
import type { EnumInfo } from './interfaces';
import { Constructable } from '../interfaces';
import { Ignore } from '../serialize';

/**
 * 表示动态成员的枚举
 *
 * 必须实现 values()
 *
 * @example
 * class MyDynamicEnum extends DynamicEnum {
 *     static async values(): Promise<readonly MyDynamicEnum[]> {
 *         // do some http request
 *         await Promise.resolve();
 *         return [new MyDynamicEnum('key1', { desc: '值1' })];
 *     }
 * }
 */
export abstract class DynamicEnum extends EnumClass {
    /** 构造动态枚举的实例 */
    protected constructor(key: string, info: EnumInfo | Promise<EnumInfo>) {
        super(key);
        this._info = info;
        if ('then' in info && 'catch' in info) {
            info.then((v) => {
                this._info = v;
            }).catch((err) => {
                console.error(err);
                this._info = {
                    desc: this.key,
                };
            });
        }
    }
    /** */
    @Ignore()
    private _info: EnumInfo | Promise<EnumInfo>;
    /** @inheritdoc */
    info(): EnumInfo {
        const info = this._info;
        if ('then' in info && 'catch' in info) {
            return {
                desc: this.key,
            };
        } else {
            return info;
        }
    }

    /** 创建动态枚举的实例，考虑在子类重写此函数提高效率 */
    static create(key: string): DynamicEnum | undefined {
        return new ((this as unknown) as Constructable<DynamicEnum>)(key, async () => {
            const info = await this.values();
            const enumValue = info.find((e) => e.key === key);
            if (!enumValue) {
                throw new Error(`${key} 不是 ${this.name} 的有效的枚举键`);
            }
            return (enumValue as DynamicEnum)._info;
        });
    }
}
