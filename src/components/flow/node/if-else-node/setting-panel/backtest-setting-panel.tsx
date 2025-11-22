import { useNodeConnections } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { ReactSortable } from "react-sortablejs";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useStrategyWorkflow, {
} from "@/hooks/flow/use-strategy-workflow";
import { useBacktestConfig } from "@/hooks/node-config/if-else-node";
import {
	type CaseItem,
	LogicalSymbol,
} from "@/types/node/if-else-node";
import { TradeMode } from "@/types/strategy";
import CaseEditor from "../components/case-editor";

const IfElseNodeBacktestSettingPanel: React.FC<SettingProps> = ({
	id,
}) => {
	const { t } = useTranslation();

	// ✅ 使用新版本 hook 管理回测配置
	const { backtestConfig, updateCase, removeCase, updateCases } = useBacktestConfig({ id });

	const { getConnectedNodeVariables } = useStrategyWorkflow();

	

	// 获取所有连接
	const connections = useNodeConnections({ id, handleType: "target" });


	const variables = getConnectedNodeVariables(connections,TradeMode.BACKTEST);

	// 添加ELIF分支
	const handleAddElif = () => {
		const cases = backtestConfig?.cases;
		if (!cases || cases.length === 0) {
			// 如果没有 case，创建 ID 为 1 的第一个 case
			updateCase({
				caseId: 1,
				outputHandleId: `${id}_output_1`,
				logicalSymbol: LogicalSymbol.AND,
				conditions: [],
			});
			return;
		}

		// 找到最大的 caseId，新增时使用 maxId + 1
		const maxCaseId = Math.max(...cases.map((c) => c.caseId));
		const newCaseId = maxCaseId + 1;

		const newCaseItem: CaseItem = {
			caseId: newCaseId,
			outputHandleId: `${id}_output_${newCaseId}`,
			logicalSymbol: LogicalSymbol.AND,
			conditions: [],
		};
		updateCase(newCaseItem);
	};

	// 删除case
	const handleRemoveCase = (caseId: number) => {
		console.log("删除case", caseId);
		removeCase(caseId);
		// 注意：不需要重新设置 caseId，保持 ID 不变
	};

	// 处理拖拽排序
	const handleSortCases = (newList: CaseItem[]) => {
		// 只保留CaseItem应有的字段，过滤掉ReactSortable添加的内部字段
		// 保持原有的 caseId 不变，只改变顺序
		const cleanedCases = newList.map((c) => ({
			caseId: c.caseId, // 保持原有 ID 不变
			logicalSymbol: c.logicalSymbol,
			conditions: c.conditions,
			outputHandleId: c.outputHandleId, // 保持原有 outputHandleId
		}));

		// 更新本地状态
		updateCases(cleanedCases);
	};

	// 为ReactSortable准备的带有id的cases
	const casesWithId = backtestConfig?.cases?.map((caseItem) => ({
		...caseItem,
		id: caseItem.caseId,
	}));

	return (
		<div className="h-full overflow-y-auto bg-white">
			<div className="flex flex-col gap-2 p-2">
			{/* 如果cases为空，则传一个空的case */}
			{!backtestConfig?.cases || backtestConfig?.cases.length === 0 ? (
				<CaseEditor
					variableItemList={variables}
					caseItem={{
						caseId: 1,
						outputHandleId: `${id}_output_1`,
						logicalSymbol: LogicalSymbol.AND,
						conditions: [],
					}}
					onCaseChange={updateCase}
					onCaseRemove={handleRemoveCase}
				/>
			) : (
				<ReactSortable
					list={casesWithId}
					setList={handleSortCases}
					handle=".drag-handle"
					animation={200}
					className="flex flex-col gap-2"
				>
					{casesWithId?.map((caseItem, index) => (
						<div key={caseItem.caseId}>
							<CaseEditor
								variableItemList={variables}
								caseItem={caseItem}
								caseIndex={index + 1}
								onCaseChange={updateCase}
								onCaseRemove={handleRemoveCase}
							/>
						</div>
					))}
				</ReactSortable>
			)}
			{/* 添加分支按钮 */}
			<div className="px-2">
				<Button
					variant="outline"
					className="w-full h-8 border-dashed hover:font-bold"
					onClick={handleAddElif}
				>
					<span className="text-xs">+ELIF</span>
				</Button>
			</div>
			{/* 分支 */}
			<Separator orientation="horizontal" className="h-px bg-gray-200" />
			<div className="flex flex-col gap-2 p-2">
				<h3 className="text-sm font-bold">ELSE</h3>
				<div className="text-xs text-muted-foreground">
					{t("ifElseNode.elseDescription")}
				</div>
			</div>
			</div>
		</div>
	);
};

export default IfElseNodeBacktestSettingPanel;
