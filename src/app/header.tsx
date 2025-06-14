import { SidebarIcon } from "lucide-react"
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import useSidebarToggleStore from '@/store/use-sidebar-toggle-store'
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Minus, Square, X } from "lucide-react"
import QuitAppConfitmBox from './quit-app-confitm-box'
import { useNavigate } from 'react-router'
import { useHeaderStore } from '@/store/useHeaderStore'

// 声明electron的require
const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null }

// 扩展CSSProperties类型以支持WebKit拖拽属性
declare module 'react' {
  interface CSSProperties {
    WebkitAppRegion?: 'drag' | 'no-drag';
  }
}


// 整个应用的头部
// 侧边栏触发器
function SidebarTrigger() {
  const { setOpen } = useSidebar()
  const { isSidebarOpen, setIsSidebarOpen } = useSidebarToggleStore()
  return (
    <Button variant="ghost" size="icon" onClick={() => { setOpen(!isSidebarOpen); setIsSidebarOpen(!isSidebarOpen) }}>
      <SidebarIcon />
    </Button>
  )
}

// 路由箭头
function RouteArrow() {
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-0.5"> 
    {/* 返回 */}
      <Button variant="ghost" size="icon" onClick={() => { navigate(-1) }}>
        <ChevronLeft />
      </Button>
      {/* 前进 */}
      <Button variant="ghost" size="icon" onClick={() => { navigate(1) }}>
        <ChevronRight />
      </Button>
    </div>
  )
}

function AppTitle() {
  const { centerContent } = useHeaderStore()
  
  return (
    <div className="flex items-center gap-2">
      {centerContent ? (
        <div className="flex items-center">
          {centerContent}
        </div>
      ) : (
      <h1 className="text-lg font-bold select-none cursor-default">Star River</h1>
      )}
    </div>
  )
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
      <QuitAppConfitmBox>
        <Button variant="ghost" size="icon" className="hover:text-red-400">
          <X className="w-3 h-3" />
        </Button>
      </QuitAppConfitmBox>
    </div>
  )
}



export function AppHeader() {

  return (
    // sticky: 固定在顶部
    // z-50: 确保在其他元素之上
    // w-full: 占据整个宽度
    // items-center: 垂直居中
    // border-b: 底部边框
    // bg-background的具体含义是：背景颜色为背景色
    // h-10: 高度为10 这里固定设置为10
    <header className="flex sticky h-10 w-full items-center bg-background">
        {/* 
    h-[--header-height]: 的意思是，div的高度等于头部的高度
    w-full: 占据整个宽度
    items-center: 垂直居中
    border-b: 底部边框
    bg-background: 背景颜色
    */}
      <div className="flex w-full items-center justify-between gap-2 pl-4" style={{WebkitAppRegion: 'drag'}}>
        <div className="flex items-center gap-2" style={{WebkitAppRegion: 'no-drag'}}>
          <SidebarTrigger />
          <RouteArrow />
          
        </div>
        <div style={{WebkitAppRegion: 'no-drag'}}>
          <AppTitle />
        </div>
        <div className="flex items-center gap-2" style={{WebkitAppRegion: 'no-drag'}}>
          <WindowControl />
        </div>
      </div>
    </header>
  )
}
