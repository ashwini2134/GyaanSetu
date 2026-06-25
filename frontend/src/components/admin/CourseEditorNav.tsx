// Fraylon Admin - Phase 2
import { NavLink } from "react-router-dom";

export function CourseEditorNav({ courseId }: { courseId: string }) {
  const tabs = [
    { label: "Lessons", path: `/admin/content-studio/${courseId}/lessons` },
    { label: "Quiz", path: `/admin/content-studio/${courseId}/quiz` },
    { label: "Project", path: `/admin/content-studio/${courseId}/project` },
    { label: "Versions", path: `/admin/content-studio/${courseId}/versions` },
    { label: "Beta", path: `/admin/content-studio/${courseId}/beta` },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center gap-6">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `py-4 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
