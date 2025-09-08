import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import useStrategyLoadingStore from "@/store/useStrategyLoadingStore";

interface StoppingButtonProps {
	strategyId: number | undefined;
}

const StoppingButton: React.FC<StoppingButtonProps> = () => {
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
			{showDialog ? "停止中..." : "查看停止状态"}
		</Button>
	);
};

export default StoppingButton;
