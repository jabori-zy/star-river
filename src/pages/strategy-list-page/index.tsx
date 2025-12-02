import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import CreateStrategyDialog from "@/components/create-strategy-dialog";
import { Button } from "@/components/ui/button";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { useStrategyList } from "@/service/strategy-management/get-strategy-list";
import { StrategyItem } from "./component/strategy-list-item";

function StrategyListPage() {
	const [open, setOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const ITEMS_PER_PAGE = 5;
	const { t } = useTranslation();
	// Use TanStack Query hook
	const { data, isLoading, error, refetch } = useStrategyList({
		params: {
			page: currentPage,
			items_per_page: ITEMS_PER_PAGE,
		},
	});

	// Handle delete callback
	const handleStrategyDelete = () => {
		refetch();
	};

	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-semibold tracking-tight">
					{t("desktop.strategyList")}
				</h2>
				<Button
					onClick={() => setOpen(true)}
					className="flex items-center gap-2"
				>
					<Plus className="h-4 w-4" />
					{t("desktop.newStrategy")}
				</Button>
			</div>

			<CreateStrategyDialog
				open={open}
				onOpenChange={setOpen}
				onSuccess={() => {
					setCurrentPage(1);
				}}
			/>

			<div className="space-y-4">
				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				) : error ? (
					<div className="text-center py-8 text-red-500">
						Error loading strategies: {error.message}
					</div>
				) : data?.data && data.data.length > 0 ? (
					<>
						<div className="space-y-2">
							{data.data.map((strategy) => (
								<StrategyItem
									key={strategy.id}
									strategyId={strategy.id}
									strategyName={strategy.name}
									strategyDescription={strategy.description}
									createTime={strategy.createTime}
									updateTime={strategy.updateTime}
									strategyStatus={strategy.status}
									tradeMode={strategy.tradeMode}
									nodeCount={strategy.nodeCount}
									onDelete={handleStrategyDelete}
								/>
							))}
						</div>
						{data.totalPages > 1 && (
							<Pagination className="mt-4">
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											onClick={() =>
												setCurrentPage((prev) => Math.max(1, prev - 1))
											}
										/>
									</PaginationItem>

									{/* 生成页码按钮 */}
									{Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
										(page) => {
											// 只显示当前页附近的页码和首尾页
											if (
												page === 1 ||
												page === data.totalPages ||
												(page >= currentPage - 1 && page <= currentPage + 1)
											) {
												return (
													<PaginationItem key={page}>
														<PaginationLink
															onClick={() => setCurrentPage(page)}
															isActive={page === currentPage}
														>
															{page}
														</PaginationLink>
													</PaginationItem>
												);
											} else if (
												page === currentPage - 2 ||
												page === currentPage + 2
											) {
												return (
													<PaginationItem key={page}>
														<PaginationEllipsis />
													</PaginationItem>
												);
											}
											return null;
										},
									)}

									<PaginationItem>
										<PaginationNext
											onClick={() =>
												setCurrentPage((prev) =>
													Math.min(data.totalPages, prev + 1),
												)
											}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						)}
					</>
				) : (
					<div className="text-center py-8 text-muted-foreground">
						暂无策略，点击右上角添加
					</div>
				)}
			</div>
		</div>
	);
}

export default StrategyListPage;
