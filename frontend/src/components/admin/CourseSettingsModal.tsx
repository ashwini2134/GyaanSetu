// Fraylon Admin - Phase 2
import { useState, useEffect } from "react";
import { X, UploadCloud, Save } from "lucide-react";
import { authFetch } from "../../authClient";

interface CourseSettingsModalProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function CourseSettingsModal({ courseId, isOpen, onClose, onSaved }: CourseSettingsModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  useEffect(() => {
    if (isOpen && courseId) {
      setIsLoading(true);
      authFetch<any>(`/admin/courses/${courseId}`)
        .then(course => {
          setTitle(course.title || "");
          setDescription(course.description || "");
          setCategory(course.category || "Web Development");
          setDifficulty(course.difficulty || "Beginner");
          setEstimatedDuration(course.estimatedDuration || "");
          setThumbnailUrl(course.thumbnailUrl || "");
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch course details", err);
          setIsLoading(false);
        });
    }
  }, [isOpen, courseId]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await authFetch(`/admin/courses/${courseId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title, description, category, difficulty, estimatedDuration, thumbnailUrl
        })
      });
      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      alert("Failed to save course settings: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#0f172a] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Course Settings</h2>
            <p className="text-sm text-slate-400 mt-1">Quickly update course metadata.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-48 text-slate-400">Loading settings...</div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Course Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg px-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg px-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Thumbnail Upload</label>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center bg-[#0a0f1e] hover:bg-white/5 transition-colors cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-slate-300">Click to upload image</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg px-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                  >
                    <option>Web Development</option>
                    <option>Data Science</option>
                    <option>AI/ML</option>
                    <option>Design</option>
                    <option>Business</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Duration (hours)</label>
                  <input 
                    type="number" 
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg px-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                <div className="flex gap-4">
                  {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        difficulty === level 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'bg-[#0a0f1e] border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-[#0a0f1e] rounded-b-2xl shrink-0">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
