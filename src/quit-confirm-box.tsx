import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

// 声明electron的require
const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null }

interface QuitConfirmBoxProps {
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  children: React.ReactNode;  // 触发器内容
}

// 退出应用二次确认框
const QuitConfirmBox = ({ title, description, confirmText, cancelText, children }: QuitConfirmBoxProps) => {
    const handleConfirmQuit = () => {
        if (ipcRenderer) {
            ipcRenderer.invoke('close-window')
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription>
                    {description}
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>{cancelText}</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmQuit} className="bg-red-500 hover:bg-red-600">
                    {confirmText}
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default QuitConfirmBox;