import React from "react";
import type { ColorMode, ColorValue } from "@/components/color-picker";
import { ColorModeToggle, ColorPicker } from "@/components/color-picker";
import { formatColorByMode } from "@/components/color-picker/utils";

export default function ColorModeTest() {
	const [color, setColor] = React.useState("#FF6B6B");
	const [mode, setMode] = React.useState<ColorMode>("hex");
	const [lastComplete, setLastComplete] = React.useState<ColorValue | null>(
		null,
	);

	const handleColorComplete = (colorValue: ColorValue) => {
		setLastComplete(colorValue);
		console.log("颜色选择完成:", colorValue);
	};

	const displayValue = formatColorByMode(color, mode);

	return (
		<div className="container mx-auto p-8 space-y-8">
			<h1 className="text-3xl font-bold">颜色模式切换测试</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{/* 颜色选择器 */}
				<div className="space-y-4">
					<h2 className="text-xl font-semibold">颜色选择器</h2>
					<ColorPicker
						value={color}
						onChange={setColor}
						onChangeComplete={handleColorComplete}
						showAlpha={false}
						showPresets={true}
					/>
				</div>

				{/* 颜色信息显示 */}
				<div className="space-y-4">
					<h2 className="text-xl font-semibold">颜色信息</h2>

					{/* 颜色预览 */}
					<div
						className="w-full h-32 rounded border border-border"
						style={{ backgroundColor: color }}
					/>

					{/* 模式切换器 */}
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium">显示模式:</span>
						<ColorModeToggle mode={mode} onModeChange={setMode} />
					</div>

					{/* 当前颜色值 */}
					<div className="space-y-2">
						<p className="text-sm font-medium">当前颜色值:</p>
						<p className="font-mono text-lg bg-muted p-2 rounded">
							{displayValue}
						</p>
					</div>

					{/* 所有格式显示 */}
					<div className="space-y-2">
						<p className="text-sm font-medium">所有格式:</p>
						<div className="space-y-1 text-sm">
							<div>
								<strong>HEX:</strong>{" "}
								<code>{formatColorByMode(color, "hex")}</code>
							</div>
							<div>
								<strong>RGB:</strong>{" "}
								<code>{formatColorByMode(color, "rgb")}</code>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* 完整颜色信息 */}
			{lastComplete && (
				<div className="mt-8 p-4 border rounded-lg">
					<h3 className="text-lg font-semibold mb-4">最后选择的颜色详细信息</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div
							className="w-full h-24 rounded border"
							style={{ backgroundColor: lastComplete.hex }}
						/>
						<div className="space-y-2 text-sm">
							<div>
								<strong>HEX:</strong> <code>{lastComplete.hex}</code>
							</div>
							<div>
								<strong>RGB:</strong>{" "}
								<code>
									rgb({lastComplete.rgb.r}, {lastComplete.rgb.g},{" "}
									{lastComplete.rgb.b})
								</code>
							</div>
							<div>
								<strong>HSL:</strong>{" "}
								<code>
									hsl({lastComplete.hsl.h}, {lastComplete.hsl.s}%,{" "}
									{lastComplete.hsl.l}%)
								</code>
							</div>
							<div>
								<strong>Alpha:</strong> <code>{lastComplete.alpha}</code>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
