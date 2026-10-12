import React, { useEffect, useState } from "react";
import { RefreshCw, CheckCircle, Clock } from "lucide-react";
import { authFetch } from "../../../authClient";

interface BlockedStudent {
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  blockType: string;
  blockedReason: string;
  blockedSince: string;
}

export const BlockedStudentsView: React.FC = () => {
  const [blocked, setBlocked] = useState<BlockedStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Unblock Modal State
  const [unblockingStudent, setUnblockingStudent] = useState<BlockedStudent | null>(null);
  const [isUnblocking, setIsUnblocking] = useState(false);

  const fetchBlocked = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const res = await authFetch("/api/admin/students/blocked");
      if (res.ok) {
        const data = await res.json();
        setBlocked(data);
      }
    } catch (err) {
      console.error("Failed to fetch blocked students", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBlocked();
  }, []);

  const handleUnblock = async () => {
    if (!unblockingStudent) return;
    setIsUnblocking(true);
    try {
      const res = await authFetch("/api/admin/students/unblock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: unblockingStudent.studentId,
          courseId: unblockingStudent.courseId,
          blockType: unblockingStudent.blockType,
          reason: unblockingStudent.blockedReason,
          blockedAt: unblockingStudent.blockedSince
        })
      });

      if (res.ok) {
        // Remove from list
        setBlocked(prev => prev.filter(s => 
          !(s.studentId === unblockingStudent.studentId && s.courseId === unblockingStudent.courseId)
        ));
        
        // Dispatch custom event for toast if we want to show it globally
        window.dispatchEvent(new CustomEvent("show-toast", { 
          detail: { message: "Student unblocked successfully. They can now continue their course.", type: "success" } 
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUnblocking(false);
      setUnblockingStudent(null);
    }
  };

  const getRelativeTime = (dateStr: string) => {
    const diffHours = (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
    if (diffHours < 24) return <span className="text-yellow-500">{Math.floor(diffHours)} hours</span>;
    return <span className="text-red-500">{Math.floor(diffHours / 24)} days</span>;
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Blocked Students</h2>
          <p className="text-sm text-gray-400">Students stuck due to system errors — not human errors. Admin can manually unblock.</p>
        </div>
        <div className="flex items-center space-x-4">
          {blocked.length > 0 ? (
            <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-sm border border-red-500/20">
              {blocked.length} blocked
            </span>
          ) : (
            <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm border border-green-500/20">
              0 blocked
            </span>
          )}
          <button 
            onClick={() => fetchBlocked(true)}
            disabled={isRefreshing}
            className="p-2 text-gray-400 hover:text-white bg-[#1A1D27] border border-[#2D2D3D] rounded transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-[#1A1D27] border border-[#2D2D3D] rounded-lg p-8 flex justify-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : blocked.length === 0 ? (
        <div className="bg-[#1A1D27] border border-green-500/30 rounded-lg p-6 flex items-center space-x-4">
          <div className="p-3 bg-green-500/10 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">✅ No blocked students!</h3>
            <p className="text-gray-400">All students are progressing normally. The platform is running smoothly.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#1A1D27] rounded-lg border border-[#2D2D3D] border-l-4 border-l-red-500">
          <table className="min-w-full text-left text-sm whitespace-nowrap text-gray-300">
            <thead className="bg-[#1E2130] uppercase tracking-wider text-xs text-gray-500 font-semibold border-b border-[#2D2D3D]">
              <tr>
                <th className="px-6 py-4">STUDENT</th>
                <th className="px-6 py-4">COURSE</th>
                <th className="px-6 py-4">BLOCKED AT</th>
                <th className="px-6 py-4">REASON</th>
                <th className="px-6 py-4">STUCK FOR</th>
                <th className="px-6 py-4">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D2D3D]">
              {blocked.map((student) => (
                <tr key={`${student.studentId}-${student.courseId}`} className="hover:bg-[#1E2130] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{student.studentName}</div>
                    <div className="text-xs text-gray-500">{student.studentEmail}</div>
                  </td>
                  <td className="px-6 py-4">{student.courseName}</td>
                  <td className="px-6 py-4">{student.blockType}</td>
                  <td className="px-6 py-4 text-gray-400">{student.blockedReason}</td>
                  <td className="px-6 py-4 font-medium flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    {getRelativeTime(student.blockedSince)}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setUnblockingStudent(student)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                    >
                      Unblock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Unblock Modal */}
      {unblockingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[#1A1D27] rounded-lg border border-[#2D2D3D] w-full max-w-md shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Manually Unblock Student?</h3>
              
              <div className="space-y-2 mb-6 text-sm">
                <p><span className="text-gray-400">Student:</span> <span className="text-white">{unblockingStudent.studentName}</span></p>
                <p><span className="text-gray-400">Course:</span> <span className="text-white">{unblockingStudent.courseName}</span></p>
                <p><span className="text-gray-400">Issue:</span> <span className="text-red-400 font-medium">{unblockingStudent.blockedReason}</span></p>
              </div>

              <div className="bg-[#1E2130] p-4 rounded-lg mb-6 border border-[#2D2D3D]">
                <p className="text-sm font-semibold text-gray-300 mb-2">What will happen:</p>
                <ul className="text-sm text-gray-400 space-y-2 list-disc pl-5">
                  {unblockingStudent.blockType === "Project Submission" && (
                    <>
                      <li>Project will be marked as APPROVED</li>
                      <li>Score: 75 (default passing score)</li>
                    </>
                  )}
                  {unblockingStudent.blockType === "Certificate Generation" && (
                    <li>Certificate generation will be bypassed/completed</li>
                  )}
                  {unblockingStudent.blockType === "Lesson Unlock" && (
                    <li>Progress will be forcefully updated</li>
                  )}
                  <li>Student can continue to next section</li>
                  <li>This action is logged in audit trail</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => setUnblockingStudent(null)}
                  disabled={isUnblocking}
                  className="flex-1 py-2 bg-transparent border border-[#2D2D3D] hover:bg-[#1E2130] text-gray-300 rounded font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUnblock}
                  disabled={isUnblocking}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors flex justify-center items-center"
                >
                  {isUnblocking ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Confirm Unblock"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
