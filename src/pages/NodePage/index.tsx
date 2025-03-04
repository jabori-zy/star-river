import NodeFlow from "./NodeFlow";
import  {NodeList}  from "./NodeList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, X, Check, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function NodePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [strategyName, setStrategyName] = useState("未命名策略");
  const [tempName, setTempName] = useState(strategyName);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setStrategyName(tempName);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempName(strategyName);
    setIsEditing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="h-screen flex flex-col bg-background"
    >
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
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
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
              </motion.div>
            ) : (
              <div className="flex items-center gap-3">
                <div
                  onClick={() => setIsEditing(true)}
                  className="text-lg font-semibold hover:text-primary cursor-pointer px-3 py-1.5 rounded hover:bg-accent transition-colors"
                >
                  {strategyName}
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
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-2 min-w-[100px]"
              onClick={() => {
                setIsSaving(true);
                setTimeout(() => setIsSaving(false), 1000);
              }}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? "保存中" : "保存策略"}
            </Button>
          </div>
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-1 overflow-hidden"
      >
        <NodeList />
        <NodeFlow />
      </motion.div>
    </motion.div>
  );
}

