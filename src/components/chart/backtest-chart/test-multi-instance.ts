// 测试多实例store的功能
import { getBacktestChartStore, cleanupBacktestChartStore } from './backtest-chart-store';

// 测试函数：验证多个图表实例的独立性
export const testMultiInstanceStore = () => {
  console.log('=== 开始测试多实例store ===');
  
  // 创建两个不同的图表实例
  const store1 = getBacktestChartStore(1);
  const store2 = getBacktestChartStore(2);
  
  // 验证它们是不同的实例
  console.log('Store1 === Store2:', store1 === store2); // 应该是 false
  
  // 设置不同的chartId
  const state1 = store1.getState();
  const state2 = store2.getState();
  
  console.log('Store1 chartId:', state1.chartId); // 应该是 1
  console.log('Store2 chartId:', state2.chartId); // 应该是 2
  
  // 设置不同的klineKeyStr
  state1.setKlineKeyStr('test-key-1');
  state2.setKlineKeyStr('test-key-2');
  
  // 验证状态独立性
  const updatedState1 = store1.getState();
  const updatedState2 = store2.getState();
  
  console.log('Store1 klineKeyStr:', updatedState1.klineKeyStr); // 应该是 'test-key-1'
  console.log('Store2 klineKeyStr:', updatedState2.klineKeyStr); // 应该是 'test-key-2'
  
  // 验证状态不会互相影响
  console.log('状态独立性测试通过:', 
    updatedState1.klineKeyStr === 'test-key-1' && 
    updatedState2.klineKeyStr === 'test-key-2'
  );
  
  // 清理测试实例
  cleanupBacktestChartStore(1);
  cleanupBacktestChartStore(2);
  
  console.log('=== 多实例store测试完成 ===');
};

// 测试数据持久性
export const testDataPersistence = () => {
  console.log('=== 测试数据持久性 ===');

  const store1 = getBacktestChartStore(1);
  const store2 = getBacktestChartStore(2);

  // 模拟设置数据
  const mockData = [
    { time: 1640995200 as any, open: 100, high: 105, low: 95, close: 102 },
    { time: 1640995260 as any, open: 102, high: 108, low: 100, close: 106 }
  ];

  store1.getState().setData(mockData);
  store2.getState().setData(mockData);

  // 标记为已初始化
  store1.setState({ isInitialized: true });
  store2.setState({ isInitialized: true });

  console.log('Store1 数据长度:', store1.getState().chartData.length);
  console.log('Store2 数据长度:', store2.getState().chartData.length);
  console.log('Store1 已初始化:', store1.getState().isInitialized);
  console.log('Store2 已初始化:', store2.getState().isInitialized);

  // 模拟删除图表1，检查图表2的数据是否保持
  cleanupBacktestChartStore(1);

  console.log('删除图表1后，Store2 数据长度:', store2.getState().chartData.length);
  console.log('删除图表1后，Store2 已初始化:', store2.getState().isInitialized);

  // 清理
  cleanupBacktestChartStore(2);

  console.log('=== 数据持久性测试完成 ===');
};

// 在开发环境下可以调用这个函数进行测试
if (process.env.NODE_ENV === 'development') {
  // testMultiInstanceStore();
  // testDataPersistence();
}
