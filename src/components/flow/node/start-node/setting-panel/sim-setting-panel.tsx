import type React from "react";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";

// 新开始节点实时模式设置面板
export const StartNodeSimSettingPanel: React.FC<SettingProps> = ({
	id,
	data,
}) => {
	console.log(id, data);

	return (
		<div>
			<h1>新开始节点模拟模式设置面板</h1>
		</div>
	);
};

export default StartNodeSimSettingPanel;
