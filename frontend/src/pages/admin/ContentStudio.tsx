// Fraylon Admin - Phase 1
export default function ContentStudio() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Content Studio</h1>
        <p className="text-slate-500 mt-1">Create and manage your courses</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">No courses yet</h3>
        <p className="text-slate-500 text-center max-w-sm mb-6">
          Start building your first interactive learning experience with Fraylon Studio.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm">
          Create Your First Course
        </button>
      </div>
    </div>
  );
}
