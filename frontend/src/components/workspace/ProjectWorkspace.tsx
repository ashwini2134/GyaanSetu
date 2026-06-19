import { useState, useEffect, useCallback, useRef } from "react";
import { Play, RotateCcw, Save, Files, CheckCircle2, Download, MoreHorizontal, Sparkles } from "lucide-react";
import type { Project } from "../../data/projectsData";
import { useProjectTasks } from "../../hooks/useProjectTasks";
import { validateTask, allRulesPass } from "../../utils/validationEngine";
import { authFetch } from "../../authClient";
import CodeWorkspace from "./CodeWorkspace";
import LivePreview from "./LivePreview";
import BottomConsole from "./BottomConsole";
import type { ConsoleMessage } from "./BottomConsole";
import ProjectGuide from "./ProjectGuide";

interface ProjectWorkspaceProps {
  project: Project;
  currentStatus: string;
  startProject: (id: string) => void;
  completeProject: (id: string, data: { githubUrl: string; liveDemoUrl?: string; description: string }) => void;
}

function getStarterCode(project: Project, fileId: string): string {
  if (project.starterCode) {
    switch (fileId) {
      case "html": return project.starterCode.html || "";
      case "css": return project.starterCode.css || "";
      case "js": return project.starterCode.js || "";
    }
  }
  return "";
}

let msgCounter = 0;

export default function ProjectWorkspace({ project, currentStatus, startProject, completeProject }: ProjectWorkspaceProps) {
  const tasks = project.tasks || [];
  const files = project.workspaceFiles || [
    { id: "html", path: "index.html", language: "html" },
    { id: "css", path: "style.css", language: "css" },
    { id: "js", path: "script.js", language: "javascript" },
  ];
  const { taskStatuses, startTask, completeTask, completedCount, totalCount } = useProjectTasks(project.id, tasks.length);

  const [activeFile, setActiveFile] = useState(files[0]?.id || "html");
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [codeMap, setCodeMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const f of files) {
      map[f.id] = getStarterCode(project, f.id);
    }
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [validationResults, setValidationResults] = useState<{ ruleId: string; label: string; passed: boolean }[]>([]);
  const [filesLoaded, setFilesLoaded] = useState(false);

  const initialCodeMap = useRef<Record<string, string>>({ ...codeMap });

  const addMessage = useCallback((type: ConsoleMessage["type"], text: string) => {
    msgCounter++;
    setConsoleMessages(prev => [...prev, { id: `msg-${msgCounter}`, type, text, timestamp: Date.now() }]);
  }, []);

  const currentTask = tasks[currentTaskIndex];
  const isCurrentStepComplete = currentTask ? taskStatuses[currentTask.id]?.status === "COMPLETED" : false;
  const allTasksDone = completedCount === totalCount && totalCount > 0;
  const hasCode = Object.values(codeMap).some(c => c.length > 0);

  /* Load files from backend on mount */
  useEffect(() => {
    (async () => {
      try {
        const data = await authFetch<Record<string, string> | null>(`/projects/files/${project.id}`);
        if (data) {
          setCodeMap(prev => {
            const merged = { ...prev };
            for (const key of Object.keys(data)) {
              if (data[key]) merged[key] = data[key];
            }
            initialCodeMap.current = { ...merged };
            return merged;
          });
        }
      } catch {
        // no saved files
      } finally {
        setFilesLoaded(true);
        addMessage("success", "Workspace ready");
      }
    })();
  }, [project.id]);

  /* Start project if not started */
  useEffect(() => {
    if (currentStatus === "NOT_STARTED") {
      startProject(project.id);
    }
  }, [currentStatus, project.id, startProject]);

  /* Auto-start first task */
  useEffect(() => {
    const firstTask = tasks[0];
    if (firstTask && (!taskStatuses[firstTask.id] || taskStatuses[firstTask.id].status === "NOT_STARTED")) {
      startTask(firstTask.id);
    }
  }, [tasks, taskStatuses, startTask]);

  /* Auto-advance when current step completes */
  useEffect(() => {
    if (currentTask && taskStatuses[currentTask.id]?.status === "COMPLETED") {
      const nextIdx = tasks.findIndex((t, i) => i > currentTaskIndex && taskStatuses[t.id]?.status !== "COMPLETED");
      if (nextIdx !== -1) {
        setTimeout(() => {
          setCurrentTaskIndex(nextIdx);
          setValidationResults([]);
          addMessage("success", "Moving to next step...");
        }, 1000);
      }
    }
  }, [taskStatuses, currentTask, currentTaskIndex, tasks]);

  const handleCodeChange = useCallback((fileId: string, val: string) => {
    setCodeMap(prev => ({ ...prev, [fileId]: val }));
  }, []);

  const handleCheckProgress = useCallback(() => {
    const htmlCode = codeMap["html"] || "";
    const cssCode = codeMap["css"] || "";
    const jsCode = codeMap["js"] || "";

    addMessage("info", "Checking your work...");

    if (currentTask) {
      const results = validateTask(currentTask.validationRules, htmlCode, cssCode, jsCode);
      setValidationResults(results.map(r => ({
        ruleId: r.ruleId,
        label: r.label,
        passed: r.passed,
      })));

      const passedCount = results.filter(r => r.passed).length;
      addMessage("info", `Requirements: ${passedCount}/${results.length} passed`);

      if (allRulesPass(results)) {
        const status = taskStatuses[currentTask.id]?.status;
        if (status !== "COMPLETED") {
          completeTask(currentTask.id);
          addMessage("success", `✓ ${currentTask.title} — completed!`);
        } else {
          addMessage("success", `${currentTask.title} — already completed`);
        }
      } else {
        const failed = results.filter(r => !r.passed);
        for (const f of failed) {
          addMessage("warning", `✗ ${f.label} — not yet`);
        }
      }
    }
  }, [codeMap, currentTask, taskStatuses, completeTask, addMessage]);

  const handleReset = useCallback(() => {
    setCodeMap({ ...initialCodeMap.current });
    setValidationResults([]);
    addMessage("info", "Code reset to saved version");
  }, [addMessage]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      for (const [fileId, content] of Object.entries(codeMap)) {
        await authFetch(`/projects/files/${project.id}`, {
          method: 'PUT',
          body: JSON.stringify({ fileId, content }),
        });
      }
      initialCodeMap.current = { ...codeMap };
      addMessage("success", "All files saved");
    } catch {
      addMessage("error", "Failed to save files");
    } finally {
      setSaving(false);
    }
  }, [project.id, codeMap, addMessage]);

  const handleDownload = useCallback(async () => {
    try {
      const token = localStorage.getItem("fa_token");
      const response = await fetch(`/api/projects/download/${project.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.id}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addMessage("success", "Project downloaded");
    } catch {
      addMessage("error", "Failed to download project");
    }
  }, [project.id, addMessage]);

  const handlePrevStep = useCallback(() => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(i => i - 1);
      setValidationResults([]);
    }
  }, []);

  const handleNextStep = useCallback(() => {
    const idx = currentTaskIndex + 1;
    if (idx < tasks.length) {
      setCurrentTaskIndex(idx);
      setValidationResults([]);
      const task = tasks[idx];
      if (task) {
        const status = taskStatuses[task.id]?.status;
        if (status === "NOT_STARTED" || !status) {
          startTask(task.id);
        }
      }
    }
  }, [currentTaskIndex, tasks, taskStatuses, startTask]);

  const handleSubmitProject = useCallback(async () => {
    setSubmitting(true);
    try {
      await completeProject(project.id, { githubUrl: "", description: "Project completed via workspace" });
      setSubmitSuccess(true);
      addMessage("success", "Project submitted successfully");
    } catch {
      addMessage("error", "Failed to submit project");
    } finally {
      setSubmitting(false);
    }
  }, [project.id, completeProject, addMessage]);

  return (
    <div className="h-full flex flex-col bg-[#0a0f1e]">
      {/* TOP BAR */}
      <div className="flex items-center h-10 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl flex-shrink-0 px-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Files size={13} className="text-slate-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-white truncate">{project.title}</span>
        </div>

        {/* File tabs */}
        <div className="flex items-center h-full -mb-px ml-2">
          {files.map(file => {
            const isActive = file.id === activeFile;
            return (
              <button
                key={file.id}
                onClick={() => setActiveFile(file.id)}
                className={`flex items-center gap-1.5 px-2.5 h-full text-[10px] font-medium transition-all border-b-2 ${
                  isActive
                    ? "text-blue-300 border-blue-400 bg-blue-500/5"
                    : "text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5"
                }`}
              >
                {file.id === "html" ? "index.html" : file.id === "css" ? "style.css" : file.id === "js" ? "script.js" : file.name || file.id}
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCheckProgress}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-all active:scale-95 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
          >
            <Play size={12} />
            Run Project
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-medium transition-all border border-white/10 disabled:opacity-50"
          >
            <Save size={11} />
            Save
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-medium transition-all border border-white/10"
            >
              <MoreHorizontal size={11} />
            </button>
            {showMoreActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMoreActions(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-lg bg-slate-800 border border-white/10 shadow-xl overflow-hidden">
                  <button
                    onClick={() => { handleDownload(); setShowMoreActions(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    <Download size={11} />
                    Download ZIP
                  </button>
                  <button
                    onClick={() => { handleReset(); setShowMoreActions(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    <RotateCcw size={11} />
                    Reset Code
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT: Guide | Editor | Preview */}
      <div className="flex-1 flex min-h-0">
        {/* Guide (permanent left panel) */}
        <div className="w-[300px] border-r border-white/10 flex-shrink-0 overflow-hidden">
          <ProjectGuide
            project={project}
            task={currentTask}
            taskIndex={currentTaskIndex}
            totalTasks={tasks.length}
            isCompleted={isCurrentStepComplete}
            completedCount={completedCount}
            validationResults={validationResults}
            onPrev={handlePrevStep}
            onNext={handleNextStep}
            onCheckProgress={handleCheckProgress}
          />
        </div>

        {/* Editor */}
        <div className="flex-[3] min-w-0 border-r border-white/10 bg-slate-900/60">
          <CodeWorkspace
            activeFile={activeFile}
            code={codeMap[activeFile] || ""}
            onChange={(val) => handleCodeChange(activeFile, val)}
          />
        </div>

        {/* Preview */}
        <div className="flex-[2] min-w-[300px] bg-slate-900/40 overflow-hidden">
          <LivePreview
            html={codeMap["html"] || ""}
            css={codeMap["css"] || ""}
            js={codeMap["js"] || ""}
          />
        </div>
      </div>

      {/* CONSOLE */}
      <BottomConsole messages={consoleMessages} />

      {/* SUBMIT BAR */}
      {allTasksDone && (
        <div className="flex items-center justify-end px-4 py-1.5 border-t border-white/5 bg-slate-900/60 flex-shrink-0">
          {!submitSuccess ? (
            <button
              onClick={handleSubmitProject}
              disabled={submitting}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-[11px] font-semibold transition-all disabled:opacity-50"
            >
              <CheckCircle2 size={12} />
              {submitting ? "Submitting..." : "Submit Project"}
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] text-green-400 font-semibold">
              <CheckCircle2 size={12} />
              Submitted
            </span>
          )}
        </div>
      )}
    </div>
  );
}
