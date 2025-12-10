/**
 * Card Component - Flexible container for content
 * 
 * Features:
 * - Multiple variants (default, elevated, outlined)
 * - Consistent spacing and styling
 * - Support for interactive states
 */

export default function Card({ 
  variant = 'default', 
  className = '', 
  children, 
  interactive = false,
  ...props 
}) {
  const baseClasses = "rounded-lg";
  
  const variants = {
  default: "bg-[var(--color-surface-elevated)] border border-[var(--color-border)]",
  elevated: "bg-[var(--color-surface-elevated)] shadow-sm hover:shadow-md transition-shadow duration-200",
  outlined: "bg-transparent border-2 border-[var(--color-border-strong)]",
  subtle: "bg-[var(--color-surface)] border border-[var(--color-border)]"
  };

  const interactiveClasses = interactive ? "cursor-pointer hover:scale-[1.02] transition-transform duration-200" : "";

  const combinedClasses = `${baseClasses} ${variants[variant]} ${interactiveClasses} ${className}`;

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
}

// Card sub-components for consistent structure
export function CardHeader({ className = '', children, ...props }) {
  return (
  <div className={`px-6 py-4 border-b border-[var(--color-border)] ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }) {
  return (
  <div className={`px-6 py-4 border-t border-[var(--color-border)] ${className}`} {...props}>
      {children}
    </div>
  );
}
