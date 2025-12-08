/**
 * Calculate dashboard panel size
 * Dynamically calculate the percentage size required for the control bar based on window height
 */
export const calculateDashboardSize = (): number => {
	// Page header height (fixed value)
	const HEADER_HEIGHT = 48;
	// Fixed height required for control bar (pixels)
	const CONTROL_BAR_HEIGHT = 56;

	// Calculate available content height
	const availableHeight = window.innerHeight - HEADER_HEIGHT;

	// Calculate percentage of available height occupied by control bar
	const sizePercent = (CONTROL_BAR_HEIGHT / availableHeight) * 100;

	return sizePercent;
};

/**
 * Calculate dashboard panel configuration
 * Returns all size configurations required for the panel
 */
export const getDashboardPanelConfig = () => {
	const size = calculateDashboardSize();

	return {
		defaultSize: size,
		minSize: size,
		collapsedSize: size,
		chartPanelSize: 100 - size,
	};
};
