import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3100';


/**
 * 删除策略
 */
export async function getInitialChartData(cache_key: string): Promise<[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_cache_value?cache_key=${cache_key}`);
      
      if (response.status !== 200) {
        throw new Error(`获取数据失败: ${response.status}`);
      }
      
      const data = response.data;
      if (data["code"] === 0) {
        return data["data"];
      }
      return [];
    } catch (error) {
      console.error('获取数据错误:', error);
      // 错误回调
      return [];
    }
  }