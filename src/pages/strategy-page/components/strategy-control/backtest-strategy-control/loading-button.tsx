import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import useStrategyLoadingStore from "@/store/useStrategyLoadingStore";

interface LoadingButtonProps {
	strategyId: number | undefined;
}

const LoadingButton: React.FC<LoadingButtonProps> = () => {
	const { showDialog, setShowDialog } = useStrategyLoadingStore();

	const handleViewStatus = () => {
		setShowDialog(true);
	};

	return (
		<Button
			variant="secondary"
			size="sm"
			className="flex items-center gap-2 min-w-[90px]"
			onClick={handleViewStatus}
		>
			<Loader2 className="h-4 w-4 animate-spin" />
			{showDialog ? "加载中..." : "查看加载状态"}
		</Button>
	);
};

export default LoadingButton;
