// Fraylon Admin - Phase 2
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminBreadcrumb } from "../../components/admin/AdminBreadcrumb";
import { UploadCloud, CheckCircle2, ChevronRight, Save, Plus } from "lucide-react";
import { authFetch } from "../../authClient";
import { CourseEditorNav } from "../../components/admin/CourseEditorNav";

export default function BlueprintBuilder() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!courseId);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [prerequisites, setPrerequisites] = useState<string[]>([]);
  const [noPrerequisites, setNoPrerequisites] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  useEffect(() => {
    if (courseId) {
      authFetch<any>(`/admin/courses/${courseId}`).then(course => {
        setTitle(course.title || "");
        setDescription(course.description || "");
        setCategory(course.category || "Web Development");
        setDifficulty(course.difficulty || "Beginner");
        setEstimatedDuration(course.estimatedDuration || "");
        setPrerequisites(course.prerequisites || []);
        setNoPrerequisites(!course.prerequisites || course.prerequisites.length === 0);
        setThumbnailUrl(course.thumbnailUrl || "");
        setIsLoading(false);
      }).catch(err => {
        console.error("Failed to fetch blueprint", err);
        setIsLoading(false);
      });
    }
  }, [courseId]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      if (courseId) {
        await authFetch<any>(`/admin/courses/${courseId}`, {
          method: "PATCH",
          body: JSON.stringify({
            title, description, category, difficulty, estimatedDuration, prerequisites: noPrerequisites ? [] : prerequisites, thumbnailUrl
          })
        });
        alert("Blueprint updated successfully");
        setIsSaving(false);
      } else {
        const course = await authFetch<any>("/admin/courses", {
          method: "POST",
          body: JSON.stringify({
            title, description, category, difficulty, estimatedDuration, prerequisites: noPrerequisites ? [] : prerequisites, thumbnailUrl
          })
        });
        navigate(`/admin/content-studio/${course.id}/lessons`);
      }
    } catch (err: any) {
      alert("Failed to save: " + err.message);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-[var(--text-muted)]">Loading blueprint...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-body)] overflow-auto">
      {courseId && <CourseEditorNav courseId={courseId} />}
      <div className="p-8 max-w-4xl mx-auto pb-24 w-full">
        <AdminBreadcrumb items={[
          { label: "Content Studio", path: "/admin/content-studio" },
          { label: courseId ? "Edit Course Blueprint" : "New Course Blueprint" }
        ]} />

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)] tracking-tight">Course Blueprint</h1>
          <p className="text-[var(--text-secondary)] mt-1">Design the foundation of your new learning experience.</p>
        </div>
        <button 
          onClick={() => {
            navigate('/admin/content-studio/new');
            if (!courseId) window.location.reload();
          }}
          className="bg-[var(--color-brand-navy)] hover:bg-[var(--color-primary)] text-[var(--bg-body)] px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Course
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center mb-12">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              step >= s ? "bg-[var(--color-brand-navy)] text-white" : "bg-[var(--bg-dark-surface)] text-[var(--text-muted)]"
            }`}>
              {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
            {s < 3 && (
              <div className={`h-1 flex-1 mx-4 rounded-full transition-colors ${
                step > s ? "bg-[var(--color-brand-navy)]" : "bg-[var(--bg-dark-surface)]"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-6 bg-[var(--bg-surface)] p-8 rounded-xl shadow-sm border border-[var(--border-light)]">
          <div>
            <label className="block text-sm font-medium text-[var(--text-main)] mb-2">Course Title <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Advanced Full-Stack React"
              className="w-full border border-[var(--border-light)] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-main)] bg-[var(--bg-body)]"
            />
            {title.length > 0 && title.length < 5 && <p className="text-red-500 text-xs mt-1">Title must be at least 5 characters.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-main)] mb-2">Description <span className="text-red-500">*</span></label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will students learn in this course?"
              rows={4}
              maxLength={500}
              className="w-full border border-[var(--border-light)] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all resize-none text-[var(--text-main)] bg-[var(--bg-body)]"
            />
            <div className="flex justify-between items-center mt-1">
              {description.length > 0 && description.length < 20 ? (
                <p className="text-red-500 text-xs">Description must be at least 20 characters.</p>
              ) : <div/>}
              <p className="text-xs text-[var(--text-muted)]">{description.length}/500</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-main)] mb-2">Thumbnail Upload</label>
            <div className="border-2 border-dashed border-[var(--border-light)] rounded-xl p-8 flex flex-col items-center justify-center bg-[var(--bg-body)] hover:bg-[var(--bg-dark-surface)] transition-colors cursor-pointer">
              <UploadCloud className="w-10 h-10 text-[var(--text-muted)] mb-3" />
              <p className="text-sm font-medium text-[var(--text-secondary)]">Click to upload or drag and drop</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">PNG, JPG or WEBP (Max 2MB)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-main)] mb-2">Category <span className="text-red-500">*</span></label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-[var(--border-light)] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all bg-[var(--bg-body)] text-[var(--text-main)]"
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
              <label className="block text-sm font-medium text-[var(--text-main)] mb-2">Estimated Duration (hours)</label>
              <input 
                type="number" 
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                placeholder="e.g. 15"
                min="1"
                className="w-full border border-[var(--border-light)] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-main)] bg-[var(--bg-body)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-main)] mb-3">Difficulty Level <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-3 gap-4">
              {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                <div 
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center justify-center transition-all duration-200 ${
                    difficulty === level ? "border-[var(--color-brand-navy)] bg-[var(--color-brand-navy)] hover:bg-[var(--color-primary)] text-[var(--bg-body)] shadow-sm" : "border-[var(--border-light)] bg-[var(--bg-body)] text-[var(--text-secondary)] hover:bg-[var(--color-primary)] hover:border-[var(--color-primary)] hover:text-[var(--bg-body)]"
                  }`}
                >
                  <span className="font-medium text-sm">{level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Structure */}
      {step === 2 && (
        <div className="space-y-6 bg-[var(--bg-surface)] p-8 rounded-xl shadow-sm border border-[var(--border-light)]">
          <div>
            <label className="block text-sm font-medium text-[var(--text-main)] mb-2">Prerequisites</label>
            <p className="text-sm text-[var(--text-muted)] mb-4">Select courses students should complete before starting this one.</p>
            
            <div className="flex items-center gap-3 mb-4">
              <input 
                type="checkbox" 
                id="noPre" 
                checked={noPrerequisites}
                onChange={(e) => setNoPrerequisites(e.target.checked)}
                className="w-4 h-4 text-[var(--color-primary)] rounded border-[var(--border-light)] focus:ring-[var(--color-primary)]"
              />
              <label htmlFor="noPre" className="text-sm text-[var(--text-secondary)] font-medium">No prerequisites required</label>
            </div>

            {!noPrerequisites && (
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Search existing published courses..."
                  className="w-full border border-[var(--border-light)] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-main)] bg-[var(--bg-body)]"
                />
                {/* Placeholder for selected tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--bg-dark-surface)] text-[var(--text-main)] border border-[var(--border-light)]">
                    Intro to HTML & CSS
                    <button className="hover:text-[var(--color-primary)] font-bold">&times;</button>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-6 bg-[var(--bg-surface)] p-8 rounded-xl shadow-sm border border-[var(--border-light)]">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-main)] border-b border-[var(--border-light)] pb-2 mb-4">Review Course Blueprint</h3>
            
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="text-[var(--text-muted)]">Title</div>
              <div className="font-medium text-[var(--text-main)]">{title || "Untitled Course"}</div>
              
              <div className="text-[var(--text-muted)]">Category</div>
              <div className="font-medium text-[var(--text-main)]">{category}</div>
              
              <div className="text-[var(--text-muted)]">Difficulty</div>
              <div className="font-medium text-[var(--text-main)]">{difficulty}</div>
              
              <div className="text-[var(--text-muted)]">Duration</div>
              <div className="font-medium text-[var(--text-main)]">{estimatedDuration ? `${estimatedDuration} hours` : "Not specified"}</div>
              
              <div className="text-[var(--text-muted)]">Prerequisites</div>
              <div className="font-medium text-[var(--text-main)]">{noPrerequisites ? "None" : "1 selected"}</div>
            </div>

            <div className="mt-6 pt-6 border-t border-[var(--border-light)]">
              <div className="text-[var(--text-muted)] text-sm mb-2">Description</div>
              <p className="text-[var(--text-main)] text-sm whitespace-pre-wrap">{description || "No description provided."}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8">
        <button 
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="px-6 py-2.5 rounded-lg font-medium text-[var(--text-secondary)] bg-[var(--bg-body)] border border-[var(--border-light)] hover:bg-[var(--bg-surface)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>

        {step < 3 ? (
          <button 
            onClick={() => setStep(step + 1)}
            disabled={title.length < 5 || description.length < 20}
            className="px-6 py-2.5 rounded-lg font-medium text-white bg-[var(--color-brand-navy)] hover:bg-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Continue to {step === 1 ? "Structure" : "Review"}
          </button>
        ) : (
          <button 
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg font-medium text-white bg-[var(--color-brand-navy)] hover:bg-[var(--color-primary)] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : courseId ? "Save Changes" : "Save as Draft"}
            {courseId ? <Save className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  </div>
  );
}
