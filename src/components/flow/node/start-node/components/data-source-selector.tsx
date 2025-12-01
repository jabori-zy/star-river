import { Construction, File } from "lucide-react";
import type React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { BacktestDataSource } from "@/types/strategy";
import { useTranslation } from "react-i18next";

interface DataSourceSelectorProps {
	dataSource: BacktestDataSource;
	setDataSource: (dataSource: BacktestDataSource) => void;
	updateDataSource: (dataSource: BacktestDataSource) => void;
}

const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({
	dataSource,
	setDataSource,
	updateDataSource,
}) => {
	const { t } = useTranslation();
	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<File className="h-4 w-4 text-muted-foreground" />
					<span className="font-medium text-sm">{t("startNode.dataSource")}</span>
				</div>
			</div>
			<div className="flex items-center justify-between">
				<Select
					value={dataSource}
					onValueChange={(value) => {
						// 更新本地状态
						setDataSource(value as BacktestDataSource);
						// 更新节点数据
						updateDataSource(value as BacktestDataSource);
					}}
				>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={BacktestDataSource.FILE} disabled>
							<Construction className="w-3.5 h-3.5 mr-1.5 text-yellow-500 inline" />
							{t("startNode.file")}
						</SelectItem>
						<SelectItem value={BacktestDataSource.EXCHANGE}>{t("startNode.exchange")}</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
};

export default DataSourceSelector;
