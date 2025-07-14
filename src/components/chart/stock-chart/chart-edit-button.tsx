import React from "react";
import { Button } from "@/components/ui/button";
import { Bolt, Trash2 } from "lucide-react";

interface ChartEditButtonProps {
    isMainChart: boolean;
    onEdit: () => void;
    subChartId?: number;
    onDeleteSubChart?: (subChartId: number) => void;
}

const ChartEditButton = ({ isMainChart, onEdit, subChartId, onDeleteSubChart }: ChartEditButtonProps) => {
    return (
        <div className="flex gap-1">
            <Button 
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 bg-white/80 hover:bg-gray-100 backdrop-blur-sm border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md"
                title="编辑指标"
                onClick={onEdit}
            >
                <Bolt className="w-4 h-4 text-gray-600 hover:text-blue-600" />
            </Button>
            {
                !isMainChart && onDeleteSubChart && (
                    <Button 
                        variant="secondary"
                        size="sm"
                        className="h-8 w-8 p-0 bg-white/80 hover:bg-gray-100 backdrop-blur-sm border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md"
                        title="删除子图"
                        onClick={() => subChartId !== undefined && onDeleteSubChart?.(subChartId)}
                    >
                        <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
                    </Button>
                    
                )
            }
            
        </div>
    );
};

export default ChartEditButton;
