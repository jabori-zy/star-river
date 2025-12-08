import { Plus, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import NodeListPanel from "./node-list-panel";

const SHOW_PANEL_TIME = 200;

// Add node button component
const AddNodeButton: React.FC = () => {
	const [showPanel, setShowPanel] = useState(false);
	const [isPinned, setIsPinned] = useState(false);
	const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Handle button mouse enter
	const handleButtonMouseEnter = useCallback(() => {
		// Clear previous timer
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
		}

		// Set delayed display
		hoverTimeoutRef.current = setTimeout(() => {
			setShowPanel(true);
		}, SHOW_PANEL_TIME);
	}, []);

	// Handle entire control area mouse leave
	const handleControlAreaMouseLeave = useCallback(() => {
		// Clear display timer
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
			hoverTimeoutRef.current = null;
		}

		// If not pinned by click, hide panel
		if (!isPinned) {
			setShowPanel(false);
		}
	}, [isPinned]);

	// Handle panel area mouse enter
	const handlePanelMouseEnter = useCallback(() => {
		// Clear possible hide timer
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
			hoverTimeoutRef.current = null;
		}
		// Ensure panel is shown
		setShowPanel(true);
	}, []);

	// Handle click
	const handleClick = useCallback(() => {
		// Clear hover timer
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
			hoverTimeoutRef.current = null;
		}

		// Show panel immediately and set as pinned
		setShowPanel(true);
		setIsPinned(true);
	}, []);

	// Handle panel close
	const handleClosePanel = useCallback(() => {
		setShowPanel(false);
		setIsPinned(false);
	}, []);

	// Cleanup timer
	useEffect(() => {
		return () => {
			if (hoverTimeoutRef.current) {
				clearTimeout(hoverTimeoutRef.current);
			}
		};
	}, []);

	return (
		<div className="relative" onMouseLeave={handleControlAreaMouseLeave}>
			{/* Add node button */}
			<div className="relative" onMouseEnter={handleButtonMouseEnter}>
				<Button
					variant="ghost"
					size="icon"
					className="w-8 h-8 p-0 bg-white text-xs"
					onClick={handleClick}
				>
					<Plus className="w-6 h-6" />
				</Button>
			</div>

			{/* Node list panel - absolutely positioned next to the button */}
			{showPanel && (
				<div
					className="absolute left-full top-[-124px] ml-3 z-10"
					onMouseEnter={handlePanelMouseEnter}
				>
					<NodeListPanel />
					{/* Close button in pinned state */}
					{isPinned && (
						<button
							onClick={handleClosePanel}
							className="absolute top-2 right-2 w-6 h-6 text-gray-400 hover:text-gray-600 text-sm"
							title="Close panel"
						>
							<X className="w-4 h-4" />
						</button>
					)}
				</div>
			)}

			{/* Invisible connection area to bridge the gap between button and panel */}
			{showPanel && (
				<div
					className="absolute left-full top-0 w-3 h-8 z-0"
					onMouseEnter={handlePanelMouseEnter}
				/>
			)}
		</div>
	);
};

export default AddNodeButton;
