import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className="ml-64 min-h-screen transition-all duration-300">
      <main className={`p-6 ${className}`}>
        {children}
      </main>
    </div>
  );
}
