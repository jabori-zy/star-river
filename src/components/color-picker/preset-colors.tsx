import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import type { PresetColorsProps } from './types';
import { cn } from '@/lib/utils';

export function PresetColors({ colors, selectedColor, onColorSelect }: PresetColorsProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-10 gap-1">
        {colors.map((color, index) => {
          const isSelected = color.toLowerCase() === selectedColor.toLowerCase();
          
          return (
            <Button
              key={`${color}-${index}`}
              variant="outline"
              size="sm"
              className={cn(
                "w-6 h-6 p-0 border-2 rounded-sm transition-all hover:scale-110",
                isSelected 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-border hover:border-primary/50"
              )}
              style={{ backgroundColor: color }}
              onClick={() => onColorSelect(color)}
              title={color}
            >
              {isSelected && (
                <Check 
                  className="w-3 h-3 text-white drop-shadow-sm" 
                  style={{
                    filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))'
                  }}
                />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
