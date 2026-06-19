import { useRef, useEffect } from "react";
import { XCircle, CheckCircle2, Terminal, AlertTriangle } from "lucide-react";

export interface ConsoleMessage {
  id: string;
  type: "info" | "success" | "error" | "warning";
  text: string;
  timestamp: number;
}

interface BottomConsoleProps {
  messages: ConsoleMessage[];
}

export default function BottomConsole({ messages }: BottomConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const iconMap = {
    info: Terminal,
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
  };

  const colorMap = {
    info: "text-slate-400",
    success: "text-green-300",
    error: "text-red-300",
    warning: "text-amber-300",
  };

  const iconColorMap = {
    info: "text-slate-500",
    success: "text-green-400",
    error: "text-red-400",
    warning: "text-amber-400",
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="border-t border-white/10 bg-slate-900/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-1.5 border-b border-white/5">
        <Terminal size={12} className="text-slate-500" />
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Console</span>
        {hasMessages && (
          <span className="text-[10px] text-slate-600">{messages.length} message{messages.length !== 1 ? "s" : ""}</span>
        )}
      </div>
      <div ref={scrollRef} className="h-[100px] overflow-y-auto px-4 py-2 font-mono text-[11px] space-y-0.5">
        {!hasMessages && (
          <p className="text-slate-600 italic py-1">Start editing code to see output here.</p>
        )}
        {messages.map((msg) => {
          const Icon = iconMap[msg.type];
          return (
            <div key={msg.id} className="flex items-start gap-2 py-0.5">
              <Icon size={11} className={`${iconColorMap[msg.type]} mt-0.5 flex-shrink-0`} />
              <span className={colorMap[msg.type]}>
                {msg.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
