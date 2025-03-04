import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  ChevronRight,
  ChevronDown,
  ChevronsDown,
  ChevronsUp
} from "lucide-react";
import { useState } from "react";
import { Sparkles, Boxes, Sigma, Workflow, Shield, BarChart2 } from "lucide-react";
import { NodeItem } from "./NodeItem";

const nodeCategories = [
  {
    title: "数据输入",
    icon: Boxes,
    color: "from-[#4776E6]/20 to-[#8E54E9]/20 hover:from-[#4776E6]/30 hover:to-[#8E54E9]/30",
    items: [
      { name: "K线数据", description: "历史K线数据输入" },
      { name: "实时行情", description: "实时市场数据流" },
      { name: "CSV导入", description: "自定义数据导入" },
      { name: "WebSocket", description: "实时数据订阅" },
      { name: "数据库", description: "历史数据读取" },
      { name: "API接入", description: "第三方数据源" }
    ]
  },
  {
    title: "技术指标",
    icon: Sigma,
    color: "from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
    items: [
      { name: "MA", description: "移动平均线" },
      { name: "MACD", description: "指数平滑移动平均" },
      { name: "RSI", description: "相对强弱指标" },
      { name: "KDJ", description: "随机指标" },
      { name: "BOLL", description: "布林带" },
      { name: "ATR", description: "真实波幅" },
      { name: "OBV", description: "能量潮指标" },
      { name: "CCI", description: "顺势指标" }
    ]
  },
  {
    title: "信号生成",
    icon: Sparkles,
    color: "from-[#7F00FF]/20 to-[#E100FF]/20 hover:from-[#7F00FF]/30 hover:to-[#E100FF]/30",
    items: [
      { name: "金叉死叉", description: "均线交叉信号" },
      { name: "突破", description: "价格突破判断" },
      { name: "趋势判断", description: "趋势方向识别" },
      { name: "背离", description: "价格指标背离" },
      { name: "成交量", description: "成交量分析" },
      { name: "波动率", description: "价格波动监测" },
      { name: "形态识别", description: "K线形态分析" },
      { name: "支撑阻力", description: "价格区间分析" }
    ]
  },
  {
    title: "交易执行",
    icon: Workflow,
    color: "from-[#11998e]/20 to-[#38ef7d]/20 hover:from-[#11998e]/30 hover:to-[#38ef7d]/30",
    items: [
      { name: "限价单", description: "限价交易执行" },
      { name: "市价单", description: "市价交易执行" },
      { name: "止盈止损", description: "风险控制模块" },
      { name: "跟踪止损", description: "动态止损设置" },
      { name: "网格交易", description: "自动网格策略" },
      { name: "冰山委托", description: "大单拆分执行" },
      { name: "定投", description: "定期定额投资" },
      { name: "调仓", description: "组合权重调整" }
    ]
  },
  {
    title: "风险控制",
    icon: Shield,
    color: "from-[#8E2DE2]/20 to-[#4A00E0]/20 hover:from-[#8E2DE2]/30 hover:to-[#4A00E0]/30",
    items: [
      { name: "仓位控制", description: "资金管理模块" },
      { name: "波动监控", description: "异常波动预警" },
      { name: "回撤控制", description: "最大回撤限制" },
      { name: "风险预警", description: "风险指标监控" },
      { name: "资金分配", description: "投资组合管理" }
    ]
  },
  {
    title: "统计分析",
    icon: BarChart2,
    color: "from-[#F953C6]/20 to-[#B91D73]/20 hover:from-[#F953C6]/30 hover:to-[#B91D73]/30",
    items: [
      { name: "收益统计", description: "策略绩效分析" },
      { name: "回测报告", description: "历史数据回测" },
      { name: "交易记录", description: "详细交易日志" },
      { name: "绩效评估", description: "策略表现评价" }
    ]
  }
];

export function NodeList() {
  const [openCategories, setOpenCategories] = useState<string[]>(nodeCategories.map(c => c.title));

  const toggleCategory = (title: string) => {
    setOpenCategories(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const expandAll = () => {
    setOpenCategories(nodeCategories.map(c => c.title));
  };

  const collapseAll = () => {
    setOpenCategories([]);
  };

  return (
    <div className="w-[280px] border-r flex flex-col h-full bg-background">
      <div className="p-4 border-b shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索节点..." className="pl-8" />
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Button 
            variant="ghost" 
            size="sm"
            className="flex-1 text-xs"
            onClick={expandAll}
          >
            <ChevronsDown className="h-4 w-4 mr-1" />
            展开全部
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="flex-1 text-xs"
            onClick={collapseAll}
          >
            <ChevronsUp className="h-4 w-4 mr-1" />
            折叠全部
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 h-[calc(100vh-8rem)]">
        <div className="p-3">
          {nodeCategories.map((category) => (
            <div key={category.title} className="mb-4">
              <Button
                variant="ghost"
                className="w-full justify-between px-2 py-1.5 h-auto"
                onClick={() => toggleCategory(category.title)}
              >
                <div className="flex items-center gap-2">
                  <category.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{category.title}</span>
                </div>
                {openCategories.includes(category.title) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              
              {openCategories.includes(category.title) && (
                <div className="mt-2 space-y-2 pl-2">
                  {category.items.map((item) => (
                    <NodeItem
                      key={item.name}
                      name={item.name}
                      description={item.description}
                      color={category.color}
                    />
                  ))}
                </div>
              )}
              <div className="my-3 border-t border-border/50" />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
