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
import { Boxes, Sigma, ChevronsUpDown } from "lucide-react";
import { NodeItem } from "./NodeItem";
import { NodeItemProps } from "@/types/node";

const nodeCategories = [
  {
    title: "数据输入",
    icon: Boxes,
    color: "from-[#4776E6]/20 to-[#8E54E9]/20 hover:from-[#4776E6]/30 hover:to-[#8E54E9]/30",
    items: [
      {
        nodeId: "live_data_node",
        nodeType: "liveDataNode",
        nodeName: "实时数据",
        nodeDescription: "实时数据流",
        nodeColor: "from-[#4776E6]/20 to-[#8E54E9]/20 hover:from-[#4776E6]/30 hover:to-[#8E54E9]/30",
        nodeData: {
          exchange: null,
          symbol: null,
          interval: null,
        }
      } as NodeItemProps
    ]
  },
  {
    title: "技术指标",
    icon: Sigma,
    color: "from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
    items: [
      {
        nodeId: "sma_indicator_node",
        nodeType: "smaIndicatorNode",
        nodeName: "简单移动平均线",
        nodeDescription: "简单移动平均线",
        nodeColor: "from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
        nodeData: {
          strategyId: null,
          nodeName: "简单移动平均线",
          indicatorName: "sma",
          indicatorConfig: {"period": {paramName: "周期", paramValue: 14}},
          indicatorValue: {"sma": {value: null, timestamp: null}}
        }
      } as NodeItemProps
    ]
  },
  {
    title: "条件",
    icon: ChevronsUpDown,
    color: "from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
    items: [
      {
        nodeId: "if_else_node",
        nodeType: "ifElseNode",
        nodeName: "条件",
        nodeDescription: "条件",
        nodeColor: "from-[#FF416C]/20 to-[#FF4B2B]/20 hover:from-[#FF416C]/30 hover:to-[#FF4B2B]/30",
        nodeData: {
          condition: null
        }
      } as NodeItemProps
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
                      key={item.nodeId}
                      nodeId={item.nodeId}
                      nodeType={item.nodeType}
                      nodeName={item.nodeName}
                      nodeDescription={item.nodeDescription}
                      nodeColor={category.color}
                      nodeData={item.nodeData}
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
