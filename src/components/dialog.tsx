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
    saveDisabled?: boolean;
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
    contentClassName = "",
    saveDisabled = false
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* 背景遮罩 */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog 内容 */}
            <div className={`relative bg-white rounded-lg shadow-xl mx-4 flex flex-col ${className}`}>
                {/* 标题栏 */}
                <div className="flex items-center justify-between py-2 px-4">
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
                    <div className="flex items-center justify-end gap-3 py-2 px-4">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="px-6"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saveDisabled}
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