import { useState, useRef } from 'react';
import { authFetch } from '../../authClient';
import { Loader2, CheckCircle, XCircle, Clock, Play, RefreshCw, AlertTriangle, Trash2 } from 'lucide-react';

type StepStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped' | 'info';

interface Step {
  step: string;
  status: StepStatus;
  detail: string;
  timestamp: string;
  duration?: number;
}

interface TestResult {
  pipeline: string;
  steps: Step[];
  result?: any;
  error?: string;
}

type PipelineId = 'quiz' | 'project' | 'capstone' | 'certificate' | 'notification' | 'journey' | 'cleanup';

const PIPELINE_LABELS: Record<PipelineId, string> = {
  quiz: 'Quiz Submission',
  project: 'Project Submission',
  capstone: 'Capstone Submission',
  certificate: 'Certificate Generation',
  notification: 'Notification Delivery',
  journey: 'Complete Student Journey',
  cleanup: 'Cleanup Test Data',
};

const StatusIcon = ({ status }: { status: StepStatus }) => {
  switch (status) {
    case 'running': return <Loader2 size={16} className="animate-spin" style={{ color: 'var(--brand-primary)' }} />;
    case 'success': return <CheckCircle size={16} style={{ color: 'var(--success)' }} />;
    case 'failed': return <XCircle size={16} style={{ color: 'var(--danger)' }} />;
    case 'skipped': return <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />;
    case 'info': return <Clock size={16} className="text-slate-400" />;
    default: return <Clock size={16} className="text-slate-500" />;
  }
};

function PipelineRunner({ id, label, extraBody }: { id: PipelineId; label: string; extraBody?: Record<string, string> }) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  const run = async () => {
    setSteps([{ step: `Starting ${label}...`, status: 'running', detail: '', timestamp: new Date().toISOString() }]);
    setRunning(true);
    setError(null);
    const start = Date.now();
    timerRef.current = window.setInterval(() => setElapsed(Date.now() - start), 100);

    try {
      const body = { ...(extraBody || {}) };
      const data = await authFetch<TestResult>(`/admin/testing/simulate-${id}`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setSteps(data.steps || []);
      if (data.error) setError(data.error);
    } catch (err: any) {
      setSteps(prev => [...prev, { step: 'Request failed', status: 'failed', detail: err.message || 'Unknown error', timestamp: new Date().toISOString() }]);
      setError(err.message || 'Unknown error');
    } finally {
      setRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const isSuccess = steps.length > 0 && steps.every(s => s.status === 'success' || s.status === 'info' || s.status === 'skipped');
  const isFailure = steps.some(s => s.status === 'failed');

  return (
    <div className="rounded-xl border p-5 transition-all" style={{
      borderColor: isSuccess ? 'var(--success)' : isFailure ? 'var(--danger)' : running ? 'var(--brand-primary)' : 'var(--border-medium)',
      background: isSuccess ? 'color-mix(in srgb, var(--success) 8%, transparent)' : isFailure ? 'color-mix(in srgb, var(--danger) 8%, transparent)' : running ? 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' : 'var(--surface-card)',
      opacity: running ? '1' : undefined
    }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{label}</h3>
        <div className="flex items-center gap-3">
          {elapsed > 0 && !running && (
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{(elapsed / 1000).toFixed(1)}s</span>
          )}
          {running && (
            <span className="text-xs font-mono animate-pulse" style={{ color: 'var(--brand-primary)' }}>{(elapsed / 1000).toFixed(1)}s</span>
          )}
          <button
            onClick={run}
            disabled={running}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={running ? { background: 'var(--surface-card-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : { background: 'var(--button-primary-bg)', color: 'var(--button-primary-text)' }}
          >
            {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {running ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      {steps.length > 0 && (
        <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2.5 py-1.5 px-2 rounded-lg text-xs" style={{
              background: step.status === 'running' ? 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' : 'transparent'
            }}>
              <span className="mt-0.5 flex-shrink-0"><StatusIcon status={step.status} /></span>
              <div className="flex-1 min-w-0">
                <span className="font-medium" style={{
                  color: step.status === 'success' ? 'var(--success)' :
                         step.status === 'failed' ? 'var(--danger)' :
                         step.status === 'running' ? 'var(--brand-primary)' :
                         step.status === 'skipped' ? 'var(--warning)' :
                         'var(--text-primary)'
                }}>{step.step}</span>
                {step.detail && <span className="ml-1" style={{ color: 'var(--text-secondary)' }}>— {step.detail}</span>}
              </div>
              {step.duration !== undefined && step.status !== 'running' && (
                <span className="flex-shrink-0 font-mono tabular-nums" style={{
                  color: step.duration > 500 ? 'var(--warning)' :
                         step.duration > 200 ? 'var(--warning)' :
                         'var(--text-muted)'
                }}>{step.duration}ms</span>
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-3 p-2 rounded-lg text-xs" style={{
          background: 'color-mix(in srgb, var(--danger) 12%, transparent)',
          borderColor: 'color-mix(in srgb, var(--danger) 25%, transparent)',
          color: 'var(--danger)',
          borderWidth: 1
        }}>
          {error}
        </div>
      )}

      {steps.length > 0 && !running && (
        <div className="mt-3 flex items-center gap-3 text-xs">
          {isSuccess ? (
            <span className="font-semibold" style={{ color: 'var(--success)' }}>✓ Pipeline passed</span>
          ) : isFailure ? (
            <span className="font-semibold" style={{ color: 'var(--danger)' }}>✗ Pipeline failed</span>
          ) : null}
          <span style={{ color: 'var(--text-secondary)' }}>{steps.filter(s => s.status === 'success' || s.status === 'skipped' || s.status === 'info').length}/{steps.length} steps passed</span>
          {(() => {
            const totalStep = steps.find(s => s.step === 'Total execution time');
            return totalStep?.duration ? (
              <span className="font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>Total: {totalStep.duration}ms</span>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
}

export default function TestCenter() {
  const [githubUrl, setGithubUrl] = useState('https://github.com/demo/student-project');
  const [capstoneUrl, setCapstoneUrl] = useState('https://github.com/demo/capstone-project');

  const singlePipelines: PipelineId[] = ['quiz', 'project', 'capstone', 'certificate', 'notification'];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6" style={{ background: 'var(--surface-page)', minHeight: '100%' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Development Test Center</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Verify every automation pipeline with a single click. All data uses your admin account (sandboxed).</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'color-mix(in srgb, var(--warning) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--warning) 30%, transparent)' }}>
          <AlertTriangle size={14} style={{ color: 'var(--warning)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--warning)' }}>Admin Only</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Demo GitHub URL (for project tests)</label>
          <input
            type="text"
            value={githubUrl}
            onChange={e => setGithubUrl(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Demo Capstone URL</label>
          <input
            type="text"
            value={capstoneUrl}
            onChange={e => setCapstoneUrl(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Play size={18} style={{ color: 'var(--brand-primary)' }} />
          Single Pipeline Tests
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {singlePipelines.map(id => (
            <PipelineRunner key={id} id={id} label={PIPELINE_LABELS[id]}
              extraBody={id === 'project' ? { githubUrl } : id === 'capstone' ? { githubUrl: capstoneUrl } : undefined}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <RefreshCw size={18} style={{ color: 'var(--brand-primary)' }} />
          End-to-End Tests
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PipelineRunner id="journey" label={PIPELINE_LABELS.journey} />
          <PipelineRunner id="cleanup" label={PIPELINE_LABELS.cleanup} />
        </div>
      </div>

      <div className="rounded-xl p-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-medium)' }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <Trash2 size={14} />
          <span>All test data is created under your admin user and can be cleaned up using the Cleanup Test Data pipeline above.</span>
        </div>
      </div>
    </div>
  );
}
