import React from "react";
import { ColorPicker, RgbInput } from "@/components/color-picker";
import { formatColorByMode } from "@/components/color-picker/utils";

export default function RgbInputTest() {
  const [color1, setColor1] = React.useState("#FF6B6B");
  const [color2, setColor2] = React.useState("#00FF00");

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">RGB 输入框测试</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 完整的颜色选择器 - RGB模式 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">完整颜色选择器 (RGB模式)</h2>
          <ColorPicker
            value={color1}
            onChange={setColor1}
            showAlpha={false}
            showPresets={true}
          />
          <div 
            className="w-full h-20 rounded border"
            style={{ backgroundColor: color1 }}
          />
          <div className="space-y-1 text-sm">
            <div><strong>HEX:</strong> <code>{formatColorByMode(color1, 'hex')}</code></div>
            <div><strong>RGB:</strong> <code>{formatColorByMode(color1, 'rgb')}</code></div>
          </div>
        </div>

        {/* 独立的RGB输入组件 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">独立 RGB 输入组件</h2>
          <RgbInput
            value={color2}
            onChange={setColor2}
          />
          <div 
            className="w-full h-20 rounded border"
            style={{ backgroundColor: color2 }}
          />
          <div className="space-y-1 text-sm">
            <div><strong>HEX:</strong> <code>{formatColorByMode(color2, 'hex')}</code></div>
            <div><strong>RGB:</strong> <code>{formatColorByMode(color2, 'rgb')}</code></div>
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="mt-8 p-4 border rounded-lg bg-muted/50">
        <h3 className="text-lg font-semibold mb-2">使用说明</h3>
        <ul className="space-y-1 text-sm">
          <li>• 在颜色选择器中，点击颜色值输入框右侧的下拉菜单可以切换 HEX/RGB 模式</li>
          <li>• RGB 模式下会显示三个独立的输入框：R (红)、G (绿)、B (蓝)</li>
          <li>• 每个输入框接受 0-255 之间的数值</li>
          <li>• 输入无效值时会显示红色边框，失焦时会恢复到有效值</li>
          <li>• 所有输入都会实时同步到颜色预览</li>
        </ul>
      </div>
    </div>
  );
}
