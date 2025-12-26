import {
	Check,
	CircleArrowOutUpRight,
	Cloud,
	Pencil,
	Save,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Strategy, StrategyRunState, TradeMode } from "@/types/strategy";
import { formatTimeWithTimezone } from "@/utils/date-format";
import { exportStrategy } from "@/utils/export-strategy";
import StrategyControl from "../strategy-control";
import type { OperationType } from "../strategy-control/type";
import HeaderDropdownMenu from "./dropdown-menu";

interface StrategyPageHeaderProps {
	strategy: Strategy;
	tradeMode: TradeMode;
	saveStatus: "saved" | "unsaved" | "saving";
	onSave: (autoSave?: boolean) => void;
	strategyRunState: StrategyRunState;
	onStrategyChange?: (updates: Partial<Strategy>) => void;
	onOperationSuccess?: (operationType: OperationType) => void;
}

export default function StrategyPageHeader({
	strategy,
	tradeMode,
	saveStatus,
	onSave,
	strategyRunState,
	onStrategyChange,
	onOperationSuccess,
}: StrategyPageHeaderProps) {
	const { t } = useTranslation();
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [isEditingDesc, setIsEditingDesc] = useState(false);
	const [titleInput, setTitleInput] = useState(strategy.name);
	const [descInput, setDescInput] = useState(strategy.description);
	const [timeDisplay, setTimeDisplay] = useState("");
	const [isAutoSaving, setIsAutoSaving] = useState(false);

	const titleInputRef = useRef<HTMLInputElement>(null);
	const descInputRef = useRef<HTMLInputElement>(null);

	// Sync local state
	useEffect(() => {
		setTitleInput(strategy.name);
		setDescInput(strategy.description);
	}, [strategy.name, strategy.description]);

	// Update time display
	useEffect(() => {
		const updateTimer = () => {
			if (strategy.updateTime) {
				setTimeDisplay(
					formatTimeWithTimezone(
						strategy.updateTime,
						{
							dateFormat: "smart",
							showTimezone: false,
						},
						t,
					),
				);
			}
		};
		updateTimer();
		const interval = setInterval(updateTimer, 5000); // Update every 5 seconds
		return () => clearInterval(interval);
	}, [strategy.updateTime, t]);

	// Auto save every 60 seconds when there are unsaved changes
	useEffect(() => {
		const autoSaveInterval = setInterval(() => {
			if (saveStatus === "unsaved" && !isAutoSaving) {
				setIsAutoSaving(true);
				onSave(true); // autoSave mode, no toast

				// Keep showing for at least 1 second
				setTimeout(() => {
					setIsAutoSaving(false);
				}, 1000);
			}
		}, 180000); // 180 seconds

		return () => clearInterval(autoSaveInterval);
	}, [saveStatus, onSave, isAutoSaving]);

	// Auto focus input box
	useEffect(() => {
		if (isEditingTitle && titleInputRef.current) {
			titleInputRef.current.focus();
			titleInputRef.current.select();
		}
	}, [isEditingTitle]);

	useEffect(() => {
		if (isEditingDesc && descInputRef.current) {
			descInputRef.current.focus();
			descInputRef.current.select();
		}
	}, [isEditingDesc]);

	const handleTitleSubmit = () => {
		setIsEditingTitle(false);
		if (!titleInput.trim()) {
			setTitleInput(strategy.name); // Restore original value
			return;
		}
		// If title changed, notify parent component
		if (titleInput !== strategy.name && onStrategyChange) {
			onStrategyChange({ name: titleInput });
		}
	};

	const handleDescSubmit = () => {
		setIsEditingDesc(false);
		// If description changed, notify parent component
		if (descInput !== strategy.description && onStrategyChange) {
			onStrategyChange({ description: descInput });
		}
	};

	const handleKeyDown = (
		e: React.KeyboardEvent,
		submitFn: () => void,
		cancelFn: () => void,
	) => {
		if (e.key === "Enter") {
			submitFn();
		} else if (e.key === "Escape") {
			cancelFn();
		}
	};

	const getSaveStatusText = () => {
		if (saveStatus === "saving") {
			return `${t("common.saving")}...`;
		}
		if (saveStatus === "unsaved") {
			return `${t("common.haveUnsavedChanges")}`;
		}
		return `${t("common.lastUpdated")}: ${timeDisplay}`;
	};

	return (
		<header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center px-4 justify-between z-50 sticky top-0 shadow-sm">
			{/* Left Section: Strategy Info */}
			<div className="flex items-center gap-4 flex-1 min-w-0">
				<div className="flex flex-col justify-center min-w-0 gap-0.5">
					{/* Title Row */}
					<div className="flex items-center gap-3">
						{isEditingTitle ? (
							<Input
								ref={titleInputRef}
								value={titleInput}
								onChange={(e) => setTitleInput(e.target.value)}
								onBlur={handleTitleSubmit}
								onKeyDown={(e) =>
									handleKeyDown(e, handleTitleSubmit, () => {
										setTitleInput(strategy.name);
										setIsEditingTitle(false);
									})
								}
								className="font-semibold text-lg h-7 w-full min-w-[200px] max-w-[300px] px-2"
							/>
						) : (
							<button
								type="button"
								className="group flex items-center gap-2 cursor-pointer select-none bg-transparent border-none p-0"
								onClick={() => setIsEditingTitle(true)}
							>
								<h1 className="font-semibold text-lg text-slate-900 truncate max-w-[300px] leading-tight">
									{titleInput}
								</h1>
								<Pencil className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-all -ml-1 group-hover:ml-0" />
							</button>
						)}

						{/* Status Badge */}
						<div className="flex-shrink-0">
							{saveStatus === "saving" && (
								<Badge
									variant="secondary"
									className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 gap-1.5 font-normal"
								>
									<Cloud className="w-3 h-3 animate-pulse" />
									<span>{t("common.saving")}</span>
								</Badge>
							)}
							{saveStatus === "unsaved" && (
								<Badge
									variant="secondary"
									className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 gap-1.5 font-normal"
								>
									<div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
									<span>{t("common.unsaved")}</span>
								</Badge>
							)}
							{saveStatus === "saved" && (
								<Badge
									variant="secondary"
									className="bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 gap-1.5 font-normal"
								>
									<Check className="w-3 h-3" />
									<span>{t("common.saved")}</span>
								</Badge>
							)}
						</div>
					</div>

					{/* Description Row */}
					<div className="flex items-center h-5">
						{isEditingDesc ? (
							<Input
								ref={descInputRef}
								value={descInput}
								onChange={(e) => setDescInput(e.target.value)}
								onBlur={handleDescSubmit}
								onKeyDown={(e) =>
									handleKeyDown(e, handleDescSubmit, () => {
										setDescInput(strategy.description);
										setIsEditingDesc(false);
									})
								}
								className="text-sm h-6 w-full min-w-[300px] max-w-[450px] px-2"
							/>
						) : (
							<button
								type="button"
								className="group flex items-center gap-2 cursor-pointer select-none bg-transparent border-none p-0"
								onClick={() => setIsEditingDesc(true)}
							>
								<p
									className={`text-xs truncate max-w-[450px] transition-colors ${
										!descInput
											? "text-slate-400 italic"
											: "text-slate-500 hover:text-slate-800"
									}`}
								>
									{descInput ||
										t("desktop.strategyWorkflowPage.addStrategyDescription")}
								</p>
								<Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-all" />
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Right Section: Actions */}
			<div className="flex items-center gap-3 shrink-0">
				<div className="flex flex-col items-end mr-1 hidden md:flex">
					{isAutoSaving ? (
						<span className="text-xs text-blue-500 font-medium flex items-center gap-1.5">
							<Spinner className="w-3 h-3" />
							{t("common.autoSaving")}...
						</span>
					) : (
						<span className="text-xs text-slate-400 font-medium tabular-nums">
							{getSaveStatusText()}
						</span>
					)}
				</div>

				<Button
					variant="outline"
					size="sm"
					onClick={() => onSave(false)}
					disabled={saveStatus === "saved" || saveStatus === "saving"}
					className={`min-w-[80px] ${
						saveStatus === "unsaved"
							? "border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
							: ""
					}`}
				>
					<Save className="w-4 h-4 mr-1" />
					{t("common.save")}
				</Button>

				<StrategyControl
					strategyId={strategy.id}
					strategyName={strategy.name}
					tradeMode={tradeMode}
					strategyRunState={strategyRunState}
					saveStatus={saveStatus}
					onSave={onSave}
					onOperationSuccess={onOperationSuccess}
				/>
				<div className="flex gap-1 items-center">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="text-slate-500 p-0"
								onClick={() => exportStrategy(strategy.id, strategy.name)}
							>
								<CircleArrowOutUpRight className="w-4 h-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							{t("desktop.strategyWorkflowPage.share")}
						</TooltipContent>
					</Tooltip>

					<div className="h-5 w-px bg-slate-200" />

					<HeaderDropdownMenu />
				</div>

				
			</div>
		</header>
	);
}
