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
} from "@/components/ui/alert-dialog";

interface ConfirmBoxProps {
	title: string;
	description: string;
	confirmText: string;
	cancelText: string;
	onConfirm: () => void | Promise<void>;
	children: React.ReactNode; // 触发器内容
}

// 退出应用二次确认框
const ConfirmBox = ({
	title,
	description,
	confirmText,
	cancelText,
	onConfirm,
	children,
}: ConfirmBoxProps) => {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{cancelText}</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						className="bg-red-500 hover:bg-red-600"
					>
						{confirmText}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default ConfirmBox;
