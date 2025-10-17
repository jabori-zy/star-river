import { Clock, Filter } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import type { GetVariableConfig } from "@/types/node/variable-node";

interface GetVarConfigItemProps {
	config: GetVariableConfig;
	showOnlyTrigger?: boolean;
	showOnlyDetails?: boolean;
}

const GetVarConfigItem: React.FC<GetVarConfigItemProps> = ({
	config,
	showOnlyTrigger = false,
	showOnlyDetails = false,
}) => {
	const getTriggerTypeBadge = () => {
		if (config.varTriggerType === "timer") {
			const timerConfig = config.timerConfig;

			// 判断是否为固定间隔模式
			const isIntervalMode = timerConfig?.mode === "interval";

			return (
				<Badge className="h-5 text-[10px] bg-blue-100 text-blue-800">
					<Clock className="h-3 w-3 mr-1" />
					{timerConfig && isIntervalMode
						? `${timerConfig.interval}${
								timerConfig.unit === "second"
									? "s"
									: timerConfig.unit === "minute"
										? "m"
										: timerConfig.unit === "hour"
											? "h"
											: "d"
							}`
						: "定时触发"}
				</Badge>
			);
		} else {
			return (
				<Badge className="h-5 text-[10px] bg-orange-100 text-orange-800">
					<Filter className="h-3 w-3 mr-1" />
					条件触发
				</Badge>
			);
		}
	};

	// 只显示触发方式
	if (showOnlyTrigger) {
		return <>{getTriggerTypeBadge()}</>;
	}

	// 只显示详细信息
	if (showOnlyDetails) {
		return (
			<>
				{config.symbol ? (
					<Badge variant="outline" className="h-5 px-1">
						{config.symbol}
					</Badge>
				) : (
					<Badge variant="outline" className="h-5 px-1">
						不限制交易对
					</Badge>
				)}
				<div className="text-xs text-muted-foreground">
					{config.varDisplayName}
				</div>
			</>
		);
	}

	// 默认显示所有内容
	return (
		<>
			{config.symbol ? (
				<Badge variant="outline" className="h-5 px-1">
					{config.symbol}
				</Badge>
			) : (
				<Badge variant="outline" className="h-5 px-1">
					不限制交易对
				</Badge>
			)}
			{getTriggerTypeBadge()}
			<div className="text-xs text-muted-foreground">
				{config.varDisplayName}
			</div>
		</>
	);
};

export default GetVarConfigItem;
