import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { api, type ChatMsg, saveCompletedProject, getProjectMetadata, type FailureAnalysisResult, type CodeReviewResult } from "../api";
import { markProjectCompletedDirect } from "../hooks/useProgress";
import { runPythonMock, type DebugStep } from "../interpreter";
import VisualPreview from "../components/lesson/VisualPreview";
import { hasSimulation } from "../simulation/registry";
import {
  Check, CheckCircle, X, XCircle, AlertTriangle, Gem, Clock,
  FolderUp, Download, Monitor, Bot, Pencil, MessageSquare,
  Search, Lightbulb, Bug, Unlock, Settings, RefreshCw, ChevronDown,
} from "lucide-react";
import {
  runChecklist,
  getProjectDefaultInput,
  getProjectChecklist,
  generateExampleOutput,
} from "../projects/registry";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001';

async function recordProjectCompletion(courseSlug: string, lectureNumber: number, projectId: string) {
  const token = getToken();
  if (!token) return;
  try {
    await fetch(`${BACKEND_URL}/api/progress/lecture/problem`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courseSlug, lectureNumber, problemId: projectId }),
    });
  } catch (err) {
    console.warn('Failed to record project completion:', err);
  }
}


export default function CodingProjectPage() {
  const { slug, number, projectId } = useParams<{ slug: string; number: string; projectId: string }>();
  const navigate = useNavigate();
  const highlighterRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const courseTitle = slug === "cs50p" ? "CS50 Python" : slug === "cs50ai" ? "CS50 AI" : slug === "python" ? "Python Programming" : slug?.toUpperCase() ?? "";
  
  const [lectureTitle, setLectureTitle] = useState("");
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
  const [completedConcepts, setCompletedConcepts] = useState<string[]>([]);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Dynamic Navigation Boundary States
  const [problems, setProblems] = useState<any[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState<number>(-1);

  // Markdown Description Contents
  const [question, setQuestion] = useState("");
  const [understanding, setUnderstanding] = useState("");
  const [specification, setSpecification] = useState("");
  const [hints, setHints] = useState("");
  const [testing, setTesting] = useState("");

  // Visual Preview output
  const [previewOutput, setPreviewOutput] = useState("");
  const [hasRun, setHasRun] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<DebugStep[] | undefined>(undefined);

  // Example output for the "What You Will Create" section
  const [examplePreviewOutput, setExamplePreviewOutput] = useState("");

  // Build checklist tracking
  const [checklistResults, setChecklistResults] = useState<Record<string, boolean>>({});

  // Editor Code State
  const [code, setCode] = useState("");

  // Dynamic Console Tabbed Panels State
  const [activeTab, setActiveTab] = useState<"results" | "output" | "mentor" | "input">("results");
  const [customInput, setCustomInput] = useState("");
  const [useCustomInput, setUseCustomInput] = useState(false);

  // dynamic autograder/test output
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"success" | "error" | "">("");
  const [syntaxError, setSyntaxError] = useState("");

  // Mentor Chat state
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Enhanced AI Mentor states
  const [mentorSubTab, setMentorSubTab] = useState<"chat" | "review" | "hints" | "debug">("chat");
  const [failureAnalysis, setFailureAnalysis] = useState<FailureAnalysisResult | null>(null);
  const [codeReview, setCodeReview] = useState<CodeReviewResult | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [unlockedHintLevel, setUnlockedHintLevel] = useState<number>(0);

  // Visual Debugger states
  const [debugSteps, setDebugSteps] = useState<DebugStep[]>([]);
  const [currentDebugIndex, setCurrentDebugIndex] = useState<number>(0);



  // Fetch adjacent problems in current Week
  useEffect(() => {
    if (slug && number) {
      api.courseProblems(slug)
        .then((allProblems) => {
          const filtered = allProblems.filter((p) => p.slug !== "quiz" && p.week_label === `Week ${number}`);
          setProblems(filtered);
          const index = filtered.findIndex((p) => p.slug === projectId);
          setCurrentProblemIndex(index);
        })
        .catch(console.error);
    }
  }, [slug, number, projectId]);

  // Load chat logs on load
  useEffect(() => {
    if (projectId) {
      api.chatHistory(projectId).then(setChatMessages).catch(() => {});
    }
  }, [projectId]);

  // Load lecture title for contextual header
  useEffect(() => {
    if (!slug || number === undefined) return;
    const base = import.meta.env.BASE_URL ?? '/';
    const url = base.replace(/\/$/, '') + `/data/${slug}/lecture_${number}/lesson.json`;
    fetch(url).then(r => r.ok ? r.json() : null).then(data => {
      if (data?.title) setLectureTitle(data.title);
    }).catch(() => {});
  }, [slug, number]);

  // Load optional Markdown files helper
  async function loadOptionalFile(path: string) {
    try {
      const response = await fetch(path);
      if (!response.ok) return "";
      return await response.text();
    } catch {
      return "";
    }
  }

  // Load project specifications and starter code
  useEffect(() => {
    async function loadFiles() {
      try {
        setFailureAnalysis(null);
        setCodeReview(null);
        setUnlockedHintLevel(0);
        setMentorSubTab("chat");
        setDebugSteps([]);
        setCurrentDebugIndex(0);
        
        
        const base = import.meta.env.BASE_URL;

        // Fetch required question markdown
        const questionResponse = await fetch(
          `${base}data/${slug}/lecture_${number}/${projectId}/question.md`
        );
        const questionText = await questionResponse.text();
        setQuestion(questionText);

        // Fetch optional details files
        setUnderstanding(await loadOptionalFile(`${base}data/${slug}/lecture_${number}/${projectId}/understanding.md`));
        setSpecification(await loadOptionalFile(`${base}data/${slug}/lecture_${number}/${projectId}/specification.md`));
        setHints(await loadOptionalFile(`${base}data/${slug}/lecture_${number}/${projectId}/hints.md`));
        setTesting(await loadOptionalFile(`${base}data/${slug}/lecture_${number}/${projectId}/testing.md`));

        // Load draft code if saved or load fallback starter comments
        const codeKey = `fa_code_${projectId}`;
        const savedCode = localStorage.getItem(codeKey);

        const initialCode = savedCode || "# Write your Python program below\n";
        setCode(initialCode);
        // Run initial checklist checks on loaded code
        if (projectId) {
          setChecklistResults(runChecklist(initialCode, projectId));
        }
      } catch (error) {
        console.error(error);
        setStatus("error");
        setOutput("[Error] Failed to load project files.");
      }
    }

    loadFiles();
  }, [slug, number, projectId]);

  // Generate example preview for "What You Will Create" section
  useEffect(() => {
    if (!projectId) return;
    setExamplePreviewOutput(generateExampleOutput(projectId));
  }, [projectId]);

  // Submit Mentor Chat
  async function handleChatSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || !projectId || isChatLoading) return;
    
    const userMessage = chatInput.trim();
    setChatInput("");
    setIsChatLoading(true);

    const newMsg: ChatMsg = { role: "user", content: userMessage, created_at: new Date().toISOString() };
    setChatMessages((prev) => [...prev, newMsg]);

    try {
      const { reply } = await api.chat(projectId, userMessage, code);
      setChatMessages((prev) => [...prev, { role: "assistant", content: reply, created_at: new Date().toISOString() }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatLoading(false);
    }
  }

  // Load autograder JavaScript test run logic
  async function runDynamicTests() {
    const base = import.meta.env.BASE_URL;
    const testPath = `${base}data/${slug}/lecture_${number}/${projectId}/tests.js?t=${Date.now()}`;
    const response = await fetch(testPath);

    if (!response.ok) {
      throw new Error(`Tests not found for ${projectId}`);
    }

    const testText = await response.text();
    const blob = new Blob([testText], { type: "application/javascript" });
    const blobUrl = URL.createObjectURL(blob);

    try {
      const module = await import(/* @vite-ignore */ blobUrl);
      if (!module || typeof module.runTests !== "function") {
        throw new Error("runTests(code) function not found in tests.js");
      }
      return await module.runTests(code);
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  }



  // Run per-project checklist checks against the current code
  function runChecklistChecks() {
    if (!projectId) return {};
    const results = runChecklist(code, projectId);
    setChecklistResults(results);
    return results;
  }

  // Run Code — capture actual output for preview, run tests for terminal
  async function handleRun() {
    setStatus("");
    setSyntaxError("");
    setHasRun(true);

    if (!code.trim()) {
      setStatus("error");
      setOutput("[Error] Code cannot be empty.");
      setActiveTab("output");
      return;
    }

    // Always execute the code to capture actual output for the Visual Preview
    const fallback = "Maya\n22\nblue\npainting";
    const input = useCustomInput ? customInput : (projectId ? getProjectDefaultInput(projectId) : fallback);
    const steps = runPythonMock(code, input);
    setExecutionSteps(steps);
    const lastStep = steps[steps.length - 1];
    const outputText = lastStep?.outputs?.length ? lastStep.outputs.join("\n") : '';
    const rawOutput = outputText || (lastStep ? "Your program ran but produced no visible output. Try adding print() statements." : "Program ran successfully (no output).");
    const execError = lastStep?.error;
    setPreviewOutput(execError ? rawOutput : rawOutput);

    if (useCustomInput) {
      setOutput("Running with custom input...\n");
      setActiveTab("output");
      await new Promise((r) => setTimeout(r, 450));
      if (execError) {
        setOutput(rawOutput + "\n\n[Error] Execution Error:\n" + execError);
      } else {
        setOutput(rawOutput);
      }
      setStatus("");
      return;
    }

    // Run tests for terminal output
    setOutput("Running your code...");
    setActiveTab("results");

    try {
      await new Promise((r) => setTimeout(r, 300));
      const result = await runDynamicTests();

      if (result.passed || result.success) {
        setStatus("");
        setOutput(result.message || "[OK] All test cases passed!");
        runChecklistChecks();
        setFailureAnalysis(null);
      } else {
        setStatus("error");
        setOutput(result.message || "[Error] Test cases failed.");
        if (projectId) {
          const fa = api.getFailureAnalysis(code, projectId);
          setFailureAnalysis(fa);
          setActiveTab("mentor");
          setMentorSubTab("chat");
        }
      }
    } catch (e: any) {
      console.error(e);
      setStatus("error");
      setOutput(`[Error] Test execution failed.\n\n${e?.message || "Unknown error"}`);
    }
  }

  // Submit Code
  async function handleSubmit() {
    setStatus("");
    setSyntaxError("");
    setHasRun(true);

    if (!code.trim()) {
      setStatus("error");
      setOutput("[Error] Code cannot be empty.");
      setActiveTab("output");
      return;
    }

    setOutput("Submitting code...");
    setActiveTab("results");

    try {
      await new Promise((r) => setTimeout(r, 300));
      const result = await runDynamicTests();

      if (result.passed || result.success) {
        setStatus("success");
        runChecklistChecks();
        if (slug && projectId) {
          saveCompletedProject(slug, projectId, true);
          const num = Number(number);
          if (!isNaN(num)) markProjectCompletedDirect(slug, num, projectId);
        }
        const msg = "[OK] Submission Successful!\n\nAll hidden test cases passed.";
        setOutput(msg);
        setPreviewOutput(msg);
        setFailureAnalysis(null);
        setCompletedConcepts(metadata.concepts ?? []);
        setTimeout(() => setShowCompletionOverlay(true), 800);
      } else {
        setStatus("error");
        const msg = result.message || "Please review your logic.";
        setOutput(`[Error] Submission Failed.\n\n${msg}`);
        setPreviewOutput(msg);
        if (projectId) {
          const fa = api.getFailureAnalysis(code, projectId);
          setFailureAnalysis(fa);
          setActiveTab("mentor");
          setMentorSubTab("chat");
        }
      }
    } catch (e: any) {
      console.error(e);
      setStatus("error");
      setOutput(`[Error] Submission Failed.\n\n${e?.message || "Unknown error"}`);
    }
  }

  // Save Code to local Storage
  function handleSaveCode() {
    if (projectId) {
      localStorage.setItem(`fa_code_${projectId}`, code);
      setDraftSaved(false);
      setStatus("success");
      setOutput("[OK] Code saved to local storage!");
      setActiveTab("results");
    }
  }

  // Code editor text updates
  function handleCodeChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setCode(val);

    if (projectId) {
      localStorage.setItem(`fa_code_${projectId}`, val);
      setDraftSaved(true);
    }
    
    // Auto basic python syntax warning checks
    let errorMsg = "";
    const lines = val.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if ((line.startsWith("def ") || line.startsWith("if ") || line.startsWith("for ") || line.startsWith("while ") || line.startsWith("class ")) && !line.endsWith(":")) {
        errorMsg = `Line ${i + 1}: Missing colon (":") at the end of statement`;
        break;
      }
    }
    setSyntaxError(errorMsg);
  }

  // Key Event Shortcuts & Indentation
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const val = e.currentTarget.value;
      const newVal = val.substring(0, start) + "    " + val.substring(end);
      setCode(newVal);
      
      if (projectId) {
        localStorage.setItem(`fa_code_${projectId}`, newVal);
        setDraftSaved(true);
      }

      const target = e.currentTarget;
      setTimeout(() => {
        if (target) {
          target.selectionStart = target.selectionEnd = start + 4;
        }
      }, 0);
    }
    
    if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSaveCode();
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (e.shiftKey) {
        handleSubmit();
      } else {
        handleRun();
      }
    }
  }

  // Sync scroll between Textarea, Highlight, and Line Numbers Gutter
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlighterRef.current) {
      highlighterRef.current.scrollTop = e.currentTarget.scrollTop;
      highlighterRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Upload Code handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024) {
      setToast({ message: "[Error] File exceeds size limit (50KB).", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "py" && ext !== "txt") {
      setToast({ message: "[Error] Only .py and .txt files are supported.", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCode(text);
      if (projectId) {
        localStorage.setItem(`fa_code_${projectId}`, text);
        setDraftSaved(true);
      }
      setToast({ message: "[OK] File uploaded successfully!", type: "success" });
      setTimeout(() => setToast(null), 3000);
    };
    reader.readAsText(file);
  };

  // Download Code handler
  const handleDownloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${projectId || "solution"}.py`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    setToast({ message: "[OK] Code downloaded successfully!", type: "success" });
    setTimeout(() => setToast(null), 3000);
  };

  const activeProblem = currentProblemIndex >= 0 ? problems[currentProblemIndex] : null;
  const metadata = getProjectMetadata(projectId || "", activeProblem?.difficulty);
  const problemTitle = activeProblem?.title || projectId?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Problem";

  const lines = code.split("\n");
  const lineCount = lines.length;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-[#080c10] text-slate-100 overflow-hidden">
      {/* Toast Alert Indicator */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-2 animate-bounce transition-all ${
          toast.type === "success"
            ? "bg-green-950/80 border-green-500/30 text-green-300"
            : "bg-red-950/80 border-red-500/30 text-red-300"
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* LEFT PANEL (45% Width) */}
      <div className="w-full md:w-[45%] h-[50vh] md:h-full flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-slate-800/80 bg-[#0d1117]/40">
        
        {/* Left Panel Metadata Header */}
        <div className="flex-shrink-0 p-5 border-b border-slate-800/80 bg-[#0c1015]/60">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 mb-3">
            <button onClick={() => navigate('/')} className="hover:text-blue-400 transition-colors">Dashboard</button>
            <span className="text-slate-700">/</span>
            <button onClick={() => navigate(`/course/${slug}`)} className="hover:text-blue-400 transition-colors">{courseTitle}</button>
            <span className="text-slate-700">/</span>
            <span className="text-slate-400">
              Lecture {number}{lectureTitle ? ` — ${lectureTitle}` : ''}
            </span>
            <span className="text-slate-700">/</span>
            <span className="text-blue-300">Project: {problemTitle}</span>
          </nav>

          {/* Lecture Navigation */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => navigate(`/course/${slug}/lecture/${number}`)}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 transition-colors px-2.5 py-1 rounded-lg bg-slate-800/40 hover:bg-slate-700/40 border border-slate-700/30"
            >
              ← Back to Lecture
            </button>
            <button
              onClick={() => navigate(`/course/${slug}/lecture/${number}?page=summary`)}
              className="flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20"
            >
              Continue to Summary →
            </button>
          </div>

          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mb-2">
            {problemTitle}
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
              metadata.difficulty === "Easy"
                ? "bg-green-500/10 text-green-400 border-green-500/20"
                : metadata.difficulty === "Medium"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}>
              {metadata.difficulty}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-850 border border-slate-800/80 px-2 py-0.5 rounded-lg">
              <Gem className="w-3 h-3 inline" /> {metadata.xp} XP
            </span>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-850 border border-slate-800/80 px-2 py-0.5 rounded-lg">
              <Clock className="w-3 h-3 inline" /> {metadata.estimatedTime}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1.5 mt-3">
            {metadata.tags.map((tag) => (
              <span key={tag} className="text-[9px] font-semibold text-slate-400 bg-slate-850/80 border border-slate-800/40 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Left Panel Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Section 1: Project Overview */}
          <div className="border border-slate-800/85 rounded-xl overflow-hidden bg-gradient-to-br from-blue-900/5 to-slate-900/30">
            <div className="px-5 py-2.5 bg-gradient-to-r from-blue-900/10 to-slate-900/50 text-left font-bold text-[10px] text-blue-300 uppercase tracking-widest border-b border-slate-800/80 flex items-center gap-2">
              Project Overview
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {(() => {
                  const firstLine = (question || '').split('\n').find(l => l.trim() && !l.startsWith('#') && !l.startsWith('**') && !l.startsWith('```'));
                  return firstLine?.replace(/^Write a Python program that /i, '') || `Build a ${problemTitle}.`;
                })()}
              </p>
              <div className="mt-4 flex items-center gap-3 text-[10px] text-slate-400">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${
                  metadata.difficulty === "Easy" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                  metadata.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                  "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>
                  {metadata.difficulty}
                </span>
                <span className="text-slate-600">·</span>
                <span><Gem className="w-3 h-3 inline -mt-0.5" /> {metadata.xp} XP</span>
                <span className="text-slate-600">·</span>
                <span><Clock className="w-3 h-3 inline -mt-0.5" /> {metadata.estimatedTime}</span>
              </div>
            </div>
          </div>

          {/* Section 2: What You Will Create */}
          <div className="border border-slate-800/85 rounded-xl overflow-hidden bg-[#0c1015]/40">
            <div className="px-5 py-2.5 bg-gradient-to-r from-purple-900/10 to-slate-900/50 text-left font-bold text-[10px] text-purple-300 uppercase tracking-widest border-b border-slate-800/80 flex items-center gap-2">
              What You Will Create
            </div>
            <div className="p-4">
              {hasSimulation(projectId ?? '') || examplePreviewOutput ? (
                <div className="rounded-xl border border-slate-700/20 bg-[#0b0f14] overflow-hidden pointer-events-none">
                  <VisualPreview
                    output={examplePreviewOutput || ''}
                    projectId={projectId ?? ''}
                    visible={true}
                  />
                </div>
              ) : (
                <div className="bg-slate-800/20 rounded-xl border border-slate-700/10 p-5 text-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/40 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Preview not available</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Build Checklist */}
          <div className="border border-slate-800/85 rounded-xl overflow-hidden bg-[#0c1015]/40">
            <div className="px-5 py-2.5 bg-gradient-to-r from-emerald-900/10 to-slate-900/50 text-left font-bold text-[10px] text-emerald-300 uppercase tracking-widest border-b border-slate-800/80 flex items-center gap-2">
              Build Checklist
            </div>
            <div className="p-4">
              {(() => {
                const items = getProjectChecklist(projectId ?? '');
                if (!items) return <p className="text-[10px] text-slate-500 italic">Checklist items not defined for this project.</p>;
                const completedCount = Object.values(checklistResults).filter(Boolean).length;
                return (
                  <div>
                    <div className="flex items-center justify-between mb-3 px-0.5">
                      <p className="text-[10px] text-slate-400">{completedCount} of {items.length} complete</p>
                      <div className="flex gap-1">
                        {items.map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full transition-all ${
                            checklistResults[items[i].id]
                              ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30'
                              : 'bg-slate-700'
                          }`} />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${
                            checklistResults[item.id]
                              ? 'bg-emerald-500/5 text-emerald-300'
                              : 'bg-slate-800/20 text-slate-400'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            checklistResults[item.id]
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                              : 'border-slate-600/60'
                          }`}>
                            {checklistResults[item.id] ? (
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : ''}
                          </span>
                          <span className={checklistResults[item.id] ? 'line-through text-emerald-400/70' : ''}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    {completedCount === items.length && (
                      <div className="mt-3 pt-3 border-t border-emerald-500/20 text-center">
                        <p className="text-[11px] font-semibold text-emerald-400">All checklist items complete!</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">Click Submit Project to finish.</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Section 4: Project Skills */}
          <div className="border border-slate-800/85 rounded-xl overflow-hidden bg-gradient-to-br from-amber-900/5 to-slate-900/30">
            <div className="px-5 py-2.5 bg-gradient-to-r from-amber-900/10 to-slate-900/50 text-left font-bold text-[10px] text-amber-300 uppercase tracking-widest border-b border-slate-800/80 flex items-center gap-2">
              Project Skills
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-1.5">
                {metadata.concepts?.length ? (
                  metadata.concepts.map((concept) => (
                    <span
                      key={concept}
                      className={`text-[10px] font-medium px-2.5 py-1 rounded-full border transition-all ${
                        checklistResults[concept.replace(/[^a-zA-Z]/g, '')] || 
                        Object.keys(checklistResults).length === 0
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-slate-800/40 text-slate-400 border-slate-700/30'
                      }`}
                    >
                      {concept}
                    </span>
                  ))
                ) : (
                  metadata.tags.map((tag) => (
                    <span key={tag} className="text-[10px] text-slate-400 bg-slate-800/40 px-2.5 py-1 rounded-full border border-slate-700/20">
                      {tag}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Extra details collapsible */}
          {(hints || understanding || specification || testing) && (
            <details className="border border-slate-800/50 rounded-xl overflow-hidden bg-[#0c1015]/20">
              <summary className="px-5 py-2.5 bg-slate-900/30 text-left text-[10px] font-medium text-slate-400 cursor-pointer hover:text-slate-300 transition-colors select-none">
                Additional reference materials
              </summary>
              <div className="p-4 space-y-4 border-t border-slate-800/40">
                {understanding && (
                  <div className="text-xs text-slate-400">
                    <p className="font-semibold text-slate-300 mb-1">Background</p>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{understanding}</ReactMarkdown>
                  </div>
                )}
                {specification && (
                  <div className="text-xs text-slate-400">
                    <p className="font-semibold text-slate-300 mb-1">Detailed Specs</p>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{specification}</ReactMarkdown>
                  </div>
                )}
                {hints && (
                  <div className="text-xs text-slate-400">
                    <p className="font-semibold text-slate-300 mb-1">Tips</p>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{hints}</ReactMarkdown>
                  </div>
                )}
                {testing && (
                  <div className="text-xs text-slate-400">
                    <p className="font-semibold text-slate-300 mb-1">Testing</p>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{testing}</ReactMarkdown>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>

      {/* RIGHT PANEL (55% Width) */}
      <div className="w-full md:w-[55%] h-[50vh] md:h-full flex flex-col overflow-hidden bg-[#0b0f14]">
        
        {/* Editor Control Header */}
        <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-800 px-6 py-3 bg-[#10141b]">
          
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="language-select" className="text-[11px] font-semibold text-slate-400">Language:</label>
              <select
                id="language-select"
                className="bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-200 focus:outline-none focus:border-blue-500"
                defaultValue="python3"
              >
                <option value="python3">Python 3</option>
                <option value="c" disabled>C (Disabled)</option>
                <option value="cpp" disabled>C++ (Disabled)</option>
                <option value="java" disabled>Java (Disabled)</option>
                <option value="javascript" disabled>JavaScript (Disabled)</option>
              </select>
            </div>

            {/* Project Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowToolsDropdown(v => !v)}
                onBlur={() => setTimeout(() => setShowToolsDropdown(false), 200)}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-[10px] font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                <Settings className="w-3 h-3" /> Project Tools <ChevronDown className="w-3 h-3" />
              </button>
              {showToolsDropdown && (
                <div className="absolute top-full left-0 mt-1 w-44 bg-slate-900 border border-slate-700/80 rounded-xl shadow-xl overflow-hidden z-50">
                  <button
                    onClick={() => { fileInputRef.current?.click(); setShowToolsDropdown(false); }}
                    className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[11px] font-medium text-slate-300 hover:bg-slate-800/80 transition-colors text-left"
                  >
                    <FolderUp className="w-3.5 h-3.5 text-slate-400" /> Upload File
                  </button>
                  <button
                    onClick={() => { handleDownloadCode(); setShowToolsDropdown(false); }}
                    className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[11px] font-medium text-slate-300 hover:bg-slate-800/80 transition-colors text-left"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" /> Download Code
                  </button>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".py,.txt"
                className="hidden"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {draftSaved && (
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mr-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                Draft auto-saved
              </span>
            )}
          </div>
        </div>

        {hasRun ? (
          /* After Run: simulation first (hero), editor below */
          <>
            <div className="flex-[3] flex flex-col overflow-hidden min-h-0 border-b border-slate-800/60">
              <VisualPreview output={previewOutput} steps={executionSteps} projectId={projectId ?? ''} visible={true} />
            </div>
            <div className="flex-[2] flex overflow-hidden bg-[#090d12] min-h-0">
              <div
                ref={gutterRef}
                className="w-10 flex-shrink-0 bg-[#070b0f] border-r border-slate-800/80 text-slate-600 font-mono text-right pr-2 select-none overflow-hidden py-4 text-xs"
                style={{ height: "100%" }}
              >
                {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
                  <div key={i} style={{ height: "1.5rem", lineHeight: "1.5rem" }}>
                    {i + 1}
                  </div>
                ))}
              </div>
              <div className="relative flex-1 h-full overflow-hidden">
                <textarea
                  value={code}
                  onChange={handleCodeChange}
                  onKeyDown={handleKeyDown}
                  onScroll={handleScroll}
                  spellCheck="false"
                  aria-label="Code Editor"
                  className="absolute inset-0 w-full h-full resize-none bg-transparent py-4 pl-3 pr-6 font-mono text-xs leading-6 text-transparent caret-white outline-none z-10 whitespace-pre overflow-auto"
                  style={{ WebkitTextFillColor: "transparent" }}
                />
                <div
                  ref={highlighterRef}
                  className="absolute inset-0 w-full h-full py-4 pl-3 pr-6 overflow-hidden pointer-events-none"
                >
                  <SyntaxHighlighter
                    language="python"
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: 0,
                      background: "transparent",
                      fontSize: "0.75rem",
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      overflow: "hidden",
                      whiteSpace: "pre",
                      lineHeight: "1.5rem",
                    }}
                  >
                    {code}
                  </SyntaxHighlighter>
                </div>
                {syntaxError && (
                  <div className="absolute bottom-4 right-4 bg-red-900/90 text-red-200 px-3.5 py-1.5 rounded-lg shadow-xl border border-red-750/80 z-20 pointer-events-none text-[10px] font-semibold animate-pulse">
                    <AlertTriangle className="w-3 h-3 inline" /> {syntaxError}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Before Run: editor fills available space */
          <div className="flex-1 flex overflow-hidden bg-[#090d12]">
            <div
              ref={gutterRef}
              className="w-10 flex-shrink-0 bg-[#070b0f] border-r border-slate-800/80 text-slate-600 font-mono text-right pr-2 select-none overflow-hidden py-4 text-xs"
              style={{ height: "100%" }}
            >
              {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
                <div key={i} style={{ height: "1.5rem", lineHeight: "1.5rem" }}>
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="relative flex-1 h-full overflow-hidden">
              <textarea
                value={code}
                onChange={handleCodeChange}
                onKeyDown={handleKeyDown}
                onScroll={handleScroll}
                spellCheck="false"
                aria-label="Code Editor"
                className="absolute inset-0 w-full h-full resize-none bg-transparent py-4 pl-3 pr-6 font-mono text-xs leading-6 text-transparent caret-white outline-none z-10 whitespace-pre overflow-auto"
                style={{ WebkitTextFillColor: "transparent" }}
              />
              <div
                ref={highlighterRef}
                className="absolute inset-0 w-full h-full py-4 pl-3 pr-6 overflow-hidden pointer-events-none"
              >
                <SyntaxHighlighter
                  language="python"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: 0,
                    background: "transparent",
                    fontSize: "0.75rem",
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    overflow: "hidden",
                    whiteSpace: "pre",
                    lineHeight: "1.5rem",
                  }}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
              {syntaxError && (
                <div className="absolute bottom-4 right-4 bg-red-900/90 text-red-200 px-3.5 py-1.5 rounded-lg shadow-xl border border-red-750/80 z-20 pointer-events-none text-[10px] font-semibold animate-pulse">
                  <AlertTriangle className="w-3 h-3 inline" /> {syntaxError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOTTOM TABBED CONSOLE */}
        <div className={`flex-shrink-0 flex flex-col bg-[#0b0f14] border-t border-slate-800 ${hasRun ? 'h-[140px]' : 'h-[200px] md:h-[220px]'}`}>
          
          {/* Console Header Tabs */}
          <div className="flex-shrink-0 flex items-center justify-between px-5 bg-[#10141b] border-b border-slate-800 h-10">
            <div className="flex gap-1 h-full items-end">
              {(["results", "output", "mentor", "input"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-[10px] font-bold border-t-2 border-x transition-colors flex items-center gap-1 h-[32px] rounded-t-lg ${
                    activeTab === tab
                      ? "bg-[#0b0f14] border-t-blue-500 border-x-slate-800 text-blue-400"
                      : "bg-[#10141b]/80 border-t-transparent border-x-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>{tab === "results" ? <Check className="w-3 h-3" /> : tab === "output" ? <Monitor className="w-3 h-3" /> : tab === "mentor" ? <Bot className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}</span>
                  {tab === "results" ? "Test Results" : tab === "output" ? "Execution Output" : tab === "mentor" ? "AI Mentor" : "Custom Input"}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Contents Area */}
          <div className="flex-1 overflow-hidden bg-[#0b0f14]">
            
            {/* Tab 1: Test Results */}
            {activeTab === "results" && (
              <div className="p-4 h-full overflow-y-auto space-y-3">
                {status === "success" && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <div>
                      <h4 className="font-bold text-xs text-green-400">Success! All tests passed</h4>
                      <p className="text-[11px] text-slate-350 mt-1 whitespace-pre-wrap">{output}</p>
                    </div>
                  </div>
                )}
                {status === "error" && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <div>
                      <h4 className="font-bold text-xs text-red-400">Test Run Failed</h4>
                      <p className="text-[11px] text-slate-350 mt-1 whitespace-pre-wrap font-mono">{output}</p>
                    </div>
                  </div>
                )}
                {status === "" && (
                  <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
                    No tests run yet. Click "Run Code" or "Submit Solution" below.
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Execution Output */}
            {activeTab === "output" && (
              <div className="p-3.5 h-full font-mono text-[11px] overflow-auto bg-[#090d12]/50 text-slate-300 space-y-2">
                {syntaxError && (
                  <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-300 font-sans">
                    <AlertTriangle className="w-3 h-3 inline" /><span className="font-bold text-xs"> Syntax Check warning:</span>
                    <div className="font-mono text-[10px] mt-1">{syntaxError}</div>
                  </div>
                )}
                <pre className="whitespace-pre-wrap">{output || "Console stdout is empty. Run your code to print outputs here."}</pre>
              </div>
            )}

            {/* Tab 3: AI Mentor Chat Panel */}
            {activeTab === "mentor" && (
              <div className="flex flex-col h-full bg-[#0b0f14] overflow-hidden">
                {/* Sub-tabs header for AI Mentor */}
                <div className="flex-shrink-0 flex items-center justify-between px-4 bg-[#10141b]/80 border-b border-slate-850 h-9">
                  <div className="flex gap-2 h-full items-end">
                    {(["chat", "review", "hints", "debug"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setMentorSubTab(tab)}
                        className={`px-3 py-1 text-[10px] font-bold border-b-2 transition-colors flex items-center gap-1 h-full ${
                          mentorSubTab === tab
                            ? "border-b-blue-500 text-blue-400"
                            : "border-b-transparent text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {tab === "chat" ? <><MessageSquare className="w-3 h-3" /> Chat</> : tab === "review" ? <><Search className="w-3 h-3" /> Code Review</> : tab === "hints" ? <><Lightbulb className="w-3 h-3" /> Hints</> : <><Bug className="w-3 h-3" /> Visual Debugger</>}
                      </button>
                    ))}
                  </div>
                  {/* Dynamic Alert Banner for submission failures */}
                  {failureAnalysis && (
                    <span className="text-[9px] bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-0.5 rounded font-bold animate-pulse">
                      ✗ Last Run Failed
                    </span>
                  )}
                </div>

                {/* Sub-tab content */}
                <div className="flex-1 overflow-y-auto p-4">
                  {/* 1. FAILURE ANALYSIS SHOWN AT TOP OF ANY SUB-TAB IF EXISTS */}
                  {failureAnalysis && (
                    <div className="mb-4 bg-red-950/20 border border-red-500/20 rounded-xl p-3.5 shadow-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-400 font-bold text-xs">✗ Submission Failure Analysis</span>
                        <span className="text-[9px] bg-red-500/10 border border-red-500/20 px-1.5 py-0.2 rounded font-bold text-red-400">Error</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="bg-[#090d12] border border-slate-850 p-2.5 rounded-lg">
                          <div className="text-[10px] text-slate-400 font-semibold mb-1">Expected Output:</div>
                          <pre className="font-mono text-[10px] text-green-400 whitespace-pre-wrap">{failureAnalysis.expected}</pre>
                        </div>
                        <div className="bg-[#090d12] border border-slate-850 p-2.5 rounded-lg">
                          <div className="text-[10px] text-slate-400 font-semibold mb-1">Student Output:</div>
                          <pre className="font-mono text-[10px] text-red-400 whitespace-pre-wrap">{failureAnalysis.student}</pre>
                        </div>
                      </div>

                      <div className="bg-[#0c1015]/80 border border-slate-800/80 p-2.5 rounded-lg text-xs leading-relaxed text-slate-200">
                        <span className="font-bold text-slate-350 block mb-0.5">Why It Failed:</span>
                        {failureAnalysis.whyFailed}
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 1: AI TUTOR CHAT */}
                  {mentorSubTab === "chat" && (
                    <div className="space-y-3.5 pb-4">
                      {chatMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center p-4">
                          <Bot className="w-8 h-8 mb-2 text-slate-400" />
                          <p className="text-slate-300 text-xs font-bold">I'm your progressive Socratic Mentor!</p>
                          <p className="text-slate-400 text-[10px] max-w-xs mt-1 leading-relaxed">
                            Ask me any question about the problem. I'll guide you step-by-step without giving away the direct solution.
                          </p>
                        </div>
                      ) : (
                        chatMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-xl text-xs shadow-sm prose-sm prose-invert ${
                              msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-[#10141b] border border-slate-800/80 text-slate-200 rounded-bl-none'
                            }`}>
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                            </div>
                          </div>
                        ))
                      )}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-[#10141b]/60 border border-slate-800/60 p-3 rounded-xl rounded-bl-none text-slate-400 text-xs animate-pulse">
                            Thinking...
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 2: CODE REVIEW */}
                  {mentorSubTab === "review" && (
                    <div className="space-y-4 pb-4">
                      <div className="bg-[#10141b] border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-xs text-slate-200">Review My Code</h4>
                          <p className="text-slate-400 text-[10px] mt-0.5 max-w-sm leading-relaxed">
                            Analyze your code for logical errors, common style/syntax pitfalls, and correctness checks before submitting.
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            setIsReviewing(true);
                            await new Promise(r => setTimeout(r, 600));
                            if (projectId) {
                              const result = api.reviewStudentCode(code, projectId);
                              setCodeReview(result);
                            }
                            setIsReviewing(false);
                          }}
                          disabled={isReviewing}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all whitespace-nowrap"
                        >
                          {isReviewing ? "Analyzing..." : <><Search className="w-3 h-3" /> Review My Code</>}
                        </button>
                      </div>

                      {codeReview && (
                        <div className="space-y-3">
                          <h5 className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Analysis Checklist</h5>
                          
                          {/* Checklist items */}
                          <div className="grid grid-cols-1 gap-2">
                            {codeReview.checks.map((check: any, idx: number) => (
                              <div key={idx} className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                                check.status === "correct"
                                  ? "bg-green-950/10 border-green-500/20 text-green-300"
                                  : check.status === "warning"
                                  ? "bg-yellow-950/10 border-yellow-500/20 text-yellow-300"
                                  : "bg-red-950/10 border-red-500/20 text-red-300"
                              }`}>
                                <span className="font-medium">{check.message}</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  check.status === "correct"
                                    ? "bg-green-500/10 border border-green-500/20 text-green-400"
                                    : check.status === "warning"
                                    ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
                                    : "bg-red-500/10 border border-red-500/20 text-red-400"
                                }`}>
                                  {check.status === "correct" ? "✓ Correct" : check.status === "warning" ? "[!] Warning" : "✗ Error"}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Issues/Suggestions Card */}
                          <div className="bg-[#10141b] border border-slate-800/80 rounded-xl p-4">
                            <h5 className="text-xs font-bold text-slate-200 mb-2">Code Mentor Feedback</h5>
                            {codeReview.issues.length === 0 ? (
                              <div className="text-green-400 text-xs font-medium flex items-center gap-1.5">
                                <span>✓</span> No logical issues or common errors found! Your code structure is clean.
                              </div>
                            ) : (
                              <ul className="space-y-2 list-none p-0 m-0">
                                {codeReview.issues.map((issue: string, idx: number) => (
                                  <li key={idx} className="text-xs text-slate-350 flex items-start gap-2">
                                    <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5" />
                                    <span>{issue}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 3: PROGRESSIVE HINTS */}
                  {mentorSubTab === "hints" && (
                    <div className="space-y-4 pb-4">
                      <div className="bg-[#10141b] border border-slate-800/80 rounded-xl p-4">
                        <h4 className="font-bold text-xs text-slate-250 mb-1">Progressive Hint System</h4>
                        <p className="text-slate-400 text-[10px] leading-relaxed">
                          Request hints stage-by-stage. We'll start with the concept, then guide your direction, and finally show a minimal code pattern without giving away the answer.
                        </p>
                      </div>

                      {(() => {
                        const hintData = projectId ? api.getProgressiveHints(projectId) : null;
                        if (!hintData) return null;

                        return (
                          <div className="space-y-3">
                            {/* Hint 1: Concept */}
                            <div className="border border-slate-800/85 rounded-xl overflow-hidden bg-[#0c1015]/40">
                              <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/60 flex items-center justify-between gap-3">
                                <span className="font-bold text-xs text-slate-200">Hint 1 (Concept)</span>
                                <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.2 rounded font-bold text-blue-400">Concept</span>
                              </div>
                              <div className="p-4 text-xs text-slate-300 leading-relaxed">
                                {hintData.hint1}
                              </div>
                            </div>

                            {/* Hint 2: Direction */}
                            <div className="border border-slate-800/85 rounded-xl overflow-hidden bg-[#0c1015]/40">
                              {unlockedHintLevel >= 1 ? (
                                <>
                                  <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/60 flex items-center justify-between gap-3">
                                    <span className="font-bold text-xs text-slate-200">Hint 2 (Direction)</span>
                                    <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded font-bold text-amber-400">Direction</span>
                                  </div>
                                  <div className="p-4 text-xs text-slate-300 leading-relaxed">
                                    {hintData.hint2}
                                  </div>
                                </>
                              ) : (
                                <div className="p-4 flex items-center justify-between gap-4 bg-slate-950/20">
                                  <span className="text-[11px] text-slate-500 italic">Hint 2 is locked. Review Hint 1 first.</span>
                                  <button
                                    onClick={() => setUnlockedHintLevel(1)}
                                    className="bg-slate-800 hover:bg-slate-750 text-slate-200 text-[10px] font-bold px-3 py-1 rounded-lg border border-slate-700 transition-all cursor-pointer"
                                  >
                                    <Unlock className="w-3 h-3 inline" /> Unlock Hint 2
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Hint 3: Code Pattern */}
                            <div className="border border-slate-800/85 rounded-xl overflow-hidden bg-[#0c1015]/40">
                              {unlockedHintLevel >= 2 ? (
                                <>
                                  <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/60 flex items-center justify-between gap-3">
                                    <span className="font-bold text-xs text-slate-200">Hint 3 (Example Pattern)</span>
                                    <span className="text-[9px] bg-green-500/10 border border-green-500/20 px-1.5 py-0.2 rounded font-bold text-green-400">Pattern</span>
                                  </div>
                                  <div className="p-4 text-xs text-slate-300 leading-relaxed prose-sm prose-invert">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{hintData.hint3}</ReactMarkdown>
                                  </div>
                                </>
                              ) : (
                                <div className="p-4 flex items-center justify-between gap-4 bg-slate-950/20">
                                  <span className="text-[11px] text-slate-500 italic">Hint 3 is locked. Review Hint 2 first.</span>
                                  <button
                                    onClick={() => setUnlockedHintLevel(2)}
                                    disabled={unlockedHintLevel < 1}
                                    className="bg-slate-800 hover:bg-slate-750 disabled:opacity-50 text-slate-200 text-[10px] font-bold px-3 py-1 rounded-lg border border-slate-700 transition-all cursor-pointer"
                                  >
                                    <Unlock className="w-3 h-3 inline" /> Unlock Hint 3
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* SUB-TAB 4: VISUAL DEBUGGER */}
                  {mentorSubTab === "debug" && (
                    <div className="space-y-4 pb-4">
                      {debugSteps.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center p-4">
                          <Bug className="w-8 h-8 mb-2 text-slate-400" />
                          <p className="text-slate-300 text-xs font-bold">Interactive Visual Debugger</p>
                          <p className="text-slate-400 text-[10px] max-w-xs mt-1 leading-relaxed">
                            Step through your Python code line-by-line to watch variable assignments, conditionals, and outputs execute in real time.
                          </p>
                          <button
                            onClick={() => {
                              const steps = runPythonMock(code, customInput || "");
                              setDebugSteps(steps);
                              setCurrentDebugIndex(0);
                            }}
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
                          >
                            <Settings className="w-3 h-3 inline" /> Initialize Debugger
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Controls bar */}
                          <div className="bg-[#10141b] border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setCurrentDebugIndex(0)}
                                disabled={currentDebugIndex === 0}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 disabled:opacity-40 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-300 transition-colors cursor-pointer"
                              >
                                Start
                              </button>
                              <button
                                onClick={() => setCurrentDebugIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentDebugIndex === 0}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 disabled:opacity-40 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-300 transition-colors cursor-pointer"
                              >
                                ◀ Prev
                              </button>
                              <span className="text-[10px] font-semibold text-slate-400 px-2">
                                Step {currentDebugIndex + 1} of {debugSteps.length}
                              </span>
                              <button
                                onClick={() => setCurrentDebugIndex(prev => Math.min(debugSteps.length - 1, prev + 1))}
                                disabled={currentDebugIndex === debugSteps.length - 1}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 disabled:opacity-40 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-300 transition-colors cursor-pointer"
                              >
                                Next ▶
                              </button>
                              <button
                                onClick={() => setCurrentDebugIndex(debugSteps.length - 1)}
                                disabled={currentDebugIndex === debugSteps.length - 1}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 disabled:opacity-40 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-300 transition-colors cursor-pointer"
                              >
                                End
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                const steps = runPythonMock(code, customInput || "");
                                setDebugSteps(steps);
                                setCurrentDebugIndex(0);
                              }}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3 inline" /> Restart / Reload Code
                            </button>
                          </div>

                          {/* Grid layout for trace execution info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Column 1: Executing Code Line */}
                            <div className="bg-[#10141b] border border-slate-800/80 rounded-xl p-3.5 flex flex-col h-[180px]">
                              <h5 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Trace Execution</h5>
                              <div className="flex-1 overflow-y-auto bg-[#090d12] border border-slate-850 p-2 rounded-lg space-y-1 font-mono text-[11px] leading-relaxed">
                                {(() => {
                                  const currentStep = debugSteps[currentDebugIndex];
                                  const startIdx = Math.max(0, currentStep.lineIndex - 3);
                                  const endIdx = Math.min(code.split("\n").length - 1, currentStep.lineIndex + 3);
                                  const codeLines = code.split("\n");

                                  return codeLines.map((lineText, idx) => {
                                    if (idx < startIdx || idx > endIdx) return null;
                                    const isExecuting = idx === currentStep.lineIndex;
                                    return (
                                      <div
                                        key={idx}
                                        className={`flex items-start gap-2.5 py-0.5 px-2 rounded ${
                                          isExecuting
                                            ? "bg-yellow-500/10 border-l-2 border-yellow-500 text-yellow-300 font-bold"
                                            : "text-slate-500 opacity-60"
                                        }`}
                                      >
                                        <span className="w-5 text-right select-none text-[10px] font-mono opacity-40">{idx + 1}</span>
                                        <span className="whitespace-pre-wrap">{lineText}</span>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>

                            {/* Column 2: Variables Inspector */}
                            <div className="bg-[#10141b] border border-slate-800/80 rounded-xl p-3.5 flex flex-col h-[180px]">
                              <h5 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Variables Inspector</h5>
                              <div className="flex-1 overflow-y-auto bg-[#090d12] border border-slate-850 p-2 rounded-lg">
                                {Object.keys(debugSteps[currentDebugIndex].variables).length === 0 ? (
                                  <div className="h-full flex items-center justify-center text-slate-500 text-[10px] italic">
                                    No variables defined yet at this step.
                                  </div>
                                ) : (
                                  <table className="w-full text-left text-[11px]">
                                    <thead>
                                      <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                                        <th className="pb-1 font-semibold">Variable</th>
                                        <th className="pb-1 font-semibold">Value</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {Object.entries(debugSteps[currentDebugIndex].variables).map(([name, val]) => (
                                        <tr key={name} className="border-b border-slate-900/60">
                                          <td className="py-1.5 font-mono font-bold text-blue-400">{name}</td>
                                          <td className="py-1.5 font-mono text-slate-300 whitespace-pre-wrap">{val}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Debug Terminal Output */}
                          <div className="bg-[#10141b] border border-slate-800/80 rounded-xl p-3.5">
                            <h5 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Debug Console Output</h5>
                            <div className="bg-[#090d12] border border-slate-850 p-3 rounded-lg font-mono text-[11px] text-slate-350 min-h-[50px] max-h-[80px] overflow-y-auto whitespace-pre-wrap">
                              {debugSteps[currentDebugIndex].outputs.length === 0
                                ? "[Console stdout is empty]"
                                : debugSteps[currentDebugIndex].outputs.join("\n")}
                            </div>
                            {debugSteps[currentDebugIndex].error && (
                              <div className="mt-2 text-red-400 text-[10px] font-semibold bg-red-950/20 border border-red-900/40 p-2 rounded-lg">
                                <X className="w-3 h-3 inline" /> Error at step: {debugSteps[currentDebugIndex].error}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Sub-form input shown only for Chat sub-tab */}
                {mentorSubTab === "chat" && (
                  <form onSubmit={handleChatSubmit} className="flex-shrink-0 flex gap-2 p-2 border-t border-slate-800/80 bg-[#090d12] h-12">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder="Ask for hints..."
                      className="flex-1 bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                      disabled={isChatLoading}
                    />
                    <button
                      type="submit"
                      disabled={isChatLoading || !chatInput.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                    >
                      Send
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Tab 4: Custom Input Panel */}
            {activeTab === "input" && (
              <div className="p-4 h-full flex flex-col gap-2 bg-[#0b0f14]">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-350 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useCustomInput}
                      onChange={(e) => setUseCustomInput(e.target.checked)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-950"
                    />
                    Test with custom input
                  </label>
                  {useCustomInput && (
                    <span className="text-[9px] text-amber-400 font-semibold px-2 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/20 animate-pulse">
                      Custom input active
                    </span>
                  )}
                </div>
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  disabled={!useCustomInput}
                  placeholder="Type custom inputs here (e.g. inputs to be fed to input() statements, line by line)..."
                  className="flex-1 w-full bg-[#090d12] border border-slate-800/80 rounded-xl p-2.5 font-mono text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-slate-700 disabled:opacity-40"
                />
              </div>
            )}
          </div>

        </div>

        {/* ── Sticky Bottom Action Bar ── */}
        <div className="flex-shrink-0 bg-[#10141b] border-t border-slate-800 px-6 py-3 flex items-center justify-between">
          <div className="text-slate-500 text-[10px]">
            Press <kbd className="bg-slate-800 px-1 py-0.5 rounded text-[9px] text-slate-400 border border-slate-750">Ctrl+Enter</kbd> to Run
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveCode}
              className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              Save Draft
            </button>
            <button
              onClick={handleRun}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" /> Run Project
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Submit Project
            </button>
          </div>
        </div>

        {/* ── Project Completion Overlay ── */}
        {showCompletionOverlay && (
          <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
            <div className="max-w-md w-full mx-4 p-8 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-emerald-500/30 text-center space-y-6 animate-in zoom-in duration-500">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">Project Completed</p>
                <p className="text-sm text-slate-400 mt-2">Project successfully submitted.</p>
              </div>
              {completedConcepts.length > 0 && (
                <div className="bg-slate-800/40 rounded-xl p-4 text-left">
                  <p className="text-xs font-semibold text-slate-400 mb-2">Concepts Practiced:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {completedConcepts.map((concept) => (
                      <span key={concept} className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                        ✓ {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-[10px] text-blue-400 font-medium">Progress Updated</p>
              <button
                onClick={() => {
                  setShowCompletionOverlay(false);
                  navigate(`/course/${slug}/lecture/${number}?page=summary`);
                }}
                className="text-sm font-medium px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all"
              >
                Continue to Summary →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}