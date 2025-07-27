import type React from "react";
import { Separator } from "@/components/ui/separator";
import AddNodeButton from "./add-node-button";
import ViewportControl from "./viewport-control";

// 节点控制面板
const ControlPanel: React.FC = () => {
	return (
		<div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50">
			<div className="flex items-start gap-3">
				{/* 主控制面板 */}
				<div className="bg-white rounded-lg shadow-xs border border-gray-200 p-2">
					<div className="flex flex-col gap-2">
						{/* 添加节点按钮组件 */}
						<AddNodeButton />

						{/* 分割线 */}
						<Separator />

						{/* 视口控制组件 */}
						<ViewportControl />
					</div>
				</div>
			</div>
		</div>
	);
};

export default ControlPanel;
