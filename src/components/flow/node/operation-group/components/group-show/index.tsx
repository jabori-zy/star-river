import type React from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import type { OperationGroupData } from "@/types/node/group/operation-group";
import { InputConfigItem } from "./input-config-item";
import { OutputConfigItem } from "./output-config-item";

interface GroupShowProps {
	data: OperationGroupData;
}

const GroupShow: React.FC<GroupShowProps> = ({ data }) => {
	const { inputConfigs, outputConfigs } = data;

	return (
		<div className="space-y-3">
			{/* Input Section */}
			<div className="space-y-1">
				<div className="flex items-center gap-2">
					<ArrowDown className="w-3.5 h-3.5 text-blue-500" />
					<Label className="text-sm font-bold text-muted-foreground">
						Input
					</Label>
				</div>
				{inputConfigs.length === 0 ? (
					<div className="bg-gray-100 p-2 rounded-md">
						<span className="text-sm text-red-500">No Input Configured</span>
					</div>
				) : (
					<div className="flex flex-col gap-1.5">
						{inputConfigs.map((config) => (
							<InputConfigItem
								key={config.configId}
								config={config}
							/>
						))}
					</div>
				)}
			</div>

			{/* Output Section */}
			<div className="space-y-1">
				<div className="flex items-center gap-2">
					<ArrowRight className="w-3.5 h-3.5 text-green-500" />
					<Label className="text-sm font-bold text-muted-foreground">
						Output
					</Label>
				</div>
				{outputConfigs.length === 0 ? (
					<div className="bg-gray-100 p-2 rounded-md">
						<span className="text-sm text-red-500">No Output Configured</span>
					</div>
				) : (
					<div className="flex flex-col gap-1.5">
						{outputConfigs.map((config) => (
							<OutputConfigItem
								key={config.configId}
								config={config}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default GroupShow;
