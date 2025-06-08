import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { LucideIcon } from "lucide-react";


interface BasePanelHeaderProps {
    title: string;
    icon: LucideIcon;
    iconBackgroundColor: string;
    setTitle: (title: string) => void;
    isEditingTitle: boolean;
    setIsEditingTitle: (isEditingTitle: boolean) => void;
    setIsShow: (isShow: boolean) => void;
}


const BasePanelHeader: React.FC<BasePanelHeaderProps> = ({ title, icon: Icon, iconBackgroundColor, setTitle, isEditingTitle, setIsEditingTitle, setIsShow }) => {
    return (
        // flex 弹性盒子布局
        // justify-between 两端对齐
        // items-center 垂直居中
        // p-2 内边距
        <div className="flex justify-between items-center p-1 ">
            {/* 标题区域 */}
            {/* 
                flex-1 占据剩余空间
                flex 弹性盒子布局
                items-center 垂直居中
                border-b 下边框
                border-gray-100 边框颜色
                pb-2 下内边距
                mr-2 右外边距，与按钮保持距离
                bg-red-100 背景颜色
            */}
            <div className="flex-1 flex items-center border-gray-100 mr-2 ">
                {/* 图标 */}
                {Icon && (
                    // p-1 内边距
                    // rounded-sm 圆角
                    // flex-shrink-0 效果是，如果内容超出，不收缩
                    // bg-red-400 背景颜色
                    // mr-2 右外边距
                    <div className={`p-1 mr-2 rounded-sm flex-shrink-0 ${iconBackgroundColor} `}>
                    <Icon className="w-4 h-4 text-white flex-shrink-0" />
                    </div>
                )}
                {/* 标题 */}
                {
                    isEditingTitle ? (
                        <Input  
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-8 text-sm flex-1"
                            placeholder="输入策略名称"
                            autoFocus
                            onBlur={() => setIsEditingTitle(false)}
                        />
                    ) : (
                        // leading-8 行高
                        // py-1 上下内边距
                        <h3 className="text-md font-bold text-gray-800 leading-8 py-1" 
                        onDoubleClick={() => setIsEditingTitle(true)}
                        >{ title }</h3>
                    )
                }
            </div>
            
            {/* 
                flex-shrink-0 防止按钮被压缩
                hover:bg-gray-100 鼠标悬停背景色
            */}
            <Button
                variant="ghost" 
                size="icon" 
                className="flex-shrink-0 hover:bg-gray-100"
                onClick={() => setIsShow(false)}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    )
}

export default BasePanelHeader;