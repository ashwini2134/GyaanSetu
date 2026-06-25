// Fraylon Admin - Phase 2
import { CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react";

export function PublishChecklist({ onClose, onPublish }: { onClose: () => void, onPublish: () => void }) {
  // Placeholder logic since the actual validation logic is on the backend
  const checks = [
    { label: "At least 1 lesson added", passed: true, required: true },
    { label: "At least 1 quiz created", passed: true, required: true },
    { label: "Capstone project defined", passed: false, required: true },
    { label: "Certificate template linked", passed: false, required: false },
  ];

  const allRequiredPassed = checks.filter(c => c.required).every(c => c.passed);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-semibold text-lg text-slate-900">Ready to Publish?</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {checks.map((check, i) => (
            <div key={i} className="flex items-start gap-3">
              {check.passed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : check.required ? (
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-medium ${check.passed ? 'text-slate-700' : 'text-slate-900'}`}>
                  {check.label}
                </p>
                {!check.required && !check.passed && (
                  <p className="text-xs text-slate-500 mt-0.5">Optional</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col gap-3">
          <button
            onClick={onPublish}
            disabled={!allRequiredPassed}
            className="w-full py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white"
          >
            Publish Course
          </button>
          {!allRequiredPassed && (
            <p className="text-xs text-center text-red-500 font-medium">Complete the checklist to publish</p>
          )}
        </div>
      </div>
    </div>
  );
}
