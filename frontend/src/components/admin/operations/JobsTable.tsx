import { JobStatusBadge, JobStatus } from "./JobStatusBadge";
import { RefreshCw } from "lucide-react";

export type JobType = "ai_review" | "quiz_grade" | "certificate";

export interface Job {
  id: string;
  type: JobType;
  studentName: string;
  studentEmail: string;
  courseName: string;
  status: JobStatus;
  createdAt: string;
  completedAt: string | null;
  // Extras
  score?: number | null;
  maxScore?: number | null;
  passed?: boolean;
  submissionStatus?: string;
  verificationId?: string;
}

interface JobsTableProps {
  jobs: Job[];
  onViewJob: (job: Job) => void;
  onRetryJob: (job: Job) => void;
  isRetrying: string | null;
}

const JobTypePill: React.FC<{ type: JobType }> = ({ type }) => {
  switch (type) {
    case "ai_review":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-[var(--color-primary)] text-[var(--bg-body)]">
          🤖 AI Review
        </span>
      );
    case "quiz_grade":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-[var(--color-primary)] text-[var(--bg-body)]">
          📝 Quiz Grade
        </span>
      );
    case "certificate":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-[var(--color-primary)] text-[var(--bg-body)]">
          🎓 Certificate
        </span>
      );
    default:
      return null;
  }
};

export const JobsTable: React.FC<JobsTableProps> = ({ jobs, onViewJob, onRetryJob, isRetrying }) => {
  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return "Never";
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="overflow-x-auto bg-[var(--bg-body)] rounded-lg border border-[var(--border-light)]">
      <table className="min-w-full text-left text-sm whitespace-nowrap text-[var(--text-main)]">
        <thead className="uppercase tracking-wider border-b border-[var(--border-light)] bg-[var(--bg-surface)] text-[var(--text-muted)]">
          <tr>
            <th scope="col" className="px-6 py-4 font-medium">Job Type</th>
            <th scope="col" className="px-6 py-4 font-medium">Student</th>
            <th scope="col" className="px-6 py-4 font-medium">Course</th>
            <th scope="col" className="px-6 py-4 font-medium">Status</th>
            <th scope="col" className="px-6 py-4 font-medium">Time</th>
            <th scope="col" className="px-6 py-4 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-light)]">
          {jobs.map((job) => (
            <tr key={job.id} className="hover:bg-[var(--bg-surface)] transition-colors">
              <td className="px-6 py-4">
                <JobTypePill type={job.type} />
              </td>
              <td className="px-6 py-4">
                <div className="font-medium text-[var(--text-main)] overflow-hidden text-ellipsis max-w-[150px]">
                  {job.studentName}
                </div>
                <div className="text-xs text-[var(--text-muted)] overflow-hidden text-ellipsis max-w-[150px]">
                  {job.studentEmail}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="overflow-hidden text-ellipsis max-w-[150px]" title={job.courseName}>
                  {job.courseName.length > 20 ? `${job.courseName.substring(0, 20)}...` : job.courseName}
                </div>
              </td>
              <td className="px-6 py-4">
                <JobStatusBadge status={job.status} />
              </td>
              <td className="px-6 py-4 text-[var(--text-secondary)]" title={new Date(job.createdAt).toLocaleString()}>
                {getTimeAgo(job.createdAt)}
              </td>
              <td className="px-6 py-4">
                {job.status === "completed" && (
                  <button
                    onClick={() => onViewJob(job)}
                    className="px-3 py-1 text-xs border border-[var(--border-light)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] bg-[var(--bg-body)] text-[var(--text-main)] hover:bg-[var(--bg-surface)] rounded transition-colors"
                  >
                    View
                  </button>
                )}
                {job.status === "pending" && (
                  <span className="text-[var(--text-muted)]">—</span>
                )}
                {job.status === "failed" && (
                  <button
                    onClick={() => onRetryJob(job)}
                    disabled={isRetrying === job.id}
                    className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={isRetrying === job.id ? "animate-spin" : ""} />
                    Retry
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
