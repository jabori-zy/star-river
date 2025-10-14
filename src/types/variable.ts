import { TbNumber, TbToggleLeft, TbAbc } from "react-icons/tb";

export enum VariableValueType {
	NUMBER = "number",
	STRING = "string",
	BOOLEAN = "boolean",
}

// 获取变量类型对应的图标组件
export const getVariableTypeIcon = (type: VariableValueType) => {
	switch (type) {
		case VariableValueType.NUMBER:
			return TbNumber;
		case VariableValueType.BOOLEAN:
			return TbToggleLeft;
		case VariableValueType.STRING:
			return TbAbc;
		default:
			return TbNumber;
	}
};

// 获取变量类型对应的图标颜色类名
export const getVariableTypeIconColor = (type: VariableValueType): string => {
	switch (type) {
		case VariableValueType.NUMBER:
			return "text-blue-500";
		case VariableValueType.BOOLEAN:
			return "text-purple-500";
		case VariableValueType.STRING:
			return "text-green-500";
		default:
			return "text-blue-500";
	}
};


export interface CustomVariable {
	varName: string; // 变量名（代码中使用的名称，符合变量命名规则）
	varDisplayName: string; // 显示名称
	varValueType: VariableValueType; // 变量类型
	varValue: string | number | boolean; // 变量值
}


// 策略系统变量
export enum SystemVariable {
	POSITION_NUMBER = "position_number", // 持仓数量
	Filled_ORDER_NUMBER = "filled_order_number", // 已完成的订单数量
}