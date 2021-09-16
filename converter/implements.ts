import { Converter, Convert, ConvertBack } from './decorators';
import { ValueConverter } from './base';
import { Serializable } from '@/bindable';
import { Type } from '@/bindable';
import { isExtends } from '../types';
import { get, zip } from 'lodash-es';

/**
 * 不做处理的转化器
 */
@Serializable()
@Converter({ desc: '空转换器' })
export class NoneConverter extends ValueConverter<unknown, unknown> {
    /**  @inheritdoc */
    @Convert()
    convert(value: unknown): unknown {
        return value;
    }
    /**  @inheritdoc */
    @ConvertBack()
    convertBack(value: unknown): unknown {
        return value;
    }

    /**
     *
     */
    @Convert()
    multiConvert(value: unknown[]): unknown {
        return [...value];
    }
}

/**
 * 默认转换器
 */
@Serializable()
@Converter({ desc: '默认' })
export class DefaultConverter extends ValueConverter<unknown, unknown> {
    /**  @inheritdoc */
    @Convert()
    convert(value: unknown, parameter?: string, targetType?: Type): unknown {
        return DefaultConverter.convertImpl(value, parameter, targetType);
    }
    /**  @inheritdoc */
    @ConvertBack()
    convertBack(value: unknown, parameter?: string, targetType?: Type): unknown {
        return DefaultConverter.convertImpl(value, parameter, targetType);
    }
    /**
     * 转换实现
     */
    private static convertImpl(value: unknown, parameter?: string, targetType?: Type): unknown {
        if (!targetType) return value;
        if (isExtends(targetType, String)) return String(value);
        if (isExtends(targetType, Number)) return Number(value);
        if (isExtends(targetType, Boolean)) {
            if (Array.isArray(value)) return value.length > 0;
            if (!value) return false;
            const v = String(value).toLowerCase().trim();
            if (v === 'false') return false;
            return Boolean(value);
        }
        return value;
    }
}

/**
 * 字符串到数字
 */
@Serializable()
@Converter({ desc: '字符串到数字' })
export class NumberConverter extends ValueConverter<string, number> {
    /**  @inheritdoc */
    @Convert('scalar')
    convert(value: string): number {
        const v = Number(value);
        if (Number.isNaN(v)) {
            if (value.trim().toLowerCase() === 'nan') return Number.NaN;
            else return ValueConverter.FAILED;
        }
        return v;
    }
    /**  @inheritdoc */
    @ConvertBack('scalar')
    convertBack(value: number): string {
        return String(value);
    }
}
/**
 * @author dev_yms
 * @description 判断绑定值和参数是否相等
 * @param void
 * @return void
 */
@Serializable()
@Converter({ desc: '判断绑定值和参数是否相等' })
export class BooleanConverter extends ValueConverter<string | number, boolean> {
    /**  @inheritdoc */
    @Convert('scalar')
    convert(value: number | string, parameter?: string): boolean {
        try {
            if (parameter) {
                // eslint-disable-next-line eqeqeq
                return value == parameter;
            } else {
                return false;
            }
        } catch (e) {
            return ValueConverter.FAILED;
        }
    }
}

/**
 * json字符串化
 */
@Serializable()
@Converter({ desc: 'json到字符串' })
export class JsonConverter extends ValueConverter<object, string> {
    /**  @inheritdoc */
    @Convert()
    convert(value: object | string): string {
        try {
            if (typeof value === 'string') {
                return value;
            }
            return JSON.stringify(value);
        } catch (e) {
            return ValueConverter.FAILED;
        }
    }
    /**  @inheritdoc */
    @ConvertBack()
    convertBack(value: string): object {
        try {
            return JSON.parse(value);
        } catch (e) {
            return (value as unknown) as object;
        }
    }
}
/**
 * base64转dataUrl
 */
@Serializable()
@Converter({ desc: 'base64到dataUrl' })
export class DataUrlConverter extends ValueConverter<string, string> {
    /**  @inheritdoc */
    @Convert('scalar')
    convert(value: string): string {
        try {
            const bstr = atob(value);
            const regex = /DOCTYPE\s+svg/i;
            let mime = 'image/png';
            if (regex.test(bstr.slice(0, 100))) {
                mime = 'image/svg+xml';
            }
            return `data:${mime};base64,` + value;
        } catch (e) {
            return ValueConverter.FAILED;
        }
    }
    /**  @inheritdoc */
    @ConvertBack('scalar')
    convertBack(value: string): string {
        try {
            return value.replace(/data:.*?;base64,/, '');
        } catch (e) {
            return ValueConverter.FAILED;
        }
    }
    /**
     *
     */
    base64toBlob(base64: string): Blob {
        const bstr = atob(base64);
        const regex = /DOCTYPE\s+svg/i;
        let mime = 'image/png';
        if (regex.test(bstr.slice(0, 50))) {
            mime = 'image/svg+xml';
        }
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }
}

/**
 *
 */
@Serializable()
@Converter({ desc: '格式化源字符串' })
export class StringFormatConverter extends ValueConverter<unknown, string> {
    /** 字符串转换 */
    private static readonly string = (v: unknown): string => {
        if (v == null) return '';
        return String(v);
    };
    /**
     * 转换实现
     */
    private convertImpl(value: unknown, parameter?: string): string {
        const strV = Array.isArray(value) ? value.map(StringFormatConverter.string) : StringFormatConverter.string(value);
        if (!parameter) return String(strV);
        return parameter.replace(/\${(\d*)}/g, (_, index) => {
            const i = Number.parseInt(index);
            if (Number.isNaN(i)) {
                return StringFormatConverter.string(strV);
            }
            return StringFormatConverter.string(strV[i]);
        });
    }

    /**  @inheritdoc */
    @Convert('scalar')
    convert(value: unknown, parameter?: string): string {
        return this.convertImpl(value, parameter);
    }
    /**  @inheritdoc */
    @Convert()
    multiConvert(value: readonly unknown[], parameter?: string): string {
        return this.convertImpl(value, parameter);
    }
}

/**
 *运行js表达式
 */
@Serializable()
@Converter({ desc: 'js表达式' })
export class RunJavaScript extends ValueConverter {
    /**
     * 转换实现
     */
    private static convertImpl(value: unknown, parameter?: string): unknown {
        try {
            if (parameter) {
                const jsFunction: (param: unknown) => unknown = eval(`($)=>{ return ${parameter} }`);
                return jsFunction(value);
            } else {
                return ValueConverter.FAILED;
            }
        } catch (e) {
            return ValueConverter.FAILED;
        }
    }

    /**
     *转换
     */
    @Convert()
    convert(value: unknown, parameter?: string): unknown {
        return RunJavaScript.convertImpl(value, parameter);
    }

    /**
     *转换
     */
    @Convert()
    multiConvert(value: unknown[], parameter?: string): unknown {
        return RunJavaScript.convertImpl(value, parameter);
    }
}

/**
 *运行js方法
 */
@Serializable()
@Converter({ desc: '深度遍历对象字段' })
export class TraverseObject extends ValueConverter {
    /**
     * 转换实现
     */
    private static convertImpl(value: unknown): unknown {
        /**
         *
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function test(value: any): unknown {
            for (const key in value) {
                if (typeof value[key] === 'object') {
                    test(value[key]);
                } else if (typeof value[key] === 'string') {
                    value[key] = JSON.parse(value[key]);
                }
            }
            return value;
        }
        try {
            return test(value);
        } catch (e) {
            console.error(e);
            return ValueConverter.FAILED;
        }
    }

    /**
     *转换
     */
    @Convert()
    convert(value: unknown): unknown {
        return TraverseObject.convertImpl(value);
    }

    /**
     *转换
     */
    @Convert()
    multiConvert(value: unknown[]): unknown {
        return TraverseObject.convertImpl(value);
    }
}

/**
 * 指定小数精度
 */
@Serializable()
@Converter({ desc: '数字到字符串' })
export class DecimalPrecision extends ValueConverter<number, string> {
    /**
     *转换
     */
    @Convert('scalar')
    convert(value: number, parameter: string | undefined): string {
        if (parameter) {
            try {
                const precision = Number(parameter);
                return String(Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision));
            } catch (e) {
                return ValueConverter.FAILED;
            }
        } else {
            return ValueConverter.FAILED;
        }
    }
}

/**
 * 取对象中的一个value
 */
@Serializable()
@Converter({ desc: '源为键,获取参数的值' })
export class ObjectValue extends ValueConverter<string, unknown> {
    /**
     *转换
     */
    @Convert()
    convert(value: string, parameter: string | undefined): unknown {
        if (parameter) {
            try {
                return JSON.parse(parameter)[value];
            } catch (e) {
                return ValueConverter.FAILED;
            }
        } else {
            return ValueConverter.FAILED;
        }
    }
}

/**
 * 数字使用科学计数法
 */
@Serializable()
@Converter({ desc: '数字到科学计数法数字' })
export class ScientificNotation extends ValueConverter<number, string> {
    /**
     *转换
     */
    @Convert()
    convert(value: number): string {
        try {
            const p = Math.floor(Math.log(value) / Math.LN10);
            const n = value * Math.pow(10, -p);
            return n + 'e' + p;
        } catch (e) {
            return ValueConverter.FAILED;
        }
    }
}

/**
 *数组转置
 */
@Serializable()
@Converter({ desc: '数组转置' })
export class ArrayTranspose extends ValueConverter<unknown[][], unknown[][]> {
    /**
     *转换
     */
    @Convert()
    convert(value: unknown[][]): unknown[][] {
        try {
            return zip(...value);
        } catch (e) {
            return ValueConverter.FAILED;
        }
    }
    /**
     *反转
     */
    @ConvertBack()
    convertBack(value: unknown[][]): unknown[][] {
        try {
            return zip(...value);
        } catch (e) {
            return ValueConverter.FAILED;
        }
    }
}

/**
 *
 */
@Serializable()
@Converter({ desc: '对象摘取' })
export class ObjectPluck extends ValueConverter<object, object> {
    /**
     *转换
     */
    @Convert()
    convert(value: object, parameter?: string): object {
        try {
            const newValue = JSON.parse(JSON.stringify(value));
            if (parameter == null) {
                return newValue;
            }
            for (const key in value) {
                newValue[key] = get(newValue[key], JSON.parse(`[${parameter}]`));
            }
            return newValue;
        } catch (e) {
            console.error(e);
            return ValueConverter.FAILED;
        }
    }
}
