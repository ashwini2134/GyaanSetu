import { useState, useEffect, useCallback, useRef } from 'react';
import { authFetch } from '../authClient';

export interface ProjectSubmission {
  id: string;
  status: 'NOT_SUBMITTED' | 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'ERROR' | 'CANCELLED';
  score: number | null;
  feedback: string | null;
  reviewSteps: Array<{ step: string; passed: boolean; detail: string }> | null;
  githubUrl?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useProjectStatus(projectId: string) {
  const [submission, setSubmission] = useState<ProjectSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!projectId || projectId === 'none') return null;
    try {
      const data = await authFetch(`/student/projects/${projectId}/submission`);
      // API returns { status: 'NOT_SUBMITTED' } if no submission exists
      if (data && data.status) {
        setSubmission(data as ProjectSubmission);
        return data as ProjectSubmission;
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch status');
      return null;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchStatus();
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [fetchStatus]);

  useEffect(() => {
    const isPolling = submission?.status === 'PENDING' || submission?.status === 'REVIEWING';
    
    if (isPolling && !pollRef.current) {
      pollRef.current = setInterval(async () => {
        const updated = await fetchStatus();
        if (updated && updated.status !== 'PENDING' && updated.status !== 'REVIEWING') {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
      }, 5000);
    }
    
    if (!isPolling && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, [submission?.status, fetchStatus]);

  const submitProject = async (githubUrl: string, content: string) => {
    setError(null);
    try {
      const data = await authFetch<{ submissionId: string }>(`/student/projects/${projectId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ githubUrl, content })
      });
      
      setSubmission(prev => ({ 
        ...(prev || {} as ProjectSubmission), 
        status: 'PENDING', 
        id: data.submissionId 
                      }));
    } catch (err: any) {
      setError(err.message || 'Submission failed');
      throw err;
    }
  };

  const cancelSubmission = async () => {
    setError(null);
    try {
      await authFetch<{ message: string }>(`/student/projects/${projectId}/cancel`, { method: 'POST' });
      setSubmission(prev => prev ? { ...prev, status: 'CANCELLED' as const } : null);
    } catch (err: any) {
      setError(err.message || 'Cancel failed');
      throw err;
    }
  };

  return { submission, loading, error, submitProject, cancelSubmission, refetch: fetchStatus };
}
