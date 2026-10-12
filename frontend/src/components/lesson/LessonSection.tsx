import React, { useMemo, useState, useEffect } from 'react';
import type { LessonSection, ContentBlock } from '../../types/lesson';
import ConceptVisualizationCard from './ConceptVisualizationCard';
import ThinkOfSection from './ThinkOfSection';
import VisualAidCard from './VisualAidCard';
import InteractiveTryIt from './InteractiveTryIt';
import ReflectionCard from './ReflectionCard';
import PracticeCard from './PracticeCard';
import AILearnSection from './AILearnSection';
import AIThinkOfSection from './AIThinkOfSection';
import { SearchProblemSVG, BfsDfsSVG, HeuristicSearchSVG, AdversarialSearchSVG } from './SearchAlgorithmsSVGs';
import { PropositionalLogicSVG, KnowledgeBasesSVG, FirstOrderLogicSVG, KnowledgeEngineeringSVG } from './KnowledgeLogicSVGs';
import { ProbabilityBasicsSVG, RandomVariablesSVG, BayesTheoremSVG, BayesianNetworksSVG, MarkovModelsSVG } from './ProbabilityUncertaintySVGs';
import { WhatIsOptimizationSVG, LocalSearchSVG, LinearProgrammingSVG } from './OptimizationSVGs';
import { SupervisedLearningSVG, OverfittingSVG, LossFunctionsSVG, PerceptronLearningSVG, SupportVectorMachinesSVG, UnsupervisedLearningSVG, ReinforcementLearningSVG } from './MachineLearningSVGs';
import { NeuronsArchitectureSVG, ActivationFunctionsSVG, TrainingBackpropagationSVG } from './NeuralNetworksSVGs';
import { AlgorithmicBiasSVG, HallucinationsDeepfakesSVG, ResponsibleAISVG } from './EthicsSVGs';
import InfographicBlock from './InfographicBlock';
import AIChallengeSet from './AIChallengeSet';
import { renderMarkdown } from '../../utils/renderContent';

// ── Auto-cycling SVG wrapper for svg_placeholder blocks ─────────────────────

const SVG_STYLES = `
@keyframes tof-pop { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes tof-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes tof-conn { from { stroke-dashoffset: 220; opacity: 0; } to { stroke-dashoffset: 0; opacity: 0.55; } }
@keyframes tof-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes tof-pulse-ring { 0% { r: 18; opacity: 0.8; } 100% { r: 30; opacity: 0; } }
@keyframes tof-flow { from { stroke-dashoffset: 40; } to { stroke-dashoffset: 0; } }
`;

const SVG_MAP: Record<string, (p: { scene: number }) => React.ReactElement> = {
  'search-problem': SearchProblemSVG,
  'bfs-dfs': BfsDfsSVG,
  'heuristic-search': HeuristicSearchSVG,
  'adversarial-search': AdversarialSearchSVG,
  'propositional-logic': PropositionalLogicSVG,
  'knowledge-bases': KnowledgeBasesSVG,
  'first-order-logic': FirstOrderLogicSVG,
  'knowledge-engineering': KnowledgeEngineeringSVG,
  'probability-basics': ProbabilityBasicsSVG,
  'random-variables': RandomVariablesSVG,
  'bayes-theorem': BayesTheoremSVG,
  'bayesian-networks': BayesianNetworksSVG,
  'markov-models': MarkovModelsSVG,
  'what-is-optimization': WhatIsOptimizationSVG,
  'local-search': LocalSearchSVG,
  'linear-programming': LinearProgrammingSVG,
  'supervised-learning': SupervisedLearningSVG,
  'overfitting': OverfittingSVG,
  'loss-functions': LossFunctionsSVG,
  'perceptron-learning': PerceptronLearningSVG,
  'support-vector-machines': SupportVectorMachinesSVG,
  'unsupervised-learning': UnsupervisedLearningSVG,
  'reinforcement-learning': ReinforcementLearningSVG,
  'neurons-architecture': NeuronsArchitectureSVG,
  'activation-functions': ActivationFunctionsSVG,
  'training-backpropagation': TrainingBackpropagationSVG,
  'algorithmic-bias': AlgorithmicBiasSVG,
  'hallucinations-deepfakes': HallucinationsDeepfakesSVG,
  'responsible-ai': ResponsibleAISVG,
};

const MAX_SCENES: Record<string, number> = {
  'ai-learning': 3,
  'ai-subsets': 5,
  'ai-everyday': 6,
  'search-problem': 4,
  'bfs-dfs': 4,
  'heuristic-search': 4,
  'adversarial-search': 4,
  'propositional-logic': 4,
  'knowledge-bases': 4,
  'first-order-logic': 4,
  'knowledge-engineering': 4,
  'probability-basics': 4,
  'random-variables': 4,
  'bayes-theorem': 4,
  'bayesian-networks': 4,
  'markov-models': 4,
  'what-is-optimization': 4,
  'local-search': 4,
  'linear-programming': 4,
  'supervised-learning': 4,
  'overfitting': 4,
  'loss-functions': 4,
  'perceptron-learning': 4,
  'support-vector-machines': 4,
  'unsupervised-learning': 4,
  'reinforcement-learning': 4,
  'neurons-architecture': 4,
  'activation-functions': 4,
  'training-backpropagation': 4,
  'algorithmic-bias': 4,
  'hallucinations-deepfakes': 4,
  'responsible-ai': 4,
};

function SVGPlaceholderRenderer({ svgId }: { svgId: string }) {
  const SVG = SVG_MAP[svgId];
  const max = MAX_SCENES[svgId] ?? 3;
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setScene(s => (s + 1) % max), 5000);
    return () => clearInterval(t);
  }, [max]);

  if (!SVG) return null;

  return (
    <>
      <style>{SVG_STYLES}</style>
      <SVG scene={scene} />
    </>
  );
}

function TextBlock({ block }: { block: Extract<ContentBlock, { type: 'text' }> }) {
  return (
    <p className="text-sm text-[var(--text-secondary)] leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content) }} />
  );
}

function ExplanationBlock({ block }: { block: Extract<ContentBlock, { type: 'explanation' }> }) {
  return (
    <div className="pl-5 border-l-2 border-[var(--brand-primary)]/20">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {block.title && <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">{block.title}</p>}
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(block.body) }}
          />
        </div>
      </div>
      {block.bullets && (
        <ul className="space-y-2 mt-3">
          {block.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
              <svg className="w-4 h-4 text-[var(--brand-primary)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
    <div className="pl-5 border-l-2 border-[var(--brand-primary)]/20">
      <div className="flex items-stretch">
        {showImg && (
          <div className="relative w-28 min-h-[100px] flex-shrink-0 overflow-hidden rounded-lg">
            <img
              src={imgSrc!}
              alt={block.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/60 to-transparent" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-wider mb-1">{block.title}</p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(block.text) }} />
        </div>
      </div>
    </div>
  );
}

function renderBlock(block: any, _sectionId: string, courseSlug: string, lectureNumber: number, onAttempt?: () => void, onComplete?: () => void, itemIndex?: number) {
  // --- NEW ADMIN BLOCK TYPES ---
  if (block.type === 'svg_placeholder') {
    const svgId = block.data?.svgId;
    if (svgId && SVG_MAP[svgId]) {
      return (
        <div className="my-2 rounded-2xl overflow-hidden bg-[var(--surface-container)]/40">
          <SVGPlaceholderRenderer svgId={svgId} />
        </div>
      );
    }
    return (
      <div
        className="my-2 rounded-2xl border-2 border-dashed border-[var(--border-medium)] bg-[var(--surface-container)]/40 flex items-center justify-center"
        style={{ minHeight: block.data?.height || '260px' }}
      >
        <div className="text-center text-[var(--text-muted)] px-4">
          <svg className="w-8 h-8 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs font-medium">{block.data?.label || 'SVG placeholder'}</p>
        </div>
      </div>
    );
  }
  if (block.type === 'heading') {
    const Component = block.data.level || 'h2';
    return <Component className="text-xl font-bold text-[var(--text-primary)] mt-6 mb-3">{block.data.text}</Component>;
  }
  if (block.type === 'text' && block.data) {
    return <p className="text-sm text-[var(--text-secondary)] leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(block.data.body || '') }} />;
  }
  if (block.type === 'callout') {
    const bgColors: Record<string, string> = {
      blue: 'bg-blue-500/10 border-blue-500/30',
      yellow: 'bg-yellow-500/10 border-yellow-500/30',
      green: 'bg-green-500/10 border-green-500/30',
      red: 'bg-red-500/10 border-red-500/30',
      teal: 'bg-[var(--brand-primary)]/10 border-[var(--brand-primary)]/30',
    };
    const c = bgColors[block.data.color || 'blue'] || bgColors.blue;
    return (
      <div className={`mt-2 p-4 rounded-xl border ${c} flex gap-3`}>
        {block.data.icon && <span className="text-xl leading-none">{block.data.icon}</span>}
        <p className="text-sm leading-relaxed text-[var(--text-primary)]">{block.data.text}</p>
      </div>
    );
  }
  if (block.type === 'analogy' && block.data) {
    return (
      <div className="pl-5 border-l-2 border-[var(--brand-primary)]/20">
        <p className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-wider mb-2">{block.data.title}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--surface-container)] border border-[var(--border-light)] p-4 rounded-lg">
            <p className="text-xs text-[var(--text-muted)] mb-1">Real Life</p>
            <p className="text-sm text-[var(--text-primary)]">{block.data.real}</p>
          </div>
          <div className="bg-[var(--surface-container)] border border-[var(--border-light)] p-4 rounded-lg">
            <p className="text-xs text-[var(--text-muted)] mb-1">In Code</p>
            <p className="text-sm text-[var(--text-primary)]">{block.data.concept}</p>
          </div>
        </div>
      </div>
    );
  }
  if (block.type === 'reasoning' && block.data) {
    return (
      <div className="pl-5 border-l-2 border-[var(--brand-primary)]/20">
        <p className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-wider mb-2">{block.data.title}</p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{block.data.body}</p>
      </div>
    );
  }
  if (block.type === 'code' && block.data) {
    return (
      <div className="rounded-xl overflow-hidden border border-[var(--border-medium)] my-4 shadow-sm">
        <div className="bg-[var(--surface-container)] p-4 text-sm font-mono text-[var(--text-primary)] overflow-x-auto whitespace-pre">
          {block.data.code}
        </div>
        {block.data.output && (
          <div className="bg-[var(--surface-container)] p-3 text-xs font-mono text-[var(--text-secondary)] border-t border-[var(--border-medium)]">
            Output: {block.data.output}
          </div>
        )}
      </div>
    );
  }
  if (block.type === 'exercise' && block.data) {
    return (
      <div className="rounded-xl border border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/5 p-5 my-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] text-xs rounded uppercase font-bold">{block.data.difficulty || 'Exercise'}</span>
        </div>
        <p className="font-semibold text-[var(--text-primary)] mb-2">{block.data.question}</p>
        <p className="text-sm text-[var(--text-secondary)] mb-4">{block.data.description}</p>
        <button onClick={onAttempt} className="px-4 py-2 bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-hover)] text-white rounded-lg text-sm font-medium transition-colors">
          Solve Exercise
        </button>
      </div>
    );
  }
  if (block.type === 'image' && block.data) {
    const isSvg = block.data.url?.endsWith('.svg');
    return (
      <div className="my-4">
        <img src={block.data.url} alt={block.data.alt} className={`rounded-lg w-full ${isSvg ? 'max-h-[420px] object-contain bg-[var(--bg-main)] border border-[var(--border-light)]' : 'max-h-[400px] object-cover'}`} />
        {block.data.caption && <p className="text-xs text-[var(--text-secondary)] mt-2 text-center">{block.data.caption}</p>}
      </div>
    );
  }
  if (block.type === 'video' && block.data) {
    return (
      <div className="my-4 aspect-video bg-black rounded-lg overflow-hidden border border-[var(--border-medium)] shadow-sm">
        <iframe src={block.data.url} className="w-full h-full" allowFullScreen />
      </div>
    );
  }
  if (block.type === 'list' && block.data) {
    const Tag = block.data.style === 'numbered' ? 'ol' : 'ul';
    const markerCls = block.data.style === 'numbered' ? 'list-decimal pl-5' : 'list-disc pl-5';
    return (
      <Tag className={`space-y-2 text-sm text-[var(--text-secondary)] ${markerCls}`}>
        {(block.data.items || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
      </Tag>
    );
  }
  if (block.type === 'quiz' && block.data) {
    return (
      <div className="rounded-xl border border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/5 p-5 my-4">
        <p className="font-semibold text-[var(--text-primary)] mb-4">{block.data.question}</p>
        <div className="space-y-2">
          {(block.data.options || []).map((opt: string, i: number) => (
            <div key={i} className="p-3 rounded-lg border border-[var(--border-medium)] bg-[var(--surface-card)] text-sm text-[var(--text-secondary)]">
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
      return <TextBlock block={block as any} />;
    case 'explanation':
      return <ExplanationBlock block={block as any} />;
    case 'analogy':
      return <AnalogyBlock block={block as any} />;
    case 'concept_visualization':
      return <ConceptVisualizationCard block={block as any} />;
    case 'ai_section':
      return <AILearnSection block={block} />;
    case 'ai_think_of':
      return <AIThinkOfSection block={block} />;
    case 'infographic':
      return <InfographicBlock block={block as any} />;
    case 'think_of':
      return <ThinkOfSection block={block as any} />;
    case 'visual_aid':
      return <VisualAidCard block={block as any} />;
    case 'code_example':
      if (['fundamentals-of-ai', 'ai', 'fundamentals-of-ai'].includes(courseSlug)) return null;
      return (
        <InteractiveTryIt
          block={block as any}
          courseSlug={courseSlug}
          lectureNumber={lectureNumber}
          blockId={`${_sectionId}-${itemIndex ?? 0}`}
        />
      );
    case 'reflection':
      return <ReflectionCard block={block as any} />;
    case 'practice':
      return (
        <PracticeCard
          key={`practice-${courseSlug}-${lectureNumber}-${_sectionId}-${(block as any).title}`}
          block={block as any}
          courseSlug={courseSlug}
          lectureNumber={lectureNumber}
          sectionId={_sectionId}
          onAttempt={onAttempt}
          onComplete={onComplete}
        />
      );
    case 'ai_challenge_set':
      return <AIChallengeSet block={block as any} />;
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
  isFirstSection?: boolean;
}

function blockProducesContent(block: ContentBlock, courseSlug: string): boolean {
  if (block.type === 'code_example' && ['fundamentals-of-ai', 'ai', 'fundamentals-of-ai'].includes(courseSlug)) return false;
  return true;
}

function splitParagraphs(text: string): string[] {
  return (text || '').split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
}

interface RevealItem {
  key: string;
  block: ContentBlock;
}

function buildRevealSequence(blocks: ContentBlock[], courseSlug: string): RevealItem[] {
  const items: RevealItem[] = [];

  for (const block of blocks) {
    if (!blockProducesContent(block, courseSlug)) continue;

    if (block.type === 'text') {
      const raw = (block as any).content || (block as any).data?.body || '';
      const paragraphs = splitParagraphs(raw);
      if (paragraphs.length <= 1) {
        items.push({ key: `text-${items.length}`, block });
      } else {
        paragraphs.forEach((para) => {
          items.push({
            key: `text-p${items.length}`,
            block: { ...block, content: para } as ContentBlock,
          });
        });
      }
    } else if (block.type === 'think_of') {
      items.push({ key: `think_of-${items.length}`, block });
    } else if (block.type === 'practice') {
      items.push({ key: `practice-${items.length}`, block });
    } else {
      items.push({ key: `${block.type}-${items.length}`, block });
    }
  }

  return items;
}

import ScrollReveal from '../ScrollReveal';

export default function LessonSection({
  section,
  index: _index,
  courseSlug,
  lectureNumber,
  innerRef,
  onPracticeAttempt,
  onPracticeComplete,
  isFirstSection,
}: SectionProps) {
  const revealItems = useMemo(
    () => buildRevealSequence(section.blocks, courseSlug),
    [section.blocks, courseSlug]
  );

  return (
    <section
      id={`section-${section.id}`}
      ref={innerRef as any}
    >
      <div className={`space-y-4 ${isFirstSection ? 'bg-gradient-to-b from-[#F8FCFD] to-[var(--surface-page)] rounded-2xl p-6 -mx-2 px-2' : ''}`}>
        {isFirstSection ? (
          <h2 className="sr-only">{section.label}</h2>
        ) : (
          <>
            <div className="border-t border-[var(--border-light)] mb-2" />
            <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
              {section.label}
            </h2>
          </>
        )}

        {revealItems.map((item, itemIndex) => {
          const content = renderBlock(
            item.block,
            section.id,
            courseSlug,
            lectureNumber,
            () => onPracticeAttempt?.(section.id),
            () => onPracticeComplete?.(section.id),
            itemIndex
          );

          const contentElement = (
            <div key={item.key}>
              {/* Capped so long sections don't accumulate multi-second delays —
                  each block only staggers relative to its nearby siblings,
                  not the section's entire block count. */}
              <ScrollReveal delay={Math.min(itemIndex * 0.1, 0.5)}>
                {content}
              </ScrollReveal>
            </div>
          );

          return contentElement;
        })}
      </div>
    </section>
  );
}
