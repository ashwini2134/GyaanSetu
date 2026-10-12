// Fraylon Admin - Phase 2
import { NavLink } from "react-router-dom";

export function CourseEditorNav({ courseId }: { courseId: string }) {
  const tabs = [
    { label: "Blueprint", path: `/admin/content-studio/${courseId}/blueprint` },
    { label: "Lessons", path: `/admin/content-studio/${courseId}/lessons` },
    { label: "Exercises", path: `/admin/content-studio/${courseId}/exercise` },
    { label: "Quiz", path: `/admin/content-studio/${courseId}/quiz` },
    { label: "Project", path: `/admin/content-studio/${courseId}/project` },
    { label: "Publish", path: `/admin/content-studio/${courseId}/publish` },
    { label: "Versions", path: `/admin/content-studio/${courseId}/versions` },
    { label: "Beta", path: `/admin/content-studio/${courseId}/beta` },
  ];

  return (
    <div className="bg-[var(--bg-body)] border-b border-[var(--border-light)] sticky top-0 z-10 px-8 flex items-center gap-6">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `py-4 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--color-brand-navy)] hover:border-[var(--border-light)]"
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
