import React from "react";
import { HexColorPicker } from "react-colorful";

export default function SimpleColorTest() {
	const [color, setColor] = React.useState("#aabbcc");

	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-4">简单颜色选择器测试</h1>

			<div className="space-y-4">
				<HexColorPicker color={color} onChange={setColor} />

				<div
					className="w-32 h-32 border rounded"
					style={{ backgroundColor: color }}
				/>

				<p>当前颜色: {color}</p>
			</div>
		</div>
	);
}
