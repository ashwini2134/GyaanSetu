import React from 'react';
import { Brain, Code, BookOpen } from 'lucide-react';

export function getCourseIconDetails(courseName: string, category: string) {
  const nameLow = (courseName || '').toLowerCase();
  const catLow = (category || '').toLowerCase();

  // Python Programming
  if (nameLow === 'python programming' || nameLow.includes('python programming')) {
    return {
      type: 'text',
      content: 'Py',
      bgClass: 'bg-blue-500/15',
      borderClass: 'border-blue-500/30',
      textClass: 'text-blue-500 font-bold text-[20px]',
      color: '#3B82F6',
      subtitle: 'Python'
    };
  }

  // CS50 Python
  if (nameLow.includes('cs50 python') || nameLow === 'cs50p') {
    return {
      type: 'text',
      content: 'Py',
      bgClass: 'bg-blue-500/15',
      borderClass: 'border-blue-500/30',
      textClass: 'text-blue-500 font-bold text-[20px]',
      color: '#3B82F6',
      subtitle: 'CS50 Python'
    };
  }

  // Generic Python
  if (nameLow.includes('python')) {
    return {
      type: 'text',
      content: 'Py',
      bgClass: 'bg-blue-500/15',
      borderClass: 'border-blue-500/30',
      textClass: 'text-blue-500 font-bold text-[20px]',
      color: '#3B82F6',
      subtitle: 'Python'
    };
  }

  // AI
  if (catLow.includes('artificial intelligence') || nameLow === 'ai' || nameLow.includes(' ai ') || nameLow.endsWith(' ai') || nameLow.startsWith('ai ')) {
    return {
      type: 'icon',
      icon: Brain,
      bgClass: 'bg-purple-500/15',
      borderClass: 'border-purple-500/30',
      textClass: 'text-purple-500',
      color: '#A855F7',
      subtitle: 'Artificial Intelligence'
    };
  }

  // Computer Science
  if (catLow.includes('computer science') || nameLow.includes('cs50')) {
    return {
      type: 'icon',
      icon: Code,
      bgClass: 'bg-green-500/15',
      borderClass: 'border-green-500/30',
      textClass: 'text-green-500',
      color: '#22C55E',
      subtitle: 'Computer Science'
    };
  }

  // Default fallback
  return {
    type: 'icon',
    icon: BookOpen,
    bgClass: 'bg-slate-500/15',
    borderClass: 'border-slate-500/30',
    textClass: 'text-slate-500',
    color: '#64748B',
    subtitle: courseName.split(' ')[0]
  };
}

export function DynamicCourseIcon({ courseName, category }: { courseName: string; category: string }) {
  const details = getCourseIconDetails(courseName, category);
  
  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      <div 
        className={`w-[64px] h-[64px] rounded-[16px] flex items-center justify-center border backdrop-blur-[10px] ${details.bgClass} ${details.borderClass}`} 
        style={{ WebkitBackdropFilter: 'blur(10px)' }}
      >
        {details.type === 'text' ? (
          <span className={details.textClass} style={{ color: details.color }}>
            {details.content}
          </span>
        ) : (
          details.icon && <details.icon size={28} className={details.textClass} color={details.color} />
        )}
      </div>
      <span className="text-[11px] text-slate-500 font-medium text-center">
        {details.subtitle}
      </span>
    </div>
  );
}
