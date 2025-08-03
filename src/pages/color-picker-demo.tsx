import React from "react";
import { ColorPicker } from "@/components/color-picker";
import type { ColorValue } from "@/components/color-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Copy, Palette } from "lucide-react";

export default function ColorPickerDemo() {
  const [basicColor, setBasicColor] = React.useState("#FF6B6B");
  const [alphaColor, setAlphaColor] = React.useState("#00FF00");
  const [customColor, setCustomColor] = React.useState("#0066FF");
  const [modeColor, setModeColor] = React.useState("#9B59B6");
  const [disabledColor] = React.useState("#999999");
  const [lastCompleteColor, setLastCompleteColor] = React.useState<ColorValue | null>(null);

  const handleColorComplete = (colorValue: ColorValue) => {
    setLastCompleteColor(colorValue);
    console.log("颜色选择完成:", colorValue);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const customPresetColors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
    "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
    "#BB8FCE", "#85C1E9", "#F8C471", "#82E0AA"
  ];

  const brandColors = [
    "#1DA1F2", "#1877F2", "#FF0000", "#FF6900",
    "#6B73FF", "#9B59B6", "#E91E63", "#FF5722"
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
          <Palette className="w-8 h-8" />
          颜色选择器演示
        </h1>
        <p className="text-muted-foreground">
          基于 shadcn/ui 和 react-colorful 构建的颜色选择器组件
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 基础颜色选择器 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              基础颜色选择器
              <Badge variant="secondary">默认</Badge>
            </CardTitle>
            <CardDescription>
              包含颜色选择器、输入框、透明度滑块和预设颜色
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ColorPicker
              value={basicColor}
              onChange={setBasicColor}
              onChangeComplete={handleColorComplete}
            />
            <div className="flex items-center gap-2">
              <div 
                className="w-12 h-12 rounded border border-border"
                style={{ backgroundColor: basicColor }}
              />
              <div className="flex-1">
                <p className="font-mono text-sm">{basicColor}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(basicColor)}
                  className="h-6 px-2 text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  复制
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 带透明度的颜色选择器 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              透明度颜色选择器
              <Badge variant="secondary">Alpha</Badge>
            </CardTitle>
            <CardDescription>
              支持透明度调节的颜色选择器
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ColorPicker
              value={alphaColor}
              onChange={setAlphaColor}
              showAlpha={true}
            />
            <div className="flex items-center gap-2">
              <div 
                className="w-12 h-12 rounded border border-border"
                style={{ backgroundColor: alphaColor }}
              />
              <div className="flex-1">
                <p className="font-mono text-sm">{alphaColor}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(alphaColor)}
                  className="h-6 px-2 text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  复制
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 自定义预设颜色 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              自定义预设颜色
              <Badge variant="secondary">Custom</Badge>
            </CardTitle>
            <CardDescription>
              使用自定义的预设颜色集合
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ColorPicker
              value={customColor}
              onChange={setCustomColor}
              showAlpha={false}
              presetColors={customPresetColors}
            />
            <div className="flex items-center gap-2">
              <div 
                className="w-12 h-12 rounded border border-border"
                style={{ backgroundColor: customColor }}
              />
              <div className="flex-1">
                <p className="font-mono text-sm">{customColor}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(customColor)}
                  className="h-6 px-2 text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  复制
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 颜色模式切换 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              颜色模式切换
              <Badge variant="secondary">Mode</Badge>
            </CardTitle>
            <CardDescription>
              支持 HEX、RGB、HSL、HSV 多种颜色格式
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ColorPicker
              value={modeColor}
              onChange={setModeColor}
              showAlpha={false}
              showPresets={false}
            />
            <div className="flex items-center gap-2">
              <div
                className="w-12 h-12 rounded border border-border"
                style={{ backgroundColor: modeColor }}
              />
              <div className="flex-1">
                <p className="font-mono text-sm">{modeColor}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(modeColor)}
                  className="h-6 px-2 text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  复制
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 品牌色预设 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              品牌色预设
              <Badge variant="secondary">Brand</Badge>
            </CardTitle>
            <CardDescription>
              常见品牌色彩的预设集合
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ColorPicker
              value={customColor}
              onChange={setCustomColor}
              showAlpha={false}
              presetColors={brandColors}
            />
            <div className="grid grid-cols-4 gap-2">
              {brandColors.map((color, index) => (
                <div key={index} className="text-center">
                  <div 
                    className="w-full h-8 rounded border border-border mb-1"
                    style={{ backgroundColor: color }}
                  />
                  <p className="text-xs font-mono">{color}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 禁用状态演示 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            禁用状态
            <Badge variant="outline">Disabled</Badge>
          </CardTitle>
          <CardDescription>
            演示颜色选择器的禁用状态
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ColorPicker
              value={disabledColor}
              disabled={true}
            />
            <div className="flex items-center gap-2">
              <div 
                className="w-12 h-12 rounded border border-border opacity-50"
                style={{ backgroundColor: disabledColor }}
              />
              <div>
                <p className="font-mono text-sm text-muted-foreground">{disabledColor}</p>
                <p className="text-xs text-muted-foreground">禁用状态</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 回调信息显示 */}
      {lastCompleteColor && (
        <Card>
          <CardHeader>
            <CardTitle>最后选择的颜色信息</CardTitle>
            <CardDescription>
              onChangeComplete 回调返回的完整颜色信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className="w-full h-24 rounded border border-border"
                style={{ backgroundColor: lastCompleteColor.hex }}
              />
              <div className="space-y-2 text-sm">
                <div><strong>HEX:</strong> <code>{lastCompleteColor.hex}</code></div>
                <div><strong>RGB:</strong> <code>rgb({lastCompleteColor.rgb.r}, {lastCompleteColor.rgb.g}, {lastCompleteColor.rgb.b})</code></div>
                <div><strong>HSL:</strong> <code>hsl({lastCompleteColor.hsl.h}, {lastCompleteColor.hsl.s}%, {lastCompleteColor.hsl.l}%)</code></div>
                <div><strong>Alpha:</strong> <code>{lastCompleteColor.alpha}</code></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
