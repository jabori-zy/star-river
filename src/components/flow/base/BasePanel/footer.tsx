import { Button } from "@/components/ui/button";


/**
 * 面板底部props
 */
interface BasePanelFooterProps {
    tradeMode: string; // 交易模式
    onLiveModeSave: () => void; // 实时模式保存按钮的回调
    onBacktestModeSave: () => void; // 回测模式保存按钮的回调
    onSimulationModeSave: () => void; // 模拟模式保存按钮的回调
    onCancel: () => void; // 取消按钮的回调
}

/**
 * 面板底部
 * 
 * 
 * 
 * 
 */
const BasePanelFooter: React.FC<BasePanelFooterProps> = ({ tradeMode, onLiveModeSave, onBacktestModeSave, onSimulationModeSave, onCancel }) => {
    return (
        <div className="flex justify-between items-center gap-6 ml-5 mr-5">
            <Button className="w-32" variant="outline" onClick={onCancel}>取消</Button>
            <Button className="w-32" onClick={tradeMode === "live" ? onLiveModeSave : tradeMode === "backtest" ? onBacktestModeSave : onSimulationModeSave}>保存</Button>
        </div>
    )
}

export default BasePanelFooter;