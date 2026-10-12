// Fraylon Admin - Phase 2
import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

export function AdminBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-[var(--text-muted)] mb-6">
      <Link to="/admin" className="hover:text-[var(--color-primary)] transition-colors flex items-center">
        <Home className="w-4 h-4" />
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
          {item.path ? (
            <Link to={item.path} className="hover:text-[var(--color-primary)] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--text-main)] font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
