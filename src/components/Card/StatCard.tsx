import { ReactNode, useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger';
  suffix?: string;
  prefix?: string;
  animated?: boolean;
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'primary', 
  suffix = '',
  prefix = '',
  animated = true 
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;

  useEffect(() => {
    if (animated && typeof value === 'number') {
      const duration = 1000;
      const steps = 30;
      const increment = numericValue / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setDisplayValue(numericValue);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(numericValue);
    }
  }, [numericValue, animated, value]);

  const colorClasses = {
    primary: 'bg-primary-500/15 text-primary-400 border-primary-500/30',
    success: 'bg-success-500/15 text-success-400 border-success-500/30',
    warning: 'bg-warning-500/15 text-warning-400 border-warning-500/30',
    danger: 'bg-danger-500/15 text-danger-400 border-danger-500/30',
  };

  const accentColor = {
    primary: '#165DFF',
    success: '#00B42A',
    warning: '#FF7D00',
    danger: '#F53F3F',
  };

  return (
    <div 
      className="stat-card animate-slide-up"
      style={{ '--accent-color': accentColor[color] } as React.CSSProperties}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-dark-300 font-medium">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white font-mono animate-count-up">
              {prefix}{typeof value === 'number' ? displayValue.toLocaleString() : value}{suffix}
            </span>
          </div>
          {trend && (
            <div className={cn(
              "mt-2 flex items-center gap-1 text-sm font-medium",
              trend.isUp ? "text-success-400" : "text-danger-400"
            )}>
              <span>{trend.isUp ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-dark-400 font-normal">较上月</span>
            </div>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center border",
          colorClasses[color]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
