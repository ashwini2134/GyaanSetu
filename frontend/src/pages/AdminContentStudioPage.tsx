import { BookOpen, FileCheck, BarChart3, Award, FolderKanban, Brain, Puzzle, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const SECTIONS = [
  {
    title: "Course Library",
    desc: "Manage courses, view enrollment, track student progress per course",
    icon: BookOpen,
    href: "/admin/courses",
    color: "text-blue-400",
    border: "border-blue-500/20",
    bg: "bg-blue-500/10",
  },
  {
    title: "Content",
    desc: "Edit course lectures, lesson content, problems, and quizzes",
    icon: FileCheck,
    href: "/admin/content",
    color: "text-emerald-400",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Practice Exercises",
    desc: "Create and manage coding practice exercises per course",
    icon: Puzzle,
    href: "/admin/practice-exercises",
    color: "text-violet-400",
    border: "border-violet-500/20",
    bg: "bg-violet-500/10",
  },
  {
    title: "Assessments",
    desc: "View assessment submissions, scores, and attempt history",
    icon: BarChart3,
    href: "/admin/assessments",
    color: "text-amber-400",
    border: "border-amber-500/20",
    bg: "bg-amber-500/10",
  },
  {
    title: "Projects",
    desc: "Browse project templates and view student project submissions",
    icon: FolderKanban,
    href: "/admin/projects",
    color: "text-rose-400",
    border: "border-rose-500/20",
    bg: "bg-rose-500/10",
  },
  {
    title: "Certifications",
    desc: "Manage certificate templates, view issued certs, track eligibility",
    icon: Award,
    href: "/admin/certifications",
    color: "text-purple-400",
    border: "border-purple-500/20",
    bg: "bg-purple-500/10",
  },
];

export default function AdminContentStudioPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100">
      <div className="relative overflow-hidden border-b border-slate-800">
        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <BookOpen size={28} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Content Studio</h1>
              <p className="text-slate-400 text-sm mt-1">Create and manage all learning content — courses, lectures, exercises, assessments, projects, and certifications.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.title}
                to={s.href}
                className={`group rounded-xl border ${s.border} ${s.bg} p-5 hover:scale-[1.02] transition-all duration-200`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${s.bg} ${s.border}`}>
                    <Icon size={20} className={s.color} />
                  </div>
                  <ArrowUpRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-slate-200 mt-4">{s.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.desc}</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 rounded-xl border border-slate-700/50 bg-slate-900/40 p-6">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Brain size={16} className="text-blue-400" />
            Coming in Content Studio v2
          </h2>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
            <div className="space-y-1">
              <p className="text-slate-300 font-medium">Blueprint Library</p>
              <p>Reusable course templates for quick course creation (Python, AI, Blank)</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-300 font-medium">Block-Based Editor</p>
              <p>Visual lecture builder with drag-and-drop content blocks</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-300 font-medium">Publishing Workflow</p>
              <p>Draft → Beta → Published → Archived lifecycle with QA readiness checks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
