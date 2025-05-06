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
import { NodeItem } from "./NodeItem";
import { nodeCategories } from "@/constants/nodeCategories";


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
      <ScrollArea className="flex-1 h-full">
        <div className="p-3 pb-16">
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
                      nodeColor={item.nodeColor}
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