// 生成更真实的K线数据
function generateRealisticKlineData(days: number = 120) {
	const dateValues: number[] = [];
	const openValues: number[] = [];
	const highValues: number[] = [];
	const lowValues: number[] = [];
	const closeValues: number[] = [];
	const volumeValues: number[] = [];

	// 起始时间（120天前）
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - days);

	// 起始价格
	let currentPrice = 100;

	for (let i = 0; i < days; i++) {
		// 生成日期（每天）
		const currentDate = new Date(startDate);
		currentDate.setDate(startDate.getDate() + i);
		// 只保留工作日
		if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
			continue; // 跳过周末
		}

		dateValues.push(currentDate.getTime());

		// 模拟真实的价格变化
		// 添加趋势因子和随机因子
		const trendFactor = Math.sin(i / 20) * 0.001; // 长期趋势
		const randomFactor = (Math.random() - 0.5) * 0.04; // 随机波动 ±2%
		const volatilityFactor = 1 + Math.sin(i / 10) * 0.01; // 波动性变化

		// 计算开盘价（基于前一天收盘价）
		const gapFactor = (Math.random() - 0.5) * 0.02; // 跳空因子 ±1%
		const open = currentPrice * (1 + gapFactor);

		// 计算当日波动幅度
		const dailyRange = currentPrice * 0.03 * volatilityFactor; // 日内波动范围

		// 计算收盘价
		const close = open * (1 + trendFactor + randomFactor);

		// 计算最高价和最低价
		const high = Math.max(open, close) + Math.random() * dailyRange * 0.5;
		const low = Math.min(open, close) - Math.random() * dailyRange * 0.5;

		// 确保数据逻辑正确
		const finalHigh = Math.max(high, open, close);
		const finalLow = Math.min(low, open, close);

		openValues.push(Number(open.toFixed(2)));
		highValues.push(Number(finalHigh.toFixed(2)));
		lowValues.push(Number(finalLow.toFixed(2)));
		closeValues.push(Number(close.toFixed(2)));

		// 生成成交量（模拟真实成交量分布）
		const baseVolume = 50000;
		const volumeRandomness = Math.random() * 0.8 + 0.6; // 0.6-1.4倍
		const priceChangeFactor = (Math.abs(close - open) / open) * 10 + 1; // 价格变化越大，成交量越大
		const volume = Math.floor(
			baseVolume * volumeRandomness * priceChangeFactor,
		);
		volumeValues.push(volume);

		// 更新当前价格
		currentPrice = close;
	}

	return {
		dateValues,
		openValues,
		highValues,
		lowValues,
		closeValues,
		volumeValues,
	};
}

// 生成数据
const klineData = generateRealisticKlineData(120);

// 导出数据
export const dateValues = klineData.dateValues;
export const openValues = klineData.openValues;
export const highValues = klineData.highValues;
export const lowValues = klineData.lowValues;
export const closeValues = klineData.closeValues;
export const volumeValues = klineData.volumeValues;

// 也导出生成函数，方便其他地方使用
export { generateRealisticKlineData };
