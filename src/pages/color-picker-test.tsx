import React from "react";
import { ColorPicker } from "@/components/color-picker";
import type { ColorValue } from "@/components/color-picker";

export default function ColorPickerTest() {
  const [color1, setColor1] = React.useState("#FF6B6B");
  const [color2, setColor2] = React.useState("#00FF00");
  const [color3, setColor3] = React.useState("#0066FF");

  const handleColorComplete = (colorValue: ColorValue) => {
    console.log("颜色选择完成:", colorValue);
  };

  const customPresetColors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
    "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
    "#BB8FCE", "#85C1E9", "#F8C471", "#82E0AA"
  ];

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">颜色选择器测试</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 基础颜色选择器 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">基础颜色选择器</h2>
          <ColorPicker
            value={color1}
            onChange={setColor1}
            onChangeComplete={handleColorComplete}
          />
          <div 
            className="w-full h-20 rounded border"
            style={{ backgroundColor: color1 }}
          />
          <p className="font-mono text-sm">{color1}</p>
        </div>

        {/* 带透明度的颜色选择器 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">带透明度</h2>
          <ColorPicker
            value={color2}
            onChange={setColor2}
            showAlpha={true}
          />
          <div 
            className="w-full h-20 rounded border"
            style={{ backgroundColor: color2 }}
          />
          <p className="font-mono text-sm">{color2}</p>
        </div>

        {/* 自定义预设颜色 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">自定义预设</h2>
          <ColorPicker
            value={color3}
            onChange={setColor3}
            showAlpha={false}
            presetColors={customPresetColors}
          />
          <div 
            className="w-full h-20 rounded border"
            style={{ backgroundColor: color3 }}
          />
          <p className="font-mono text-sm">{color3}</p>
        </div>
      </div>
    </div>
  );
}
