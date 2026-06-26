// Fraylon Admin - Block Editor
import React from 'react';
import { Type, AlignLeft, Lightbulb, Code2, AlertCircle, Dumbbell, PlaySquare, Image as ImageIcon, CheckSquare, List as ListIcon } from 'lucide-react';

export const BLOCK_TYPES = [
  { id: 'heading', name: 'Heading', icon: Type, desc: 'Section title' },
  { id: 'text', name: 'Text', icon: AlignLeft, desc: 'Paragraph or markdown text' },
  { id: 'analogy', name: 'Analogy', icon: Lightbulb, desc: 'Real-life comparison' },
  { id: 'code', name: 'Code Example', icon: Code2, desc: 'Syntax-highlighted code snippet' },
  { id: 'callout', name: 'Callout', icon: AlertCircle, desc: 'Colored banner with icon' },
  { id: 'exercise', name: 'Exercise', icon: Dumbbell, desc: 'Interactive coding challenge' },
  { id: 'video', name: 'Video', icon: PlaySquare, desc: 'YouTube or Vimeo embed' },
  { id: 'image', name: 'Image', icon: ImageIcon, desc: 'Picture with caption' },
  { id: 'quiz', name: 'Quiz', icon: CheckSquare, desc: 'Multiple choice question' },
  { id: 'list', name: 'List', icon: ListIcon, desc: 'Bullet or numbered list' },
  { id: 'explanation', name: 'Explanation', icon: Lightbulb, desc: 'Detailed explanation with colored background' },
  { id: 'think_of', name: 'Think Of', icon: Lightbulb, desc: 'Analogy card' },
  { id: 'practice', name: 'Practice', icon: Code2, desc: 'Interactive coding practice block' },
];

export default function BlockPicker({ onSelect, onClose }: { onSelect: (type: string) => void, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#0f172a] border border-slate-700/50 rounded-2xl p-6 max-w-2xl w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add Block</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2">✕</button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {BLOCK_TYPES.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                onSelect(b.id);
                onClose();
              }}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/50 border border-white/5 hover:bg-slate-700 hover:border-white/20 transition-all text-center group"
            >
              <b.icon className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-slate-200">{b.name}</span>
              <span className="text-xs text-slate-500 mt-1">{b.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
