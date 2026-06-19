import { useRef, useEffect, useState } from "react";

interface LivePreviewProps {
  html: string;
  css: string;
  js: string;
}

export default function LivePreview({ html, css, js }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!iframeRef.current) return;
    setLoading(true);
    const srcdoc = `
<!DOCTYPE html>
<html>
<head>
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>${js}<\/script>
</body>
</html>`;
    iframeRef.current.srcdoc = srcdoc;
  }, [html, css, js]);

  const handleLoad = () => setLoading(false);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5 flex-shrink-0">
        <div className="flex gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ml-2">Preview</span>
        {loading && <span className="text-[10px] text-slate-600 ml-auto animate-pulse">Rendering...</span>}
      </div>
      <div className="flex-1 relative">
        {!html && !css && !js ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/40 p-6 text-center">
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px]">
              Start writing code to see a live preview.
            </p>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            onLoad={handleLoad}
            title="Live Preview"
            className="absolute inset-0 w-full h-full border-0"
            sandbox="allow-scripts"
          />
        )}
      </div>
    </div>
  );
}
