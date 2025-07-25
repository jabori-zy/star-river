import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, PlusCircle, Save } from "lucide-react";

interface ChartHeaderProps {
	showAlert: boolean;
	alertMessage: string;
	onAddChart: () => void;
	onSaveChart: () => void;
}

export default function ChartHeader({
	showAlert,
	alertMessage,
	onAddChart,
	onSaveChart,
}: ChartHeaderProps) {
	return (
		<div className="sticky top-0 z-10 bg-white p-4 pb-2">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-semibold">策略图表</h2>

				<div className="flex items-center gap-3">
					{showAlert && (
						<Alert variant="destructive" className="w-auto py-2">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{alertMessage}</AlertDescription>
						</Alert>
					)}

					<Button
						variant="outline"
						className="flex items-center gap-1"
						onClick={onAddChart}
					>
						<PlusCircle className="h-4 w-4" />
						添加图表
					</Button>
					<Button
						variant="default"
						className="flex items-center gap-1"
						onClick={onSaveChart}
					>
						<Save className="h-4 w-4" />
						保存图表
					</Button>
				</div>
			</div>
		</div>
	);
}
