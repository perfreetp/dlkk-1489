import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; path?: string }[];
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, breadcrumb, action }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-dark-400 mb-3">
          {breadcrumb.map((item, index) => (
            <span key={index} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="w-4 h-4" />}
              <span className={item.path ? "hover:text-primary-400 cursor-pointer transition-colors" : "text-dark-200"}>
                {item.label}
              </span>
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && (
            <p className="text-dark-300 mt-1">{subtitle}</p>
          )}
        </div>
        {action && (
          <div className="flex items-center gap-3">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
