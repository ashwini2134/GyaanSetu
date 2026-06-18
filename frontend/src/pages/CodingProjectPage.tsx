// @ts-nocheck
import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { api, type ChatMsg, getProjectMetadata, type FailureAnalysisResult, type CodeReviewResult } from "../api";
import { authFetch } from "../authClient";
import { runPythonMock, type DebugStep } from "../interpreter";
import {
  Check, CheckCircle, X, XCircle, AlertTriangle, Gem, Clock,
  FolderUp, Download, Monitor, Bot, Pencil, MessageSquare,
  Search, Lightbulb, Bug, Unlock, Settings, RefreshCw,
} from "lucide-react";


export default function CodingProjectPage() {
  const { slug, number, projectId } = useParams<{ slug: string; number: string; projectId: string }>();
  const highlighterRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  // Editor Code State
  const [code, setCode] = useState("");

  // Accordion Expands State
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    description: true,
    understanding: false,
    specification: false,
    hints: false,
    testing: false,
  });

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

        if (savedCode) {
          setCode(savedCode);
        } else {
          setCode("# Write your Python program below\n");
        }
      } catch (error) {
        console.error(error);
        setStatus("error");
        setOutput("[Error] Failed to load project files.");
      }
    }

    loadFiles();
  }, [slug, number, projectId]);

  // Toggle Description Accordion
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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
      return await module.runTests(code, { runPythonMock });
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  }



  // Run Code
  async function handleRun() {
    setStatus("");
    setSyntaxError("");

    if (!code.trim()) {
      setStatus("error");
      setOutput("[Error] Code cannot be empty.");
      setActiveTab("output");
      return;
    }

    if (useCustomInput) {
      setOutput("Running with custom input...\n");
      setActiveTab("output");
      await new Promise((r) => setTimeout(r, 450));
      const steps = runPythonMock(code, customInput);
      const lastStep = steps[steps.length - 1];
      if (lastStep?.error) {
        setOutput(lastStep.outputs.join("\n") + "\n\n[Error] Execution Error:\n" + lastStep.error);
      } else {
        setOutput(lastStep ? lastStep.outputs.join("\n") : "Program ran successfully (no output).");
      }
      setStatus(""); // Reset autograder success/error for custom test
      return;
    }

    setOutput("Running tests...");
    setActiveTab("results");

    try {
      await new Promise((r) => setTimeout(r, 300));
      const result = await runDynamicTests();

      if (result.passed || result.success) {
        setStatus("success");
        if (slug && projectId) {
          await authFetch("/projects/complete", {
            method: "POST",
            body: JSON.stringify({ courseSlug: slug, lectureId: number, projectId })
          });
        }
        setOutput(result.message || "[OK] All test cases passed!");
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
        if (slug && projectId) {
          await authFetch("/projects/complete", {
            method: "POST",
            body: JSON.stringify({ courseSlug: slug, lectureId: number, projectId })
          });
        }
        setOutput("[OK] Submission Successful!\n\nAll hidden test cases passed.");
        setFailureAnalysis(null);
      } else {
        setStatus("error");
        setOutput(`[Error] Submission Failed.\n\n${result.message || "Please review your logic."}`);
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
          <div className="flex items-center justify-between gap-4 mb-3">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              {slug === "cs50p" ? "CS50 Python" : "AI"} • Lecture {number}
            </span>
            
            {/* Problem Navigation Links */}
            <div className="flex items-center gap-1.5">
              {currentProblemIndex > 0 ? (
                <Link
                  to={`/course/${slug}/lecture/${number}/project/${problems[currentProblemIndex - 1].slug}`}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700/80 border border-slate-750 rounded-lg text-xs font-semibold text-slate-300 transition-colors"
                >
                  ← Previous
                </Link>
              ) : (
                <span className="px-2.5 py-1 bg-slate-900/60 border border-slate-800 rounded-lg text-xs font-semibold text-slate-650 cursor-not-allowed select-none">
                  ← Previous
                </span>
              )}

              {currentProblemIndex >= 0 && currentProblemIndex < problems.length - 1 ? (
                <Link
                  to={`/course/${slug}/lecture/${number}/project/${problems[currentProblemIndex + 1].slug}`}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700/80 border border-slate-750 rounded-lg text-xs font-semibold text-slate-300 transition-colors"
                >
                  Next →
                </Link>
              ) : (
                <span className="px-2.5 py-1 bg-slate-900/60 border border-slate-800 rounded-lg text-xs font-semibold text-slate-650 cursor-not-allowed select-none">
                  Next →
                </span>
              )}
            </div>
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

        {/* Accordions Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Description Section */}
          <div className="border border-slate-800/85 rounded-xl overflow-hidden bg-[#0c1015]/40">
            <button
              onClick={() => toggleSection("description")}
              className="w-full flex items-center justify-between px-5 py-3 bg-slate-900/60 text-left font-bold text-xs text-slate-200 border-b border-slate-800/80 hover:bg-slate-900 transition-colors"
            >
              <span>Problem Description</span>
              <span className="text-[10px]">{expandedSections.description ? "▼" : "▶"}</span>
            </button>
            {expandedSections.description && (
              <div className="p-5 prose prose-invert max-w-none text-xs leading-relaxed text-slate-300">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {question}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Understanding Section */}
          {understanding && (
            <div className="border border-slate-800/85 rounded-xl overflow-hidden bg-[#0c1015]/40">
              <button
                onClick={() => toggleSection("understanding")}
                className="w-full flex items-center justify-between px-5 py-3 bg-slate-900/60 text-left font-bold text-xs text-slate-200 border-b border-slate-800/80 hover:bg-slate-900 transition-colors"
              >
                <span>Understanding & Background</span>
                <span className="text-[10px]">{expandedSections.understanding ? "▼" : "▶"}</span>
              </button>
              {expandedSections.understanding && (
                <div className="p-5 prose prose-invert max-w-none text-xs leading-relaxed text-slate-300">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {understanding}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Specification Section */}
          {specification && (
            <div className="border border-slate-800/85 rounded-xl overflow-hidden bg-[#0c1015]/40">
              <button
                onClick={() => toggleSection("specification")}
                className="w-full flex items-center justify-between px-5 py-3 bg-slate-900/60 text-left font-bold text-xs text-slate-200 border-b border-slate-800/80 hover:bg-slate-900 transition-colors"
              >
                <span>Specification & Constraints</span>
                <span className="text-[10px]">{expandedSections.specification ? "▼" : "▶"}</span>
              </button>
              {expandedSections.specification && (
                <div className="p-5 prose prose-invert max-w-none text-xs leading-relaxed text-slate-300">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {specification}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Hints Section */}
          {hints && (
            <div className="border border-slate-800/85 rounded-xl overflow-hidden bg-[#0c1015]/40">
              <button
                onClick={() => toggleSection("hints")}
                className="w-full flex items-center justify-between px-5 py-3 bg-slate-900/60 text-left font-bold text-xs text-slate-200 border-b border-slate-800/80 hover:bg-slate-900 transition-colors"
              >
                <span>Hints & Guidance</span>
                <span className="text-[10px]">{expandedSections.hints ? "▼" : "▶"}</span>
              </button>
              {expandedSections.hints && (
                <div className="p-5 prose prose-invert max-w-none text-xs leading-relaxed text-slate-300">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {hints}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Testing Section */}
          {testing && (
            <div className="border border-slate-800/85 rounded-xl overflow-hidden bg-[#0c1015]/40">
              <button
                onClick={() => toggleSection("testing")}
                className="w-full flex items-center justify-between px-5 py-3 bg-slate-900/60 text-left font-bold text-xs text-slate-200 border-b border-slate-800/80 hover:bg-slate-900 transition-colors"
              >
                <span>Testing Requirements</span>
                <span className="text-[10px]">{expandedSections.testing ? "▼" : "▶"}</span>
              </button>
              {expandedSections.testing && (
                <div className="p-5 prose prose-invert max-w-none text-xs leading-relaxed text-slate-300">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {testing}
                  </ReactMarkdown>
                </div>
              )}
            </div>
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
            
            {/* Hidden Input file reader */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".py,.txt"
              className="hidden"
            />
            
            {/* Upload Action */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-300 transition-colors cursor-pointer"
            >
              <FolderUp className="w-3 h-3" /> Upload File
            </button>
            
            {/* Download Action */}
            <button
              onClick={handleDownloadCode}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-300 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" /> Download
            </button>
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

        {/* Code Editor Area with Left Gutter Gutter */}
        <div className="flex-1 flex overflow-hidden bg-[#090d12]">
          
          {/* Scroll Synced Line Number Gutter */}
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

          {/* Text Area Input overlaid with Prism Syntax Highlighter */}
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
            
            {/* Inline lint warnings */}
            {syntaxError && (
              <div className="absolute bottom-4 right-4 bg-red-900/90 text-red-200 px-3.5 py-1.5 rounded-lg shadow-xl border border-red-750/80 z-20 pointer-events-none text-[10px] font-semibold animate-pulse">
                <AlertTriangle className="w-3 h-3 inline" /> {syntaxError}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM TABBED CONSOLE */}
        <div className="h-[250px] md:h-[280px] flex-shrink-0 flex flex-col bg-[#0b0f14] border-t border-slate-800">
          
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

          {/* Console Action Footer */}
          <div className="flex-shrink-0 bg-[#10141b] border-t border-slate-800 px-6 py-2.5 flex justify-between items-center h-12">
            <div className="text-slate-500 text-[10px]">
              Press <kbd className="bg-slate-800 px-1 py-0.5 rounded text-[9px] text-slate-400 border border-slate-750">Ctrl+Enter</kbd> to Run
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleSaveCode}
                className="px-3 py-1.5 border border-slate-700 bg-slate-800 hover:bg-slate-750 rounded-xl text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={handleRun}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/10 transition-all cursor-pointer"
              >
                Run Code
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-md shadow-green-900/10 transition-all cursor-pointer"
              >
                Submit Code
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
