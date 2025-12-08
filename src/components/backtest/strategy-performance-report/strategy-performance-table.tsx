import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { Duration } from "@/types/strategy/strategy-benchmark";
import { formatDuration } from "@/types/strategy/strategy-benchmark";

interface StrategyPerformanceTableProps {
	hasData: boolean;
	avgDuration?: Duration;
	p25?: Duration;
	p75?: Duration;
	p50?: Duration;
	p95?: Duration;
	p99?: Duration;
	recentAvg100?: Duration;
	stdDeviation?: Duration;
	minDuration?: Duration;
	maxDuration?: Duration;
}

export default function StrategyPerformanceTable({
	hasData,
	avgDuration,
	p25,
	p50,
	p75,
	minDuration,
	maxDuration,
	p95,
	p99,
	recentAvg100,
	stdDeviation,
}: StrategyPerformanceTableProps) {
	const { t } = useTranslation();
	return (
		<Card className="shadow-none">
			<CardHeader className="px-3">
				<CardTitle className="text-sm">
					{t("desktop.backtestPage.benchmark.strategyPerformance")}
				</CardTitle>
			</CardHeader>
			<CardContent className="px-3">
				{hasData && avgDuration ? (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<Table>
							<TableBody>
								<TableRow>
									<TableCell className="font-medium text-xs">
										{t("desktop.backtestPage.benchmark.average")}
									</TableCell>
									<TableCell className="text-right text-xs">
										{formatDuration(avgDuration)}
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="font-medium text-xs">
										{t("desktop.backtestPage.benchmark.min")}
									</TableCell>
									<TableCell className="text-right text-xs py-1.5">
										{minDuration ? formatDuration(minDuration) : "N/A"}
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="font-medium text-xs">
										{t("desktop.backtestPage.benchmark.max")}
									</TableCell>
									<TableCell className="text-right text-xs py-1.5">
										{maxDuration ? formatDuration(maxDuration) : "N/A"}
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="font-medium text-xs">
										{t("desktop.backtestPage.benchmark.p25")}
									</TableCell>
									<TableCell className="text-right text-xs py-1.5">
										{p25 ? formatDuration(p25) : "N/A"}
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="font-medium text-xs">
										{t("desktop.backtestPage.benchmark.p50")}
									</TableCell>
									<TableCell className="text-right text-xs py-1.5">
										{p50 ? formatDuration(p50) : "N/A"}
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>

						<Table>
							<TableBody>
								<TableRow>
									<TableCell className="font-medium text-xs">
										{t("desktop.backtestPage.benchmark.p75")}
									</TableCell>
									<TableCell className="text-right text-xs py-1.5">
										{p75 ? formatDuration(p75) : "N/A"}
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="font-medium text-xs">
										{t("desktop.backtestPage.benchmark.p95")}
									</TableCell>
									<TableCell className="text-right text-xs py-1.5">
										{p95 ? formatDuration(p95) : "N/A"}
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="font-medium text-xs">
										{t("desktop.backtestPage.benchmark.p99")}
									</TableCell>
									<TableCell className="text-right text-xs py-1.5">
										{p99 ? formatDuration(p99) : "N/A"}
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="font-medium text-xs">
										{t("desktop.backtestPage.benchmark.recentAvg100")}
									</TableCell>
									<TableCell className="text-right text-xs py-1.5">
										{recentAvg100 ? formatDuration(recentAvg100) : "N/A"}
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="font-medium text-xs">
										{t("desktop.backtestPage.benchmark.stdDeviation")}
									</TableCell>
									<TableCell className="text-right text-xs py-1.5">
										{stdDeviation ? formatDuration(stdDeviation) : "N/A"}
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</div>
				) : (
					<p className="text-muted-foreground text-center text-xs py-3">
						{t("desktop.backtestPage.benchmark.noDataDescription")}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
