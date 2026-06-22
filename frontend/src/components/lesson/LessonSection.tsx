import { useMemo, useState } from 'react';
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

function renderBlock(block: ContentBlock, _sectionId: string, courseSlug: string, lectureNumber: number, onAttempt?: () => void, onComplete?: () => void) {
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

            {section.blocks.map((block, bi) => (
              <div key={bi}>
                {renderBlock(
                  block,
                  section.id,
                  courseSlug,
                  lectureNumber,
                  () => onPracticeAttempt?.(section.id),
                  () => onPracticeComplete?.(section.id),
                )}
              </div>
            ))}
      </div>
    </section>
  );
}
