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

// 在开发环境下可以调用这个函数进行测试
if (process.env.NODE_ENV === 'development') {
  // testMultiInstanceStore();
}
