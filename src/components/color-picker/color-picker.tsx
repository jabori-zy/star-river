import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { Button } from '@/components/ui/button';
import './color-picker.css';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Palette } from 'lucide-react';
import { ColorInput } from './color-input';
import { AlphaSlider } from './alpha-slider';
import { PresetColors } from './preset-colors';
import type { ColorPickerProps, ColorMode } from './types';
import { DEFAULT_PRESET_COLORS, parseColor, colorToRgba, formatColorByMode } from './utils';
import { cn } from '@/lib/utils';

export function ColorPicker({
  value = '#000000',
  onChange,
  onChangeComplete,
  disabled = false,
  showAlpha = true,
  showPresets = true,
  presetColors = DEFAULT_PRESET_COLORS,
  className,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentColor, setCurrentColor] = React.useState(value);
  const [alpha, setAlpha] = React.useState(1);
  const [colorMode, setColorMode] = React.useState<ColorMode>('hex');

  React.useEffect(() => {
    setCurrentColor(value);
  }, [value]);

  const handleColorChange = (newColor: string) => {
    setCurrentColor(newColor);
    onChange?.(newColor);
  };

  const handleAlphaChange = (newAlpha: number) => {
    setAlpha(newAlpha);
  };

  const handleComplete = () => {
    const colorValue = parseColor(currentColor, alpha);
    onChangeComplete?.(colorValue);
    setIsOpen(false);
  };

  const handlePresetSelect = (color: string) => {
    handleColorChange(color);
  };

  const displayColor = showAlpha ? colorToRgba(currentColor, alpha) : currentColor;
  const displayText = formatColorByMode(currentColor, colorMode);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start gap-2 h-10",
            className
          )}
        >
          <div
            className="w-6 h-6 rounded border border-border flex-shrink-0"
            style={{ backgroundColor: displayColor }}
          />
          <span className="font-mono text-sm">{displayText}</span>
          <Palette className="w-4 h-4 ml-auto" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          {/* 颜色选择器 */}
          <div className="flex justify-center color-picker-container">
            <HexColorPicker
              color={currentColor}
              onChange={handleColorChange}
            />
          </div>

          <Separator />

          {/* 颜色值输入 */}
          <ColorInput
            value={currentColor}
            onChange={handleColorChange}
            disabled={disabled}
            mode={colorMode}
            onModeChange={setColorMode}
          />

          {/* 透明度滑块 */}
          {showAlpha && (
            <>
              <Separator />
              <AlphaSlider
                color={currentColor}
                alpha={alpha}
                onChange={handleAlphaChange}
              />
            </>
          )}

          {/* 预设颜色 */}
          {showPresets && presetColors.length > 0 && (
            <>
              <Separator />
              <PresetColors
                colors={presetColors}
                selectedColor={currentColor}
                onColorSelect={handlePresetSelect}
              />
            </>
          )}

          {/* 操作按钮 */}
          <Separator />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleComplete}
              className="flex-1"
            >
              确定
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
