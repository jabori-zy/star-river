import { Button } from "@/components/ui/button";
import SingleKlineChart from "@/components/chart/SingleKlineChart";
import { Edit, Trash2 } from "lucide-react";

interface ChartCardProps {
  id: string;
  chartTitle: string;
  klineCacheKeys: string;
  indicatorCacheKeys: string[];
  hasKlineData: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ChartCard({
  id,
  chartTitle,
  klineCacheKeys,
  indicatorCacheKeys,
  hasKlineData,
  onEdit,
  onDelete
}: ChartCardProps) {
  return (
    <div className="w-full rounded-lg border shadow-sm bg-white relative">
      <div className="flex h-12 justify-between items-center p-4">
        <h3 className="font-bold">{chartTitle}</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        {hasKlineData ? (
          <SingleKlineChart
            id={`strategy_${id}`}
            klineCacheKey={klineCacheKeys}
            indicatorCacheKeys={indicatorCacheKeys}
          />
        ) : (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-gray-500">请选择K线数据</p>
          </div>
        )}
      </div>
    </div>
  );
} 