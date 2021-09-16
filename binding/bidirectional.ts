/**
 * 双向绑定接口
 */
export interface BidirectionalBinding<TP> {
    /**
     * 更新绑定源的数据
     *
     * @param targetValue 绑定目标的数据值
     */
    updateSource(targetValue: TP): boolean;
}
