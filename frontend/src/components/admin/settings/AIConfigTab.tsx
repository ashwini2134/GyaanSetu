import React, { useState, useEffect } from "react";
import { Save, RefreshCcw, Eye, EyeOff, ShieldCheck, CheckSquare, BrainCircuit, Search, Play } from "lucide-react";
import { authFetch } from "../../../authClient";

export default function AIConfigTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [toastMessage, setToastMessage] = useState<{msg: string, type: 'success'|'error'}|null>(null);

  const [config, setConfig] = useState({
    provider: "google",
    apiKey: "",
    model: "gemini-2.0-flash",
    strictnessLevel: "balanced",
    passScoreRegular: 70,
    passScoreCapstone: 80,
    maxAttemptsRegular: 3,
    maxAttemptsCapstone: 2,
    securityCheckEnabled: true,
    validationEnabled: true,
    aiReviewEnabled: true,
  });

  const [originalConfig, setOriginalConfig] = useState({ ...config });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await authFetch<any>("/admin/ai-config");
      if (data) {
        const safeData = {
          provider: data.provider || "google",
          apiKey: data.apiKey || "",
          model: data.model || "gemini-2.0-flash",
          strictnessLevel: data.strictnessLevel || "balanced",
          passScoreRegular: data.passScoreRegular ?? 70,
          passScoreCapstone: data.passScoreCapstone ?? 80,
          maxAttemptsRegular: data.maxAttemptsRegular ?? 3,
          maxAttemptsCapstone: data.maxAttemptsCapstone ?? 2,
          securityCheckEnabled: data.securityCheckEnabled ?? true,
          validationEnabled: data.validationEnabled ?? true,
          aiReviewEnabled: data.aiReviewEnabled ?? true,
        };
        setConfig(safeData);
        setOriginalConfig(safeData);
      }
    } catch (err) {
      console.error("Failed to fetch AI config", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setConfig((prev) => {
      const next = { ...prev, [field]: value };
      setIsDirty(JSON.stringify(next) !== JSON.stringify(originalConfig));
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await authFetch<any>("/admin/ai-config", {
        method: "POST",
        body: JSON.stringify(config)
      });
      const safeData = { ...config, apiKey: res.apiKey || config.apiKey };
      setConfig(safeData);
      setOriginalConfig(safeData);
      setIsDirty(false);
      showToast("AI configuration saved ✓", "success");
    } catch (err) {
      showToast("Failed to save AI config.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      const res = await authFetch<any>("/admin/ai-config/test-key", {
        method: "POST",
        body: JSON.stringify({ provider: config.provider, apiKey: config.apiKey })
      });
      if (res.success) {
        showToast("Connection successful! AI reviews are active.", "success");
      } else {
        showToast(res.message || "Connection failed. Please check your API key.", "error");
      }
    } catch (err) {
      showToast("Connection failed. Please check your API key.", "error");
    } finally {
      setTesting(false);
    }
  };

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (loading) return <div className="p-8 text-[var(--text-secondary)]">Loading AI configuration...</div>;

  return (
    <div className="flex flex-col gap-6 relative pb-20">
      {toastMessage && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-xl z-50 border ${
          toastMessage.type === 'success' ? 'bg-[var(--bg-surface)] border-green-500/50 text-white' : 'bg-red-900/90 border-red-500/50 text-white'
        }`}>
          {toastMessage.msg}
        </div>
      )}

      {/* SECTION 1: AI Provider & API Key */}
      <section className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-light)] overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-[var(--border-light)]">
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest">AI Provider & API Key</h2>
        </div>
        <div className="p-6 flex flex-col gap-6">
          
          {/* Provider */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-main)] mb-1">AI Provider</label>
            <p className="text-xs text-[var(--text-muted)] mb-3">Select which AI service powers project reviews and grading.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'google', name: 'Google Gemini', desc: ['Free tier available', 'Currently active'], recommended: true },
                { id: 'anthropic', name: 'Anthropic Claude', desc: ['Requires paid API key'] },
                { id: 'mock', name: 'Mock Mode (Development)', desc: ['No API key needed', 'Returns fake results'] }
              ].map(provider => (
                <div 
                  key={provider.id}
                  onClick={() => handleChange('provider', provider.id)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    config.provider === provider.id 
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                      : 'border-[var(--border-light)] hover:border-[var(--border-light)] bg-[var(--bg-body)]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                      config.provider === provider.id ? 'border-[var(--color-primary)]' : 'border-[var(--border-light)]'
                    }`}>
                      {config.provider === provider.id && <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />}
                    </div>
                    <span className="font-medium text-[var(--text-main)]">
                      {provider.name} {provider.recommended && <span className="text-xs text-amber-500 ml-1">(Recommended)</span>}
                    </span>
                  </div>
                  <ul className="text-xs text-[var(--text-muted)] pl-6 list-disc list-outside">
                    {provider.desc.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* API Key */}
          {config.provider !== 'mock' && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-main)] mb-1">API Key</label>
              <p className="text-xs text-[var(--text-muted)] mb-3">Your API key for the selected provider. Stored securely and never shown in full.</p>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <input
                    type={showKey ? "text" : "password"}
                    value={config.apiKey}
                    onChange={(e) => handleChange("apiKey", e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg px-4 py-2.5 pr-12 text-[var(--text-main)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none font-mono text-sm"
                  />
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={handleTestConnection}
                  disabled={testing || !config.apiKey}
                  className="px-4 py-2 rounded-lg font-medium border border-[var(--border-light)] bg-[var(--bg-body)] hover:bg-[var(--bg-surface)] text-[var(--text-main)] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : null}
                  Test Connection
                </button>
              </div>
              {config.provider === 'google' && (
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-xs text-[var(--color-primary)] hover:underline mt-2 inline-block">
                  Get a free Gemini API key →
                </a>
              )}
            </div>
          )}

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-main)] mb-1">AI Model</label>
            <p className="text-xs text-[var(--text-muted)] mb-3">Which model to use for project reviews.</p>
            <select
              value={config.model}
              onChange={(e) => handleChange("model", e.target.value)}
              disabled={config.provider === 'mock'}
              className="w-full md:w-1/2 bg-[var(--bg-body)] border border-[var(--border-light)] rounded-lg px-4 py-2.5 text-[var(--text-main)] focus:border-[var(--color-primary)] outline-none disabled:opacity-50"
            >
              {config.provider === 'mock' ? (
                <option value="mock">Mock Model</option>
              ) : config.provider === 'google' ? (
                <>
                  <option value="gemini-2.0-flash">gemini-2.0-flash (Recommended, fastest)</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro (More thorough, slower)</option>
                </>
              ) : (
                <>
                  <option value="claude-sonnet-4-6">claude-sonnet-4-6 (Recommended)</option>
                  <option value="claude-haiku">claude-haiku (Faster, less detailed)</option>
                </>
              )}
            </select>
          </div>
        </div>
      </section>

      {/* SECTION 2: Review Strictness */}
      <section className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-light)] overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-[var(--border-light)]">
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest">Review Strictness</h2>
        </div>
        <div className="p-6 flex flex-col gap-6">
          <div>
            <p className="text-sm text-[var(--text-muted)] mb-4">How strictly AI evaluates student project submissions.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'lenient', name: 'Lenient', icon: '🟢', desc: ['Pass at 60%', 'Encouraging feedback'], score: 60 },
                { id: 'balanced', name: 'Balanced (Default)', icon: '🟡', desc: ['Pass at 70%', 'Fair review'], score: 70 },
                { id: 'strict', name: 'Strict', icon: '🔴', desc: ['Pass at 85%', 'High standard'], score: 85 },
              ].map(level => (
                <div 
                  key={level.id}
                  onClick={() => {
                    handleChange('strictnessLevel', level.id);
                    handleChange('passScoreRegular', level.score);
                  }}
                  className={`border rounded-xl p-4 text-center cursor-pointer transition-all ${
                    config.strictnessLevel === level.id 
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                      : 'border-[var(--border-light)] hover:border-[var(--border-light)] bg-[var(--bg-body)]'
                  }`}
                >
                  <div className="text-2xl mb-2">{level.icon}</div>
                  <h3 className="font-medium text-[var(--text-main)] mb-2">{level.name}</h3>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1">
                    {level.desc.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 rounded-lg bg-[var(--bg-body)] border border-[var(--border-light)]">
              <p className="text-sm text-[var(--text-main)]">
                Current passing score: <span className="font-bold text-[var(--color-primary)]">{config.passScoreRegular}%</span><br/>
                Students must score {config.passScoreRegular}% or above to pass.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Review Checks */}
      <section className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-light)] overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-[var(--border-light)]">
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest">Review Checks</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-[var(--text-muted)] mb-6">Choose which checks run automatically when a student submits a project.</p>
          <div className="flex flex-col gap-3">
            
            {/* Security Check */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-body)] border border-[var(--border-light)] opacity-80 cursor-not-allowed" title="Security check cannot be disabled">
              <div className="flex items-start gap-4">
                <ShieldCheck className="w-5 h-5 text-[var(--text-secondary)] mt-0.5" />
                <div>
                  <h4 className="font-medium text-[var(--text-main)]">Security Check</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Scans for malicious code or links<br/><span className="text-amber-500/80">⚠️ Recommended: Always keep enabled</span></p>
                </div>
              </div>
              <div className="w-10 h-6 bg-green-500/80 rounded-full flex items-center p-1 justify-end">
                <div className="w-4 h-4 bg-white rounded-full" />
              </div>
            </div>

            {/* Validation Rules */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-body)] border border-[var(--border-light)]">
              <div className="flex items-start gap-4">
                <CheckSquare className="w-5 h-5 text-[var(--text-secondary)] mt-0.5" />
                <div>
                  <h4 className="font-medium text-[var(--text-main)]">Validation Rules Check</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Checks format, length, required keywords</p>
                </div>
              </div>
              <button 
                onClick={() => handleChange('validationEnabled', !config.validationEnabled)}
                className={`w-10 h-6 rounded-full flex items-center p-1 transition-colors ${config.validationEnabled ? 'bg-green-500 justify-end' : 'bg-[var(--bg-surface)] justify-start'}`}
              >
                <div className="w-4 h-4 bg-white rounded-full" />
              </button>
            </div>

            {/* AI Quality Review */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-body)] border border-[var(--border-light)]">
              <div className="flex items-start gap-4">
                <BrainCircuit className="w-5 h-5 text-[var(--text-secondary)] mt-0.5" />
                <div>
                  <h4 className="font-medium text-[var(--text-main)]">AI Quality Review</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Claude/Gemini reviews against rubric</p>
                </div>
              </div>
              <button 
                onClick={() => handleChange('aiReviewEnabled', !config.aiReviewEnabled)}
                className={`w-10 h-6 rounded-full flex items-center p-1 transition-colors ${config.aiReviewEnabled ? 'bg-green-500 justify-end' : 'bg-[var(--bg-surface)] justify-start'}`}
              >
                <div className="w-4 h-4 bg-white rounded-full" />
              </button>
            </div>

            {/* Plagiarism (Disabled) */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-body)] border border-[var(--border-light)] opacity-60">
              <div className="flex items-start gap-4">
                <Search className="w-5 h-5 text-[var(--text-secondary)] mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-[var(--text-main)]">Plagiarism Detection</h4>
                    <span className="text-[10px] uppercase bg-[var(--bg-surface)] text-[var(--text-secondary)] px-2 py-0.5 rounded">Coming Soon</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Checks for copied submissions</p>
                </div>
              </div>
              <div className="w-10 h-6 bg-[var(--bg-surface)] rounded-full flex items-center p-1 justify-start border border-[var(--border-light)]">
                <div className="w-4 h-4 bg-[var(--bg-surface)] rounded-full" />
              </div>
            </div>

            {/* Code Execution (Disabled) */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-body)] border border-[var(--border-light)] opacity-60">
              <div className="flex items-start gap-4">
                <Play className="w-5 h-5 text-[var(--text-secondary)] mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-[var(--text-main)]">Code Execution</h4>
                    <span className="text-[10px] uppercase bg-[var(--bg-surface)] text-[var(--text-secondary)] px-2 py-0.5 rounded">Coming Soon</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Runs and tests student code</p>
                </div>
              </div>
              <div className="w-10 h-6 bg-[var(--bg-surface)] rounded-full flex items-center p-1 justify-start border border-[var(--border-light)]">
                <div className="w-4 h-4 bg-[var(--bg-surface)] rounded-full" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: Per Project Type Settings */}
      <section className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-light)] overflow-hidden shadow-lg mb-8">
        <div className="px-6 py-4 border-b border-[var(--border-light)]">
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest">Project Type Settings</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-[var(--text-muted)] mb-4">Different strictness for regular projects vs capstone projects.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Regular */}
            <div className="border border-[var(--border-light)] bg-[var(--bg-body)] p-5 rounded-xl">
              <h3 className="font-medium text-[var(--text-main)] mb-4">Regular Projects</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--text-secondary)]">Pass Score (%)</span>
                  <input type="number" value={config.passScoreRegular} onChange={(e) => handleChange('passScoreRegular', e.target.value)} className="w-20 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded px-3 py-1 text-[var(--text-main)] outline-none focus:border-[var(--color-primary)] text-right" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--text-secondary)]">Max Attempts</span>
                  <input type="number" value={config.maxAttemptsRegular} onChange={(e) => handleChange('maxAttemptsRegular', e.target.value)} className="w-20 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded px-3 py-1 text-[var(--text-main)] outline-none focus:border-[var(--color-primary)] text-right" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--text-secondary)]">AI Review</span>
                  <button onClick={() => handleChange('aiReviewEnabled', !config.aiReviewEnabled)} className={`w-10 h-6 rounded-full flex items-center p-1 transition-colors ${config.aiReviewEnabled ? 'bg-green-500 justify-end' : 'bg-[var(--bg-surface)] justify-start'}`}>
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
              </div>
            </div>

            {/* Capstone */}
            <div className="border border-[var(--border-light)] bg-[var(--bg-body)] p-5 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-medium text-[var(--text-main)]">Capstone Projects</h3>
                <span className="text-[10px] uppercase font-bold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/20">Advanced</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--text-secondary)]">Pass Score (%)</span>
                  <input type="number" value={config.passScoreCapstone} onChange={(e) => handleChange('passScoreCapstone', e.target.value)} className="w-20 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded px-3 py-1 text-[var(--text-main)] outline-none focus:border-[var(--color-primary)] text-right" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--text-secondary)]">Max Attempts</span>
                  <input type="number" value={config.maxAttemptsCapstone} onChange={(e) => handleChange('maxAttemptsCapstone', e.target.value)} className="w-20 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded px-3 py-1 text-[var(--text-main)] outline-none focus:border-[var(--color-primary)] text-right" />
                </div>
                <div className="flex justify-between items-center opacity-70">
                  <span className="text-sm text-[var(--text-secondary)]">AI Review</span>
                  <div className="w-10 h-6 rounded-full flex items-center p-1 bg-green-500/80 justify-end cursor-not-allowed">
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--text-secondary)]">All checks must pass</span>
                  <div className="w-10 h-6 rounded-full flex items-center p-1 bg-green-500 justify-end">
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="sticky bottom-4 z-10">
        <button
          onClick={handleSave}
          disabled={!isDirty || saving}
          className={`w-full py-3 rounded-lg font-medium shadow-xl transition-all flex justify-center items-center gap-2 ${
            isDirty 
              ? 'bg-[var(--color-primary)] hover:brightness-110 text-white' 
              : 'bg-[var(--bg-surface)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-light)]'
          }`}
        >
          {saving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save AI Configuration
        </button>
      </div>

    </div>
  );
}
