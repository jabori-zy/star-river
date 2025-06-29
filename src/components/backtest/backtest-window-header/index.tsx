import React from "react";
import { Button } from '@/components/ui/button'
import { Minus, Square, X } from "lucide-react"
import QuitConfirmBox from '@/quit-confirm-box'

// 声明electron的require
const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null }

// 扩展CSSProperties类型以支持WebKit拖拽属性
declare module 'react' {
  interface CSSProperties {
    WebkitAppRegion?: 'drag' | 'no-drag';
  }
}

interface BacktestWindowHeaderProps {
  strategyName: string;
}

// 窗口控制
function WindowControl() {
  const handleMinimize = () => {
    if (ipcRenderer) {
      ipcRenderer.invoke('minimize-window')
    }
  }
  
  const handleMaximize = () => {
    if (ipcRenderer) {
      ipcRenderer.invoke('maximize-window')
    }
  }
  
  return (
    <div className="flex items-center gap-0.5">
      {/* 最小化 */}
      <Button variant="ghost" size="icon" onClick={handleMinimize}>
        <Minus className="w-3 h-3" />
      </Button>
      {/* 最大化 */}
      <Button variant="ghost" size="icon" onClick={handleMaximize}>  
        <Square className="w-3 h-3" />
      </Button>
      {/* 关闭 - 使用确认框包装 */}
      <QuitConfirmBox
        title="确认关闭"
        description="确认关闭回测窗口吗？所有未保存的更改可能会丢失。"
        confirmText="确认"
        cancelText="取消"
      >
        <Button variant="ghost" size="icon" className="hover:text-red-400">
          <X className="w-3 h-3" />
        </Button>
      </QuitConfirmBox>
    </div>
  )
}

const BacktestWindowHeader: React.FC<BacktestWindowHeaderProps> = ({ strategyName }) => {
  return (
    <header className="flex sticky h-10 w-full items-center bg-background">
      <div className="flex w-full items-center justify-between gap-2 pl-4" style={{WebkitAppRegion: 'drag'}}>
        <div style={{WebkitAppRegion: 'no-drag'}}>
          <h1 className="text-lg font-bold">{strategyName}</h1>
        </div>
        <div className="flex items-center gap-2" style={{WebkitAppRegion: 'no-drag'}}>
          <WindowControl />
        </div>
      </div>
    </header>
  )
}

export default BacktestWindowHeader;