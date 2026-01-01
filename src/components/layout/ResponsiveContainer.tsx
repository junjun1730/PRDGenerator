import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export default function ResponsiveContainer({
  children,
  className,
}: ResponsiveContainerProps) {
  return (
    <div className={cn('container-responsive', className)}>
      {children}
    </div>
  );
}
