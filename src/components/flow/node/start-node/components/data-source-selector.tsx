import React from "react";
import { BacktestDataSource } from "@/types/strategy";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { File } from "lucide-react";

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
	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<File className="h-4 w-4 text-muted-foreground" />
					<span className="font-medium text-sm">数据源</span>
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
						<SelectValue placeholder="选择数据源" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={BacktestDataSource.FILE}>文件</SelectItem>
						<SelectItem value={BacktestDataSource.EXCHANGE}>交易所</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
};

export default DataSourceSelector;
