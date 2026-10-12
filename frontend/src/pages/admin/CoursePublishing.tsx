// Fraylon Admin - Phase 2
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminBreadcrumb } from "../../components/admin/AdminBreadcrumb";
import { CourseEditorNav } from "../../components/admin/CourseEditorNav";
import { authFetch } from "../../authClient";

export default function CoursePublishing() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [checks, setChecks] = useState<any[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    async function verify() {
      try {
        const [lessons, quiz, project] = await Promise.all([
          authFetch<any[]>(`/admin/courses/${courseId}/lessons`).catch(() => []),
          authFetch<any>(`/admin/courses/${courseId}/quiz`).catch(() => null),
          authFetch<any>(`/admin/courses/${courseId}/project`).catch(() => null)
        ]);

        const hasLessons = Array.isArray(lessons) && lessons.length > 0;
        const hasQuiz = quiz && Array.isArray(quiz.questions) && quiz.questions.length > 0;
        const hasProject = project !== null && project.id !== undefined;

        setChecks([
          { label: "At least 1 lesson added", passed: hasLessons, required: true },
          { label: "At least 1 quiz created", passed: hasQuiz, required: true },
          { label: "Capstone project defined", passed: hasProject, required: true },
          { label: "Certificate template linked", passed: false, required: false },
        ]);
      } catch (err) {
        console.error("Failed to verify course:", err);
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [courseId]);

  const allRequiredPassed = checks.length > 0 && checks.filter(c => c.required).every(c => c.passed);

  const handlePublish = async () => {
    if (!courseId) return;
    setIsPublishing(true);
    try {
      await authFetch(`/admin/courses/${courseId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "PUBLISHED" })
      });
      alert("Course successfully published!");
      navigate("/admin/content-studio");
    } catch (err: any) {
      alert("Failed to publish course: " + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      <div className="p-8 pb-0 shrink-0">
        <AdminBreadcrumb items={[
          { label: "Content Studio", path: "/admin/content-studio" },
          { label: "Course Editor" }
        ]} />
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-main)]">Course Publishing</h1>
        </div>
      </div>

      <CourseEditorNav courseId={courseId || "draft"} />

      <div className="flex-1 overflow-y-auto p-8 bg-[var(--bg-body)] flex justify-center items-start">
        <div className="bg-[var(--bg-surface)] rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-[var(--border-light)] mt-8">
          <div className="flex items-center justify-between p-6 border-b border-[var(--border-light)] bg-[var(--bg-body)]">
            <div>
              <h3 className="font-bold text-xl text-[var(--text-main)] mb-1">Ready to Publish?</h3>
              <p className="text-sm text-[var(--text-secondary)]">Complete all required checklist items below to make this course live.</p>
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            {loading ? (
              <div className="text-center py-12 text-[var(--text-secondary)] flex flex-col items-center">
                <svg className="animate-spin h-8 w-8 text-[var(--color-primary)] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Checking course requirements...
              </div>
            ) : (
              checks.map((check, i) => (
                <div key={i} className={`flex items-start gap-4 p-4 rounded-lg border ${check.passed ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-[var(--bg-body)] border-[var(--border-light)]'}`}>
                  {check.passed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                  ) : check.required ? (
                    <XCircle className="w-6 h-6 text-[var(--text-muted)] shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-yellow-500/50 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`text-base font-medium ${check.passed ? 'text-emerald-100' : 'text-[var(--text-main)]'}`}>
                      {check.label}
                    </p>
                    {!check.required && !check.passed && (
                      <p className="text-sm text-[var(--text-muted)] mt-1">Optional requirement</p>
                    )}
                    {check.required && !check.passed && (
                      <p className="text-sm text-[var(--text-muted)] mt-1">Must be completed before publishing</p>
                    )}
                  </div>
                </div>
              ))
            )}

            {!loading && allRequiredPassed && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 mt-6 text-center">
                <p className="text-emerald-400 font-medium text-lg">Your course is ready to publish! 🎉</p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-[var(--border-light)] bg-[var(--bg-body)] flex flex-col gap-4">
            <button
              onClick={handlePublish}
              disabled={!allRequiredPassed || isPublishing}
              className="w-full py-4 rounded-lg font-bold text-lg shadow-lg transition-colors disabled:bg-[var(--bg-dark-surface)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed bg-[var(--color-brand-navy)] hover:bg-[var(--color-primary)] text-[var(--bg-body)]"
            >
              {isPublishing ? "Publishing..." : "Publish Course Now"}
            </button>
            {!allRequiredPassed && !loading && (
              <p className="text-sm text-center text-red-400 font-medium">Complete the required checklist items above to publish</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
