// Fraylon Admin - Phase 2
import { NavLink } from "react-router-dom";

export function CourseEditorNav({ courseId }: { courseId: string }) {
  const tabs = [
    { label: "Blueprint", path: `/admin/content-studio/${courseId}/blueprint` },
    { label: "Lessons", path: `/admin/content-studio/${courseId}/lessons` },
    { label: "Quiz", path: `/admin/content-studio/${courseId}/quiz` },
    { label: "Project", path: `/admin/content-studio/${courseId}/project` },
    { label: "Versions", path: `/admin/content-studio/${courseId}/versions` },
    { label: "Beta", path: `/admin/content-studio/${courseId}/beta` },
  ];

  return (
    <div className="bg-[#0f172a] border-b border-white/10 sticky top-0 z-10 px-8 flex items-center gap-6">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `py-4 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? "border-blue-600 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-100 hover:border-white/10"
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
