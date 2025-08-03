import React from "react";
import { ColorPicker } from "@/components/color-picker";
import { formatColorByMode } from "@/components/color-picker/utils";

export default function ResponsiveTest() {
  const [color1, setColor1] = React.useState("#FF6B6B");
  const [color2, setColor2] = React.useState("#00FF00");
  const [color3, setColor3] = React.useState("#0066FF");

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">响应式宽度测试</h1>
      <p className="text-muted-foreground">
        测试颜色选择器在不同容器宽度下的适配效果
      </p>
      
      <div className="space-y-8">
        {/* 全宽容器 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">全宽容器 (100%)</h2>
          <div className="w-full border border-dashed border-gray-300 p-4">
            <ColorPicker
              value={color1}
              onChange={setColor1}
              showAlpha={true}
              showPresets={true}
            />
          </div>
          <div 
            className="w-full h-12 rounded border border-border"
            style={{ backgroundColor: color1 }}
          />
          <p className="text-sm text-muted-foreground">
            当前颜色: {formatColorByMode(color1, 'hex')}
          </p>
        </div>

        {/* 中等宽度容器 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">中等宽度容器 (400px)</h2>
          <div className="w-[400px] border border-dashed border-gray-300 p-4 mx-auto">
            <ColorPicker
              value={color2}
              onChange={setColor2}
              showAlpha={true}
              showPresets={true}
            />
          </div>
          <div 
            className="w-[400px] h-12 rounded border border-border mx-auto"
            style={{ backgroundColor: color2 }}
          />
          <p className="text-sm text-muted-foreground text-center">
            当前颜色: {formatColorByMode(color2, 'hex')}
          </p>
        </div>

        {/* 窄宽度容器 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">窄宽度容器 (280px)</h2>
          <div className="w-[280px] border border-dashed border-gray-300 p-4 mx-auto">
            <ColorPicker
              value={color3}
              onChange={setColor3}
              showAlpha={false}
              showPresets={true}
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

        {/* 网格布局测试 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">网格布局测试</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-dashed border-gray-300 p-4">
              <h3 className="text-lg font-medium mb-4">列 1</h3>
              <ColorPicker
                value={color1}
                onChange={setColor1}
                showAlpha={false}
                showPresets={false}
              />
            </div>
            <div className="border border-dashed border-gray-300 p-4">
              <h3 className="text-lg font-medium mb-4">列 2</h3>
              <ColorPicker
                value={color2}
                onChange={setColor2}
                showAlpha={false}
                showPresets={false}
              />
            </div>
            <div className="border border-dashed border-gray-300 p-4">
              <h3 className="text-lg font-medium mb-4">列 3</h3>
              <ColorPicker
                value={color3}
                onChange={setColor3}
                showAlpha={false}
                showPresets={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 说明 */}
      <div className="mt-8 p-4 border rounded-lg bg-muted/50">
        <h3 className="text-lg font-semibold mb-2">响应式特点</h3>
        <ul className="space-y-1 text-sm">
          <li>✅ 颜色选择器宽度自适应容器宽度 (width: 100%)</li>
          <li>✅ 最大宽度限制为 280px，避免过度拉伸</li>
          <li>✅ 饱和度区域高度固定为 200px，保持良好比例</li>
          <li>✅ 在网格布局中能够很好地适配各列宽度</li>
          <li>✅ 在不同屏幕尺寸下都有良好的显示效果</li>
        </ul>
      </div>
    </div>
  );
}
