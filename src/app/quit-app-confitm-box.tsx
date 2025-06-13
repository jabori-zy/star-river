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

interface QuitAppConfitmBoxProps {
  children: React.ReactNode;  // 触发器内容
}

// 退出应用二次确认框
const QuitAppConfitmBox = ({ children }: QuitAppConfitmBoxProps) => {
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
                <AlertDialogTitle>确认退出</AlertDialogTitle>
                <AlertDialogDescription>
                    确认退出应用吗？所有未保存的更改可能会丢失。
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmQuit} className="bg-red-500 hover:bg-red-600">
                    确认退出
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default QuitAppConfitmBox;