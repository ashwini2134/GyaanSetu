// Fraylon Admin - Block Editor
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { BLOCK_TYPES } from './BlockPicker';
import HeadingBlock from './blocks/HeadingBlock';
import TextBlock from './blocks/TextBlock';
import AnalogyBlock from './blocks/AnalogyBlock';
import CodeBlock from './blocks/CodeBlock';
import CalloutBlock from './blocks/CalloutBlock';
import ExerciseBlock from './blocks/ExerciseBlock';
import VideoBlock from './blocks/VideoBlock';
import ImageBlock from './blocks/ImageBlock';
import QuizBlock from './blocks/QuizBlock';
import ListBlock from './blocks/ListBlock';
import ExplanationBlock from './blocks/ExplanationBlock';
import ThinkOfBlock from './blocks/ThinkOfBlock';
import PracticeBlock from './blocks/PracticeBlock';

interface BlockCardProps {
  id: string;
  type: string;
  data: any;
  onChange: (data: any) => void;
  onDelete: () => void;
}

export default function BlockCard({ id, type, data, onChange, onDelete }: BlockCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const blockConfig = BLOCK_TYPES.find(b => b.id === type);
  const Icon = blockConfig?.icon || React.Fragment;

  const renderBlockEditor = () => {
    const safeData = data || {};
    switch (type) {
      case 'heading': return <HeadingBlock data={safeData} onChange={onChange} />;
      case 'text': return <TextBlock data={safeData} onChange={onChange} />;
      case 'analogy': return <AnalogyBlock data={safeData} onChange={onChange} />;
      case 'code': return <CodeBlock data={safeData} onChange={onChange} />;
      case 'callout': return <CalloutBlock data={safeData} onChange={onChange} />;
      case 'exercise': return <ExerciseBlock data={safeData} onChange={onChange} />;
      case 'video': return <VideoBlock data={safeData} onChange={onChange} />;
      case 'image': return <ImageBlock data={safeData} onChange={onChange} />;
      case 'quiz': return <QuizBlock data={safeData} onChange={onChange} />;
      case 'list': return <ListBlock data={safeData} onChange={onChange} />;
      case 'explanation': return <ExplanationBlock data={safeData} onChange={onChange} />;
      case 'think_of': return <ThinkOfBlock data={safeData} onChange={onChange} />;
      case 'practice': return <PracticeBlock data={safeData} onChange={onChange} />;
      default: return <div className="text-red-400">Unknown block type: {type}</div>;
    }
  };

  const badgeColors: Record<string, string> = {
    heading: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    text: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    analogy: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    code: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
    callout: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    exercise: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    video: 'bg-red-500/20 text-red-300 border-red-500/30',
    image: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    quiz: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    list: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
  };

  const badgeColor = badgeColors[type] || 'bg-slate-500/20 text-slate-300';

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`relative group bg-[#1A1D27] border ${isDragging ? 'border-blue-500' : 'border-white/5'} rounded-xl p-5 pl-10 shadow-sm`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="absolute left-2 top-0 bottom-0 flex items-center justify-center w-6 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="text-slate-500 w-4 h-4" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setCollapsed(!collapsed)} className="text-slate-400 hover:text-white">
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          <span className={`flex items-center gap-2 text-xs font-bold px-2.5 py-1 rounded-md border uppercase tracking-wide ${badgeColor}`}>
            {Icon !== React.Fragment && <Icon className="w-3.5 h-3.5" />}
            {blockConfig?.name || type}
          </span>
        </div>
        <button 
          onClick={onDelete}
          className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {!collapsed && (
        <div className="pl-2">
          {renderBlockEditor()}
        </div>
      )}
    </div>
  );
}
