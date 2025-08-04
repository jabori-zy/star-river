import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { hexToRgb, rgbToHex } from './utils';

interface RgbInputProps {
  value: string; // HEX value
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function RgbInput({ value, onChange, disabled }: RgbInputProps) {
  const rgb = hexToRgb(value) || { r: 0, g: 0, b: 0 };
  const [r, setR] = React.useState(rgb.r.toString());
  const [g, setG] = React.useState(rgb.g.toString());
  const [b, setB] = React.useState(rgb.b.toString());
  const [errors, setErrors] = React.useState({ r: false, g: false, b: false });

  React.useEffect(() => {
    const newRgb = hexToRgb(value) || { r: 0, g: 0, b: 0 };
    setR(newRgb.r.toString());
    setG(newRgb.g.toString());
    setB(newRgb.b.toString());
    setErrors({ r: false, g: false, b: false });
  }, [value]);

  const validateAndUpdate = (newR: string, newG: string, newB: string) => {
    const rNum = parseInt(newR, 10);
    const gNum = parseInt(newG, 10);
    const bNum = parseInt(newB, 10);

    const newErrors = {
      r: Number.isNaN(rNum) || rNum < 0 || rNum > 255,
      g: Number.isNaN(gNum) || gNum < 0 || gNum > 255,
      b: Number.isNaN(bNum) || bNum < 0 || bNum > 255,
    };

    setErrors(newErrors);

    // 如果所有值都有效，更新颜色
    if (!newErrors.r && !newErrors.g && !newErrors.b) {
      const hexValue = rgbToHex(rNum, gNum, bNum);
      onChange(hexValue);
    }
  };

  const handleRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setR(newValue);
    validateAndUpdate(newValue, g, b);
  };

  const handleGChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setG(newValue);
    validateAndUpdate(r, newValue, b);
  };

  const handleBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setB(newValue);
    validateAndUpdate(r, g, newValue);
  };

  const handleBlur = (component: 'r' | 'g' | 'b') => {
    // 失焦时，如果值无效，恢复到当前有效值
    if (errors[component]) {
      const currentRgb = hexToRgb(value) || { r: 0, g: 0, b: 0 };
      switch (component) {
        case 'r':
          setR(currentRgb.r.toString());
          break;
        case 'g':
          setG(currentRgb.g.toString());
          break;
        case 'b':
          setB(currentRgb.b.toString());
          break;
      }
      setErrors(prev => ({ ...prev, [component]: false }));
    }
  };

  return (
    <div className="space-y-2 rgb-input">
      <div className="flex flex-row gap-4">
        <div className="flex items-center">
          <Label htmlFor="rgb-r" className="text-xs text-muted-foreground w-3">
            R
          </Label>
          <Input
            id="rgb-r"
            type="number"
            min="0"
            max="255"
            value={r}
            onChange={handleRChange}
            onBlur={() => handleBlur('r')}
            disabled={disabled}
            className={`text-center text-xs h-8 w-16 flex-1 ${errors.r ? 'border-destructive' : ''}`}
            placeholder="0"
          />
        </div>
        <div className="flex items-center">
          <Label htmlFor="rgb-g" className="text-xs text-muted-foreground w-3">
            G
          </Label>
          <Input
            id="rgb-g"
            type="number"
            min="0"
            max="255"
            value={g}
            onChange={handleGChange}
            onBlur={() => handleBlur('g')}
            disabled={disabled}
            className={`text-center text-xs h-8 w-16 flex-1 ${errors.g ? 'border-destructive' : ''}`}
            placeholder="0"
          />
        </div>
        <div className="flex items-center">
          <Label htmlFor="rgb-b" className="text-xs text-muted-foreground w-3">
            B
          </Label>
          <Input
            id="rgb-b"
            type="number"
            min="0"
            max="255"
            value={b}
            onChange={handleBChange}
            onBlur={() => handleBlur('b')}
            disabled={disabled}
            className={`text-center text-xs h-8 w-16 flex-1 ${errors.b ? 'border-destructive' : ''}`}
            placeholder="0"
          />
        </div>
      </div>
      {(errors.r || errors.g || errors.b) && (
        <p className="text-xs text-destructive">
          请输入 0-255 之间的有效数值
        </p>
      )}
    </div>
  );
}
