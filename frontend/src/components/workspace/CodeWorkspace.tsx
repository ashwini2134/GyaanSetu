import { useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";

interface CodeWorkspaceProps {
  activeFile: string;
  code: string;
  onChange: (val: string) => void;
}

const LANG_MAP: Record<string, string> = {
  html: "html",
  css: "css",
  js: "javascript",
  javascript: "javascript",
};

export default function CodeWorkspace({ activeFile, code, onChange }: CodeWorkspaceProps) {
  const handleChange = useCallback((val: string | undefined) => {
    onChange(val || "");
  }, [onChange]);

  return (
    <div className="h-full w-full">
      <MonacoEditor
        height="100%"
        language={LANG_MAP[activeFile] || "html"}
        value={code}
        onChange={handleChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: "on",
          padding: { top: 12 },
          renderLineHighlight: "line",
          cursorBlinking: "smooth",
          smoothScrolling: true,
          overviewRulerBorder: false,
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
        loading={
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            Loading editor...
          </div>
        }
      />
    </div>
  );
}
