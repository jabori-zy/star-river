import { StrategyItem } from "./StrategyItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";

function StrategyMain() {
    const navigate = useNavigate();
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">策略列表</h2>
                <Button 
                    onClick={() => navigate("/node")}
                    className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    添加策略
                </Button>
            </div>
            <div className="space-y-1">
                <StrategyItem title="双均线交叉策略" status="running" />
                <StrategyItem title="网格交易策略" status="paused" />
                <StrategyItem title="动量突破策略" status="error" />
                <StrategyItem title="日内交易策略" status="running" />
                <StrategyItem title="趋势跟踪策略" status="paused" />
            </div>
        </div>
    );
}

export default StrategyMain;
