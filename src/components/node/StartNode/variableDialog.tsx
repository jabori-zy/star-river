import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Hash, AlignLeft } from 'lucide-react';
import { StrategyVariable as StrategyVarType, StrategyVariableType } from '@/types/strategy';

// 变量编辑对话框的属性
export interface VariableDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (variable: StrategyVarType) => void;
  editingVariable?: StrategyVarType;
  currentVariables: StrategyVarType[];
}

const VariableDialog = ({ 
  isOpen, 
  onOpenChange, 
  onSave, 
  editingVariable,
  currentVariables
}: VariableDialogProps) => {
  const [variableName, setVariableName] = useState<string>(editingVariable?.varName || "");
  const [variableDisplayName, setVariableDisplayName] = useState<string>(editingVariable?.varDisplayName || "");
  const [variableType, setVariableType] = useState<StrategyVariableType>(editingVariable?.varType || StrategyVariableType.NUMBER);
  const [variableValue, setVariableValue] = useState<string>(editingVariable?.varValue?.toString() || "");
  const [nameError, setNameError] = useState<string>("");

  // 检查变量名是否符合规则
  const validateVariableName = (varName: string): boolean => {
    if (!varName) {
      setNameError("变量名不能为空");
      return false;
    }
    
    const nameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!nameRegex.test(varName)) {
      setNameError("变量名必须以字母或下划线开头，只能包含字母、数字和下划线");
      return false;
    }
    
    if (currentVariables.some(v => v.varName === varName && v.varName !== editingVariable?.varName)) {
      setNameError("变量名已存在");
      return false;
    }
    
    setNameError("");
    return true;
  };

  const handleValueChange = (value: string) => {
    setVariableValue(value);
  };

  const handleSave = () => {
    if (!validateVariableName(variableName) || !variableDisplayName) {
      return;
    }

    // 根据类型转换值
    let finalValue: string | number = variableValue;
    if (variableType === StrategyVariableType.NUMBER) {
      finalValue = variableValue === "" ? 0 : parseFloat(variableValue);
    }

    onSave({
      varName: variableName,
      varDisplayName: variableDisplayName,
      varType: variableType,
      varValue: finalValue
    });
  };

  // 每次对话框打开时重置状态
  useEffect(() => {
    if (isOpen) {
      setVariableName(editingVariable?.varName || "");
      setVariableDisplayName(editingVariable?.varDisplayName || "");
      setVariableType(editingVariable?.varType || StrategyVariableType.NUMBER);
      setVariableValue(editingVariable?.varValue?.toString() || "");
      setNameError("");
    }
  }, [isOpen, editingVariable]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingVariable ? '编辑变量' : '添加变量'}</DialogTitle>
          <DialogDescription>
            为策略添加可配置的变量，运行时可根据变量值调整策略行为。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="variable-type" className="text-right">
              变量类型
            </Label>
            <div className="col-span-3">
              <Select 
                value={variableType} 
                onValueChange={(value) => setVariableType(value as StrategyVariableType)}
              >
                <SelectTrigger id="variable-type">
                  <SelectValue placeholder="选择变量类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={StrategyVariableType.NUMBER}>
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 mr-2 text-blue-500" />
                      <span>数字</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={StrategyVariableType.STRING}>
                    <div className="flex items-center">
                      <AlignLeft className="h-4 w-4 mr-2 text-green-500" />
                      <span>字符串</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="variable-name" className="text-right">
              变量名
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="variable-name"
                value={variableName}
                onChange={(e) => {
                  setVariableName(e.target.value);
                  validateVariableName(e.target.value);
                }}
                placeholder="如: threshold_value"
                className={nameError ? "border-red-500" : ""}
                disabled={!!editingVariable} // 编辑模式下不允许修改变量名
              />
              {nameError && <p className="text-xs text-red-500">{nameError}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="variable-display-name" className="text-right">
              显示名称
            </Label>
            <Input
              id="variable-display-name"
              value={variableDisplayName}
              onChange={(e) => setVariableDisplayName(e.target.value)}
              placeholder="如: 阈值"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="variable-value" className="text-right">
              变量值
            </Label>
            <Input
              id="variable-value"
              value={variableValue}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={variableType === StrategyVariableType.NUMBER ? "如: 0.05" : "如: BTC/USDT"}
              type={variableType === StrategyVariableType.NUMBER ? "number" : "text"}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VariableDialog;
