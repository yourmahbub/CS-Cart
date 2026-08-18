import React from 'react';
import { Star } from 'lucide-react';

interface StarsProps {
  value: number;
  size?: number;
  color?: string;
  className?: string;
  onSelect?: (value: number) => void;
}

/**
 * Rating stars with true fractional fill (4.3 renders the 5th star 30% filled),
 * matching the storefront theme. Pass `onSelect` to make it interactive.
 */
export function Stars({ value, size = 14, color = '#ff5c00', className = '', onSelect }: StarsProps) {
  return (
    <div className={`flex items-center gap-[1px] ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span
            key={i}
            className={`relative inline-block leading-none ${onSelect ? 'cursor-pointer' : ''}`}
            style={{ width: size, height: size }}
            onClick={onSelect ? () => onSelect(i) : undefined}
            role={onSelect ? 'button' : undefined}
            aria-label={onSelect ? `Rate ${i} of 5` : undefined}
          >
            <Star
              className="absolute inset-0"
              style={{ width: size, height: size, color: `${color}33`, fill: `${color}33` }}
            />
            {fill > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star style={{ width: size, height: size, color, fill: color }} />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
