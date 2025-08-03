import React from "react";
import { ColorPicker } from "@/components/color-picker";
import type { ColorValue } from "@/components/color-picker";
import { formatColorByMode } from "@/components/color-picker/utils";

export default function CompactLayoutTest() {
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
      <h1 className="text-3xl font-bold">紧凑布局测试</h1>
      <p className="text-muted-foreground">
        测试去除透明度预览色块和优化RGB输入框尺寸后的最终效果
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* HEX 模式 + 透明度 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">HEX 模式 + 透明度</h2>
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
            <div><strong>HEX:</strong> <code>{formatColorByMode(color1, 'hex')}</code></div>
            <div><strong>RGB:</strong> <code>{formatColorByMode(color1, 'rgb')}</code></div>
          </div>
        </div>

        {/* RGB 模式 + 透明度 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">RGB 模式 + 透明度</h2>
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
            <div><strong>HEX:</strong> <code>{formatColorByMode(color2, 'hex')}</code></div>
            <div><strong>RGB:</strong> <code>{formatColorByMode(color2, 'rgb')}</code></div>
          </div>
        </div>
      </div>

      {/* 窄容器测试 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">窄容器测试 (280px) - RGB 模式</h2>
        <div className="w-[280px] mx-auto border border-dashed border-gray-300 p-4">
          <ColorPicker
            value={color3}
            onChange={setColor3}
            showAlpha={true}
            showPresets={true}
            presetColors={customPresetColors}
          />
        </div>
        <div 
          className="w-[280px] h-12 rounded border border-border mx-auto"
          style={{ backgroundColor: color3 }}
        />
        <p className="text-sm text-muted-foreground text-center">
          当前颜色: {formatColorByMode(color3, 'hex')}
        </p>
      </div>

      {/* 超窄容器测试 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">超窄容器测试 (240px) - RGB 模式</h2>
        <div className="w-[240px] mx-auto border border-dashed border-gray-300 p-3">
          <ColorPicker
            value={color1}
            onChange={setColor1}
            showAlpha={false}
            showPresets={false}
          />
        </div>
        <div 
          className="w-[240px] h-12 rounded border border-border mx-auto"
          style={{ backgroundColor: color1 }}
        />
        <p className="text-sm text-muted-foreground text-center">
          测试RGB输入框在极窄容器中的表现
        </p>
      </div>

      {/* 优化说明 */}
      <div className="mt-8 p-4 border rounded-lg bg-muted/50">
        <h3 className="text-lg font-semibold mb-2">最新优化</h3>
        <ul className="space-y-1 text-sm">
          <li>✅ <strong>去除透明度预览</strong>: 移除透明度滑块下方的预览色块</li>
          <li>✅ <strong>RGB输入框优化</strong>: 缩小输入框尺寸，确保在一行显示</li>
          <li>✅ <strong>高度调整</strong>: RGB输入框高度调整为 h-8 (32px)</li>
          <li>✅ <strong>间距优化</strong>: 减少RGB输入框之间的间距 (gap-2)</li>
          <li>✅ <strong>标签居中</strong>: RGB标签 (R、G、B) 居中对齐</li>
          <li>✅ <strong>字体调整</strong>: 输入框文字大小调整为 text-sm</li>
        </ul>
      </div>

      {/* 布局对比 */}
      <div className="mt-8 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
        <h3 className="text-lg font-semibold mb-2">布局对比</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">修改前:</h4>
            <ul className="space-y-1">
              <li>• RGB输入框较大，容易挤占空间</li>
              <li>• 透明度滑块下方有预览色块</li>
              <li>• 在窄容器中可能换行</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">修改后:</h4>
            <ul className="space-y-1">
              <li>• RGB输入框紧凑，确保一行显示</li>
              <li>• 透明度滑块更简洁，无预览</li>
              <li>• 在各种容器宽度下都表现良好</li>
            </ul>
          </div>
        </div>
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
