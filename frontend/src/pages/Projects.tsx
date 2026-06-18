import { useState } from "react";
import { FolderKanban } from "lucide-react";
import { Link } from "react-router-dom";
import { projectsData } from "../data/projectsData";

const CATEGORIES = [
  "Beginner Level",
  "Intermediate Level",
  "Advanced Level",
  "AI/ML Projects",
  "Industry Projects",
  "Capstone Projects"
] as const;

type Category = typeof CATEGORIES[number];

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState<Category>("Beginner Level");

  const filteredProjects = projectsData.filter(p => p.category === activeCategory);

  return (
    <div className="w-full min-h-full p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FolderKanban size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Projects</h1>
            <p className="text-sm text-slate-400">Build real-world applications to master your skills</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col lg:flex-row gap-6 items-start">
          {/* Sidebar / Tabs */}
          <div className="w-full lg:w-64 flex-shrink-0 flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide border-b lg:border-b-0 border-slate-700/50">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex-shrink-0 lg:w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                  activeCategory === category
                    ? "bg-blue-600/15 text-blue-300 border-blue-500/30 shadow-sm"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-transparent hover:border-slate-700/50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Project Grid */}
          <div className="flex-1 w-full grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-5 hover:border-blue-500/30 hover:bg-slate-800/60 hover:shadow-[0_0_24px_rgba(59,130,246,0.06)] transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    {/* Badge */}
                    <span className="inline-flex items-center justify-center whitespace-nowrap overflow-hidden text-ellipsis px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400 leading-none">
                      {project.difficulty}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors mb-1.5">
                    {project.title}
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    {project.shortDescription}
                  </p>
                </div>

                <Link
                  to={`/projects/${project.id}`}
                  className="w-full flex items-center justify-center py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-all border border-slate-700/50 group-hover:border-slate-600"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
