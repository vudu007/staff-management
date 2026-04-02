'use client';

import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'outline';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700 border-gray-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  outline: 'bg-transparent text-gray-600 border-gray-300',
};

const statusMap: Record<string, BadgeVariant> = {
  ACTIVE: 'success',
  ON_LEAVE: 'warning',
  TERMINATED: 'error',
  SUSPENDED: 'default',
  PRESENT: 'success',
  ABSENT: 'error',
  LATE: 'warning',
  HALF_DAY: 'info',
  SUPER_ADMIN: 'error',
  ADMIN: 'purple',
  MANAGER: 'info',
  VIEWER: 'default',
  PUNCTUALITY: 'info',
  CUSTOMER_SERVICE: 'success',
  SALES: 'purple',
  TEAMWORK: 'warning',
  OVERALL: 'info',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  status?: string;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export function Badge({ children, variant, status, size = 'sm', dot = false, className }: BadgeProps) {
  const resolvedVariant = variant || (status ? statusMap[status] || 'default' : 'default');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border rounded-full whitespace-nowrap',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variantStyles[resolvedVariant],
        className
      )}
    >
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          resolvedVariant === 'success' && 'bg-emerald-500',
          resolvedVariant === 'warning' && 'bg-amber-500',
          resolvedVariant === 'error' && 'bg-red-500',
          resolvedVariant === 'info' && 'bg-blue-500',
          resolvedVariant === 'purple' && 'bg-purple-500',
          resolvedVariant === 'default' && 'bg-gray-500',
        )} />
      )}
      {children}
    </span>
  );
}
