import {
	useReactFlow,
	useStore,
	useStoreApi,
	useViewport,
} from "@xyflow/react";
import { Lock, Maximize2, Unlock, ZoomIn, ZoomOut } from "lucide-react";
import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ControlButtonProps {
	onClick: () => void;
	disabled?: boolean;
	title?: string;
	children: React.ReactNode;
	className?: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({
	onClick,
	disabled = false,
	title,
	children,
	className,
}) => {
	return (
		<Button
			onClick={onClick}
			disabled={disabled}
			title={title}
			variant="ghost"
			size="icon"
			className={cn(
				"w-8 h-8 bg-white hover:bg-gray-50 p-0",
				disabled && "opacity-50 cursor-not-allowed",
				className,
			)}
		>
			{children}
		</Button>
	);
};

// Selector function to get ReactFlow state
const selector = (state: {
	nodesDraggable: boolean;
	nodesConnectable: boolean;
	elementsSelectable: boolean;
	transform: [number, number, number];
	minZoom: number;
	maxZoom: number;
}) => ({
	isInteractive:
		state.nodesDraggable || state.nodesConnectable || state.elementsSelectable,
	minZoomReached: state.transform[2] <= state.minZoom,
	maxZoomReached: state.transform[2] >= state.maxZoom,
});

enum ZoomType {
	zoomIn = "zoomIn",
	zoomOut = "zoomOut",
	zoomToFit = "zoomToFit",
	zoomTo50 = "zoomTo50",
	zoomTo75 = "zoomTo75",
	zoomTo100 = "zoomTo100",
	zoomTo200 = "zoomTo200",
}

// Viewport control component
const ViewportControl: React.FC = () => {
	const { zoomIn, zoomOut, fitView, zoomTo } = useReactFlow();
	const { isInteractive, minZoomReached, maxZoomReached } = useStore(selector);
	const { zoom } = useViewport();
	const store = useStoreApi();
	const [zoomPopoverOpen, setZoomPopoverOpen] = useState(false);

	// Zoom options configuration
	const ZOOM_OPTIONS = [
		[
			{ key: ZoomType.zoomTo200, text: "200%", value: 2 },
			{ key: ZoomType.zoomTo100, text: "100%", value: 1 },
			{ key: ZoomType.zoomTo75, text: "75%", value: 0.75 },
			{ key: ZoomType.zoomTo50, text: "50%", value: 0.5 },
		],
		[{ key: ZoomType.zoomToFit, text: "Fit View", value: null }],
	];

	// Zoom in
	const handleZoomIn = useCallback(() => {
		zoomIn({ duration: 800 });
	}, [zoomIn]);

	// Zoom out
	const handleZoomOut = useCallback(() => {
		zoomOut({ duration: 800 });
	}, [zoomOut]);

	// Fit view
	const handleFitView = useCallback(() => {
		fitView({ padding: 0.1, duration: 800 });
	}, [fitView]);

	// Toggle interactivity
	const handleToggleInteractive = useCallback(() => {
		store.setState({
			nodesDraggable: !isInteractive,
			nodesConnectable: !isInteractive,
			elementsSelectable: !isInteractive,
		});
	}, [isInteractive, store]);

	// Handle zoom
	const handleZoom = useCallback(
		(type: string) => {
			if (type === ZoomType.zoomToFit) {
				handleFitView();
			} else if (type === ZoomType.zoomTo50) {
				zoomTo(0.5, { duration: 800 });
			} else if (type === ZoomType.zoomTo75) {
				zoomTo(0.75, { duration: 800 });
			} else if (type === ZoomType.zoomTo100) {
				zoomTo(1, { duration: 800 });
			} else if (type === ZoomType.zoomTo200) {
				zoomTo(2, { duration: 800 });
			}
			setZoomPopoverOpen(false);
		},
		[zoomTo, handleFitView],
	);

	return (
		<>
			{/* Zoom in button */}
			<ControlButton
				onClick={handleZoomIn}
				disabled={maxZoomReached}
				title="Zoom in"
			>
				<ZoomIn className="w-6 h-6" />
			</ControlButton>

			{/* Zoom percentage display and selector */}
			<Popover open={zoomPopoverOpen} onOpenChange={setZoomPopoverOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="w-8 h-8 p-0 bg-white text-xs"
						title="Select zoom level"
					>
						{Math.round(zoom * 100)}%
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="w-36 p-2 ml-2 shadow-none"
					side="right"
					align="start"
				>
					{ZOOM_OPTIONS.map((options, i) => (
						<React.Fragment key={`zoom-options-group-${options[0].key}`}>
							{i !== 0 && <Separator className="my-1" />}
							<div className="space-y-1">
								{options.map((option) => (
									<button
										key={`zoom-option-${option.key}`}
										type="button"
										className="w-full flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-gray-100 cursor-pointer"
										onClick={() => handleZoom(option.key)}
									>
										<span>{option.text}</span>
										{option.value && zoom === option.value && (
											<div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
										)}
									</button>
								))}
							</div>
						</React.Fragment>
					))}
				</PopoverContent>
			</Popover>

			{/* Zoom out button */}
			<ControlButton
				onClick={handleZoomOut}
				disabled={minZoomReached}
				title="Zoom out"
			>
				<ZoomOut className="w-4 h-4" />
			</ControlButton>

			{/* Separator */}
			<Separator />

			{/* Fit view button */}
			<ControlButton onClick={handleFitView} title="Fit view">
				<Maximize2 className="w-4 h-4" />
			</ControlButton>

			{/* Interactivity toggle button */}
			<ControlButton
				onClick={handleToggleInteractive}
				title={isInteractive ? "Lock view" : "Unlock view"}
			>
				{isInteractive ? (
					<Unlock className="w-4 h-4" />
				) : (
					<Lock className="w-4 h-4" />
				)}
			</ControlButton>
		</>
	);
};

export default ViewportControl;
