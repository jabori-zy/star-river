import React, { useCallback, useState } from 'react';
import { useReactFlow, useStore, useStoreApi, useViewport } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize2, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ControlButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  onClick,
  disabled = false,
  title,
  children,
  className
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      title={title}
      variant="ghost"
      size="icon"
      className={cn(
        "w-8 h-8 bg-white hover:bg-gray-50 p-0",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </Button>
  );
};

// 选择器函数，用于获取ReactFlow状态
const selector = (state: {
  nodesDraggable: boolean;
  nodesConnectable: boolean;
  elementsSelectable: boolean;
  transform: [number, number, number];
  minZoom: number;
  maxZoom: number;
}) => ({
  isInteractive: state.nodesDraggable || state.nodesConnectable || state.elementsSelectable,
  minZoomReached: state.transform[2] <= state.minZoom,
  maxZoomReached: state.transform[2] >= state.maxZoom,
});

enum ZoomType {
  zoomIn = 'zoomIn',
  zoomOut = 'zoomOut',
  zoomToFit = 'zoomToFit',
  zoomTo25 = 'zoomTo25',
  zoomTo50 = 'zoomTo50',
  zoomTo75 = 'zoomTo75',
  zoomTo100 = 'zoomTo100',
  zoomTo200 = 'zoomTo200',
}

// 视口控制组件
const ViewportControl: React.FC = () => {
  const { zoomIn, zoomOut, fitView, zoomTo } = useReactFlow();
  const { isInteractive, minZoomReached, maxZoomReached } = useStore(selector);
  const { zoom } = useViewport();
  const store = useStoreApi();
  const [zoomPopoverOpen, setZoomPopoverOpen] = useState(false);

  // 缩放选项配置
  const ZOOM_OPTIONS = [
    [
      { key: ZoomType.zoomTo200, text: '200%', value: 2 },
      { key: ZoomType.zoomTo100, text: '100%', value: 1 },
      { key: ZoomType.zoomTo75, text: '75%', value: 0.75 },
      { key: ZoomType.zoomTo50, text: '50%', value: 0.5 },
      { key: ZoomType.zoomTo25, text: '25%', value: 0.25 },
    ],
    [
      { key: ZoomType.zoomToFit, text: '适应视图', value: null },
    ],
  ];

  // 放大
  const handleZoomIn = useCallback(() => {
    zoomIn({ duration: 800 });
  }, [zoomIn]);

  // 缩小
  const handleZoomOut = useCallback(() => {
    zoomOut({ duration: 800 });
  }, [zoomOut]);

  // 适应视图
  const handleFitView = useCallback(() => {
    fitView({ padding: 0.1, duration: 800 });
  }, [fitView]);

  // 切换交互性
  const handleToggleInteractive = useCallback(() => {
    store.setState({
      nodesDraggable: !isInteractive,
      nodesConnectable: !isInteractive,
      elementsSelectable: !isInteractive,
    });
  }, [isInteractive, store]);

  // 处理缩放
  const handleZoom = useCallback((type: string) => {
    if (type === ZoomType.zoomToFit) {
      handleFitView();
    } else if (type === ZoomType.zoomTo25) {
      zoomTo(0.25, { duration: 800 });
    } else if (type === ZoomType.zoomTo50) {
      zoomTo(0.5, { duration: 800 });
    } else if (type === ZoomType.zoomTo75) {
      zoomTo(0.75, { duration: 800 });
    } else if (type === ZoomType.zoomTo100) {
      zoomTo(1, { duration: 800 });
    } else if (type === ZoomType.zoomTo200) {
      zoomTo(2, { duration: 800 });
    }
    setZoomPopoverOpen(false);
  }, [zoomTo, handleFitView]);

  return (
    <>
      {/* 放大按钮 */}
      <ControlButton
        onClick={handleZoomIn}
        disabled={maxZoomReached}
        title="放大视图"
      >
        <ZoomIn className="w-6 h-6" />
      </ControlButton>

      {/* 缩放百分比显示和选择器 */}
      <Popover open={zoomPopoverOpen} onOpenChange={setZoomPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 p-0 bg-white text-xs"
            title="选择缩放比例"
          >
            {Math.round(zoom * 100)}%
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-36 p-2 ml-2 shadow-none" side="right" align="start">
          {ZOOM_OPTIONS.map((options, i) => (
            <React.Fragment key={i}>
              {i !== 0 && <Separator className="my-1" />}
              <div className="space-y-1">
                {options.map((option) => (
                  <div
                    key={option.key}
                    className="flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleZoom(option.key)}
                  >
                    <span>{option.text}</span>
                    {option.value && zoom === option.value && (
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </React.Fragment>
          ))}
        </PopoverContent>
      </Popover>

      {/* 缩小按钮 */}
      <ControlButton
        onClick={handleZoomOut}
        disabled={minZoomReached}
        title="缩小视图"
      >
        <ZoomOut className="w-4 h-4" />
      </ControlButton>

      {/* 分割线 */}
      <Separator/>

      {/* 适应视图按钮 */}
      <ControlButton
        onClick={handleFitView}
        title="适应视图"
      >
        <Maximize2 className="w-4 h-4" />
      </ControlButton>

      {/* 交互性切换按钮 */}
      <ControlButton
        onClick={handleToggleInteractive}
        title={isInteractive ? "锁定视图" : "解锁视图"}
      >
        {isInteractive ? (
          <Unlock className="w-4 h-4" />
        ) : (
          <Lock className="w-4 h-4" />
        )}
      </ControlButton>
    </>
  );
};

export default ViewportControl;
