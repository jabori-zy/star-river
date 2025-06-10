import { create } from 'zustand';
import { SystemConfig, SupportLanguage } from '@/types/system';
import { getSystemConfig, updateSystemConfig } from '@/service/system';
import { changeLanguage } from '@/i18n/i18n';

// 系统配置状态接口
interface SystemConfigState {
    systemConfig: SystemConfig | null;
    isLoading: boolean;
    isInitialized: boolean;
    
    // 操作方法
    loadSystemConfig: () => Promise<void>;
    updateSystemConfigAction: (config: SystemConfig) => Promise<void>;
    setLanguage: (language: SupportLanguage) => Promise<void>;
}

// 系统配置store
const useSystemConfigStore = create<SystemConfigState>((set, get) => ({
    systemConfig: null,
    isLoading: false,
    isInitialized: false,
    
    // 加载系统配置
    loadSystemConfig: async () => {
        const { isLoading } = get();
        if (isLoading) return; // 防止重复请求
        
        set({ isLoading: true });
        try {
            const config = await getSystemConfig();
            set({ 
                systemConfig: config, 
                isLoading: false, 
                isInitialized: true 
            });
            
            // 自动设置语言
            if (config.localization) {
                changeLanguage(config.localization);
            }
            
            console.log('系统配置加载成功:', config);
        } catch (error) {
            console.error('加载系统配置失败:', error);
            set({ 
                isLoading: false, 
                isInitialized: true 
            });
        }
    },
    
    // 更新系统配置
    updateSystemConfigAction: async (config: SystemConfig) => {
        set({ isLoading: true });
        try {
            const updatedConfig = await updateSystemConfig(config);
            set({ 
                systemConfig: updatedConfig, 
                isLoading: false 
            });
            
            // 切换语言
            if (updatedConfig.localization) {
                changeLanguage(updatedConfig.localization);
            }
            
            console.log('系统配置更新成功:', updatedConfig);
        } catch (error) {
            console.error('更新系统配置失败:', error);
            set({ isLoading: false });
            throw error;
        }
    },
    
    // 设置语言（仅切换i18n语言，不更新数据库）
    setLanguage: async (language: SupportLanguage) => {
        try {
            await changeLanguage(language);
            console.log('语言切换成功:', language);
        } catch (error) {
            console.error('语言切换失败:', error);
            throw error;
        }
    },
}));

export default useSystemConfigStore; 