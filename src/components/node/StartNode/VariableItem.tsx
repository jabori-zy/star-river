import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Settings, X, Hash, AlignLeft } from 'lucide-react';
import { StrategyVariable as StrategyVarType, StrategyVariableType } from '@/types/strategy';

// 变量显示项组件的属性
export interface VariableItemProps {
  variable: StrategyVarType;
  onEdit: (variable: StrategyVarType) => void;
  onDelete: (name: string) => void;
}

const VariableItem = ({ variable, onEdit, onDelete }: VariableItemProps) => {
  return (
    <div className="flex items-center justify-between p-2 border rounded-md bg-background group">
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="h-5 px-1 cursor-help">
                {variable.varType === StrategyVariableType.NUMBER ? (
                  <Hash className="h-3 w-3 mr-1 text-blue-500" />
                ) : (
                  <AlignLeft className="h-3 w-3 mr-1 text-green-500" />
                )}
                {variable.varType === StrategyVariableType.NUMBER ? "数字" : "文本"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{variable.varName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="font-medium">{variable.varDisplayName}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="text-sm">{variable.varValue?.toString()}</div>
        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={() => onEdit(variable)}
          >
            <Settings className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-destructive"
            onClick={() => onDelete(variable.varName)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VariableItem; 