import { Property, PropInfo } from '../property';

/**
 * 定义一个模板属性，@see Property
 */
export function TemplatedProperty(info: PropInfo): PropertyDecorator {
    info.templated = true;
    return Property(info);
}
