'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: any;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  gradient?: string;
  className?: string;
  animate?: boolean;
}

function useCountUp(end: number, duration: number = 1200, animate: boolean = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!animate || hasAnimated.current) {
      setCount(end);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();
          const step = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, animate]);

  return { count, ref };
}

const defaultGradients = [
  'from-indigo-500 to-indigo-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-amber-600',
  'from-purple-500 to-purple-600',
  'from-rose-500 to-rose-600',
  'from-cyan-500 to-cyan-600',
];

export function StatsCard({ label, value, icon: Icon, change, trend, gradient, className, animate = true }: StatsCardProps) {
  const numValue = typeof value === 'number' ? value : parseFloat(value);
  const isNumeric = !isNaN(numValue) && typeof value === 'number';
  const { count, ref } = useCountUp(isNumeric ? numValue : 0, 1200, animate && isNumeric);

  return (
    <div
      ref={ref}
      className={cn(
        'relative bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300',
        className
      )}
    >
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1 tabular-nums">
            {isNumeric ? count : value}
          </p>
          {change && (
            <p className={cn(
              'text-xs font-medium mt-1.5',
              trend === 'up' && 'text-emerald-600',
              trend === 'down' && 'text-red-600',
              (!trend || trend === 'neutral') && 'text-gray-400',
            )}>
              {trend === 'up' && '↑ '}
              {trend === 'down' && '↓ '}
              {change}
            </p>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-xl bg-gradient-to-br shadow-lg shadow-indigo-500/20',
          gradient || defaultGradients[0]
        )}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Decorative gradient blob */}
      <div className={cn(
        'absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.04] bg-gradient-to-br group-hover:opacity-[0.08] transition-opacity duration-500',
        gradient || defaultGradients[0]
      )} />
    </div>
  );
}
