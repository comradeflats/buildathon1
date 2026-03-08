import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hover = false, children, ...props }, ref) => {
    const hoverStyles = hover ? 'hover:bg-card-hover cursor-pointer transition-colors' : '';

    return (
      <div
        ref={ref}
        className={`bg-card rounded-xl border border-zinc-800 ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
