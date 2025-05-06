import { StrategyItem } from "./StrategyItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import CreateStrategyDialog from "./CreateStrategyDialog";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface Strategy {
  id: number;
  name: string;
  description: string;
  status: 'running' | 'paused' | 'error' | 'draft';
  created_time: string;
  updated_time: string;
}

function StrategyListPage() {
  const [open, setOpen] = useState(false);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const ITEMS_PER_PAGE = 5;

  const fetchStrategies = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3100/get_strategy_list?page=${page}&strategy_per_page=${ITEMS_PER_PAGE}`
      );

      if (!response.ok) {
        throw new Error('获取策略列表失败');
      }

      const data = await response.json();

      setStrategies(data.data || []);
      setTotalPages(data.page_num || 1);
      
    } catch (err) {
      toast.error("加载策略列表失败: " + err);
      setStrategies([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategies(currentPage);
  }, [currentPage]);

  // 添加删除后的回调函数
  const handleStrategyDelete = () => {
    fetchStrategies(currentPage); // 重新加载当前页数据
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">策略列表</h2>
        <Button 
          onClick={() => setOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          添加策略
        </Button>
      </div>

      <CreateStrategyDialog 
        open={open} 
        onOpenChange={setOpen}
        onSuccess={() => {
          setCurrentPage(1); // 重置到第一页
          fetchStrategies(1); // 重新加载数据
        }}
      />
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : strategies?.length > 0 ? (
          <>
            <div className="space-y-2">
              {strategies.map((strategy) => (
                <StrategyItem 
                  key={strategy.id}
                  strategyId={strategy.id}
                  strategyName={strategy.name}
                  strategyDescription={strategy.description}
                  createTime={strategy.created_time}
                  strategyStatus="running"
                  onDelete={handleStrategyDelete}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    />
                  </PaginationItem>
                  
                  {/* 生成页码按钮 */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // 只显示当前页附近的页码和首尾页
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={page === currentPage}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            暂无策略，点击右上角添加
          </div>
        )}
      </div>

      <Toaster 
        position="bottom-right" 
        expand={false} 
        richColors 
        closeButton
      />
    </div>
  );
}

export default StrategyListPage;
