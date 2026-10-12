import React, { useEffect, useState } from "react";
import { RefreshCw, Search, Flag, CheckCircle, XCircle, ChevronRight, X, AlertTriangle } from "lucide-react";
import { authFetch } from "../../../authClient";

interface AIReview {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  score: number | null;
  status: string;
  createdAt: string;
  isOverridden: boolean;
  overrideReason: string | null;
  isFlagged: boolean;
  user?: { name: string; email: string };
  project?: { title: string };
  aiReview?: any;
  securityCheck?: any;
  validationCheck?: any;
  content?: string;
  feedback?: string;
}

export const AiReviewLogsView: React.FC = () => {
  const [reviews, setReviews] = useState<AIReview[]>([]);
  const [stats, setStats] = useState({ totalToday: 0, passRateToday: 0, totalOverrides: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Drawer
  const [selectedReview, setSelectedReview] = useState<AIReview | null>(null);
  
  // Override Modal
  const [overrideReview, setOverrideReview] = useState<AIReview | null>(null);
  const [overrideScore, setOverrideScore] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [isOverriding, setIsOverriding] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch(`/api/admin/ai-reviews?status=${filter}&search=${search}&page=${page}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setTotalPages(data.totalPages);
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filter, search, page]);

  const fetchDetail = async (id: string) => {
    try {
      const res = await authFetch(`/api/admin/ai-reviews/${id}`);
      if (res.ok) {
        setSelectedReview(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFlag = async (id: string) => {
    try {
      const res = await authFetch(`/api/admin/ai-reviews/${id}/flag`, { method: "POST" });
      if (res.ok) {
        const { isFlagged } = await res.json();
        setReviews(prev => prev.map(r => r.id === id ? { ...r, isFlagged } : r));
        window.dispatchEvent(new CustomEvent("show-toast", { 
          detail: { message: isFlagged ? "Review flagged for quality review" : "Flag removed", type: "success" } 
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitOverride = async () => {
    if (!overrideReview || !overrideScore || !overrideReason) return;
    setIsOverriding(true);
    try {
      const res = await authFetch(`/api/admin/ai-reviews/${overrideReview.id}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrideScore, reason: overrideReason })
      });

      if (res.ok) {
        window.dispatchEvent(new CustomEvent("show-toast", { 
          detail: { message: "Review overridden. Student notified.", type: "success" } 
        }));
        setOverrideReview(null);
        setOverrideScore("");
        setOverrideReason("");
        // Reload list and drawer if open
        fetchLogs();
        if (selectedReview?.id === overrideReview.id) fetchDetail(selectedReview.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsOverriding(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const renderChecks = (review: AIReview) => {
    const secPassed = review.securityCheck?.passed;
    const valPassed = review.validationCheck?.passed;
    // For AI review, if it's rejected and not overridden, AI check failed.
    const aiPassed = review.status === "APPROVED" || review.isOverridden;
    
    return (
      <div className="flex space-x-1">
        {secPassed ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
        {valPassed ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
        {aiPassed ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
      </div>
    );
  };

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">AI Review Logs</h2>
          <p className="text-sm text-gray-400">Every AI project review — spot-check accuracy and override if needed</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400 font-medium">
            {stats.totalToday} reviews today &middot; {stats.passRateToday}% pass rate
          </span>
          <button onClick={fetchLogs} className="p-2 text-gray-400 hover:text-white bg-[#1A1D27] border border-[#2D2D3D] rounded transition-colors">
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="flex space-x-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by student or course..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1A1D27] border border-[#2D2D3D] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-[#1A1D27] border border-[#2D2D3D] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
          <option value="needs_review">Needs Review</option>
          <option value="overridden">Overridden</option>
        </select>
      </div>

      <div className="overflow-x-auto bg-[#1A1D27] rounded-lg border border-[#2D2D3D]">
        <table className="min-w-full text-left text-sm whitespace-nowrap text-gray-300">
          <thead className="bg-[#1E2130] uppercase tracking-wider text-xs text-gray-500 font-semibold border-b border-[#2D2D3D]">
            <tr>
              <th className="px-6 py-4 w-12"></th>
              <th className="px-6 py-4">STUDENT</th>
              <th className="px-6 py-4">COURSE</th>
              <th className="px-6 py-4">SCORE</th>
              <th className="px-6 py-4">RESULT</th>
              <th className="px-6 py-4">CHECKS</th>
              <th className="px-6 py-4">REVIEWED</th>
              <th className="px-6 py-4">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2D2D3D]">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">No reviews found matching criteria</td>
              </tr>
            ) : reviews.map((review) => (
              <tr key={review.id} className="hover:bg-[#1E2130] transition-colors">
                <td className="px-6 py-4">
                  <button onClick={() => handleFlag(review.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                    <Flag className={`w-4 h-4 ${review.isFlagged ? "text-red-500 fill-red-500" : ""}`} />
                  </button>
                </td>
                <td className="px-6 py-4 font-medium text-white">{review.user?.name || "Unknown"}</td>
                <td className="px-6 py-4">{review.courseName}</td>
                <td className="px-6 py-4">
                  {review.isOverridden ? (
                    <div className="flex flex-col">
                      <span className="line-through text-gray-500 text-xs">{review.aiReview?.originalScore || 0}/100</span>
                      <span className="text-white">{review.score}/100</span>
                    </div>
                  ) : (
                    <span>{review.score}/100</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {review.isOverridden ? (
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs border border-purple-500/20">OVERRIDE</span>
                  ) : review.status === "APPROVED" ? (
                    <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded-full text-xs border border-green-500/20">APPROVED</span>
                  ) : review.status === "NEEDS_REVIEW" ? (
                    <span className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs border border-amber-500/20">NEEDS REVIEW</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded-full text-xs border border-red-500/20">REJECTED</span>
                  )}
                </td>
                <td className="px-6 py-4">{renderChecks(review)}</td>
                <td className="px-6 py-4 text-gray-500" title={new Date(review.createdAt).toLocaleString()}>
                  {getTimeAgo(review.createdAt)}
                </td>
                <td className="px-6 py-4 flex items-center space-x-3">
                  <button 
                    onClick={() => fetchDetail(review.id)}
                    className="text-gray-400 hover:text-white transition-colors text-xs font-medium"
                  >
                    View
                  </button>
                  {(review.status === "REJECTED" || review.status === "NEEDS_REVIEW") && !review.isOverridden && (
                    <button
                      onClick={() => setOverrideReview(review)}
                      className="text-purple-400 hover:text-purple-300 transition-colors text-xs font-medium"
                    >
                      Override
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <div className="text-gray-500">
          Showing page {page} of {totalPages}
        </div>
        <div className="flex space-x-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 bg-[#1A1D27] border border-[#2D2D3D] rounded text-gray-400 disabled:opacity-50 hover:bg-[#1E2130]"
          >
            Previous
          </button>
          <button 
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 bg-[#1A1D27] border border-[#2D2D3D] rounded text-gray-400 disabled:opacity-50 hover:bg-[#1E2130]"
          >
            Next
          </button>
        </div>
      </div>

      {/* Review Drawer */}
      {selectedReview && (
        <div className="fixed inset-0 z-40 bg-black/50 flex justify-end">
          <div className="w-full max-w-lg bg-[#1A1D27] h-full shadow-2xl flex flex-col border-l border-[#2D2D3D] animate-in slide-in-from-right">
            <div className="p-6 border-b border-[#2D2D3D] flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-white flex items-center">
                <span className="mr-2">🤖</span> AI Review Details
              </h2>
              <button onClick={() => setSelectedReview(null)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              <section>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-[#2D2D3D] pb-2">SUBMISSION INFO</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-gray-400">Student</div><div className="text-white font-medium">{selectedReview.user?.name}</div>
                  <div className="text-gray-400">Course</div><div className="text-white font-medium">{selectedReview.courseName}</div>
                  <div className="text-gray-400">Project</div><div className="text-white font-medium">{selectedReview.projectName}</div>
                  <div className="text-gray-400">Submitted</div><div className="text-white font-medium">{new Date(selectedReview.createdAt).toLocaleString()}</div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-[#2D2D3D] pb-2">STUDENT SUBMISSION</h3>
                <div className="bg-[#12141C] border border-[#2D2D3D] rounded p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto max-h-48">
                  {selectedReview.content || selectedReview.githubUrl || "No content"}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-[#2D2D3D] pb-2">CHECK RESULTS</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    {selectedReview.securityCheck?.passed ? <CheckCircle className="w-5 h-5 text-green-500 mr-2 shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 mr-2 shrink-0" />}
                    <div>
                      <div className="font-medium text-white">Security Check &mdash; {selectedReview.securityCheck?.passed ? "Passed" : "Failed"}</div>
                      <div className="text-gray-400 text-xs mt-1">{selectedReview.securityCheck?.details || "No details"}</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    {selectedReview.validationCheck?.passed ? <CheckCircle className="w-5 h-5 text-green-500 mr-2 shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 mr-2 shrink-0" />}
                    <div>
                      <div className="font-medium text-white">Validation Check &mdash; {selectedReview.validationCheck?.passed ? "Passed" : "Failed"}</div>
                      <div className="text-gray-400 text-xs mt-1">{selectedReview.validationCheck?.details || "No details"}</div>
                    </div>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-[#2D2D3D] pb-2">AI FEEDBACK</h3>
                <div className="text-sm text-gray-300 italic bg-[#1E2130] p-4 rounded border-l-4 border-blue-500">
                  "{selectedReview.feedback}"
                </div>
              </section>

              {selectedReview.aiReview?.criteriaScores && (
                <section>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-[#2D2D3D] pb-2">CRITERIA SCORES</h3>
                  <div className="space-y-3 text-sm">
                    {Object.entries(selectedReview.aiReview.criteriaScores).map(([key, data]: any) => (
                      <div key={key}>
                        <div className="flex justify-between text-gray-400 mb-1">
                          <span>{key}</span>
                          <span className="text-white">{data.score}/{data.max}</span>
                        </div>
                        <div className="w-full bg-[#12141C] rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(data.score / data.max) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-[#2D2D3D] pb-2">FINAL RESULT</h3>
                <div className="text-xl font-bold flex items-center space-x-2">
                  {selectedReview.isOverridden ? (
                    <>
                      <span className="text-purple-400">OVERRIDE TO APPROVED</span>
                    </>
                  ) : selectedReview.status === "APPROVED" ? (
                    <>
                      <CheckCircle className="text-green-500 w-6 h-6" />
                      <span className="text-green-500">APPROVED</span>
                    </>
                  ) : selectedReview.status === "NEEDS_REVIEW" ? (
                    <>
                      <Flag className="text-amber-400 w-6 h-6" />
                      <span className="text-amber-400">NEEDS REVIEW</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-500 w-6 h-6" />
                      <span className="text-red-500">REJECTED</span>
                    </>
                  )}
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-[#2D2D3D] flex space-x-3 bg-[#1A1D27] shrink-0">
              <button
                onClick={() => { handleFlag(selectedReview.id); setSelectedReview(null); }}
                className="flex-1 py-2 bg-[#1E2130] hover:bg-[#2D2D3D] text-gray-300 rounded font-medium transition-colors"
              >
                Flag as Inaccurate
              </button>
              {(selectedReview.status === "REJECTED" || selectedReview.status === "NEEDS_REVIEW") && !selectedReview.isOverridden && (
                <button 
                  onClick={() => setOverrideReview(selectedReview)}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors"
                >
                  Override to Approve
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Override Modal */}
      {overrideReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[#1A1D27] rounded-lg border border-[#2D2D3D] w-full max-w-md shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Override AI Decision?</h3>
              
              <div className="space-y-2 mb-6 text-sm">
                <p><span className="text-gray-400">Student:</span> <span className="text-white">{overrideReview.user?.name}</span></p>
                <p><span className="text-gray-400">AI Score:</span> <span className="text-red-400 font-medium">{overrideReview.score}/100 &mdash; REJECTED</span></p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Override Score (/100)</label>
                  <input 
                    type="number"
                    value={overrideScore}
                    onChange={e => setOverrideScore(e.target.value)}
                    className="w-full bg-[#12141C] border border-[#2D2D3D] rounded p-2 text-white"
                    placeholder="75"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Reason for override (required)</label>
                  <textarea 
                    value={overrideReason}
                    onChange={e => setOverrideReason(e.target.value)}
                    className="w-full bg-[#12141C] border border-[#2D2D3D] rounded p-2 text-white"
                    placeholder="e.g. AI misunderstood the context..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="bg-[#1E2130] p-4 rounded-lg mb-6 border border-[#2D2D3D]">
                <p className="text-sm font-semibold text-yellow-500 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" /> This will:
                </p>
                <ul className="text-sm text-gray-400 space-y-1 list-disc pl-5">
                  <li>Change project status to APPROVED</li>
                  <li>Notify student their project was approved</li>
                  <li>Log this override in the audit trail</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => { setOverrideReview(null); setOverrideScore(""); setOverrideReason(""); }}
                  disabled={isOverriding}
                  className="flex-1 py-2 bg-transparent border border-[#2D2D3D] hover:bg-[#1E2130] text-gray-300 rounded font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitOverride}
                  disabled={isOverriding || !overrideScore || !overrideReason}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded font-medium transition-colors flex justify-center items-center"
                >
                  {isOverriding ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Confirm Override"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
