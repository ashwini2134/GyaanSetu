import { useState, useRef } from 'react';
import { authFetch } from '../../authClient';
import { Loader2, CheckCircle, XCircle, Clock, Play, AlertTriangle, BookOpen, FileText, Eye, PenTool, HelpCircle, Code, Award, GraduationCap, ClipboardList, Database, Zap, Shield, Route } from 'lucide-react';

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

type PipelineId = 'course-structure' | 'learning-content' | 'code-editor' | 'code-execution' | 'practice-problems' | 'assessments' | 'projects' | 'capstone' | 'certificate' | 'portfolio' | 'database' | 'performance' | 'security' | 'student-journey';

const PIPELINE_LABELS: Record<PipelineId, string> = {
  'course-structure': 'Course Structure',
  'learning-content': 'Learning Content',
  'code-editor': 'Code Editor',
  'code-execution': 'Code Execution',
  'practice-problems': 'Practice Problems',
  'assessments': 'Assessments',
  'projects': 'Projects',
  'capstone': 'Capstone',
  'certificate': 'Certificate',
  'portfolio': 'Portfolio',
  'database': 'Database',
  'performance': 'Performance',
  'security': 'Security',
  'student-journey': 'Complete Student Journey',
};

const PIPELINE_ICONS: Record<PipelineId, React.ReactNode> = {
  'course-structure': <BookOpen size={16} />,
  'learning-content': <FileText size={16} />,
  'code-editor': <Code size={16} />,
  'code-execution': <Zap size={16} />,
  'practice-problems': <PenTool size={16} />,
  'assessments': <HelpCircle size={16} />,
  'projects': <Code size={16} />,
  'capstone': <Award size={16} />,
  'certificate': <GraduationCap size={16} />,
  'portfolio': <BookOpen size={16} />,
  'database': <Database size={16} />,
  'performance': <Zap size={16} />,
  'security': <Shield size={16} />,
  'student-journey': <Route size={16} />,
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

function PipelineRunner({ id, label, icon }: { id: PipelineId; label: string; icon: React.ReactNode }) {
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
      const data = await authFetch<TestResult>(`/admin/python-course-testing/simulate-${id}`, {
        method: 'POST',
        body: JSON.stringify({}),
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
    }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
          {label}
        </h3>
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
        </div>
      )}
    </div>
  );
}

function AcceptanceRunner() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [allPassed, setAllPassed] = useState<boolean | null>(null);
  const timerRef = useRef<number | null>(null);

  const run = async () => {
    setSteps([{ step: 'Starting full course acceptance test...', status: 'running', detail: '', timestamp: new Date().toISOString() }]);
    setRunning(true);
    setError(null);
    setAllPassed(null);
    const start = Date.now();
    timerRef.current = window.setInterval(() => setElapsed(Date.now() - start), 100);

    try {
      const data = await authFetch<TestResult>('/admin/python-course-testing/run-acceptance', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      setSteps(data.steps || []);
      if (data.error) setError(data.error);
      if (data.result?.allPassed !== undefined) setAllPassed(data.result.allPassed);
    } catch (err: any) {
      setSteps(prev => [...prev, { step: 'Request failed', status: 'failed', detail: err.message || 'Unknown error', timestamp: new Date().toISOString() }]);
      setError(err.message || 'Unknown error');
      setAllPassed(false);
    } finally {
      setRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  return (
    <div className="rounded-xl border-2 p-6 transition-all" style={{
      borderColor: allPassed === true ? 'var(--success)' : allPassed === false ? 'var(--danger)' : running ? 'var(--brand-primary)' : 'var(--border-medium)',
      background: allPassed === true ? 'color-mix(in srgb, var(--success) 8%, transparent)' : allPassed === false ? 'color-mix(in srgb, var(--danger) 8%, transparent)' : running ? 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' : 'var(--surface-card)',
    }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <ClipboardList size={18} style={{ color: 'var(--brand-primary)' }} />
            Run Complete Course Acceptance
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Executes all 14 pipelines sequentially and generates final report</p>
        </div>
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={running ? { background: 'var(--surface-card-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : { background: 'var(--button-primary-bg)', color: 'var(--button-primary-text)' }}
          >
            {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {running ? 'Running...' : 'Run Full Acceptance'}
          </button>
        </div>
      </div>

      {allPassed !== null && !running && (
        <div className="mb-4 p-3 rounded-lg border text-sm font-bold" style={{
          background: allPassed ? 'color-mix(in srgb, var(--success) 12%, transparent)' : 'color-mix(in srgb, var(--danger) 12%, transparent)',
          borderColor: allPassed ? 'color-mix(in srgb, var(--success) 25%, transparent)' : 'color-mix(in srgb, var(--danger) 25%, transparent)',
          color: allPassed ? 'var(--success)' : 'var(--danger)',
          borderWidth: 1
        }}>
          {allPassed ? '✓ PYTHON COURSE ACCEPTED — Every pipeline passed.' : '✗ PYTHON COURSE REJECTED — One or more pipelines failed.'}
        </div>
      )}

      {steps.length > 0 && (
        <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2.5 py-1.5 px-2 rounded-lg text-xs" style={{
              background: step.status === 'running' ? 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' : 'transparent',
              paddingLeft: step.step.startsWith('  ') ? '12px' : undefined,
              borderLeft: step.step.startsWith('  ') ? '2px solid var(--border-medium)' : undefined
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
                <span className="flex-shrink-0 font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>{step.duration}ms</span>
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
    </div>
  );
}

export default function PythonCourseTestCenter() {
  const singlePipelines: PipelineId[] = [
    'course-structure', 'learning-content', 'code-editor', 'code-execution',
    'practice-problems', 'assessments', 'projects', 'capstone',
    'certificate', 'portfolio', 'database', 'performance', 'security',
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6" style={{ background: 'var(--surface-page)', minHeight: '100%' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Python Course Testing Center</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Validate Python Course (14 lectures) end-to-end before production release. All tests execute real course data.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'color-mix(in srgb, var(--warning) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--warning) 30%, transparent)' }}>
          <AlertTriangle size={14} style={{ color: 'var(--warning)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--warning)' }}>Admin &mdash; Internal QA Tool</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Play size={18} style={{ color: 'var(--brand-primary)' }} />
          Individual Pipelines
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {singlePipelines.map(id => (
            <PipelineRunner key={id} id={id} label={PIPELINE_LABELS[id]} icon={PIPELINE_ICONS[id]} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Route size={18} style={{ color: 'var(--brand-primary)' }} />
          End-to-End Pipeline
        </h2>
        <div className="grid grid-cols-1 gap-4">
          <PipelineRunner id="student-journey" label={PIPELINE_LABELS['student-journey']} icon={PIPELINE_ICONS['student-journey']} />
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-medium)' }} className="my-2" />

      <AcceptanceRunner />

      <div className="rounded-xl p-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-medium)' }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <AlertTriangle size={14} />
          <span>This is an internal QA tool for administrators. Tests validate Python course data integrity, content completeness, and system readiness. Results are read-only and do not modify any data.</span>
        </div>
      </div>
    </div>
  );
}
