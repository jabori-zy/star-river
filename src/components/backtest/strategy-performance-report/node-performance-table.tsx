import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { NodePerformanceReport } from "@/types/strategy/strategy-benchmark";
import { formatDuration } from "@/types/strategy/strategy-benchmark";

interface NodePerformanceTableProps {
	nodeReports: NodePerformanceReport[];
}

export default function NodePerformanceTable({
	nodeReports,
}: NodePerformanceTableProps) {
	const [isOpen, setIsOpen] = useState(true);
	const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
	const { t } = useTranslation();
	const toggleRow = (nodeId: string) => {
		setExpandedRows((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(nodeId)) {
				newSet.delete(nodeId);
			} else {
				newSet.add(nodeId);
			}
			return newSet;
		});
	};

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<Card className="shadow-none">
				<CardHeader className="px-3">
					<CollapsibleTrigger asChild>
						<button
							type="button"
							className="flex items-center justify-between w-full hover:opacity-80 transition-opacity"
						>
							<CardTitle className="text-sm">
								{t("desktop.backtestPage.benchmark.nodePerformance")}
							</CardTitle>
							{isOpen ? (
								<ChevronUp className="h-4 w-4" />
							) : (
								<ChevronDown className="h-4 w-4" />
							)}
						</button>
					</CollapsibleTrigger>
				</CardHeader>

				<CollapsibleContent>
					<CardContent className="px-3">
						{nodeReports.length > 0 &&
						nodeReports.some((node) => node.totalCycles > 0) ? (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="text-xs py-1.5 w-8"></TableHead>
											<TableHead className="text-xs py-1.5 w-[120px]">
												{t("desktop.backtestPage.benchmark.nodeName")}
											</TableHead>
											<TableHead className="text-right text-xs py-1.5 w-[65px]">
												{t("desktop.backtestPage.benchmark.cycles")}
											</TableHead>
											<TableHead className="text-right text-xs py-1.5 w-[75px]">
												{t("desktop.backtestPage.benchmark.average")}
											</TableHead>
											<TableHead className="text-right text-xs py-1.5 w-[55px]">
												{t("desktop.backtestPage.benchmark.strategyPercentage")}
											</TableHead>
											<TableHead className="text-right text-xs py-1.5 w-[75px]">
												{t("desktop.backtestPage.benchmark.min")}
											</TableHead>
											<TableHead className="text-right text-xs py-1.5 w-[75px]">
												{t("desktop.backtestPage.benchmark.max")}
											</TableHead>
											<TableHead className="text-right text-xs py-1.5 w-[75px]">
												{t("desktop.backtestPage.benchmark.p25")}
											</TableHead>
											<TableHead className="text-right text-xs py-1.5 w-[75px]">
												{t("desktop.backtestPage.benchmark.p50")}
											</TableHead>
											<TableHead className="text-right text-xs py-1.5 w-[75px]">
												{t("desktop.backtestPage.benchmark.p75")}
											</TableHead>
											<TableHead className="text-right text-xs py-1.5 w-[75px]">
												{t("desktop.backtestPage.benchmark.p95")}
											</TableHead>
											<TableHead className="text-right text-xs py-1.5 w-[75px]">
												{t("desktop.backtestPage.benchmark.p99")}
											</TableHead>
											<TableHead className="text-right text-xs py-1.5 w-[75px]">
												{t("desktop.backtestPage.benchmark.stdDeviation")}
											</TableHead>
											<TableHead className="text-right text-xs py-1.5 w-[85px]">
												{t("desktop.backtestPage.benchmark.recentAvg100")}
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{nodeReports.map((node) => {
											const isExpanded = expandedRows.has(node.nodeId);
											const hasPhaseReports =
												node.phaseReports && node.phaseReports.length > 0;

											return (
												<>
													{/* Main Row */}
													<TableRow
														key={node.nodeId}
														className="hover:bg-muted/50"
													>
														<TableCell className="py-1.5">
															{hasPhaseReports && (
																<Button
																	variant="ghost"
																	size="icon"
																	onClick={() => toggleRow(node.nodeId)}
																	className="h-5 w-5 p-0"
																>
																	{isExpanded ? (
																		<ChevronDown className="h-3 w-3" />
																	) : (
																		<ChevronRight className="h-3 w-3" />
																	)}
																</Button>
															)}
														</TableCell>
														<TableCell className="font-medium text-xs py-1.5">
															{node.nodeName}
														</TableCell>
														<TableCell className="text-right text-xs py-1.5">
															{node.totalCycles}
														</TableCell>
														<TableCell className="text-right text-xs py-1.5">
															{node.totalCycles > 0
																? formatDuration(node.avgDuration)
																: "N/A"}
														</TableCell>
														<TableCell className="text-right text-xs py-1.5">
															{node.totalCycles > 0
																? `${node.avgDurationPercentage.toFixed(1)}%`
																: "N/A"}
														</TableCell>
														<TableCell className="text-right text-xs py-1.5">
															{node.totalCycles > 0
																? formatDuration(node.minDuration)
																: "N/A"}
														</TableCell>
														<TableCell className="text-right text-xs py-1.5">
															{node.totalCycles > 0
																? formatDuration(node.maxDuration)
																: "N/A"}
														</TableCell>
														<TableCell className="text-right text-xs py-1.5">
															{node.totalCycles > 0
																? formatDuration(node.p25)
																: "N/A"}
														</TableCell>
														<TableCell className="text-right text-xs py-1.5">
															{node.totalCycles > 0
																? formatDuration(node.p50)
																: "N/A"}
														</TableCell>
														<TableCell className="text-right text-xs py-1.5">
															{node.totalCycles > 0
																? formatDuration(node.p75)
																: "N/A"}
														</TableCell>

														<TableCell className="text-right text-xs py-1.5">
															{node.totalCycles > 0
																? formatDuration(node.p95)
																: "N/A"}
														</TableCell>
														<TableCell className="text-right text-xs py-1.5">
															{node.totalCycles > 0
																? formatDuration(node.p99)
																: "N/A"}
														</TableCell>
														<TableCell className="text-right text-xs py-1.5">
															{node.totalCycles > 0
																? formatDuration(node.stdDeviation)
																: "N/A"}
														</TableCell>
														<TableCell className="text-right text-xs py-1.5">
															{node.totalCycles > 0
																? formatDuration(node.recentAvg100)
																: "N/A"}
														</TableCell>
													</TableRow>

													{/* Expanded Phase Reports Row */}
													{isExpanded && hasPhaseReports && (
														<TableRow key={`${node.nodeId}-phases`}>
															<TableCell
																colSpan={14}
																className="bg-muted/30 py-2 px-2"
															>
																<div className="pl-6">
																	<Table>
																		<TableHeader>
																			<TableRow>
																				<TableHead className="text-xs py-1 w-[140px]">
																					{t(
																						"desktop.backtestPage.benchmark.phaseName",
																					)}
																				</TableHead>
																				<TableHead className="text-right text-xs py-1 w-[70px]">
																					{t(
																						"desktop.backtestPage.benchmark.cycles",
																					)}
																				</TableHead>
																				<TableHead className="text-right text-xs py-1 w-[75px]">
																					{t(
																						"desktop.backtestPage.benchmark.average",
																					)}
																				</TableHead>
																				<TableHead className="text-right text-xs py-1 w-[60px]">
																					{t(
																						"desktop.backtestPage.benchmark.nodePercentage",
																					)}
																				</TableHead>
																				<TableHead className="text-right text-xs py-1 w-[75px]">
																					{t(
																						"desktop.backtestPage.benchmark.min",
																					)}
																				</TableHead>
																				<TableHead className="text-right text-xs py-1 w-[75px]">
																					{t(
																						"desktop.backtestPage.benchmark.max",
																					)}
																				</TableHead>
																				<TableHead className="text-right text-xs py-1 w-[75px]">
																					{t(
																						"desktop.backtestPage.benchmark.p25",
																					)}
																				</TableHead>
																				<TableHead className="text-right text-xs py-1 w-[75px]">
																					{t(
																						"desktop.backtestPage.benchmark.p50",
																					)}
																				</TableHead>
																				<TableHead className="text-right text-xs py-1 w-[75px]">
																					{t(
																						"desktop.backtestPage.benchmark.p75",
																					)}
																				</TableHead>
																				<TableHead className="text-right text-xs py-1 w-[75px]">
																					{t(
																						"desktop.backtestPage.benchmark.p95",
																					)}
																				</TableHead>
																				<TableHead className="text-right text-xs py-1 w-[75px]">
																					{t(
																						"desktop.backtestPage.benchmark.p99",
																					)}
																				</TableHead>
																				<TableHead className="text-right text-xs py-1 w-[75px]">
																					{t(
																						"desktop.backtestPage.benchmark.total",
																					)}
																				</TableHead>
																			</TableRow>
																		</TableHeader>
																		<TableBody>
																			{node.phaseReports.map((phase, index) => (
																				<TableRow
																					key={`${node.nodeId}-phase-${index}`}
																				>
																					<TableCell className="text-xs py-1">
																						{phase.phaseName}
																					</TableCell>
																					<TableCell className="text-right text-xs py-1">
																						{phase.totalCycles}
																					</TableCell>
																					<TableCell className="text-right text-xs py-1">
																						{formatDuration(phase.avgDuration)}
																					</TableCell>
																					<TableCell className="text-right text-xs py-1">
																						{phase.avgDurationPercentage.toFixed(
																							1,
																						)}
																						%
																					</TableCell>
																					<TableCell className="text-right text-xs py-1">
																						{formatDuration(phase.minDuration)}
																					</TableCell>
																					<TableCell className="text-right text-xs py-1">
																						{formatDuration(phase.maxDuration)}
																					</TableCell>
																					<TableCell className="text-right text-xs py-1">
																						{formatDuration(phase.p25)}
																					</TableCell>
																					<TableCell className="text-right text-xs py-1">
																						{formatDuration(phase.p50)}
																					</TableCell>
																					<TableCell className="text-right text-xs py-1">
																						{formatDuration(phase.p75)}
																					</TableCell>
																					<TableCell className="text-right text-xs py-1">
																						{formatDuration(phase.p95)}
																					</TableCell>
																					<TableCell className="text-right text-xs py-1">
																						{formatDuration(phase.p99)}
																					</TableCell>
																					<TableCell className="text-right text-xs py-1">
																						{formatDuration(
																							phase.totalDuration,
																						)}
																					</TableCell>
																				</TableRow>
																			))}
																		</TableBody>
																	</Table>
																</div>
															</TableCell>
														</TableRow>
													)}
												</>
											);
										})}
									</TableBody>
								</Table>
							</div>
						) : (
							<p className="text-muted-foreground text-center text-xs py-3">
								{t("desktop.backtestPage.benchmark.noDataDescription")}
							</p>
						)}
					</CardContent>
				</CollapsibleContent>
			</Card>
		</Collapsible>
	);
}
