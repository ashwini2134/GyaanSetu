import { useState, useEffect } from "react";
import { Search, X, RotateCcw, Flame } from "lucide-react";
import type { Course } from "../api";

interface CourseSearchFiltersProps {
  courses: Course[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onFilteredCoursesChange: (filtered: Course[]) => void;
}

export function CourseSearchFilters({ courses, searchQuery, setSearchQuery, onFilteredCoursesChange }: CourseSearchFiltersProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches
  useEffect(() => {
    try {
      const stored = localStorage.getItem("fa_recent_searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Filter courses whenever search query or filters change
  useEffect(() => {
    let filtered = [...courses];

    // Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query)
      );
    }

    // Level Filter
    if (selectedLevel !== "All") {
      filtered = filtered.filter((c) => c.level === selectedLevel);
    }

    // Category Filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((c) => c.category === selectedCategory);
    }

    onFilteredCoursesChange(filtered);
  }, [searchQuery, selectedLevel, selectedCategory, courses, onFilteredCoursesChange]);

  const addRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const term = query.trim();
    let updated = [term, ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())];
    updated = updated.slice(0, 5); // Keep last 5 searches
    setRecentSearches(updated);
    localStorage.setItem("fa_recent_searches", JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("fa_recent_searches");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRecentSearch(searchQuery);
  };

  const handlePopularClick = (tag: string) => {
    setSearchQuery(tag);
    addRecentSearch(tag);
  };

  const handleRecentClick = (term: string) => {
    setSearchQuery(term);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedLevel("All");
    setSelectedCategory("All");
  };

  // Unique categories and levels from input courses
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];
  const categories = ["All", "Programming", "Computer Science", "Artificial Intelligence"];
  const popularSearches = ["Python", "AI", "Beginner", "Computer Science"];

  return (
    <div className="w-full bg-[#161B22] border border-[#2D3748] rounded-[12px] p-[20px] mb-6 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-4 h-4 text-white" />
        <h2 className="text-[14px] font-semibold text-white">Find Your Course</h2>
      </div>

      <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-5">
        <Search className="absolute left-4 w-5 h-5 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onBlur={() => searchQuery.trim() && addRecentSearch(searchQuery)}
          placeholder="Search courses by name or description..."
          className="w-full h-[48px] pl-12 pr-10 bg-[#161B22] border border-[#2D3748] focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] focus:outline-none rounded-[10px] text-sm text-white placeholder-slate-500 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-4 p-1 rounded-full text-slate-500 hover:bg-[#1F2937] hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Grid of Search Metadata and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        {/* Left: Popular searches */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-medium text-[12px]">
            Popular:
          </span>
          {popularSearches.map((tag) => {
            const isActive = searchQuery.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                type="button"
                onClick={() => handlePopularClick(tag)}
                className={`px-3 py-1 rounded-[20px] border text-[13px] font-medium transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#3B82F6] border-[#3B82F6] text-white'
                    : 'bg-[#1F2937] border-[#2D3748] text-slate-300 hover:border-[#3B82F6] hover:text-[#3B82F6]'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* Right: Level & Category Filters */}
        <div className="flex items-center gap-4">
          {/* Level Filter */}
          <div className="flex flex-col gap-1.5 min-w-[140px]">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Difficulty Level
            </label>
            <div className="relative">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full h-[40px] px-3 bg-[#161B22] border border-[#2D3748] rounded-[8px] text-xs text-slate-300 focus:outline-none focus:border-[#3B82F6] transition-all cursor-pointer appearance-none"
              >
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl} className="bg-[#161B22]">
                    {lvl === "All" ? "All Levels" : lvl}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Topic / Category
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-[40px] px-3 bg-[#161B22] border border-[#2D3748] rounded-[8px] text-xs text-slate-300 focus:outline-none focus:border-[#3B82F6] transition-all cursor-pointer appearance-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#161B22]">
                    {cat === "All" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Custom Empty Results Component ───────────────────────────────────────────
interface NoResultsStateProps {
  query: string;
  onSelectSuggestion: (tag: string) => void;
}

export function NoResultsState({ query, onSelectSuggestion }: NoResultsStateProps) {
  const suggestions = ["Python", "AI", "Beginner", "Computer Science"];
  return (
    <div className="text-center py-12 px-6 bg-[#0c101b]/30 border border-slate-800/50 rounded-3xl max-w-lg mx-auto">
      <div className="w-12 h-12 rounded-full bg-slate-800/40 flex items-center justify-center mx-auto mb-4 border border-slate-700/30">
        <Search className="w-6 h-6 text-slate-500 animate-pulse" />
      </div>
      <h3 className="text-base font-bold text-white mb-2">No courses found</h3>
      <p className="text-xs text-slate-400 mb-6 leading-relaxed">
        We couldn't find any courses matching <span className="text-blue-400 font-semibold">"{query}"</span>. 
        Try checking for spelling errors, clearing filters, or choosing one of our popular topics below:
      </p>
      <div className="flex flex-wrap justify-center gap-2.5">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSelectSuggestion(s)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
