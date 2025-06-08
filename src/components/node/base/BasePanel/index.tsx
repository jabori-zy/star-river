import { Panel, PanelProps } from '@xyflow/react';
import usePanelResize from '@/hooks/use-panelResize';
import { ReactElement, useRef, useState, useCallback, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import BasePanelHeader from './header';
import { Settings, GripVertical } from 'lucide-react';

interface BasePanelProps extends PanelProps {
    title: string; // 面板标题
    setTitle: (title: string) => void; // 设置面板标题
    icon: LucideIcon; // 面板图标
    iconBackgroundColor: string; // 面板图标背景颜色
    children: ReactElement; // 面板内容
    isShow: boolean; // 是否显示面板
    setIsShow: (isShow: boolean) => void; // 设置是否显示面板
}


const BasePanel: React.FC<BasePanelProps> = ({
    title="面板",
    setTitle,
    icon,
    iconBackgroundColor,
    children,
}) => {
    const panelRef = useRef<HTMLDivElement>(null);
    // 计算面板高度，使其与flow高度一致
    const panelHeight = `${window.innerHeight - 250}px`; // 减去一些边距
    usePanelResize(panelRef);

    // 是否在编辑标题
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    // 是否展示面板
    const [isShow, setIsShow] = useState(true);
    
    // 面板宽度状态
    const [panelWidth, setPanelWidth] = useState(350);
    const [isResizing, setIsResizing] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startWidth, setStartWidth] = useState(0);
    
    // 最小和最大宽度
    const MIN_WIDTH = 200;
    const MAX_WIDTH = 600;

    // 开始拖拽缩放
    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        setStartX(e.clientX);
        setStartWidth(panelWidth);
    }, [panelWidth]);

    // 处理拖拽缩放
    const handleResizeMove = useCallback((e: MouseEvent) => {
        if (!isResizing) return;
        
        const deltaX = startX - e.clientX; // 注意这里是减法，因为左拖拽时X减小但宽度增大
        const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth + deltaX));
        setPanelWidth(newWidth);
    }, [isResizing, startX, startWidth]);

    // 结束拖拽缩放
    const handleResizeEnd = useCallback(() => {
        setIsResizing(false);
    }, []);

    // 添加全局鼠标事件监听
    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleResizeMove);
            document.addEventListener('mouseup', handleResizeEnd);
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, handleResizeMove, handleResizeEnd]);

    return <Panel position="top-right">
        {
            isShow && (
                <div
                    ref={panelRef}
                    className="min-h-[300px] flex flex-col gap-4 bg-white rounded-lg shadow-lg border border-gray-200 p-2 relative"
                    style={{ 
                        height: panelHeight,
                        width: `${panelWidth}px`
                    }}
                >
                    {/* 左侧拖拽区域 */}
                    <div
                        className="absolute left-0 top-0 w-2 h-full flex items-center justify-center group"
                        style={{
                            zIndex: 10
                        }}
                    >
                        {/* 拖拽图标 */}
                        {/* 
                        opacity-0 透明度为0
                        group-hover:opacity-100 悬停时透明度为100
                        transition-opacity 过渡效果
                        cursor-ew-resize 鼠标样式为可拖拽
                        p-1 内边距
                        rounded 圆角
                        bg-gray-100 背景颜色
                        */}
                        <div
                            className="flex items-center w-10 h-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-ew-resize p-1 rounded bg-gray-100 hover:bg-gray-400"
                            onMouseDown={handleResizeStart}
                        >
                            <GripVertical size={14} className="text-black-500" />
                        </div>
                    </div>
                    
                    {/* 标题区域 */}
                    <BasePanelHeader
                        title={title}
                        setTitle={setTitle}
                        isEditingTitle={isEditingTitle}
                        setIsEditingTitle={setIsEditingTitle}
                        setIsShow={setIsShow}
                        icon={Settings}
                        iconBackgroundColor="bg-red-400"
                    />
                    
                    {/* Demo内容区域 */}
                    <div className="flex-1 overflow-y-auto space-y-3">
                        {/* 节点信息 */}
                        <div className="bg-gray-50 rounded-md p-3">
                            <h4 className="text-xs font-medium text-gray-600 mb-2">节点信息</h4>
                            <div className="space-y-1">
                                <div className="text-xs text-gray-500">节点数量: 5</div>
                                <div className="text-xs text-gray-500">连接数量: 3</div>
                            </div>
                        </div>
                        
                        {/* 操作按钮 */}
                        <div className="space-y-2">
                            <button className="w-full px-3 py-2 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                                添加节点
                            </button>
                            <button className="w-full px-3 py-2 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors">
                                清空画布
                            </button>
                        </div>
                        
                        {/* 设置区域 */}
                        <div className="bg-gray-50 rounded-md p-3">
                            <h4 className="text-xs font-medium text-gray-600 mb-2">设置</h4>
                            <div className="space-y-2">
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" className="rounded" />
                                    <span className="text-xs text-gray-600">显示网格</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" className="rounded" />
                                    <span className="text-xs text-gray-600">自动保存</span>
                                </label>
                            </div>
                        </div>
                        
                        {/* 状态信息 */}
                        <div className="bg-green-50 rounded-md p-3">
                            <h4 className="text-xs font-medium text-green-700 mb-2">状态</h4>
                            <div className="space-y-1">
                                <div className="text-xs text-green-600">● 连接正常</div>
                                <div className="text-xs text-green-600">● 数据同步</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* 自定义children内容 */}
                    {children && (
                        <div className="border-t border-gray-100 pt-2">
                            {children}
                        </div>
                    )}
                </div>
                
            )
        }
        
    </Panel>;
};

export default BasePanel;