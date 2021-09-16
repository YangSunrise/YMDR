import type { Type, FieldInfo, FieldRuntimeInfo, FieldInfoMap } from '../interfaces';

/**
 * 表示操作的元数据
 */
export interface ActionInfo extends FieldInfo {
    /** 参数类型 */
    paramTypes?: ReadonlyArray<Type | undefined>;
    /** 返回值类型 */
    returnType?: Type;
}

/**
 * 表示操作的完整元数据
 */
export interface ActionRuntimeInfo extends ActionInfo, FieldRuntimeInfo {
    /** @inheritdoc */
    paramTypes: readonly Type[];
    /** @inheritdoc */
    returnType: Type;
    /** @inheritdoc */
    fieldType: 'action';
    /** @inheritdoc */
    // eslint-disable-next-line @typescript-eslint/ban-types
    type: Type<Function>;
}

/**
 * 操作元数据 Map
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionInfoMap<T = any> = FieldInfoMap<ActionRuntimeInfo, T>;
