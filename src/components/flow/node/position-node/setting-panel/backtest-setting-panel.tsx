import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import AccountSelector from "@/components/flow/account-selector";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBacktestConfig } from "@/hooks/node-config/position-node";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { useSymbolList } from "@/service/market/symbol-list";
import {
	PositionOperation,
	type PositionOperationConfig,
} from "@/types/node/position-node";
import type { SelectedAccount } from "@/types/strategy";
import PositionOpItem from "../components/position-op-item";

const PositionNodeBacktestSettingPanel: React.FC<SettingProps> = ({
	id,
}) => {
	const { t } = useTranslation();
	// 获取开始节点数据
	const { getStartNodeData } = useStrategyWorkflow();
	const startNodeData = getStartNodeData();
	const accountList = startNodeData?.backtestConfig?.exchangeModeConfig?.selectedAccounts || [];

	const {
		backtestConfig,
		updateSelectedAccount,
		addPositionOperation,
		updatePositionOperation,
		removePositionOperation,
	} = useBacktestConfig({ id });

	const operationConfigs = backtestConfig?.positionOperations || [];

	const [selectedAccount, setSelectedAccount] =
		useState<SelectedAccount | null>(backtestConfig?.selectedAccount || null);

	const { data: symbolList = [] } = useSymbolList(selectedAccount?.id ?? 0);

	useEffect(() => {
		if (backtestConfig) {
			setSelectedAccount(backtestConfig.selectedAccount || null);
		}
	}, [backtestConfig]);

	const handleAccountChange = (account: SelectedAccount | null) => {
		setSelectedAccount(account);
		updateSelectedAccount(account);
	};

	const handleOperationConfigChange = (
		index: number,
		config: PositionOperationConfig,
	) => {
		updatePositionOperation(index, config);
	};

	const handleDeleteOperation = (index: number) => {
		removePositionOperation(index);
	};

	const handleAddOperation = () => {
		const newConfigId = operationConfigs.length + 1;
		const newConfig: PositionOperationConfig = {
			configId: newConfigId,
			inputHandleId: `${id}_input_${newConfigId}`,
			symbol: null,
			positionOperation: PositionOperation.CLOSE_POSITION,
			positionOperationName: "Close Position",
		};
		addPositionOperation(newConfig);
	};

	return (
		<div className="h-full overflow-y-auto bg-white">
			<div className="flex flex-col gap-2">
				<AccountSelector
					label={t("positionNode.operationAccount")}
					accountList={accountList}
					selectedAccount={selectedAccount}
					onAccountChange={handleAccountChange}
				/>
			</div>

			<div className="flex items-center justify-between px-2">
				<Label className="text-sm font-bold text-gray-700">
					{t("positionNode.operationConfig")}
				</Label>
				<Button
					variant="ghost"
					size="icon"
					onClick={handleAddOperation}
					disabled={!selectedAccount?.id}
				>
					<PlusIcon className="w-4 h-4" />
				</Button>
			</div>

			<div className="px-2 space-y-2">
				{operationConfigs.length === 0 ? (
					<div className="flex items-center justify-center p-4 border border-dashed rounded-md text-muted-foreground text-sm">
						{t("positionNode.emptyOperationHint")}
					</div>
				) : (
					operationConfigs.map((config, index) => (
						<PositionOpItem
							key={config.configId}
							config={config}
							symbolList={symbolList}
							onChange={(updatedConfig) =>
								handleOperationConfigChange(index, updatedConfig)
							}
							onDelete={() => handleDeleteOperation(index)}
						/>
					))
				)}
			</div>
		</div>
	);
};

export default PositionNodeBacktestSettingPanel;
