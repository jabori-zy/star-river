import { toast } from "sonner";

/**
 * 打开回测窗口
 *
 * 根据运行环境（Electron 或浏览器）选择不同的打开方式：
 * - Electron 环境：通过 IPC 调用打开新窗口
 * - 浏览器环境：使用 window.open 打开新标签页
 *
 * @param strategyId 策略 ID
 */
export async function openBacktestWindow(
	strategyId: number,
	strategyName: string,
): Promise<void> {
	try {
		// 检查是否在 Electron 环境中
		if (window.require) {
			// Electron 环境：打开新窗口
			const electronModule = window.require("electron");
			if (electronModule?.ipcRenderer) {
				await electronModule.ipcRenderer.invoke(
					"open-backtest-window",
					strategyId,
					strategyName,
				);
			}
		} else {
			// 浏览器环境：打开新标签页
			const backtestUrl = `/backtest/${strategyId}?strategyName=${encodeURIComponent(strategyName)}`;
			window.open(backtestUrl, "_blank", "width=1200,height=800");
		}
	} catch (error) {
		console.error("打开回测窗口失败:", error);
		toast.error("打开回测窗口失败");
		throw error;
	}
}
