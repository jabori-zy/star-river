import { KlineChartConfig, SubChartConfig } from "@/types/chart";

interface IndicatorEditorProps {
	mode: "main" | "sub";
	klineChartConfig?: KlineChartConfig;
	subChartConfigs?: SubChartConfig[];
}

const IndicatorEditor = ({
	mode,
	klineChartConfig,
	subChartConfigs,
}: IndicatorEditorProps) => {
	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold text-gray-900">指标配置</h3>

			{mode === "main" && klineChartConfig && (
				<div className="space-y-3">
					{Object.entries(klineChartConfig.indicatorChartConfig).map(
						([cacheKey, config]) => (
							<div key={cacheKey} className="bg-gray-50 p-4 rounded-lg">
								<h4 className="font-medium text-gray-900 mb-2">
									{config.name}
								</h4>
								<div className="space-y-2 text-sm">
									<div>
										<span className="text-gray-600">缓存键: </span>
										<span className="font-mono text-xs bg-gray-200 px-1 rounded">
											{cacheKey}
										</span>
									</div>
									<div>
										<span className="text-gray-600">位置: </span>
										<span
											className={
												config.isInMainChart
													? "text-blue-600"
													: "text-orange-600"
											}
										>
											{config.isInMainChart ? "主图" : "子图"}
										</span>
									</div>
									<div>
										<span className="text-gray-600">数据系列: </span>
										<span>{config.seriesConfigs.length} 个</span>
									</div>
									<div className="mt-2">
										<div className="text-gray-600 mb-1">系列配置:</div>
										{config.seriesConfigs.map((series, index) => (
											<div
												key={index}
												className="ml-2 text-xs bg-white p-2 rounded border"
											>
												<div>名称: {series.name}</div>
												<div>类型: {series.type}</div>
												<div>颜色: {series.color || "默认"}</div>
												<div>线宽: {series.strokeThickness || "默认"}</div>
											</div>
										))}
									</div>
								</div>
							</div>
						),
					)}

					{Object.keys(klineChartConfig.indicatorChartConfig).length === 0 && (
						<div className="text-center py-8 text-gray-500">暂无指标配置</div>
					)}
				</div>
			)}

			{mode === "sub" && subChartConfigs && (
				<div className="space-y-4">
					{subChartConfigs.map((subConfig, subIndex) => (
						<div
							key={subConfig.subChartId}
							className="border border-gray-200 rounded-lg p-4"
						>
							<h4 className="font-medium text-gray-900 mb-3">
								子图 {subIndex + 1} (ID: {subConfig.subChartId})
							</h4>

							<div className="space-y-3">
								{Object.entries(subConfig.indicatorChartConfigs).map(
									([cacheKey, config]) => (
										<div key={cacheKey} className="bg-gray-50 p-3 rounded">
											<h5 className="font-medium text-gray-800 mb-2">
												{config.name}
											</h5>
											<div className="space-y-1 text-sm">
												<div>
													<span className="text-gray-600">缓存键: </span>
													<span className="font-mono text-xs bg-gray-200 px-1 rounded">
														{cacheKey}
													</span>
												</div>
												<div>
													<span className="text-gray-600">数据系列: </span>
													<span>{config.seriesConfigs.length} 个</span>
												</div>
												<div className="mt-2">
													<div className="text-gray-600 mb-1">系列配置:</div>
													{config.seriesConfigs.map((series, index) => (
														<div
															key={index}
															className="ml-2 text-xs bg-white p-2 rounded border"
														>
															<div>名称: {series.name}</div>
															<div>类型: {series.type}</div>
															<div>颜色: {series.color || "默认"}</div>
															<div>
																线宽: {series.strokeThickness || "默认"}
															</div>
														</div>
													))}
												</div>
											</div>
										</div>
									),
								)}

								{Object.keys(subConfig.indicatorChartConfigs).length === 0 && (
									<div className="text-center py-4 text-gray-500">
										暂无指标配置
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default IndicatorEditor;
