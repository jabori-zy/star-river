/**
 * 计算仪表板面板的尺寸
 * 根据窗口高度动态计算控制栏所需的百分比大小
 */
export const calculateDashboardSize = (): number => {
	// 页面头部高度（固定值）
	const HEADER_HEIGHT = 48;
	// 控制栏需要的固定高度（像素）
	const CONTROL_BAR_HEIGHT = 56;
	
	// 计算可用的内容高度
	const availableHeight = window.innerHeight - HEADER_HEIGHT;
	
	// 计算控制栏高度占可用高度的百分比
	const sizePercent = (CONTROL_BAR_HEIGHT / availableHeight) * 100;
	
	return sizePercent;
};

/**
 * 计算仪表板面板的配置
 * 返回面板所需的所有尺寸配置
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