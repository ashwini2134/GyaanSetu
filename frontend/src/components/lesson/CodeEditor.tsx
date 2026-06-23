import { useRef, useState, useEffect, useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { runPython, normalizeNumbers, stripPrompts } from '../../utils/pythonRunner';
import { scanForInput, injectInputs, type InputField } from '../../utils/prescanner';

interface CodeEditorProps {
  initialCode: string;
  language?: string;
  readOnly?: boolean;
  height?: string;
  showRunButton?: boolean;
  showResetButton?: boolean;
  showSaveButton?: boolean;
  showSubmitButton?: boolean;
  expectedOutput?: string;
  solution?: string;
  onChange?: (code: string) => void;
  onRun?: (code: string, output: string, error: string | null) => void;
  onSubmit?: (code: string, output: string, error: string | null, expectedOutput?: string) => void;
  onSave?: (code: string) => void;
  onReset?: () => void;
}

const ERROR_TRANSLATIONS: Record<string, (msg: string) => string> = {
  'SyntaxError: EOL while scanning string literal': () =>
    'You forgot to close a string with a matching quote mark.',
  'SyntaxError: EOF while scanning triple-quoted string literal': () =>
    'You started a triple-quoted string but didn\'t close it.',
  'SyntaxError: unexpected EOF while parsing': (msg) =>
    msg.includes(')') ? 'You opened a parenthesis but forgot to close it.' : 'Python reached the end of your code and found something unexpected.',
  'SyntaxError: unmatched': (msg) => {
    if (msg.includes("'") ) return 'You have an unmatched bracket or parenthesis.';
    return 'There\'s a syntax error in your code — check your brackets and parentheses.';
  },
  'NameError: name': (msg) => {
    const m = msg.match(/name '(\w+)'/);
    return m ? `You're using the variable "${m[1]}" but it hasn't been defined yet. Did you spell it correctly?` : 'You\'re using a variable name that hasn\'t been defined.';
  },
  'TypeError: unsupported operand': () =>
    'You\'re trying to combine two values that don\'t work together (like adding text and a number).',
  'ZeroDivisionError: division by zero': () =>
    'You tried to divide by zero, which is not allowed in math.',
  'IndentationError': () =>
    'Your indentation is inconsistent. Make sure all lines in a block start with the same number of spaces.',
  'ValueError: invalid literal for int()': () =>
    'You tried to convert something to a number, but Python doesn\'t recognize it as a valid number.',
  'ValueError: could not convert string to float': () =>
    'You tried to convert a string to a decimal number, but Python doesn\'t recognize it.',
  'return outside function': () =>
    'You used "return" outside of a function. Return can only be used inside a function body.',
};

function friendlyError(error: string): string {
  if (!error) return error;
  for (const [key, fn] of Object.entries(ERROR_TRANSLATIONS)) {
    if (error.includes(key)) return fn(error);
  }
  const lines = error.split('\n');
  const lastLine = lines[lines.length - 1]?.trim() ?? '';
  if (lastLine && !lastLine.includes('Traceback')) return lastLine;
  return error;
}

export default function CodeEditor({
  initialCode,
  language = 'python',
  readOnly = false,
  height = '180px',
  showRunButton = true,
  showResetButton = true,
  showSaveButton = false,
  showSubmitButton = false,
  expectedOutput,
  solution,
  onChange,
  onRun,
  onSubmit,
  onSave,
  onReset,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [running, setRunning] = useState(false);
  const [inputFields, setInputFields] = useState<InputField[]>([]);
  const [showInputPanel, setShowInputPanel] = useState(false);
  const [prompts, setPrompts] = useState<string[]>([]);
  const pendingAction = useRef<'run' | 'submit' | null>(null);
  const pendingCodeRef = useRef<string>('');
  const lastInjectedRef = useRef<string>('');
  const lastRawCodeRef = useRef<string>('');
  const editorRef = useRef<any>(null);
  const userEditedRef = useRef(false);

  useEffect(() => {
    if (!userEditedRef.current) {
      setCode(initialCode);
      if (editorRef.current) {
        editorRef.current.setValue(initialCode);
      }
    }
  }, [initialCode]);

  const handleChange = (val: string | undefined) => {
    const v = val ?? '';
    userEditedRef.current = true;
    setCode(v);
    onChange?.(v);
  };

  const executeCode = useCallback((finalCode: string, notify: 'run' | 'submit', dynamicExpected?: string) => {
    setRunning(true);
    setOutput(null);
    setRunError(null);
    setPrompts([]);
    setTimeout(() => {
      try {
        const result = runPython(finalCode);
        setOutput(result.output);
        setPrompts(result.prompts || []);
        if (result.error) {
          setRunError(friendlyError(result.error));
        }
        if (notify === 'run') onRun?.(finalCode, result.output, result.error ? friendlyError(result.error) : null);
        if (notify === 'submit') onSubmit?.(finalCode, result.output, result.error ? friendlyError(result.error) : null, dynamicExpected);
      } finally {
        setRunning(false);
      }
    }, 50);
  }, [onRun, onSubmit]);

  const doRun = useCallback((notify: 'run' | 'submit') => {
    if (running) return;

    // If we already have injected code AND the raw code hasn't changed, reuse it
    if (lastInjectedRef.current && lastRawCodeRef.current === code) {
      executeCode(lastInjectedRef.current, notify);
      return;
    }
    // Code changed, clear cached injection
    lastInjectedRef.current = '';
    lastRawCodeRef.current = '';

    const scanned = scanForInput(code);
    if (scanned.hasInput && !showInputPanel) {
      setInputFields(scanned.fields);
      pendingAction.current = notify;
      pendingCodeRef.current = scanned.replacedCode;
      setShowInputPanel(true);
      return;
    }
    if (showInputPanel && pendingAction.current) {
      const values = inputFields.map(f => f.value);
      const injected = injectInputs(pendingCodeRef.current, values);
      lastInjectedRef.current = injected;
      lastRawCodeRef.current = code;
      setShowInputPanel(false);
      pendingAction.current = null;
      pendingCodeRef.current = '';

      // If solution is provided, compute dynamic expected output with same values
      let dynamicExpected: string | undefined;
      if (solution && notify === 'submit') {
        const scannedSol = scanForInput(solution);
        if (scannedSol.hasInput) {
          const solInjected = injectInputs(scannedSol.replacedCode, values);
          const solResult = runPython(solInjected);
          if (!solResult.error) dynamicExpected = solResult.output;
        }
      }
      executeCode(injected, notify, dynamicExpected);
      return;
    }
    executeCode(code, notify);
  }, [code, running, showInputPanel, inputFields, executeCode, solution]);

  const handleInputChange = (id: number, value: string) => {
    setInputFields(prev => prev.map(f => f.id === id ? { ...f, value } : f));
  };

  const handleInputSubmit = () => {
    if (pendingAction.current) {
      doRun(pendingAction.current);
    }
  };

  const handleRun = () => doRun('run');
  const handleSubmit = () => doRun('submit');

  const dismissInputPanel = () => {
    setShowInputPanel(false);
    setInputFields([]);
    pendingAction.current = null;
    pendingCodeRef.current = '';
  };

  const handleSave = () => {
    onSave?.(code);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput(null);
    setRunError(null);
    setSaved(false);
    lastInjectedRef.current = '';
    lastRawCodeRef.current = '';
    if (editorRef.current) {
      editorRef.current.setValue(initialCode);
    }
    onReset?.();
  };

  const cleanOutput = output ? stripPrompts(output, prompts) : '';
  const cleanExpected = expectedOutput ? stripPrompts(expectedOutput, prompts) : '';

  const isCorrect = expectedOutput !== undefined && output !== null &&
    !runError && normalizeNumbers(cleanOutput.trim()) === normalizeNumbers(cleanExpected.trim());

  const isWrong = expectedOutput !== undefined && output !== null &&
    !runError && normalizeNumbers(cleanOutput.trim()) !== normalizeNumbers(cleanExpected.trim());

  const hasError = runError !== null;

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700/40 bg-[#1e1e1e]">
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-800/60 border-b border-slate-700/40">
        <span className="w-3 h-3 rounded-full bg-red-500/70" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <span className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="ml-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider flex-1">
          {language}
        </span>
        <div className="flex items-center gap-1">
          {showSaveButton && (
            <button
              onClick={handleSave}
              className="px-2 py-1 text-[10px] font-medium text-blue-400 hover:text-blue-300 rounded bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all"
            >
              {saved ? 'Saved' : 'Save'}
            </button>
          )}
          {showResetButton && !readOnly && (
            <button
              onClick={handleReset}
              className="p-1 text-slate-400 hover:text-slate-200 rounded bg-slate-700/40 hover:bg-slate-700/70 transition-all"
              title="Reset code"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          {/* Removed Run and Submit buttons from here */}
        </div>
      </div>

      {/* Monaco Editor */}
      <MonacoEditor
        height={height}
        language={language}
        value={code}
        onChange={handleChange}
        theme="vs-dark"
        onMount={(editor) => { editorRef.current = editor; }}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          padding: { top: 10, bottom: 10 },
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontLigatures: true,
          renderLineHighlight: 'line',
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          scrollbar: { vertical: 'hidden', horizontal: 'hidden', alwaysConsumeMouseWheel: false },
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: true,
          wordWrap: 'on',
        }}
      />

      {/* Input Panel */}
      {showInputPanel && (
        <div className="border-t border-blue-700/40 bg-slate-900/80 px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">Input Required</span>
          </div>
          <div className="space-y-2">
            {inputFields.map((field, i) => (
              <div key={field.id}>
                {field.prompt && (
                  <label className="text-[11px] text-slate-400 mb-1 block">{field.prompt}</label>
                )}
                <input
                  type="text"
                  value={field.value}
                  onChange={e => handleInputChange(field.id, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && field.value) handleInputSubmit(); }}
                  placeholder={field.prompt || `Input #${i + 1}`}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  autoFocus={i === 0}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleInputSubmit}
              disabled={running}
              className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all"
            >
              {running ? 'Running...' : `Run with Inputs`}
            </button>
            <button
              onClick={dismissInputPanel}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-lg bg-slate-700/40 hover:bg-slate-700/70 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action Bar (Run/Submit) */}
      {(!readOnly && (showRunButton || showSubmitButton)) && !showInputPanel && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/30 border-t border-slate-700/40">
          <div>
            {showRunButton && (
              <button
                onClick={handleRun}
                disabled={running}
                className="px-4 py-2 text-xs font-semibold text-white rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {running ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                )}
                {running ? 'Running...' : 'Run Code'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {showSubmitButton && (
              <button
                onClick={handleSubmit}
                disabled={running}
                className="px-4 py-2 text-xs font-semibold text-white rounded-lg bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {running ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {running ? 'Submitting...' : 'Submit Solution'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Output */}
      {(hasError || output !== null) && (
        <div className={`border-t ${
          hasError ? 'border-red-700/40' :
          isCorrect ? 'border-green-700/40' :
          isWrong ? 'border-amber-700/40' :
          'border-slate-700/40'
        }`}>
          {/* Output section */}
          <div className="px-4 py-1.5 bg-slate-800/40 border-b border-slate-700/30 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Output</span>
          </div>
          {hasError ? (
            <pre className="px-4 py-3 text-sm font-mono leading-relaxed text-slate-500 italic">
              No output generated
            </pre>
          ) : (
            <pre className="px-4 py-3 text-sm font-mono leading-relaxed text-green-300">
              {output}
            </pre>
          )}
          {/* Console section */}
          <div className={`px-4 py-1.5 border-t flex items-center gap-2 ${
            hasError ? 'bg-red-900/20 border-red-700/30 text-red-400' :
            'bg-green-900/10 border-green-700/20 text-green-400'
          }`}>
            {hasError ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="text-[10px] font-semibold uppercase tracking-wider">Console</span>
          </div>
          {hasError ? (
            <pre className="px-4 py-3 text-sm font-mono leading-relaxed text-red-300 whitespace-pre-wrap">
              {runError}
            </pre>
          ) : (
            <div className="px-4 py-2 text-sm text-green-400 font-mono">
              ✓ No errors
            </div>
          )}
        </div>
      )}
      {!readOnly && output === null && !hasError && (
        <div className="border-t border-slate-700/30 px-4 py-3 bg-slate-800/20">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Output</span>
          </div>
          <p className="text-sm text-slate-500 italic">Run the code to see output</p>
        </div>
      )}
    </div>
  );
}
