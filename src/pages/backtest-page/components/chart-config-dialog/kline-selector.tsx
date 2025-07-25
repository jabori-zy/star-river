import { useMemo, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BacktestKlineKey, BacktestIndicatorKey } from "@/types/symbol-key";

interface KlineSelectorProps {
	cacheKeys: Record<string, BacktestKlineKey | BacktestIndicatorKey>;
	selectedKlineCacheKey: string | null;
	onKlineChange: (klineCacheKey: string) => void;
	loading: boolean;
}

const KlineSelector = ({
	cacheKeys,
	selectedKlineCacheKey,
	onKlineChange,
}: KlineSelectorProps) => {
	// 控制Select的开关状态，解决与Dialog焦点冲突的问题
	const [isSelectOpen, setIsSelectOpen] = useState(false);

	// 计算K线选项
	const klineOptions = useMemo(() => {
		const options: { key: string; data: BacktestKlineKey }[] = [];

		Object.entries(cacheKeys).forEach(([key, value]) => {
			if (key.startsWith("backtest_kline|")) {
				options.push({
					key,
					data: value as BacktestKlineKey,
				});
			}
		});

		return options;
	}, [cacheKeys]);

	// 渲染K线项目
	const renderKlineItem = (klineCacheKey: BacktestKlineKey) => (
		<div className="flex items-center gap-2">
			<Badge variant="outline">{klineCacheKey.exchange}</Badge>
			<span className="font-medium">{klineCacheKey.symbol}</span>
			<Badge variant="secondary">{klineCacheKey.interval}</Badge>
		</div>
	);

	return (
		<div className="grid gap-2">
			<h3 className="text-sm font-medium">K线</h3>
			<Select
				value={selectedKlineCacheKey || ""}
				onValueChange={(value) => {
					// 先关闭Select，然后更新值，避免焦点冲突
					setIsSelectOpen(false);
					onKlineChange(value);
				}}
				open={isSelectOpen}
				onOpenChange={(open) => {
					// 控制Select的开关状态，防止Dialog焦点冲突
					setIsSelectOpen(open);
				}}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="选择K线">
						{selectedKlineCacheKey &&
							cacheKeys[selectedKlineCacheKey] &&
							renderKlineItem(
								cacheKeys[selectedKlineCacheKey] as BacktestKlineKey,
							)}
					</SelectValue>
				</SelectTrigger>
				<SelectContent
					onCloseAutoFocus={(e) => {
						// 防止关闭时的自动聚焦，避免与Dialog焦点冲突
						e.preventDefault();
					}}
					onPointerDownOutside={() => {
						// 点击外部时关闭Select，避免焦点陷阱
						setIsSelectOpen(false);
					}}
				>
					{klineOptions.map((option) => (
						<SelectItem key={option.key} value={option.key}>
							{renderKlineItem(option.data as BacktestKlineKey)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};

export default KlineSelector;
