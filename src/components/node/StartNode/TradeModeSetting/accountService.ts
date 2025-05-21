import axios from 'axios';

// 账户配置类型
export interface MT5AccountConfig {
  id: number;
  account_name: string;
  exchange: string;
  login: number;
  server: string;
  terminal_path: string;
  is_available: boolean;
  created_time: string;
}

// 获取MT5账户配置列表
export const getMT5AccountConfigs = async (): Promise<MT5AccountConfig[]> => {
  try {
    const {data} = await axios.get(`http://localhost:3100/get_account_config?exchange=metatrader5`);
    const mt5ConfigData = data.data || [];
    console.log("获取到的MT5账户配置:", mt5ConfigData);
    
    // 手动添加延迟以展示加载过程
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mt5ConfigData;
  } catch (error) {
    console.error("获取MT5账户配置失败:", error);
    throw new Error("获取账户列表失败，请稍后重试");
  }
};

// 获取账户配置列表的包装函数，方便日后扩展其他类型账户
export const getAccountConfigs = async (exchange: string = 'metatrader5'): Promise<MT5AccountConfig[]> => {
  if (exchange === 'metatrader5') {
    return getMT5AccountConfigs();
  }
  // 未来可以扩展其他类型的账户获取
  return [];
}; 