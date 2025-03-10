import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, X, Check, Loader2 } from "lucide-react";
import { useReactFlow } from '@xyflow/react';
import { toast } from "sonner";

// 保存策略按钮组件
function SaveStrategyButton({ strategyId, strategyName, strategyDescription }: { strategyId: number, strategyName: string, strategyDescription: string }) {
  const [isSaving, setIsSaving] = useState(false);
  const reactFlowInstance = useReactFlow();

  const handleSave = async () => {
    const nodes = reactFlowInstance.getNodes();
    const edges = reactFlowInstance.getEdges();

    
    const body = {
      id: strategyId,
      name: strategyName,
      description: strategyDescription,
      status: 1,
      nodes,
      edges
    }

    setIsSaving(true);

    try {
      await fetch('http://localhost:3100/update_strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      toast.success('保存成功');
    } catch (err) {
      toast.error('保存失败' + err);
    } finally {
      setTimeout(() => {
        setIsSaving(false);
      }, 1000);
    }
  };

  return (
    <Button
      variant="default"
      size="sm"
      className="flex items-center gap-2 min-w-[100px]"
      onClick={handleSave}
      disabled={isSaving}
    >
      {isSaving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      {isSaving ? "保存中" : "保存策略"}
    </Button>
  );
}

interface HeaderProps {
    strategyId: number;
    strategyName: string;
    strategyDescription: string;
}

export function Header({ strategyId, strategyName, strategyDescription }: HeaderProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(strategyName);
  const [tempName, setTempName] = useState(displayName);

  const handleSave = () => {
    setDisplayName(tempName);
    setIsEditing(false);
    // 实际的保存操作由 SaveStrategyButton 处理
  };

  const handleCancel = () => {
    setTempName(displayName);
    setIsEditing(false);
  };

  return (
    <div className="border-b shadow-sm">
      <div className="flex h-16 items-center px-6 justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:bg-background"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>

          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="h-8 w-[300px] text-lg font-semibold"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="h-8 w-8 p-0 border border-border/50 hover:border-green-500 hover:text-green-500 transition-colors"
              >
                <Check className="h-4 w-4 text-green-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0 border border-border/50 hover:border-red-500 hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div
                onClick={() => setIsEditing(true)}
                className="text-lg font-semibold hover:text-primary cursor-pointer px-3 py-1.5 rounded hover:bg-accent transition-colors"
              >
                {displayName}
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                编辑中
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-mono">
            最后保存: 10:30:25
          </Badge>
          <SaveStrategyButton strategyId={strategyId} strategyName={displayName} strategyDescription={strategyDescription} />
        </div>
      </div>
    </div>
  );
} 