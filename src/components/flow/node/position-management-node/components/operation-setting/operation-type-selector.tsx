import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { PositionOperation } from "@/types/node/position-management-node";

interface OperationTypeSelectorProps {
    value: PositionOperation;
    onChange: (value: PositionOperation) => void;
    disabled?: boolean;
}

const OPERATION_OPTIONS = [
    { 
        value: PositionOperation.UPDATE, 
        label: '更新仓位', 
        description: '更新现有仓位信息'
    },
    { 
        value: PositionOperation.CLOSEALL, 
        label: '全部平仓', 
        description: '关闭所有持仓'
    },
];

const OperationTypeSelector: React.FC<OperationTypeSelectorProps> = ({
    value,
    onChange,
    disabled = false
}) => {
    // 获取当前选中的操作类型标签
    const getSelectedLabel = (selectedValue: PositionOperation) => {
        const option = OPERATION_OPTIONS.find(opt => opt.value === selectedValue);
        return option ? option.label : selectedValue;
    };

    return (
        <Select 
            value={value} 
            onValueChange={(selectedValue: PositionOperation) => onChange(selectedValue)}
            disabled={disabled}
        >
            <SelectTrigger id="operationType">
                <SelectValue placeholder="选择操作类型">
                    {value ? getSelectedLabel(value) : "选择操作类型"}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {OPERATION_OPTIONS.map((option) => (
                    <SelectItem 
                        key={option.value} 
                        value={option.value}
                    >
                        <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default OperationTypeSelector; 