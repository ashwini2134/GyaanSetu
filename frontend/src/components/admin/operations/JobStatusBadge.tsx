import React from "react";

export type JobStatus = "completed" | "pending" | "failed";

interface JobStatusBadgeProps {
  status: JobStatus;
}

export const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({ status }) => {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
        ✅ Completed
      </span>
    );
  }
  
  if (status === "pending") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
        ⏳ Pending
      </span>
    );
  }
  
  if (status === "failed") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
        ❌ Failed
      </span>
    );
  }

  return null;
};
