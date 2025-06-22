import React from "react";
import { type VariableConfig, GetVariableType } from "@/types/node/variable-node";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, X, Clock, Filter } from "lucide-react";

interface VariableConfigItemProps {
    config: VariableConfig;
    index: number;
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
}

const VariableConfigItem: React.FC<VariableConfigItemProps> = ({
    config,
    index,
    onEdit,
    onDelete
}) => {
    const getTriggerTypeBadge = (triggerType: GetVariableType) => {
        if (triggerType === GetVariableType.TIMER) {
            return (
                <Badge className="h-5 text-[10px] bg-blue-100 text-blue-800">
                    <Clock className="h-3 w-3 mr-1" />
                    {config.timerConfig ? 
                        `${config.timerConfig.interval}${
                            config.timerConfig.unit === "second" ? "s" : 
                            config.timerConfig.unit === "minute" ? "m" : 
                            config.timerConfig.unit === "hour" ? "h" : "d"
                        }` : "定时触发"}
                </Badge>
            );
        } else {
            return (
                <Badge className="h-5 text-[10px] bg-orange-100 text-orange-800">
                    <Filter className="h-3 w-3 mr-1" />
                    条件触发
                </Badge>
            );
        }
    };

    return (
        <div className="flex items-center justify-between p-2 border rounded-md bg-background group">
            <div className="flex items-center gap-2">
                {config.symbol ? (
                    <Badge variant="outline" className="h-5 px-1">
                        {config.symbol}
                    </Badge>
                ) : (
                    <Badge variant="outline" className="h-5 px-1">
                        不限制交易对
                    </Badge>
                )}
                {getTriggerTypeBadge(config.getVariableType)}
                <div className="text-xs text-muted-foreground">
                    {config.variableName}
                </div>
            </div>
            <div className="flex items-center gap-1">
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => onEdit(index)}
                    >
                        <Settings className="h-3 w-3" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive"
                        onClick={() => onDelete(index)}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default VariableConfigItem; 