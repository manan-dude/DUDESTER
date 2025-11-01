// src/components/ui/Card.jsx

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-[var(--color-surface)] rounded-xl border border-gray-400 border-opacity-20 dark:border-opacity-30 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-b border-gray-400 border-opacity-20 dark:border-opacity-30 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-t border-gray-400 border-opacity-20 dark:border-opacity-30 ${className}`}>
      {children}
    </div>
  );
}

// Default export for convenience
export default Card;