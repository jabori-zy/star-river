import { useState } from "react";
import { KlineChartConfig, SubChartConfig } from "@/types/chart";
import Dialog from "@/components/dialog";
import Menu, { MenuType } from "./menu";
import KlineEditor from "./kline-editor";
import IndicatorEditor from "./indicator-editor";

interface ChartEditDialogProps {
	isOpen: boolean;
	onClose: () => void;
	mode: "main" | "sub";
	klineChartConfig?: KlineChartConfig;
	subChartConfigs?: SubChartConfig[];
	onSave: (
		config: KlineChartConfig | SubChartConfig | SubChartConfig[],
	) => void;
}

const ChartEditDialog = ({
	isOpen,
	onClose,
	mode,
	klineChartConfig,
	subChartConfigs,
	onSave,
}: ChartEditDialogProps) => {
	// 当前选中的菜单
	const [selectedMenu, setSelectedMenu] = useState<MenuType>(
		mode === "main" ? "kline" : "indicator",
	);

	const handleSave = () => {
		// TODO: 实现保存逻辑
		console.log("保存设置", { mode, klineChartConfig, subChartConfigs });

		if (mode === "main" && klineChartConfig) {
			onSave(klineChartConfig);
		} else if (mode === "sub" && subChartConfigs) {
			onSave(subChartConfigs);
		}

		onClose();
	};

	const handleCancel = () => {
		onClose();
	};

	const handleMenuSelect = (menu: MenuType) => {
		setSelectedMenu(menu);
	};

	return (
		<Dialog
			isOpen={isOpen}
			onClose={handleCancel}
			title="编辑图表"
			onSave={handleSave}
			onCancel={handleCancel}
			saveText="保存设置"
			cancelText="取消"
			className="w-full max-w-4xl min-w-[800px] max-h-[80vh] min-h-[600px]"
			contentClassName="flex"
		>
			<div className="flex border-b border-gray-200 border-t ">
				{/* 左侧菜单 */}
				<Menu
					mode={mode}
					selectedMenu={selectedMenu}
					onMenuSelect={handleMenuSelect}
				/>

				{/* 右侧编辑窗口 */}
				<div className="flex-1 flex flex-col overflow-hidden">
					<div className="p-6 flex-1 overflow-y-auto">
						{selectedMenu === "kline" &&
							mode === "main" &&
							klineChartConfig && (
								<KlineEditor klineChartConfig={klineChartConfig} />
							)}

						{selectedMenu === "indicator" && (
							<IndicatorEditor
								mode={mode}
								klineChartConfig={klineChartConfig}
								subChartConfigs={subChartConfigs}
							/>
						)}
					</div>
				</div>
			</div>
		</Dialog>
	);
};

export default ChartEditDialog;
