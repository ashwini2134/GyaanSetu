import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import LiveTemplatePreview from './templates/LiveTemplatePreview';
import type { TemplateComponentId } from './templates/registry';
import { PORTFOLIO_TEMPLATES, type TemplateProps } from './templates/types';

export default function TemplateGallery({
  open, onClose, onApply, currentTemplate, previewProps,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (id: TemplateComponentId) => Promise<void>;
  currentTemplate: string;
  previewProps: TemplateProps;
}) {
  const [pendingId, setPendingId] = useState<TemplateComponentId>(currentTemplate as TemplateComponentId);
  const [applying, setApplying] = useState(false);

  // Re-sync the pending pick to whatever's actually live whenever the
  // gallery is (re)opened — otherwise a stale pick from a previous open
  // (e.g. closed without applying) would carry over silently.
  useEffect(() => {
    if (open) setPendingId(currentTemplate as TemplateComponentId);
  }, [open, currentTemplate]);

  const hasChanges = pendingId !== currentTemplate;

  const handleApply = async () => {
    if (!hasChanges) { onClose(); return; }
    setApplying(true);
    try {
      await onApply(pendingId);
      onClose();
    } finally {
      setApplying(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative w-full max-w-5xl max-h-[88vh] bg-[var(--bg-body)] rounded-2xl border border-[var(--border-light)] shadow-2xl overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-light)] flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-main)]">Choose a Template</h2>
                <p className="text-[12.5px] text-[var(--text-muted)] mt-0.5">Live previews built from your real portfolio data — pick one, then Apply.</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-dark-surface)] hover:text-[var(--text-main)] transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {PORTFOLIO_TEMPLATES.map((t) => {
                  const isPending = pendingId === t.id;
                  const isLive = currentTemplate === t.id;
                  return (
                    <motion.div
                      key={t.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setPendingId(t.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPendingId(t.id); } }}
                      whileHover={{ y: -4 }}
                      className={`text-left rounded-2xl border-2 overflow-hidden bg-[var(--bg-surface)] transition-colors duration-150 cursor-pointer ${
                        isPending ? 'border-[var(--color-primary)]' : 'border-[var(--border-light)] hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      <div className="border-b border-[var(--border-light)] relative">
                        {isLive && (
                          <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-[var(--text-main)]/80 text-white text-[10px] font-semibold tracking-wide uppercase">
                            Current
                          </span>
                        )}
                        <LiveTemplatePreview templateId={t.id} previewProps={previewProps} />
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-[14px] text-[var(--text-main)]">{t.label}</h3>
                          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{t.description}</p>
                        </div>
                        {isPending && (
                          <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-[#ffffff] flex items-center justify-center flex-shrink-0">
                            <Check size={14} />
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-[var(--border-light)] flex-shrink-0 bg-[var(--bg-body)]">
              <p className="text-[12.5px] text-[var(--text-muted)]">
                {hasChanges ? `Switching to ${PORTFOLIO_TEMPLATES.find((t) => t.id === pendingId)?.label}.` : 'This is your current template.'}
              </p>
              <div className="flex items-center gap-3">
                <button onClick={onClose} disabled={applying} className="h-[40px] px-5 text-[var(--text-main)] text-sm font-medium border border-[var(--border-light)] hover:bg-[var(--bg-dark-surface)] rounded-[8px] transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="h-[40px] px-6 bg-[var(--color-primary)] text-[#ffffff] rounded-[8px] font-medium text-sm hover:bg-[var(--color-primary-dark)] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {applying && <Loader2 size={15} className="animate-spin" />}
                  {applying ? 'Applying...' : hasChanges ? 'Apply Template' : 'Done'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
