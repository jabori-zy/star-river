import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    onSave?: () => void;
    onCancel?: () => void;
    saveText?: string;
    cancelText?: string;
    showFooter?: boolean;
    className?: string;
    contentClassName?: string;
}

const Dialog = ({
    isOpen,
    onClose,
    title,
    children,
    onSave,
    onCancel,
    saveText = "保存",
    cancelText = "取消",
    showFooter = true,
    className = "",
    contentClassName = ""
}: DialogProps) => {
    if (!isOpen) return null;

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            onClose();
        }
    };

    const handleSave = () => {
        if (onSave) {
            onSave();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* 背景遮罩 */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog 内容 */}
            <div className={`relative bg-white rounded-lg shadow-xl w-full max-w-3xl min-w-[200px] max-h-[80vh] min-h-[600px] mx-4 flex flex-col ${className}`}>
                {/* 标题栏 */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {title}
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        onClick={onClose}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* 内容区域 */}
                <div className={`flex-1 overflow-hidden ${contentClassName}`}>
                    {children}
                </div>

                {/* 底部按钮 */}
                {showFooter && (
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="px-6"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="px-6"
                        >
                            {saveText}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dialog;