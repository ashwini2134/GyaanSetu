// Fraylon Admin - Phase 2
import { useState } from "react";
import { useParams } from "react-router-dom";
import { AdminBreadcrumb } from "../../components/admin/AdminBreadcrumb";
import { CourseEditorNav } from "../../components/admin/CourseEditorNav";
import { RichTextEditor } from "../../components/admin/RichTextEditor";
import { ExerciseBuilder } from "../../components/admin/ExerciseBuilder";
import { GripVertical, Plus, Settings, PlayCircle, BookOpen, LayoutTemplate, Dumbbell } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Lesson {
  id: string;
  title: string;
  type: string;
  content: string;
}

const SortableLessonItem = ({ lesson, activeId, onClick }: { lesson: Lesson, activeId: string, onClick: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lesson.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${activeId === lesson.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'}`} onClick={onClick}>
      <div {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600 p-1">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${activeId === lesson.id ? 'text-blue-700' : 'text-slate-700'}`}>{lesson.title}</p>
        <p className="text-xs text-slate-500 capitalize">{lesson.type}</p>
      </div>
      {lesson.type === 'video' && <PlayCircle className="w-4 h-4 text-slate-400 shrink-0" />}
      {lesson.type === 'content' && <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />}
    </div>
  );
};

export default function LessonEditor() {
  const { courseId } = useParams();
  
  const [lessons, setLessons] = useState<Lesson[]>([
    { id: '1', title: 'Welcome to the Course', type: 'video', content: '<h2>Welcome!</h2><p>This is the intro.</p>' },
    { id: '2', title: 'Setting up your environment', type: 'content', content: '<h2>Setup</h2><p>Install Node.js.</p>' },
  ]);
  const [activeLessonId, setActiveLessonId] = useState<string>('1');
  const [isExerciseBuilderOpen, setIsExerciseBuilderOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setLessons((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addLesson = () => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: 'New Lesson',
      type: 'content',
      content: ''
    };
    setLessons([...lessons, newLesson]);
    setActiveLessonId(newLesson.id);
  };

  const activeLesson = lessons.find(l => l.id === activeLessonId);

  const updateActiveLesson = (updates: Partial<Lesson>) => {
    setLessons(lessons.map(l => l.id === activeLessonId ? { ...l, ...updates } : l));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      <div className="p-8 pb-0 shrink-0">
        <AdminBreadcrumb items={[
          { label: "Content Studio", path: "/admin/content-studio" },
          { label: "Course Editor" }
        ]} />
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Course Editor</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Settings className="w-4 h-4" />
            Course Settings
          </button>
        </div>
      </div>

      <CourseEditorNav courseId={courseId || "draft"} />

      <div className="flex flex-1 overflow-hidden min-h-0 bg-white">
        {/* Left Sidebar - Lesson List */}
        <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
            <h3 className="font-semibold text-slate-900">Curriculum</h3>
            <button onClick={addLesson} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                  {lessons.map((lesson) => (
                    <SortableLessonItem 
                      key={lesson.id} 
                      lesson={lesson} 
                      activeId={activeLessonId}
                      onClick={() => setActiveLessonId(lesson.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>

        {/* Right Area - Editor */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 relative">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto space-y-6 pb-24">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">Lesson Details</h2>
                <button 
                  onClick={() => setIsExerciseBuilderOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Dumbbell className="w-4 h-4" />
                  Add Exercise
                </button>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <input 
                  type="text"
                  value={activeLesson.title}
                  onChange={(e) => updateActiveLesson({ title: e.target.value })}
                  className="text-2xl font-bold text-slate-900 w-full outline-none placeholder:text-slate-300 border-b border-transparent focus:border-slate-200 pb-2 mb-4"
                  placeholder="Lesson Title"
                />
                
                <div className="flex items-center gap-4 mb-6">
                  <label className="text-sm font-medium text-slate-700">Lesson Type:</label>
                  <select 
                    value={activeLesson.type}
                    onChange={(e) => updateActiveLesson({ type: e.target.value })}
                    className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="content">Text Content</option>
                    <option value="video">Video Lesson</option>
                  </select>
                </div>

                {activeLesson.type === 'video' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Video URL (YouTube/Vimeo)</label>
                    <input 
                      type="text" 
                      placeholder="https://..."
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Lesson Content</label>
                  <RichTextEditor 
                    content={activeLesson.content} 
                    onChange={(content) => updateActiveLesson({ content })}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <LayoutTemplate className="w-12 h-12 mb-4 text-slate-300" />
              <p>Select a lesson to edit or create a new one.</p>
            </div>
          )}
        </div>
      </div>
      
      <ExerciseBuilder 
        isOpen={isExerciseBuilderOpen} 
        onClose={() => setIsExerciseBuilderOpen(false)} 
      />
    </div>
  );
}
