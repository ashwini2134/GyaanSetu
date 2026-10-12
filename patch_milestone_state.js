import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'frontend/src/pages/MilestonePage.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace imports
content = content.replace(
  "import { useAuth } from '../auth';",
  "import { useAuth } from '../auth';\nimport { useProjectStatus } from '../hooks/useProjectStatus';"
);

// Replace state
const oldStateBlock = `  const [completedProjectId, setCompletedProjectId] = useState<string | null>(null);
  const [lastLectureNumber, setLastLectureNumber] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);`;

const newStateBlock = `  const navigate = useNavigate();
  const degreesStatus = useProjectStatus('fundamentals-of-ai-degrees');
  const tictactoeStatus = useProjectStatus('fundamentals-of-ai-tictactoe');
  const [githubUrl, setGithubUrl] = useState('');

  const bothCompleted = 
    (degreesStatus.submission?.status === 'APPROVED' || degreesStatus.submission?.status === 'PENDING') && 
    (tictactoeStatus.submission?.status === 'APPROVED' || tictactoeStatus.submission?.status === 'PENDING');

  const activeStatus = selected?.id === 'fundamentals-of-ai-degrees' ? degreesStatus : tictactoeStatus;
  const isSubmitted = activeStatus.submission && activeStatus.submission.status !== 'NOT_SUBMITTED';
  const isSubmitting = activeStatus.loading;
  const submitError = activeStatus.error;`;

content = content.replace(oldStateBlock, newStateBlock);

// Replace handleSubmitProject
const oldSubmitBlock = `  const handleSubmitProject = async () => {
    if (!selected || !githubUrl || submitted) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await authFetch('/projects/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug: slug, lectureId: String(lastLectureNumber), projectId: selected.id, githubUrl })
      });
      setSubmitted(true);
      setCompletedProjectId(selected.id);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit project');
    } finally {
      setSubmitting(false);
    }
  };`;

const newSubmitBlock = `  const handleSubmitProject = async () => {
    if (!selected || !githubUrl || isSubmitted) return;
    try {
      await activeStatus.submitProject(githubUrl, "Milestone submission");
    } catch (err: any) {
      console.error(err);
    }
  };`;

content = content.replace(oldSubmitBlock, newSubmitBlock);

// Replace useEffect for fetching progress
const oldUseEffect1 = `  useEffect(() => {
    if (!slug) return;
    api.courseLectures(slug)
      .then((lectures) => {
        if (lectures.length > 0) {
          const lastNum = lectures[lectures.length - 1].number;
          setLastLectureNumber(lastNum);
          
          // Fetch milestone project completion status
          authFetch<{ projectCompleted: boolean; projectId: string | null }>(\`/progress/lecture/\${slug}/\${lastNum}\`)
            .then((res) => {
              if (res.projectCompleted && res.projectId) {
                setCompletedProjectId(res.projectId);
                const compProj = PROJECTS.find(p => p.id === res.projectId);
                if (compProj) {
                  setSelected(compProj);
                }
              }
            })
            .catch((err) => {
              console.error('Failed to load milestone progress', err);
            });
        }
      })
      .catch((err) => {
        console.error('Failed to load course lectures for milestone progress', err);
      });
  }, [slug]);`;

content = content.replace(oldUseEffect1, ''); // We don't need this anymore, useProjectStatus handles fetching

// Replace the second useEffect
const oldUseEffect2 = `  // Handle selected project changes
  useEffect(() => {
    if (selected) {
      setSubmitted(false);
      setShowCertificate(false);
      setGithubUrl('');
      setSubmitError(null);
    }
  }, [selected]);`;

const newUseEffect2 = `  // Handle selected project changes
  useEffect(() => {
    if (selected) {
      setGithubUrl('');
    }
  }, [selected]);`;

content = content.replace(oldUseEffect2, newUseEffect2);

// Update variables in JSX
content = content.replace(/submitted/g, 'isSubmitted');
content = content.replace(/submitting/g, 'isSubmitting');

// Fix any variables named 'isSubmitted' that we just replaced
// like setSubmitted(true) -> this was removed in the function replacements.
// Let's remove the "You have already completed your capstone project" banner
content = content.replace(/\{completedProjectId && \([\s\S]*?\}\)/g, '');

// Replace "completedProjectId === project.id" with "isCompleted" check in the project cards list
content = content.replace(/completedProjectId === project\.id/g, "(project.id === 'fundamentals-of-ai-degrees' ? degreesStatus.submission?.status !== 'NOT_SUBMITTED' && degreesStatus.submission?.status !== undefined : tictactoeStatus.submission?.status !== 'NOT_SUBMITTED' && tictactoeStatus.submission?.status !== undefined)");

// Add the Continue to Next Lecture button
const certificateBlock = `{/\* 🎯 Step 4: Submit\/Certificate Summary 🎯 \*/}`;
const continueButtonBlock = `
      {bothCompleted && (
        <div className="mt-8 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <CheckCircle className="text-emerald-400" /> All Milestones Completed
          </h3>
          <p className="text-slate-300 mb-6">You have successfully submitted all milestone projects for this lecture.</p>
          <button
            onClick={() => navigate('/course/fundamentals-of-ai/lecture/2')}
            className="flex items-center justify-center gap-2 mx-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-600/20"
          >
            Continue to Next Lecture <ArrowRight size={18} />
          </button>
        </div>
      )}
      
      {/* 🎯 Step 4: Submit/Certificate Summary 🎯 */}`;

content = content.replace(certificateBlock, continueButtonBlock);

// Replace "Generate Certificate" logic which uses handleCompleteCapstone
content = content.replace(/const handleCompleteCapstone = async \(\) => \{[\s\S]*?setStep\('Certificate'\);\n  \};/g, '');
content = content.replace(/<button[\s\S]*?onClick=\{handleCompleteCapstone\}[\s\S]*?<\/button>/g, '');
content = content.replace(/\{showCertificate && \([\s\S]*?\}\)/g, '');

// Add the download button inside the project details header
const downloadButtonHtml = `
              {selected.downloadUrl && (
                <a href={selected.downloadUrl} download className="inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-500/20">
                  <Terminal size={16} /> Download Starter Code & Dataset
                </a>
              )}
`;

content = content.replace(/(<h2 className="text-2xl font-bold text-white mb-4">[\s\S]*?<\/p>)/, `$1${downloadButtonHtml}`);

fs.writeFileSync(filePath, content);
console.log('MilestonePage state patched successfully.');
