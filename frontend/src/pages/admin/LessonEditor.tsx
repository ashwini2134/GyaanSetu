// Fraylon Admin - Phase 2
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AdminBreadcrumb } from "../../components/admin/AdminBreadcrumb";
import { CourseEditorNav } from "../../components/admin/CourseEditorNav";
import { RichTextEditor } from "../../components/admin/RichTextEditor";
import { ExerciseBuilder } from "../../components/admin/ExerciseBuilder";
import { GripVertical, Plus, Settings, PlayCircle, BookOpen, LayoutTemplate, Dumbbell, Save, Trash2 } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { authFetch } from "../../authClient";

interface Lesson {
  id: string;
  title: string;
  type: string;
  content: string;
  order?: number;
}

const SortableLessonItem = ({ lesson, activeId, onClick }: { lesson: Lesson, activeId: string, onClick: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lesson.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${activeId === lesson.id ? 'bg-blue-900/30 border border-blue-200' : 'hover:bg-[#0a0f1e] border border-transparent'}`} onClick={onClick}>
      <div {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-300 p-1">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${activeId === lesson.id ? 'text-blue-400' : 'text-slate-300'}`}>{lesson.title}</p>
        <p className="text-xs text-slate-400 capitalize">{lesson.type}</p>
      </div>
      {lesson.type === 'video' && <PlayCircle className="w-4 h-4 text-slate-400 shrink-0" />}
      {lesson.type === 'content' && <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />}
    </div>
  );
};

export default function LessonEditor() {
  const { courseId } = useParams();
  
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string>('');
  const [isExerciseBuilderOpen, setIsExerciseBuilderOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    authFetch<Lesson[]>(`/admin/courses/${courseId}/lessons`)
      .then(data => {
        setLessons(data);
        if (data.length > 0) setActiveLessonId(data[0].id);
      })
      .catch(console.error);
  }, [courseId]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = lessons.findIndex(i => i.id === active.id);
      const newIndex = lessons.findIndex(i => i.id === over.id);
      const newLessons = arrayMove(lessons, oldIndex, newIndex);
      setLessons(newLessons);
      
      try {
        await authFetch(`/admin/courses/${courseId}/lessons/reorder`, {
          method: 'PATCH',
          body: JSON.stringify({ lessonIds: newLessons.map(l => l.id) })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const addLesson = async () => {
    try {
      const newLesson = await authFetch<Lesson>(`/admin/courses/${courseId}/lessons`, {
        method: 'POST',
        body: JSON.stringify({ title: 'New Lesson', type: 'content' })
      });
      setLessons([...lessons, newLesson]);
      setActiveLessonId(newLesson.id);
    } catch (err) {
      console.error(err);
    }
  };

  const activeLesson = lessons.find(l => l.id === activeLessonId);

  const updateActiveLesson = (updates: Partial<Lesson>) => {
    setLessons(lessons.map(l => l.id === activeLessonId ? { ...l, ...updates } : l));
  };

  const saveActiveLesson = async () => {
    if (!activeLesson) return;
    setIsSaving(true);
    try {
      await authFetch(`/admin/lessons/${activeLesson.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: activeLesson.title, type: activeLesson.type, content: activeLesson.content })
      });
      // Optionally show a toast here
    } catch (err: any) {
      alert("Failed to save lesson: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteActiveLesson = async () => {
    if (!activeLesson) return;
    if (!confirm(`Are you sure you want to delete "${activeLesson.title}"? This cannot be undone.`)) return;
    try {
      await authFetch(`/admin/lessons/${activeLesson.id}`, { method: 'DELETE' });
      const newLessons = lessons.filter(l => l.id !== activeLesson.id);
      setLessons(newLessons);
      setActiveLessonId(newLessons.length > 0 ? newLessons[0].id : '');
    } catch (err: any) {
      alert("Failed to delete lesson: " + err.message);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      <div className="p-8 pb-0 shrink-0">
        <AdminBreadcrumb items={[
          { label: "Content Studio", path: "/admin/content-studio" },
          { label: "Course Editor" }
        ]} />
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-100">Course Editor</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] border border-white/10 rounded-lg text-sm font-medium text-slate-300 hover:bg-[#0a0f1e] transition-colors">
            <Settings className="w-4 h-4" />
            Course Settings
          </button>
        </div>
      </div>

      <CourseEditorNav courseId={courseId || "draft"} />

      <div className="flex flex-1 overflow-hidden min-h-0 bg-[#0f172a]">
        {/* Left Sidebar - Lesson List */}
        <div className="w-80 bg-[#0a0f1e] border-r border-white/10 flex flex-col shrink-0">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0f172a] shrink-0">
            <h3 className="font-semibold text-slate-100">Curriculum</h3>
            <button onClick={addLesson} className="p-1.5 text-blue-400 hover:bg-blue-900/30 rounded-md transition-colors">
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
        <div className="flex-1 overflow-y-auto p-8 bg-[#0a0f1e] relative">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto space-y-6 pb-24">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-100">Lesson Details</h2>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsExerciseBuilderOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] border border-white/10 rounded-lg text-sm font-medium text-blue-400 hover:bg-blue-900/30 transition-colors"
                  >
                    <Dumbbell className="w-4 h-4" />
                    Add Exercise
                  </button>
                  <button 
                    onClick={saveActiveLesson}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save Lesson"}
                  </button>
                  <button 
                    onClick={deleteActiveLesson}
                    className="flex items-center gap-2 px-3 py-2 bg-[#0f172a] border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                    title="Delete Lesson"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-[#0f172a] p-6 rounded-xl border border-white/10 shadow-sm">
                <input 
                  type="text"
                  value={activeLesson.title}
                  onChange={(e) => updateActiveLesson({ title: e.target.value })}
                  className="text-2xl font-bold text-slate-100 w-full outline-none placeholder:text-slate-300 border-b border-transparent focus:border-white/10 pb-2 mb-4"
                  placeholder="Lesson Title"
                />
                
                <div className="flex items-center gap-4 mb-6">
                  <label className="text-sm font-medium text-slate-300">Lesson Type:</label>
                  <select 
                    value={activeLesson.type}
                    onChange={(e) => updateActiveLesson({ type: e.target.value })}
                    className="border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="content">Text Content</option>
                    <option value="video">Video Lesson</option>
                  </select>
                </div>

                {activeLesson.type === 'video' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Video URL (YouTube/Vimeo)</label>
                    <input 
                      type="text" 
                      placeholder="https://..."
                      className="w-full border border-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Lesson Content</label>
                  <RichTextEditor 
                    content={activeLesson.content} 
                    onChange={(content) => updateActiveLesson({ content })}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
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
