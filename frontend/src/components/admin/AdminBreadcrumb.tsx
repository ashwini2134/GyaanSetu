// Fraylon Admin - Phase 2
import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

export function AdminBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-400 mb-6">
      <Link to="/admin" className="hover:text-blue-400 transition-colors flex items-center">
        <Home className="w-4 h-4" />
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-slate-400" />
          {item.path ? (
            <Link to={item.path} className="hover:text-blue-400 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-100 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
