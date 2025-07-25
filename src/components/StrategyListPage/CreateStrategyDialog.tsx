// 填写策略名称，策略描述等信息
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createStrategy } from "@/service/strategy";

interface CreateStrategyDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

const CreateStrategyDialog = ({
	open,
	onOpenChange,
	onSuccess,
}: CreateStrategyDialogProps) => {
	const navigate = useNavigate();
	const [strategyName, setStrategyName] = useState("");
	const [description, setDescription] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleCreate = async () => {
		if (!strategyName.trim()) {
			setError("策略名称不能为空");
			return;
		}

		setIsLoading(true);

		try {
			const strategy = await createStrategy(
				strategyName.trim(),
				description.trim(),
			);
			// const response = await fetch('http://localhost:3100/create_strategy', {
			//   method: 'POST',
			//   headers: {
			//     'Content-Type': 'application/json',
			//   },
			//   body: JSON.stringify({
			//     name: strategyName.trim(),
			//     description: description.trim(),
			//     status: 1
			//   })
			// });

			if (!strategy) {
				throw new Error("创建策略失败");
			}

			toast.success("创建成功");

			navigate("/node", {
				state: {
					strategyId: strategy.id,
					strategyName: strategyName.trim(),
					description: description.trim(),
				},
			});
		} catch (err) {
			toast.error("保存策略失败，请重试:" + err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		onOpenChange(false);
		setStrategyName("");
		setDescription("");
		setError("");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="sm:max-w-[425px]"
				onOpenAutoFocus={(e) => e.preventDefault()} // 防止自动聚焦
			>
				<DialogHeader>
					<DialogTitle>创建新策略</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="name" className="flex items-center gap-1">
							策略名称
							<span className="text-red-500">*</span>
						</Label>
						<Input
							id="name"
							placeholder="输入策略名称"
							value={strategyName}
							onChange={(e) => {
								setStrategyName(e.target.value);
								setError("");
							}}
							className={cn(
								error && "border-red-500 focus-visible:ring-red-500",
							)}
						/>
						{error && <p className="text-xs text-red-500">{error}</p>}
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">
							策略描述{" "}
							<span className="text-sm text-muted-foreground">(选填)</span>
						</Label>
						<Textarea
							id="description"
							placeholder="输入策略描述..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="resize-none min-h-[100px]"
							rows={4}
							style={{
								overflowY: "auto",
								wordBreak: "break-word",
							}}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={handleCancel} disabled={isLoading}>
						取消
					</Button>
					<Button onClick={handleCreate} disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								保存中...
							</>
						) : (
							"创建策略"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default CreateStrategyDialog;
