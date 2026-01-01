import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  shadow?: 'none' | 'soft' | 'medium' | 'strong';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export default function Card({
  children,
  shadow = 'soft',
  padding = 'md',
  hover = false,
  className,
  ...props
}: CardProps) {
  const shadows = {
    none: '',
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    strong: 'shadow-strong',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-neutral-200',
        'transition-all duration-200',
        shadows[shadow],
        paddings[padding],
        hover && 'hover:shadow-medium hover:border-neutral-300 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
