import React, { useEffect, useState } from "react";
import { X, ExternalLink } from "lucide-react";
import { Job } from "./JobsTable";
import { authFetch } from "../../../authClient";

interface JobDetailsDrawerProps {
  jobId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const JobDetailsDrawer: React.FC<JobDetailsDrawerProps> = ({ jobId, isOpen, onClose }) => {
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && jobId) {
      setLoading(true);
      authFetch(`/admin/jobs/${jobId}`)
        .then((data) => setJobDetails(data))
        .catch((err) => console.error("Failed to fetch job details:", err))
        .finally(() => setLoading(false));
    } else {
      setJobDetails(null);
    }
  }, [isOpen, jobId]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div 
        className={`fixed top-0 right-0 h-full w-[400px] bg-[#1A1D27] border-l border-[#2D2D3D] z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {jobDetails?.type === 'ai_review' && '🤖 AI Review Details'}
              {jobDetails?.type === 'quiz_grade' && '📝 Quiz Grade Details'}
              {jobDetails?.type === 'certificate' && '🎓 Certificate Details'}
              {!jobDetails && 'Loading...'}
            </h2>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-[#2D2D3D] rounded-md text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {loading ? (
            <div className="text-gray-400">Loading details...</div>
          ) : jobDetails ? (
            <div className="space-y-6 text-sm">
              
              <div className="bg-[#15171F] rounded-lg p-4 space-y-2 border border-[#2D2D3D]">
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <span className="text-gray-500">Student:</span>
                  <span className="text-white font-medium">{jobDetails.studentName}</span>
                  
                  <span className="text-gray-500">Course:</span>
                  <span className="text-white">{jobDetails.courseName}</span>
                  
                  <span className="text-gray-500">Time:</span>
                  <span className="text-white">{new Date(jobDetails.createdAt).toLocaleString()}</span>
                  
                  {jobDetails.type === "ai_review" && jobDetails.completedAt && (
                    <>
                      <span className="text-gray-500">Reviewed:</span>
                      <span className="text-white">{new Date(jobDetails.completedAt).toLocaleString()}</span>
                      
                      <span className="text-gray-500">Time taken:</span>
                      <span className="text-white">
                        {Math.max(1, Math.round((new Date(jobDetails.completedAt).getTime() - new Date(jobDetails.createdAt).getTime()) / 1000))} seconds
                      </span>
                    </>
                  )}
                </div>
              </div>

              {jobDetails.type === "ai_review" && (
                <>
                  <div className="space-y-2">
                    <h3 className="text-gray-400 uppercase text-xs font-bold tracking-wider">Result</h3>
                    <div className="bg-[#15171F] rounded-lg p-4 border border-[#2D2D3D] space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className="text-white font-medium">
                          {jobDetails.submissionStatus === "APPROVED" ? "✅ APPROVED" : jobDetails.submissionStatus === "REJECTED" ? "❌ REJECTED" : jobDetails.submissionStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Score:</span>
                        <span className="text-white font-medium">{jobDetails.score ?? 0}/{jobDetails.maxScore ?? 100}</span>
                      </div>
                    </div>
                  </div>

                  {jobDetails.feedback && (
                    <div className="space-y-2">
                      <h3 className="text-gray-400 uppercase text-xs font-bold tracking-wider">AI Feedback</h3>
                      <div className="bg-[#15171F] rounded-lg p-4 border border-[#2D2D3D] text-gray-300 italic">
                        "{jobDetails.feedback}"
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="text-gray-400 uppercase text-xs font-bold tracking-wider">Checks Passed</h3>
                    <div className="bg-[#15171F] rounded-lg p-4 border border-[#2D2D3D] space-y-2">
                      <div className="flex items-center gap-2">
                        {jobDetails.securityCheck ? "✅" : "❌"} Security Check
                      </div>
                      <div className="flex items-center gap-2">
                        {jobDetails.validationCheck ? "✅" : "❌"} Validation Check
                      </div>
                      <div className="flex items-center gap-2">
                        {jobDetails.aiReview ? "✅" : "❌"} AI Quality Review
                      </div>
                    </div>
                  </div>
                </>
              )}

              {jobDetails.type === "quiz_grade" && (
                <>
                  <div className="space-y-2">
                    <h3 className="text-gray-400 uppercase text-xs font-bold tracking-wider">Result</h3>
                    <div className="bg-[#15171F] rounded-lg p-4 border border-[#2D2D3D] space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Score:</span>
                        <span className="text-white font-medium">{jobDetails.score}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className="text-white font-medium">
                          {jobDetails.passed ? "✅ PASSED" : "❌ FAILED"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Attempt:</span>
                        <span className="text-white font-medium">{jobDetails.attemptNumber}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {jobDetails.type === "certificate" && (
                <>
                  <div className="space-y-2">
                    <h3 className="text-gray-400 uppercase text-xs font-bold tracking-wider">Certificate Data</h3>
                    <div className="bg-[#15171F] rounded-lg p-4 border border-[#2D2D3D] space-y-4">
                      <div>
                        <span className="block text-gray-500 text-xs mb-1">Certificate ID</span>
                        <span className="text-white font-mono">{jobDetails.verificationId}</span>
                      </div>
                      
                      {jobDetails.pdfUrl && (
                        <a 
                          href={jobDetails.pdfUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                        >
                          <ExternalLink size={16} />
                          Download Certificate PDF
                        </a>
                      )}
                    </div>
                  </div>
                </>
              )}

            </div>
          ) : (
            <div className="text-red-400">Failed to load details.</div>
          )}
        </div>
      </div>
    </>
  );
};
