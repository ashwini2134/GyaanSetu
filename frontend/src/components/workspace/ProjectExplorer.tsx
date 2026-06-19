import { FileCode, FileType, FileJson, FolderOpen } from "lucide-react";

export interface WorkspaceFile {
  id: string;
  name: string;
  language: string;
}

interface ProjectExplorerProps {
  files: WorkspaceFile[];
  activeFile: string;
  onSelectFile: (id: string) => void;
}

const FILE_ICONS: Record<string, typeof FileCode> = {
  html: FileCode,
  css: FileType,
  javascript: FileJson,
  js: FileJson,
};

export default function ProjectExplorer({ files, activeFile, onSelectFile }: ProjectExplorerProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
        <FolderOpen size={14} className="text-slate-500" />
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Explorer</span>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {files.map((file) => {
          const Icon = FILE_ICONS[file.language] || FileCode;
          const isActive = file.id === activeFile;
          return (
            <button
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs transition-all duration-150 ${
                isActive
                  ? "bg-blue-500/10 text-blue-300 border-l-2 border-blue-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border-l-2 border-transparent"
              }`}
            >
              <Icon size={14} className={isActive ? "text-blue-400" : "text-slate-500"} />
              <span className="truncate font-medium">{file.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
