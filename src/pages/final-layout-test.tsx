import React from "react";
import type { ColorValue } from "@/components/color-picker";
import { ColorPicker } from "@/components/color-picker";
import { formatColorByMode } from "@/components/color-picker/utils";

export default function FinalLayoutTest() {
	const [color1, setColor1] = React.useState("#FF6B6B");
	const [color2, setColor2] = React.useState("#00FF00");
	const [color3, setColor3] = React.useState("#0066FF");
	const [lastComplete, setLastComplete] = React.useState<ColorValue | null>(
		null,
	);

	const handleColorComplete = (colorValue: ColorValue) => {
		setLastComplete(colorValue);
		console.log("颜色选择完成:", colorValue);
	};

	const customPresetColors = [
		"#FF6B6B",
		"#4ECDC4",
		"#45B7D1",
		"#96CEB4",
		"#FFEAA7",
		"#DDA0DD",
		"#98D8C8",
		"#F7DC6F",
		"#BB8FCE",
		"#85C1E9",
		"#F8C471",
		"#82E0AA",
	];

	return (
		<div className="container mx-auto p-8 space-y-8">
			<h1 className="text-3xl font-bold">最终布局测试</h1>
			<p className="text-muted-foreground">
				测试所有最新的布局优化：简化的模式切换、RGB模式同行布局、透明度滑块同行显示、简化的预览
			</p>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* HEX 模式测试 */}
				<div className="space-y-4">
					<h2 className="text-xl font-semibold">HEX 模式</h2>
					<div className="border border-dashed border-gray-300 p-4">
						<ColorPicker
							value={color1}
							onChange={setColor1}
							onChangeComplete={handleColorComplete}
							showAlpha={true}
							showPresets={true}
						/>
					</div>
					<div
						className="w-full h-16 rounded border border-border"
						style={{ backgroundColor: color1 }}
					/>
					<div className="space-y-1 text-sm">
						<div>
							<strong>HEX:</strong>{" "}
							<code>{formatColorByMode(color1, "hex")}</code>
						</div>
						<div>
							<strong>RGB:</strong>{" "}
							<code>{formatColorByMode(color1, "rgb")}</code>
						</div>
					</div>
				</div>

				{/* RGB 模式测试 */}
				<div className="space-y-4">
					<h2 className="text-xl font-semibold">RGB 模式</h2>
					<div className="border border-dashed border-gray-300 p-4">
						<ColorPicker
							value={color2}
							onChange={setColor2}
							showAlpha={true}
							showPresets={false}
						/>
					</div>
					<div
						className="w-full h-16 rounded border border-border"
						style={{ backgroundColor: color2 }}
					/>
					<div className="space-y-1 text-sm">
						<div>
							<strong>HEX:</strong>{" "}
							<code>{formatColorByMode(color2, "hex")}</code>
						</div>
						<div>
							<strong>RGB:</strong>{" "}
							<code>{formatColorByMode(color2, "rgb")}</code>
						</div>
					</div>
				</div>

				{/* 自定义预设测试 */}
				<div className="space-y-4">
					<h2 className="text-xl font-semibold">自定义预设</h2>
					<div className="border border-dashed border-gray-300 p-4">
						<ColorPicker
							value={color3}
							onChange={setColor3}
							showAlpha={false}
							presetColors={customPresetColors}
						/>
					</div>
					<div
						className="w-full h-16 rounded border border-border"
						style={{ backgroundColor: color3 }}
					/>
					<div className="space-y-1 text-sm">
						<div>
							<strong>HEX:</strong>{" "}
							<code>{formatColorByMode(color3, "hex")}</code>
						</div>
						<div>
							<strong>RGB:</strong>{" "}
							<code>{formatColorByMode(color3, "rgb")}</code>
						</div>
					</div>
				</div>
			</div>

			{/* 窄容器测试 */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">窄容器测试 (300px)</h2>
				<div className="w-[300px] mx-auto border border-dashed border-gray-300 p-4">
					<ColorPicker
						value={color1}
						onChange={setColor1}
						showAlpha={true}
						showPresets={true}
					/>
				</div>
			</div>

			{/* 布局特点说明 */}
			<div className="mt-8 p-4 border rounded-lg bg-muted/50">
				<h3 className="text-lg font-semibold mb-2">最新布局特点</h3>
				<ul className="space-y-1 text-sm">
					<li>
						✅ <strong>模式切换</strong>: 去除描述文字，只显示图标和模式名称
					</li>
					<li>
						✅ <strong>RGB 模式</strong>: 三个输入框与模式切换按钮在同一行
					</li>
					<li>
						✅ <strong>HEX 模式</strong>: 输入框与模式切换按钮在同一行
					</li>
					<li>
						✅ <strong>透明度滑块</strong>:
						滑块与百分比在同一行，去除"透明度"文字
					</li>
					<li>
						✅ <strong>预览色块</strong>: 去除"预览:"文字，只显示颜色块
					</li>
					<li>
						✅ <strong>响应式宽度</strong>: 颜色选择器自适应容器宽度
					</li>
					<li>
						✅ <strong>简洁界面</strong>: 去除所有冗余标题和文字
					</li>
				</ul>
			</div>

			{/* 操作指南 */}
			<div className="mt-8 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
				<h3 className="text-lg font-semibold mb-2">操作指南</h3>
				<ul className="space-y-1 text-sm">
					<li>• 点击颜色按钮打开颜色选择器</li>
					<li>• 在输入框右侧点击下拉菜单切换 HEX/RGB 模式</li>
					<li>• RGB 模式下可以直接输入 R、G、B 数值 (0-255)</li>
					<li>• 透明度滑块右侧显示当前百分比</li>
					<li>• 预设颜色可以快速选择常用颜色</li>
				</ul>
			</div>

			{/* 最后选择的颜色信息 */}
			{lastComplete && (
				<div className="mt-8 p-4 border rounded-lg">
					<h3 className="text-lg font-semibold mb-4">最后选择的颜色详细信息</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div
							className="w-full h-24 rounded border border-border"
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
