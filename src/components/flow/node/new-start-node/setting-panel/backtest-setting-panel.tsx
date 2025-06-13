import React, { useState } from 'react';
import { SettingProps } from '@/components/flow/base/BasePanel/setting-panel';
import { StartNodeData } from '@/types/node/startNode';
import AccountSelector from '../components/account-selector';
import VariableEditor from '../components/variable-editor';
import { SelectedAccount, TimeRange, BacktestDataSource } from '@/types/strategy';
import DataSourceSelector from '../components/data-source-selector';
import TimeRangeSelector from '../components/time-range-selector';
import BacktestStrategySetting from '../components/backtest-strategy-setting';
import { useBacktestConfig } from '@/hooks/node/start-node/use-backtest-config';




// 新开始节点回测模式设置面板
export const NewStartNodeBacktestSettingPanel: React.FC<SettingProps> = ({ id, data }) => {
    // 将data转换为StartNodeData类型
    const startNodeData = data as StartNodeData;
    
    // 使用自定义 hook 管理回测配置
    const {
        config,
        updateInitialBalance,
        updateLeverage, 
        updateFeeRate,
        updatePlaySpeed,
        updateDataSource,
        updateSelectedAccounts,
        updateTimeRange,
        updateVariables
    } = useBacktestConfig({
        id,
        initialConfig: startNodeData.backtestConfig
    });

    // 本地UI状态
    const [dataSource, setDataSource] = useState<BacktestDataSource>(config?.dataSource || BacktestDataSource.FILE);
    const [selectedAccounts, setSelectedAccounts] = useState<SelectedAccount[]>(config?.exchangeConfig?.fromExchanges || []);
    const [timeRange, setTimeRange] = useState<TimeRange>(config?.exchangeConfig?.timeRange || { startDate: "", endDate: "" });
    const [initialBalance, setInitialBalance] = useState<number>(config?.initialBalance || 10000);
    const [leverage, setLeverage] = useState<number>(config?.leverage || 1);
    const [feeRate, setFeeRate] = useState<number>(config?.feeRate || 0.001);
    const [playSpeed, setPlaySpeed] = useState<number>(config?.playSpeed || 1);


    // 处理函数 - 简化为调用 hook 方法并更新本地状态
    const handleUpdateDataSource = (dataSource: BacktestDataSource) => {
        setDataSource(dataSource);
        updateDataSource(dataSource);
    };

    const handleUpdateSelectedAccounts = (accounts: SelectedAccount[]) => {
        setSelectedAccounts(accounts);
        updateSelectedAccounts(accounts);
    };

    const handleUpdateTimeRange = (timeRange: TimeRange) => {
        setTimeRange(timeRange);
        updateTimeRange(timeRange);
    };

    const handleUpdateInitialBalance = (initialBalance: number) => {
        setInitialBalance(initialBalance);
        updateInitialBalance(initialBalance);
    };

    const handleUpdateLeverage = (leverage: number) => {
        setLeverage(leverage);
        updateLeverage(leverage);
    };

    const handleUpdateFeeRate = (feeRate: number) => {
        setFeeRate(feeRate);
        updateFeeRate(feeRate);
    };

    const handleUpdatePlaySpeed = (playSpeed: number) => {
        setPlaySpeed(playSpeed);
        updatePlaySpeed(playSpeed);
    };

    return (
        <div className="p-4 space-y-4">
            <DataSourceSelector dataSource={dataSource} setDataSource={setDataSource} updateDataSource={handleUpdateDataSource} />
            {/* 根据数据源切换不同的组件 */}
            {dataSource === BacktestDataSource.EXCHANGE && (
                <div className="space-y-4">
                    <AccountSelector selectedAccounts={selectedAccounts} setSelectedAccounts={setSelectedAccounts} updateSelectedAccounts={handleUpdateSelectedAccounts} />
                    <TimeRangeSelector timeRange={timeRange} setTimeRange={handleUpdateTimeRange} />
                </div>
            )}
            <BacktestStrategySetting 
                initialBalance={initialBalance} 
                setInitialBalance={setInitialBalance} 
                updateInitialBalance={handleUpdateInitialBalance} 
                leverage={leverage} 
                setLeverage={setLeverage} 
                updateLeverage={handleUpdateLeverage} 
                feeRate={feeRate} 
                setFeeRate={setFeeRate} 
                updateFeeRate={handleUpdateFeeRate} 
                playSpeed={playSpeed}
                setPlaySpeed={setPlaySpeed}
                updatePlaySpeed={handleUpdatePlaySpeed} />

            <VariableEditor
                variables={config?.variables || []}
                onVariablesChange={updateVariables}
            />
        </div>
    );
};

export default NewStartNodeBacktestSettingPanel;