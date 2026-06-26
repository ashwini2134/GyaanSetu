import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import type { LessonSection, ContentBlock } from '../../types/lesson';
import ConceptVisualizationCard from './ConceptVisualizationCard';
import ThinkOfSection from './ThinkOfSection';
import VisualAidCard from './VisualAidCard';
import InteractiveTryIt from './InteractiveTryIt';
import ReflectionCard from './ReflectionCard';
import PracticeCard from './PracticeCard';
import { renderMarkdown } from '../../utils/renderContent';

function TextBlock({ block }: { block: Extract<ContentBlock, { type: 'text' }> }) {
  return (
    <p className="text-sm text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content) }} />
  );
}

function ExplanationBlock({ block }: { block: Extract<ContentBlock, { type: 'explanation' }> }) {
  const ACCENT: Record<string, string> = {
    blue:   'border-blue-500/20 from-blue-600/10',
    purple: 'border-purple-500/20 from-purple-600/10',
    green:  'border-green-500/20 from-green-600/10',
    orange: 'border-orange-500/20 from-orange-600/10',
    amber:  'border-amber-500/20 from-amber-600/10',
  };
  const ICON_COLOR: Record<string, string> = {
    blue: 'text-blue-400', purple: 'text-purple-400', green: 'text-green-400',
    orange: 'text-orange-400', amber: 'text-amber-400',
  };
  const color = block.accentColor ?? 'blue';
  const accentCls = ACCENT[color] ?? ACCENT.blue;
  const iconCls = ICON_COLOR[color] ?? ICON_COLOR.blue;

  return (
    <div className={`rounded-2xl border ${accentCls} bg-gradient-to-br to-slate-800/40 backdrop-blur-sm p-5`}>
      <div className="flex items-start gap-3 mb-3">
        <svg className={`w-5 h-5 ${iconCls} mt-0.5 flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <div className="flex-1">
          {block.title && <p className="text-sm font-semibold text-slate-200 mb-1">{block.title}</p>}
          <p className="text-sm text-slate-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(block.body) }}
          />
        </div>
      </div>
      {block.bullets && (
        <ul className="space-y-2 ml-8">
          {block.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <svg className={`w-4 h-4 ${iconCls} mt-0.5 flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span dangerouslySetInnerHTML={{ __html: renderMarkdown(b) }} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const ANALOGY_IMAGES: Array<[RegExp, string]> = [
  [/jar|labeled|storage|container|box|variable/i, 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800&q=80'],
  [/recipe|kitchen|cook|baking/i, 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80'],
  [/chain|string|beads|character/i, 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80'],
  [/tool|multi.?tool|swiss/i, 'https://images.unsplash.com/photo-1615127717889-8945dba1f05a?w=800&q=80'],
];

function analogyImage(title: string): string | null {
  for (const [pattern, url] of ANALOGY_IMAGES) {
    if (pattern.test(title.toLowerCase())) return url;
  }
  return null;
}

function AnalogyBlock({ block }: { block: Extract<ContentBlock, { type: 'analogy' }> }) {
  const imgSrc = useMemo(() => analogyImage(block.title), [block.title]);
  const [imgError, setImgError] = useState(false);
  const showImg = !!imgSrc && !imgError;

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-600/8 to-slate-800/40 overflow-hidden">
      <div className="flex items-stretch">
        {showImg && (
          <div className="relative w-28 min-h-[100px] flex-shrink-0 overflow-hidden">
            <img
              src={imgSrc!}
              alt={block.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 to-transparent" />
          </div>
        )}
        <div className="p-5 flex-1">
          <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">{block.title}</p>
          <p className="text-sm text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(block.text) }} />
        </div>
      </div>
    </div>
  );
}

function renderBlock(block: any, _sectionId: string, courseSlug: string, lectureNumber: number, onAttempt?: () => void, onComplete?: () => void) {
  // --- NEW ADMIN BLOCK TYPES ---
  if (block.type === 'heading') {
    const Component = block.data.level || 'h2';
    return <Component className="text-xl font-bold text-slate-100 mt-6 mb-3">{block.data.text}</Component>;
  }
  if (block.type === 'text' && block.data) {
    return <p className="text-sm text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(block.data.body || '') }} />;
  }
  if (block.type === 'callout') {
    const bgColors: Record<string, string> = {
      blue: 'bg-blue-500/10 border-blue-500/30',
      yellow: 'bg-yellow-500/10 border-yellow-500/30',
      green: 'bg-green-500/10 border-green-500/30',
      red: 'bg-red-500/10 border-red-500/30',
    };
    const c = bgColors[block.data.color || 'blue'] || bgColors.blue;
    return (
      <div className={`mt-2 p-4 rounded-xl border ${c} flex gap-3`}>
        {block.data.icon && <span className="text-xl leading-none">{block.data.icon}</span>}
        <p className="text-sm leading-relaxed text-slate-200">{block.data.text}</p>
      </div>
    );
  }
  if (block.type === 'analogy' && block.data) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-600/8 to-slate-800/40 p-5">
        <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">{block.data.title}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">Real Life</p>
            <p className="text-sm text-slate-300">{block.data.real}</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">In Code</p>
            <p className="text-sm text-slate-300">{block.data.concept}</p>
          </div>
        </div>
      </div>
    );
  }
  if (block.type === 'code' && block.data) {
    return (
      <div className="rounded-xl overflow-hidden border border-white/10 my-4">
        <div className="bg-[#1e1e1e] p-4 text-sm font-mono text-slate-300 overflow-x-auto whitespace-pre">
          {block.data.code}
        </div>
        {block.data.output && (
          <div className="bg-black/50 p-3 text-xs font-mono text-slate-400 border-t border-white/5">
            Output: {block.data.output}
          </div>
        )}
      </div>
    );
  }
  if (block.type === 'exercise' && block.data) {
    return (
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5 my-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded uppercase font-bold">{block.data.difficulty || 'Exercise'}</span>
        </div>
        <p className="font-semibold text-slate-200 mb-2">{block.data.question}</p>
        <p className="text-sm text-slate-400 mb-4">{block.data.description}</p>
        <button onClick={onAttempt} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          Solve Exercise
        </button>
      </div>
    );
  }
  if (block.type === 'image' && block.data) {
    return (
      <div className="my-4">
        <img src={block.data.url} alt={block.data.alt} className="rounded-lg max-h-[400px] object-cover" />
        {block.data.caption && <p className="text-xs text-slate-400 mt-2 text-center">{block.data.caption}</p>}
      </div>
    );
  }
  if (block.type === 'video' && block.data) {
    return (
      <div className="my-4 aspect-video bg-black rounded-lg overflow-hidden border border-white/10">
        <iframe src={block.data.url} className="w-full h-full" allowFullScreen />
      </div>
    );
  }
  if (block.type === 'list' && block.data) {
    const Tag = block.data.style === 'numbered' ? 'ol' : 'ul';
    const markerCls = block.data.style === 'numbered' ? 'list-decimal pl-5' : 'list-disc pl-5';
    return (
      <Tag className={`space-y-2 text-sm text-slate-300 ${markerCls}`}>
        {(block.data.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
      </Tag>
    );
  }
  if (block.type === 'quiz' && block.data) {
    return (
      <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-5 my-4">
        <p className="font-semibold text-slate-200 mb-4">{block.data.question}</p>
        <div className="space-y-2">
          {(block.data.options || []).map((opt: string, i: number) => (
            <div key={i} className="p-3 rounded-lg border border-white/5 bg-slate-800/50 text-sm text-slate-300">
              {opt}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- OLD JSON BLOCK TYPES (Fallback) ---
  switch (block.type) {
    case 'text':
      return <TextBlock block={block} />;
    case 'explanation':
      return <ExplanationBlock block={block} />;
    case 'analogy':
      return <AnalogyBlock block={block} />;
    case 'concept_visualization':
      return <ConceptVisualizationCard block={block} />;
    case 'think_of':
      return <ThinkOfSection block={block} />;
    case 'visual_aid':
      return <VisualAidCard block={block} />;
    case 'code_example':
      if (['cs50ai', 'ai', 'cs50-ai'].includes(courseSlug)) return null;
      return <InteractiveTryIt block={block} />;
    case 'reflection':
      return <ReflectionCard block={block} />;
    case 'practice':
      return (
        <PracticeCard
          block={block}
          courseSlug={courseSlug}
          lectureNumber={lectureNumber}
          sectionId={_sectionId}
          onAttempt={onAttempt}
          onComplete={onComplete}
        />
      );
    default:
      return null;
  }
}

interface SectionProps {
  section: LessonSection;
  index: number;
  courseSlug: string;
  lectureNumber: number;
  innerRef?: (el: HTMLElement | null) => void;
  onPracticeAttempt?: (sectionId: string) => void;
  onPracticeComplete?: (sectionId: string) => void;
}

const SECTION_COLORS = ['blue', 'blue', 'purple', 'green', 'orange', 'amber'] as const;

// ── Progressive reveal helpers ─────────────────────────────────────────────────

function blockProducesContent(block: ContentBlock, courseSlug: string): boolean {
  if (block.type === 'code_example' && ['cs50ai', 'ai', 'cs50-ai'].includes(courseSlug)) return false;
  return true;
}

function splitParagraphs(text: string): string[] {
  return text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
}

interface FlattenedItem {
  key: string;
  block: ContentBlock;
}

function flattenSectionBlocks(blocks: ContentBlock[], courseSlug: string): {
  readingItems: FlattenedItem[];
  thinkOfBlock: ContentBlock | null;
  practiceBlock: ContentBlock | null;
} {
  const readingItems: FlattenedItem[] = [];
  let thinkOfBlock: ContentBlock | null = null;
  let practiceBlock: ContentBlock | null = null;

  for (const block of blocks) {
    if (!blockProducesContent(block, courseSlug)) continue;

    if (block.type === 'think_of') {
      thinkOfBlock = block;
      continue;
    }
    if (block.type === 'practice') {
      practiceBlock = block;
      continue;
    }

    if (block.type === 'text') {
      const paragraphs = splitParagraphs(block.content);
      if (paragraphs.length <= 1) {
        readingItems.push({ key: `text`, block });
      } else {
        paragraphs.forEach((para, i) => {
          readingItems.push({
            key: `text-p${i}`,
            block: { ...block, content: para } as ContentBlock,
          });
        });
      }
    } else {
      readingItems.push({ key: block.type, block });
    }
  }

  return { readingItems, thinkOfBlock, practiceBlock };
}

// ── Individual reveal item ─────────────────────────────────────────────────────

function RevealItem({
  index: _idx,
  onRevealed,
  children,
}: {
  index: number;
  onRevealed: (idx: number) => void;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            onRevealed(_idx);
            observer.unobserve(el);
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: '-32px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [_idx, onRevealed]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      {children}
    </div>
  );
}

// ── Content that fades in automatically after mount ────────────────────────────

function StaggerFadeIn({
  show,
  delay = 0,
  children,
}: {
  show: boolean;
  delay?: number;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        setVisible(true);
      });
    }, delay);
    return () => clearTimeout(timer);
  }, [show, delay]);

  if (!show) return null;

  return (
    <div
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      {children}
    </div>
  );
}

export default function LessonSection({
  section,
  index,
  courseSlug,
  lectureNumber,
  innerRef,
  onPracticeAttempt,
  onPracticeComplete,
}: SectionProps) {
  const color = SECTION_COLORS[index % SECTION_COLORS.length];
  const COLOR_MAP: Record<string, string> = {
    blue: 'bg-blue-600/20 text-blue-400',
    purple: 'bg-purple-600/20 text-purple-400',
    green: 'bg-green-600/20 text-green-400',
    orange: 'bg-orange-600/20 text-orange-400',
    amber: 'bg-amber-600/20 text-amber-400',
  };

  const { readingItems, thinkOfBlock, practiceBlock } = useMemo(
    () => flattenSectionBlocks(section.blocks, courseSlug),
    [section.blocks, courseSlug]
  );

  const totalReading = readingItems.length;
  const [revealedCount, setRevealedCount] = useState(0);
  const [showThinkOf, setShowThinkOf] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const thinkOfRef = useRef<HTMLDivElement>(null);

  const allReadingRevealed = revealedCount >= totalReading;

  const handleRevealed = useCallback(
    (idx: number) => {
      setRevealedCount((prev) => Math.max(prev, idx + 1));
    },
    []
  );

  // After all reading items are revealed, show Think Of
  useEffect(() => {
    if (allReadingRevealed && totalReading > 0) {
      const timer = setTimeout(() => setShowThinkOf(true), 500);
      return () => clearTimeout(timer);
    }
    // If there are no reading items, show Think Of immediately
    if (totalReading === 0 && thinkOfBlock) {
      setShowThinkOf(true);
    }
  }, [allReadingRevealed, totalReading, thinkOfBlock]);

  // After Think Of becomes visible, wait and show Practice
  useEffect(() => {
    if (!showThinkOf || !thinkOfRef.current) return;

    const el = thinkOfRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => setShowPractice(true), 2000);
          observer.unobserve(el);
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [showThinkOf]);

  // If no think_of block exists, show practice after reading is done
  useEffect(() => {
    if (allReadingRevealed && !thinkOfBlock && practiceBlock && totalReading > 0) {
      const timer = setTimeout(() => setShowPractice(true), 800);
      return () => clearTimeout(timer);
    }
    if (totalReading === 0 && !thinkOfBlock && practiceBlock) {
      setShowPractice(true);
    }
  }, [allReadingRevealed, thinkOfBlock, practiceBlock, totalReading]);

  return (
    <section
      id={`section-${section.id}`}
      ref={innerRef as any}
    >
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${COLOR_MAP[color]}`}>
            {index + 1}
          </span>
          {section.label}
        </h2>

        {/* Reading items — each reveals on scroll */}
        {readingItems.map((item, i) => (
          <RevealItem key={item.key} index={i} onRevealed={handleRevealed}>
            {renderBlock(
              item.block,
              section.id,
              courseSlug,
              lectureNumber,
              () => onPracticeAttempt?.(section.id),
              () => onPracticeComplete?.(section.id),
            )}
          </RevealItem>
        ))}

        {/* Think Of — appears after all reading content is revealed */}
        {thinkOfBlock && (
          <StaggerFadeIn show={showThinkOf} delay={200}>
            <div ref={thinkOfRef}>
              {renderBlock(
                thinkOfBlock,
                section.id,
                courseSlug,
                lectureNumber,
                () => onPracticeAttempt?.(section.id),
                () => onPracticeComplete?.(section.id),
              )}
            </div>
          </StaggerFadeIn>
        )}

        {/* Practice — appears after Think Of has been visible */}
        {practiceBlock && (
          <StaggerFadeIn show={showPractice} delay={300}>
            {renderBlock(
              practiceBlock,
              section.id,
              courseSlug,
              lectureNumber,
              () => onPracticeAttempt?.(section.id),
              () => onPracticeComplete?.(section.id),
            )}
          </StaggerFadeIn>
        )}
      </div>
    </section>
  );
}
