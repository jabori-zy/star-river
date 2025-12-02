import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ConfirmBox from "@/components/confirm-box";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { getStrategyCacheKeys } from "@/service/strategy";
import type { IndicatorKey, KlineKey } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";

interface SymbolListDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	strategyId: number;
	selectedKlineCacheKeyStr?: string;
	onKlineSelect: (klineCacheKeyStr: string) => void;
}

export default function SymbolListDialog({
	open,
	onOpenChange,
	strategyId,
	selectedKlineCacheKeyStr,
	onKlineSelect,
}: SymbolListDialogProps) {
	const { t } = useTranslation();
	const [klineOptions, setKlineOptions] = useState<
		{ key: string; data: KlineKey }[]
	>([]);
	const [loading, setLoading] = useState(false);

	// 获取可用的kline数据
	const fetchKlineOptions = useCallback(async () => {
		setLoading(true);
		try {
			const keys = await getStrategyCacheKeys(strategyId);
			const parsedKeyMap: Record<string, KlineKey | IndicatorKey> = {};

			keys.forEach((keyString) => {
				parsedKeyMap[keyString] = parseKey(keyString) as
					| KlineKey
					| IndicatorKey;
			});

			// 过滤出kline选项
			const options: { key: string; data: KlineKey }[] = [];
			Object.entries(parsedKeyMap).forEach(([key, value]) => {
				if (key.startsWith("kline|")) {
					options.push({
						key,
						data: value as KlineKey,
					});
				}
			});

			setKlineOptions(options);
		} catch (error) {
			console.error("获取kline选项失败:", error);
		} finally {
			setLoading(false);
		}
	}, [strategyId]);

	// 当dialog打开时获取kline数据
	useEffect(() => {
		if (open) {
			fetchKlineOptions();
		}
	}, [open, fetchKlineOptions]);

	// 处理kline选择
	const handleKlineSelect = (klineCacheKeyStr: string) => {
		onKlineSelect(klineCacheKeyStr);
		onOpenChange(false);
	};

	// 渲染kline项目
	const renderKlineItem = (klineCacheKey: KlineKey) => (
		<div className="flex items-center gap-2">
			<Badge variant="outline">{klineCacheKey.exchange}</Badge>
			<span className="font-medium">{klineCacheKey.symbol}</span>
			<Badge variant="secondary">{klineCacheKey.interval}</Badge>
		</div>
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange} modal={false}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>{t("desktop.backtestPage.selectKline")}</DialogTitle>
				</DialogHeader>
				<DialogDescription />
				<div className="grid gap-4 py-4">
					{loading ? (
						<div className="flex items-center justify-center py-8">
							<div className="text-sm text-gray-500">正在加载K线数据...</div>
						</div>
					) : (
						<div className="grid gap-2 max-h-96 overflow-y-auto">
							{klineOptions.map((option) => {
								const needsConfirmation =
									selectedKlineCacheKeyStr &&
									selectedKlineCacheKeyStr !== option.key;

								const buttonContent = (
									<Button
										key={option.key}
										variant={
											selectedKlineCacheKeyStr === option.key
												? "secondary"
												: "outline"
										}
										className={`flex items-center justify-start gap-2 h-auto p-3 w-full ${
											selectedKlineCacheKeyStr === option.key
												? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
												: ""
										}`}
										onClick={
											needsConfirmation
												? undefined
												: () => handleKlineSelect(option.key)
										}
									>
										{renderKlineItem(option.data)}
									</Button>
								);

								return needsConfirmation ? (
									<ConfirmBox
										key={option.key}
										title="确认切换交易对吗？"
										description="切换后，所有添加的指标将被删除。"
										confirmText="确认"
										cancelText="取消"
										onConfirm={() => handleKlineSelect(option.key)}
									>
										{buttonContent}
									</ConfirmBox>
								) : (
									buttonContent
								);
							})}
							{klineOptions.length === 0 && (
								<div className="text-center py-8 text-gray-500">
									暂无可用的K线数据
								</div>
							)}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
