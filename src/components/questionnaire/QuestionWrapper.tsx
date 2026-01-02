'use client';

import { useEffect, useState } from 'react';

interface QuestionWrapperProps {
  isVisible: boolean;
  delay?: number;
  children: React.ReactNode;
}

/**
 * Progressive reveal wrapper for questionnaire questions
 * Animates question appearance with slideInUp + fadeIn animation
 */
export default function QuestionWrapper({
  isVisible,
  delay = 0,
  children,
}: QuestionWrapperProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShouldRender(true);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      setShouldRender(false);
    }
  }, [isVisible, delay]);

  if (!shouldRender) return null;

  return (
    <div
      className="opacity-0 animate-slideInUp"
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards',
        animationDuration: '300ms',
        animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // spring easing
      }}
    >
      {children}
    </div>
  );
}
