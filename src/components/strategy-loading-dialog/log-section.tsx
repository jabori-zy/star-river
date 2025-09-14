import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy, Check, ChevronDown } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { getLogLevelStyle } from "./utils";
import type { LogEvent } from "./types";
import { ScrollBar } from "@/components/ui/scroll-area";
import { DateTime } from "luxon";

interface LogSectionProps {
    logs: LogEvent[];
}

const LogSection: React.FC<LogSectionProps> = ({ logs }) => {
    // 复制状态管理
    const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
    // 滚动容器引用
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    // 用户是否在底部附近（用于智能滚动）
    const [isNearBottom, setIsNearBottom] = useState(true);
    // 是否有新日志但用户不在底部
    const [hasNewLogs, setHasNewLogs] = useState(false);
    // 是否正在自动滚动（用于防止按钮闪烁）
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);
    // 使用ref来跟踪自动滚动状态，避免useEffect依赖问题
    const isAutoScrollingRef = useRef(false);
    
    // 检测用户是否在底部附近
    const handleScroll = useCallback((scrollContainer: Element) => {
        const threshold = 50; // 50px的阈值
        const isAtBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight <= threshold;
        
        // 使用防抖来避免频繁更新状态，减少防抖时间以提高响应速度
        setTimeout(() => {
            if (!isAutoScrollingRef.current) { // 只有在非自动滚动时才更新状态
                setIsNearBottom(isAtBottom);
                if (isAtBottom) {
                    setHasNewLogs(false);
                }
            }
        }, 50); // 减少防抖时间以提高响应速度
    }, []);

    // 手动滚动到底部
    const scrollToBottom = () => {
        const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
            isAutoScrollingRef.current = true;
            setIsAutoScrolling(true);
            setHasNewLogs(false);
            scrollContainer.scrollTo({
                top: scrollContainer.scrollHeight,
                behavior: 'smooth'
            });
            
            // 滚动完成后重置自动滚动状态
            setTimeout(() => {
                isAutoScrollingRef.current = false;
                setIsAutoScrolling(false);
                setIsNearBottom(true);
            }, 300); // 减少手动滚动的重置时间
        }
    };

    // 当日志更新时，自动滚动到底部（仅当用户在底部附近时）
    useEffect(() => {
        if (scrollAreaRef.current && logs.length > 0) {
            if (isNearBottom && !isAutoScrollingRef.current) {
                const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
                if (scrollContainer) {
                    isAutoScrollingRef.current = true;
                    setIsAutoScrolling(true);
                    // 使用requestAnimationFrame确保DOM更新完成后立即滚动
                    requestAnimationFrame(() => {
                        // 检查滚动距离，如果距离很小则使用瞬时滚动，否则使用平滑滚动
                        const scrollDistance = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight;
                        const shouldUseInstantScroll = scrollDistance < 100; // 小于100px时瞬时滚动
                        
                        scrollContainer.scrollTo({
                            top: scrollContainer.scrollHeight,
                            behavior: shouldUseInstantScroll ? 'auto' : 'smooth'
                        });
                        
                        // 根据滚动方式调整重置时间
                        const resetTime = shouldUseInstantScroll ? 50 : 150;
                        setTimeout(() => {
                            isAutoScrollingRef.current = false;
                            setIsAutoScrolling(false);
                        }, resetTime);
                    });
                }
            } else if (!isNearBottom && !isAutoScrollingRef.current) {
                // 如果用户不在底部且不在自动滚动，显示新日志提示
                setHasNewLogs(true);
            }
        }
    }, [logs, isNearBottom]); // 移除isAutoScrolling依赖，使用ref代替

    // 设置滚动监听器
    useEffect(() => {
        const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
            const onScroll = () => handleScroll(scrollContainer);
            scrollContainer.addEventListener('scroll', onScroll);
            
            // 初始检查一次
            handleScroll(scrollContainer);
            
            return () => {
                scrollContainer.removeEventListener('scroll', onScroll);
            };
        }
    }, [handleScroll]); // 依赖handleScroll

    const handleCopyError = (log: LogEvent, index: number) => {
        const logKey = `${log.datetime}-${index}`;
        const copyContent = [
            `原因: ${log.message}`,
            `错误代码: ${log.errorCode}`,
            log.errorCodeChain ? `错误链: ${log.errorCodeChain.join(" → ")}` : null
        ].filter(Boolean).join('\n');
        
        navigator.clipboard.writeText(copyContent);
        
        // 设置复制状态
        setCopiedStates(prev => ({ ...prev, [logKey]: true }));
        
        // 2秒后恢复
        setTimeout(() => {
            setCopiedStates(prev => ({ ...prev, [logKey]: false }));
        }, 2000);
    };

    return (
        <div className="flex flex-col h-full space-y-2">
            <div className="text-sm font-medium text-gray-700 flex-shrink-0">日志</div>
            <div className="border border-gray-300 rounded-lg bg-gray-50 shadow-inner flex-1 min-h-0 relative">
                <ScrollArea ref={scrollAreaRef} className="h-45">
                    <div className="p-4 space-y-2">
                        {logs.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                等待日志数据...
                            </div>
                        ) : (
                            logs.map((log, index) => {
                                const style = getLogLevelStyle(log.logLevel);
                                const isStrategyLog = log.type === "strategy";
                                const logKey = `${log.datetime}-${index}`;
                                
                                return (
                                    <div key={logKey} className="space-y-1">
                                        <div className="flex items-center space-x-2 text-xs">
                                            {style.icon}
                                            <span className="text-gray-400">
                                                [{DateTime.fromISO(log.datetime).toFormat("yyyy-MM-dd HH:mm:ss")}]
                                            </span>
                                            <span className="text-gray-600 font-medium">
                                                {isStrategyLog 
                                                    ? `${'strategyName' in log ? log.strategyName || '未知策略' : '未知策略'}` 
                                                    : `${'nodeName' in log ? log.nodeName || '未知节点' : '未知节点'}`
                                                }
                                            </span>
                                        </div>
                                        <div className="text-gray-900 pl-6 text-sm">
                                            {log.message}
                                        </div>
                                        {log.errorCode && (
                                            <div className="pl-6 space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-red-600 font-medium">
                                                        错误代码: {log.errorCode}
                                                    </span>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleCopyError(log, index)}
                                                                    disabled={copiedStates[logKey]}
                                                                    className={`h-6 w-6 p-0 transition-all duration-200 ${
                                                                        copiedStates[logKey]
                                                                            ? "text-red-600 bg-red-50 hover:bg-red-50"
                                                                            : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                                                                    }`}
                                                                >
                                                                    {copiedStates[logKey] ? (
                                                                        <Check className="w-3 h-3" />
                                                                    ) : (
                                                                        <Copy className="w-3 h-3" />
                                                                    )}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{copiedStates[logKey] ? "已复制" : "复制详情"}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <ScrollBar orientation="vertical" />
                </ScrollArea>
                
                {/* 新日志提示按钮 */}
                {hasNewLogs && !isNearBottom && !isAutoScrolling && (
                    <div className="absolute bottom-4 right-4">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="default"
                                        size="icon"
                                        onClick={scrollToBottom}
                                        className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200"
                                    >
                                        <ChevronDown className="w-5 h-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>滚动到底部</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogSection;