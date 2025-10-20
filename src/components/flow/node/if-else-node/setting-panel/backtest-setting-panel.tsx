import { useNodeConnections } from "@xyflow/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ReactSortable } from "react-sortablejs";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useStrategyWorkflow, {
	type VariableItem,
} from "@/hooks/flow/use-strategy-workflow";
import { useUpdateBacktestConfig } from "@/hooks/node-config/if-else-node/use-update-backtest-config";
import {
	type CaseItem,
	type IfElseNodeData,
	LogicalSymbol,
} from "@/types/node/if-else-node";
import { TradeMode } from "@/types/strategy";
import CaseEditor from "../components/case-editor";

const IfElseNodeBacktestSettingPanel: React.FC<SettingProps> = ({
	id,
	data,
}) => {
	const ifElseNodeData = data as IfElseNodeData;
	const { t } = useTranslation();
	const [localBacktestCases, setLocalBacktestCases] = useState<CaseItem[]>(
		ifElseNodeData?.backtestConfig?.cases || [],
	);

	const { updateCase, removeCase, updateCases } = useUpdateBacktestConfig({
		id,
		initialConfig: ifElseNodeData?.backtestConfig,
	});
	const { getConnectedNodeVariables } = useStrategyWorkflow();

	// 获取所有连接
	const connections = useNodeConnections({ id, handleType: "target" });
	// 收集到的所有变量列表
	const [variableItemList, setVariableItemList] = useState<VariableItem[]>([]);

	// 当节点的回测配置发生变化时，同步到本地状态，确保重新打开面板时能看到已保存的数据
	useEffect(() => {
		const cases = ifElseNodeData?.backtestConfig?.cases;

		if (!cases || cases.length === 0) {
			setLocalBacktestCases([]);
			return;
		}

		setLocalBacktestCases((prevCases) => {
			const hasReferenceDiff =
				prevCases.length !== cases.length ||
				prevCases.some((prevCase, index) => prevCase !== cases[index]);

			if (!hasReferenceDiff) {
				return prevCases;
			}

			return cases.map((caseItem) => ({
				...caseItem,
				conditions: (caseItem.conditions ?? []).map((condition) => ({
					...condition,
					left: condition.left
						? { ...condition.left }
						: null,
					right: condition.right
						? { ...condition.right }
						: null,
				})),
			}));
		});
	}, [ifElseNodeData?.backtestConfig?.cases]);

	useEffect(() => {
		// 获取连接节点的变量并更新状态
		// console.log("connections", connections);
		const variables = getConnectedNodeVariables(
			connections,
			TradeMode.BACKTEST,
		);
		setVariableItemList(variables);
	}, [connections, getConnectedNodeVariables]);

	// 更新case
	const handleCaseChange = (caseItem: CaseItem) => {
		// 如果当前配置为空，先初始化一个case
		if (!localBacktestCases || localBacktestCases.length === 0) {
			// 确保第一个case的ID为1，符合其他地方的预期
			const normalizedCase = { ...caseItem, caseId: 1 };
			setLocalBacktestCases([normalizedCase]);
			updateCase(normalizedCase);
		} else {
			setLocalBacktestCases(
				localBacktestCases.map((c) =>
					c.caseId === caseItem.caseId ? caseItem : c,
				),
			);
			updateCase(caseItem);
		}
	};

	// 添加ELIF分支
	const handleAddElif = () => {
		const caseId = localBacktestCases?.length + 1 || 1;
		const newCaseItem: CaseItem = {
			caseId: caseId,
			outputHandleId: `${id}_output_${caseId}`,
			logicalSymbol: LogicalSymbol.AND,
			conditions: [],
		};
		setLocalBacktestCases([...localBacktestCases, newCaseItem]);
		updateCase(newCaseItem);
	};

	// 删除case
	const handleRemoveCase = (caseId: number) => {
		console.log("删除case", caseId);
		removeCase(caseId);

		// 先过滤掉要删除的case
		const filteredCases = localBacktestCases.filter((c) => c.caseId !== caseId);
		console.log("重置id前", filteredCases);

		// 判断filteredCases是否为空
		// 如果为空，则添加一个id为1的case
		if (filteredCases.length === 0) {
			const newCase: CaseItem = {
				caseId: 1,
				outputHandleId: `${id}_output_1`,
				logicalSymbol: LogicalSymbol.AND,
				conditions: [],
			};
			setLocalBacktestCases([newCase]);
			updateCases([newCase]);
			return;
		} else {
			// 重新设置caseId，确保连续性（1,2,3...）
			const resetCases = filteredCases.map((c, index) => ({
				...c,
				caseId: index + 1,
			}));

			// 更新本地状态
			setLocalBacktestCases(resetCases);

			// 同步更新后的case到配置中
			updateCases(resetCases);
		}
	};

	// 处理拖拽排序
	const handleSortCases = (newList: CaseItem[]) => {
		// 只保留CaseItem应有的字段，过滤掉ReactSortable添加的内部字段
		const resetCases = newList.map((c, index) => ({
			caseId: index + 1, // 重新设置caseId，确保连续性（1,2,3...）
			logicalSymbol: c.logicalSymbol,
			conditions: c.conditions,
			outputHandleId: `${id}_output_${index + 1}`,
		}));

		// 更新本地状态
		setLocalBacktestCases(resetCases);

		// 同步更新后的case到配置中
		updateCases(resetCases);
	};

	// 为ReactSortable准备的带有id的cases
	const casesWithId = localBacktestCases.map((caseItem) => ({
		...caseItem,
		id: caseItem.caseId,
	}));

	return (
		<div className="flex flex-col gap-2">
			{/* 如果cases为空，则传一个空的case */}
			{!localBacktestCases || localBacktestCases.length === 0 ? (
				<CaseEditor
					id={id}
					data={data}
					variableItemList={variableItemList}
					caseItem={{
						caseId: 1,
						outputHandleId: `${id}_output_1`,
						logicalSymbol: LogicalSymbol.AND,
						conditions: [],
					}}
					onCaseChange={handleCaseChange}
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
					{casesWithId.map((caseItem) => (
						<div key={caseItem.caseId}>
							<CaseEditor
								id={id}
								data={data}
								variableItemList={variableItemList}
								caseItem={caseItem}
								onCaseChange={handleCaseChange}
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
	);
};

export default IfElseNodeBacktestSettingPanel;
