import { AtSign, ChevronDown, ChevronRight, Variable } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import type { SelectedAccount, StrategyLiveConfig } from "@/types/strategy";
import type { CustomVariable } from "@/types/variable";

interface LiveNodeShowProps {
	liveConfig: StrategyLiveConfig;
}

const LiveNodeShow: React.FC<LiveNodeShowProps> = ({ liveConfig }) => {
	const [isVariablesOpen, setIsVariablesOpen] = useState(true);
	const [isAccountsOpen, setIsAccountsOpen] = useState(true);
	return (
		<div className="space-y-2">
			{/* Selected accounts display */}
			<div className="space-y-2">
				{!liveConfig.selectedAccounts ||
				liveConfig.selectedAccounts.length === 0 ? (
					<div className="flex items-center justify-between gap-2 rounded-md">
						<Label className="text-xm font-bold text-muted-foreground">
							账户
						</Label>
						<span className="text-sm text-red-500"> 未配置 </span>
					</div>
				) : (
					<Collapsible open={isAccountsOpen} onOpenChange={setIsAccountsOpen}>
						<CollapsibleTrigger className="flex items-center gap-2 w-full">
							{isAccountsOpen ? (
								<ChevronDown className="w-4 h-4" />
							) : (
								<ChevronRight className="w-4 h-4" />
							)}
							<Label className="text-xm font-bold text-muted-foreground">
								账户
							</Label>
							<Badge className="h-4 min-w-4 rounded-full px-1 font-mono tabular-nums text-xs bg-gray-200 text-gray-500">
								{liveConfig.selectedAccounts.length}
							</Badge>
						</CollapsibleTrigger>
						<CollapsibleContent className="mt-2">
							<div>
								{liveConfig.selectedAccounts.map((account: SelectedAccount) => {
									return (
										<div
											key={account.id}
											className="flex items-center gap-2 bg-gray-100 p-2 rounded-md"
										>
											<span className="text-sm">
												{" "}
												{account.accountName} ({account.exchange})
											</span>
										</div>
									);
								})}
							</div>
						</CollapsibleContent>
					</Collapsible>
				)}
			</div>
			{/* Variables display */}
			<div className="space-y-2">
				{liveConfig.customVariables?.length === 0 ? (
					<div className="flex items-center justify-between gap-2 rounded-md">
						<Label className="text-xm font-bold text-muted-foreground">
							变量
						</Label>
						<span className="text-sm text-red-500"> 未配置 </span>
					</div>
				) : (
					<Collapsible open={isVariablesOpen} onOpenChange={setIsVariablesOpen}>
						<CollapsibleTrigger className="flex items-center gap-2 w-full">
							{isVariablesOpen ? (
								<ChevronDown className="w-4 h-4" />
							) : (
								<ChevronRight className="w-4 h-4" />
							)}
							<Label className="text-xm font-bold text-muted-foreground">
								变量
							</Label>
							<Badge className="h-4 min-w-4 rounded-full px-1 font-mono tabular-nums text-xs bg-gray-200 text-gray-500">
								{liveConfig.customVariables?.length || 0}
							</Badge>
						</CollapsibleTrigger>
						<CollapsibleContent className="mt-2">
							<div className="space-y-2">
								{liveConfig.customVariables?.map(
									(variable: CustomVariable, index: number) => {
										return (
											<div
												key={index}
												className="flex flex-col bg-gray-100 p-2 rounded-md"
											>
												{variable.varValueType === "number" && (
													<div
														className="flex items-center gap-2"
														title={variable.varName}
													>
														<Variable className="w-4 h-4 text-green-500" />
														<span className="text-sm">
															{" "}
															{variable.varName} = {variable.varValue}
														</span>
													</div>
												)}
												{variable.varValueType === "string" && (
													<div
														className="flex items-center gap-2"
														title={variable.varName}
													>
														<AtSign className="w-4 h-4 text-green-500" />
														<span className="text-sm">
															{" "}
															{variable.varName} = "{variable.varValue}"
														</span>
													</div>
												)}
											</div>
										);
									},
								)}
							</div>
						</CollapsibleContent>
					</Collapsible>
				)}
			</div>
		</div>
	);
};

export default LiveNodeShow;
