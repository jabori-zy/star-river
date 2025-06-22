import React from "react";
import { type PositionOperationConfig, PositionOperation } from "@/types/node/position-management-node";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, X } from "lucide-react";

interface OperationConfigItemProps {
    config: PositionOperationConfig;
    index: number;
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
}

const OperationConfigItem: React.FC<OperationConfigItemProps> = ({
    config,
    index,
    onEdit,
    onDelete
}) => {
    const getOperationTypeLabel = (type: PositionOperation) => {
        const labels = {
            [PositionOperation.UPDATE]: '更新仓位',
            [PositionOperation.CLOSEALL]: '全部平仓',
        };
        return labels[type] || type;
    };

    const getOperationTypeBadgeVariant = (type: PositionOperation) => {
        switch (type) {
            case PositionOperation.UPDATE:
                return "default";
            case PositionOperation.CLOSEALL:
                return "destructive";
            default:
                return "outline";
        }
    };

    return (
        <div className="flex items-center justify-between p-2 border rounded-md bg-background group">
            <div className="flex items-center gap-2">
                {config.symbol ? (
                    <Badge variant="outline" className="h-5 px-1">
                        {config.symbol}
                    </Badge>
                ):(
                    <Badge variant="outline" className="h-5 px-1">
                        所有交易对
                    </Badge>
                )}
                <Badge 
                    variant={getOperationTypeBadgeVariant(config.positionOperation)} 
                    className="h-5 px-1 text-xs"
                >
                    {getOperationTypeLabel(config.positionOperation)}
                </Badge>
                <div className="text-xs text-muted-foreground">
                    {config.positionOperationName}
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

export default OperationConfigItem; 