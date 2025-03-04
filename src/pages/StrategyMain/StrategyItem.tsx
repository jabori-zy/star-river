import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, ArrowUpRight } from "lucide-react";

interface StrategyItemProps {
  title: string;
  status: 'running' | 'paused' | 'error';
}

export function StrategyItem({ title, status = 'running' }: StrategyItemProps) {
  const statusConfig = {
    running: { label: '运行中', className: 'bg-green-500/10 text-green-500 hover:bg-green-500/20' },
    paused: { label: '暂停中', className: 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20' },
    error: { label: '错误', className: 'bg-red-500/10 text-red-500 hover:bg-red-500/20' },
  };

  const { label, className } = statusConfig[status];

  return (
    <Card className="p-6 mb-4 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-card to-background border border-border/50 relative group">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-lg tracking-tight">{title}</h3>
              <Badge variant="secondary" className={className}>
                {label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/40" />
              创建时间：2024-03-20
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-green-500" />
              收益率 +12.5%
            </span>
            <span>交易次数 125</span>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 hover:bg-primary/10 transition-colors group-hover:translate-x-1 duration-200"
        >
          <Eye className="h-4 w-4" />
          查看
          <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </Button>
      </div>
    </Card>
  );
}
