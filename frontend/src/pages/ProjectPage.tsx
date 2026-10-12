// @ts-nocheck
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Zap, Search } from 'lucide-react';
import { getCompletedProjects, getProjectMetadata } from "../api";
import { ProjectCard } from "../components";
import { COURSE_FULL_NAMES } from "../data/courseNames";

interface Project {
  id: string;
  title: string;
  description: string;
  difficulty?: string;
}

export default function ProjectPage() {
  const { slug, number } = useParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [completedProjects, setCompletedProjects] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    setCompletedProjects(getCompletedProjects());

    async function loadProjects() {
      try {
        const base = import.meta.env.BASE_URL;
        const response = await fetch(
          `${base}data/${slug}/lecture_${number}/problems.json`
        );
        const data = await response.json();
        const filtered = data.filter((item: any) => item.id !== "quiz");
        setProjects(filtered);
      } catch (error) {
        console.error(error);
      }
    }
    loadProjects();
  }, [slug, number]);

  const courseTitle = slug ? (COURSE_FULL_NAMES[slug] ?? slug.toUpperCase()) : undefined;

  // Helper to determine project status
  const getProjectStatus = (projectId: string) => {
    const isCompleted = completedProjects[`${slug}/${projectId}`];
    if (isCompleted) return "completed";
    
    const draft = localStorage.getItem(`fa_code_${projectId}`);
    const cleanDraft = draft ? draft.split("\n").map(l => l.replace(/#.*$/, "")).join("").trim() : "";
    const isInProgress = cleanDraft.length > 0 && cleanDraft !== "def main():" && cleanDraft !== "pass";
    
    return isInProgress ? "in_progress" : "not_started";
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const meta = getProjectMetadata(project.id, project.difficulty);
    const status = getProjectStatus(project.id);

    // 1. Search Query Match
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meta.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Difficulty Filter Match
    const matchesDifficulty =
      difficultyFilter === "All" || meta.difficulty === difficultyFilter;

    // 3. Status Filter Match
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Completed" && status === "completed") ||
      (statusFilter === "In Progress" && status === "in_progress") ||
      (statusFilter === "Not Started" && status === "not_started");

    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  const totalCount = projects.length;
  const completedCount = projects.filter(p => completedProjects[`${slug}/${p.id}`]).length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col">
      {/* Header and Breadcrumbs */}
      <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800/40 px-6 py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          <nav className="flex mb-4 text-xs font-semibold text-slate-450 items-center gap-1.5">
            <Link to="/" className="hover:text-blue-400 transition-colors">Dashboard</Link>
            <span>/</span>
            <Link to={`/course/${slug}`} className="hover:text-blue-400 transition-colors">{courseTitle}</Link>
            <span>/</span>
            <Link to={`/course/${slug}/lecture/${number}`} className="hover:text-blue-400 transition-colors">Lecture {number}</Link>
            <span>/</span>
            <span className="text-slate-200">Projects</span>
          </nav>
          
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Lecture {number} Coding Projects
          </h1>
          <p className="text-slate-400 text-xs mt-2 max-w-xl">
            Complete the following coding assignments using the embedded code editor. Double-check your requirements with the autograder.
          </p>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Progress & Stats Cards */}
        {totalCount > 0 && (
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap size={20} className="text-yellow-400" /> Coding Assignment Progress
              </h2>
              <p className="text-slate-400 text-xs">
                Solve all problems in this week to earn {totalCount * 100} maximum XP points.
              </p>
            </div>
            
            <div className="flex-1 max-w-md space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Solved Status</span>
                <span className="text-slate-200">{completedCount} of {totalCount} completed ({percent}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-850 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-550"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/40 p-4 border border-slate-800/60 rounded-2xl">
          <div className="relative w-full md:flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by title, description or tags..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-100 placeholder-slate-500"
            />
          </div>

          <div className="flex w-full md:w-auto items-center gap-3.5">
            {/* Difficulty Filter */}
            <div className="flex-1 md:flex-none">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-350 focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex-1 md:flex-none">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-350 focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Not Started">Not Started</option>
              </select>
            </div>
          </div>
        </div>

        {/* Empty State / Cards Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/20 border border-slate-850 rounded-2xl space-y-3">
            <Search size={48} className="text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No projects match filters</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              Try adjusting your search query, difficulty filters, or progress status filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const meta = getProjectMetadata(project.id, project.difficulty);
              const status = getProjectStatus(project.id);
              
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  courseSlug={slug || ""}
                  lectureNumber={number || ""}
                  metadata={meta}
                  status={status}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
