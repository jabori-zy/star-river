import { VarType } from "@/types/node/if-else-node";
import Selector from "@/components/flow/node/if-else-node/components/selector";
import { SelectItem } from "@/components/ui/select";
import { useState, useEffect } from "react";

interface VarTypeSelectorProps {
    className?: string;
    varType: VarType;
    onVarTypeChange: (varType: VarType) => void;
}

const VarTypeSelector: React.FC<VarTypeSelectorProps> = ({className,varType,onVarTypeChange}) => {
    const [localVarType, setLocalVarType] = useState<VarType>(varType);

    // 当传入的varType发生变化时，同步更新本地状态
    useEffect(() => {
        setLocalVarType(varType);
    }, [varType]);

    const handleVarTypeChange = (value: string) => {
        const newValue = value as VarType;
        setLocalVarType(newValue);
        onVarTypeChange(newValue);
    }

    return (
        <Selector defaultValue={localVarType} className={className} onValueChange={handleVarTypeChange}>
            {Object.values(VarType).map((value) => (
                <SelectItem key={value} value={value}>{value}</SelectItem>
            ))}
        </Selector>
    )
}

export default VarTypeSelector;