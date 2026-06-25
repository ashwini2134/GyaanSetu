// Fraylon Admin - Phase 2
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminBreadcrumb } from "../../components/admin/AdminBreadcrumb";
import { UploadCloud, CheckCircle2, ChevronRight } from "lucide-react";
import { authFetch } from "../../authClient";

export default function BlueprintBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [prerequisites, setPrerequisites] = useState<string[]>([]);
  const [noPrerequisites, setNoPrerequisites] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const course = await authFetch<any>("/admin/courses", {
        method: "POST",
        body: JSON.stringify({
          title, description, category, difficulty, estimatedDuration, prerequisites: noPrerequisites ? [] : prerequisites, thumbnailUrl
        })
      });
      navigate(`/admin/content-studio/${course.id}/lessons`);
    } catch (err: any) {
      alert("Failed to save: " + err.message);
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      <AdminBreadcrumb items={[
        { label: "Content Studio", path: "/admin/content-studio" },
        { label: "New Course Blueprint" }
      ]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Course Blueprint</h1>
        <p className="text-slate-500 mt-1">Design the foundation of your new learning experience.</p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center mb-12">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              step >= s ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
            }`}>
              {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
            {s < 3 && (
              <div className={`h-1 flex-1 mx-4 rounded-full transition-colors ${
                step > s ? "bg-blue-600" : "bg-slate-200"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Course Title <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Advanced Full-Stack React"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            {title.length > 0 && title.length < 5 && <p className="text-red-500 text-xs mt-1">Title must be at least 5 characters.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Description <span className="text-red-500">*</span></label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will students learn in this course?"
              rows={4}
              maxLength={500}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            />
            <div className="flex justify-between items-center mt-1">
              {description.length > 0 && description.length < 20 ? (
                <p className="text-red-500 text-xs">Description must be at least 20 characters.</p>
              ) : <div/>}
              <p className="text-xs text-slate-500">{description.length}/500</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Thumbnail Upload</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
              <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG or WEBP (Max 2MB)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Category <span className="text-red-500">*</span></label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
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
              <label className="block text-sm font-medium text-slate-900 mb-2">Estimated Duration (hours)</label>
              <input 
                type="number" 
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                placeholder="e.g. 15"
                min="1"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-3">Difficulty Level <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-3 gap-4">
              {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                <div 
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center justify-center transition-all ${
                    difficulty === level ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm" : "border-slate-200 hover:border-slate-300 bg-white text-slate-600"
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
        <div className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Prerequisites</label>
            <p className="text-sm text-slate-500 mb-4">Select courses students should complete before starting this one.</p>
            
            <div className="flex items-center gap-3 mb-4">
              <input 
                type="checkbox" 
                id="noPre" 
                checked={noPrerequisites}
                onChange={(e) => setNoPrerequisites(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <label htmlFor="noPre" className="text-sm text-slate-700 font-medium">No prerequisites required</label>
            </div>

            {!noPrerequisites && (
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Search existing published courses..."
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                {/* Placeholder for selected tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Intro to HTML & CSS
                    <button className="hover:text-blue-900 font-bold">&times;</button>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Review Course Blueprint</h3>
            
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div className="text-slate-500">Title</div>
              <div className="font-medium text-slate-900">{title || "Untitled Course"}</div>
              
              <div className="text-slate-500">Category</div>
              <div className="font-medium text-slate-900">{category}</div>
              
              <div className="text-slate-500">Difficulty</div>
              <div className="font-medium text-slate-900">{difficulty}</div>
              
              <div className="text-slate-500">Duration</div>
              <div className="font-medium text-slate-900">{estimatedDuration ? `${estimatedDuration} hours` : "Not specified"}</div>
              
              <div className="text-slate-500">Prerequisites</div>
              <div className="font-medium text-slate-900">{noPrerequisites ? "None" : "1 selected"}</div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="text-slate-500 text-sm mb-2">Description</div>
              <p className="text-slate-900 text-sm whitespace-pre-wrap">{description || "No description provided."}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8">
        <button 
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="px-6 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>

        {step < 3 ? (
          <button 
            onClick={() => setStep(step + 1)}
            disabled={title.length < 5 || description.length < 20}
            className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Continue to {step === 1 ? "Structure" : "Review"}
          </button>
        ) : (
          <button 
            onClick={handleSaveDraft}
            className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
          >
            Save as Draft
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
