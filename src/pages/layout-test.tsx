import React from "react";
import { ColorPicker } from "@/components/color-picker";
import type { ColorValue } from "@/components/color-picker";
import { formatColorByMode } from "@/components/color-picker/utils";

export default function LayoutTest() {
  const [color1, setColor1] = React.useState("#FF6B6B");
  const [color2, setColor2] = React.useState("#00FF00");
  const [color3, setColor3] = React.useState("#0066FF");
  const [lastComplete, setLastComplete] = React.useState<ColorValue | null>(null);

  const handleColorComplete = (colorValue: ColorValue) => {
    setLastComplete(colorValue);
    console.log("颜色选择完成:", colorValue);
  };

  const customPresetColors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
    "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
    "#BB8FCE", "#85C1E9", "#F8C471", "#82E0AA"
  ];

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">新布局测试</h1>
      <p className="text-muted-foreground">
        测试去除标题后的简洁布局，正方形颜色选择器，以及输入框与模式切换在同一行的效果
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 基础颜色选择器 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">基础版本</h2>
          <ColorPicker
            value={color1}
            onChange={setColor1}
            onChangeComplete={handleColorComplete}
            showAlpha={true}
            showPresets={true}
          />
          <div 
            className="w-full h-16 rounded border border-border"
            style={{ backgroundColor: color1 }}
          />
          <div className="space-y-1 text-sm">
            <div><strong>HEX:</strong> <code>{formatColorByMode(color1, 'hex')}</code></div>
            <div><strong>RGB:</strong> <code>{formatColorByMode(color1, 'rgb')}</code></div>
          </div>
        </div>

        {/* 带透明度 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">带透明度</h2>
          <ColorPicker
            value={color2}
            onChange={setColor2}
            showAlpha={true}
            showPresets={false}
          />
          <div 
            className="w-full h-16 rounded border border-border"
            style={{ backgroundColor: color2 }}
          />
          <div className="space-y-1 text-sm">
            <div><strong>HEX:</strong> <code>{formatColorByMode(color2, 'hex')}</code></div>
            <div><strong>RGB:</strong> <code>{formatColorByMode(color2, 'rgb')}</code></div>
          </div>
        </div>

        {/* 自定义预设 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">自定义预设</h2>
          <ColorPicker
            value={color3}
            onChange={setColor3}
            showAlpha={false}
            presetColors={customPresetColors}
          />
          <div 
            className="w-full h-16 rounded border border-border"
            style={{ backgroundColor: color3 }}
          />
          <div className="space-y-1 text-sm">
            <div><strong>HEX:</strong> <code>{formatColorByMode(color3, 'hex')}</code></div>
            <div><strong>RGB:</strong> <code>{formatColorByMode(color3, 'rgb')}</code></div>
          </div>
        </div>
      </div>

      {/* 布局特点说明 */}
      <div className="mt-8 p-4 border rounded-lg bg-muted/50">
        <h3 className="text-lg font-semibold mb-2">新布局特点</h3>
        <ul className="space-y-1 text-sm">
          <li>✅ 去除了"选择颜色"、"颜色值"、"预设颜色"等标题</li>
          <li>✅ 颜色选择器改为 200x200 像素的正方形，居中显示</li>
          <li>✅ HEX 模式下，输入框和模式切换按钮在同一行</li>
          <li>✅ RGB 模式下，模式切换按钮在右上角</li>
          <li>✅ 透明度滑块只显示百分比，格式为"透明度: XX%"</li>
          <li>✅ 预设颜色直接显示色块网格，无标题</li>
          <li>✅ 整体布局更加简洁紧凑</li>
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
              <div><strong>HEX:</strong> <code>{lastComplete.hex}</code></div>
              <div><strong>RGB:</strong> <code>rgb({lastComplete.rgb.r}, {lastComplete.rgb.g}, {lastComplete.rgb.b})</code></div>
              <div><strong>HSL:</strong> <code>hsl({lastComplete.hsl.h}, {lastComplete.hsl.s}%, {lastComplete.hsl.l}%)</code></div>
              <div><strong>Alpha:</strong> <code>{lastComplete.alpha}</code></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
