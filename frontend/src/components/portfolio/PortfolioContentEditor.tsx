import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { ExperienceEntry, EducationEntry, ServiceEntry, TestimonialEntry } from './templates/types';

const inputClass = "w-full h-[40px] bg-[var(--bg-body)] border border-[var(--border-light)] rounded-[8px] px-3 text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-shadow";
const labelClass = "block text-xs font-medium text-[var(--text-secondary)] mb-1.5";

interface FieldConfig<T> {
  key: keyof T;
  label: string;
  type: 'text' | 'textarea' | 'checkbox';
  placeholder?: string;
  half?: boolean;
}

function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface ListEditorProps<T extends { id: string }> {
  title: string;
  description: string;
  items: T[];
  onChange: (items: T[]) => void;
  fields: FieldConfig<T>[];
  emptyItem: Omit<T, 'id'>;
  renderSummary: (item: T) => { title: string; subtitle?: string };
  addLabel: string;
}

function ListEditor<T extends { id: string }>({
  title, description, items, onChange, fields, emptyItem, renderSummary, addLabel,
}: ListEditorProps<T>) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAdd = () => {
    const item = { ...emptyItem, id: genId() } as T;
    onChange([...items, item]);
    setExpandedId(item.id);
  };

  const handleDelete = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const handleFieldChange = (id: string, key: keyof T, value: string | boolean) => {
    onChange(items.map((i) => (i.id === id ? { ...i, [key]: value } : i)));
  };

  return (
    <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-light)] space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-[var(--text-main)]">{title}</h4>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{description}</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 h-9 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-[8px] text-[13px] font-medium hover:bg-[var(--color-primary)]/20 transition-colors flex-shrink-0"
        >
          <Plus size={14} /> {addLabel}
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-[13px] text-[var(--text-muted)] italic py-2">Nothing added yet.</p>
      )}

      <div className="space-y-2">
        {items.map((item) => {
          const isOpen = expandedId === item.id;
          const summary = renderSummary(item);
          return (
            <div key={item.id} className="border border-[var(--border-light)] rounded-[10px] overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setExpandedId(isOpen ? null : item.id)}
                  className="flex-1 flex items-center gap-2 text-left min-w-0"
                >
                  {isOpen ? <ChevronUp size={14} className="text-[var(--text-muted)] flex-shrink-0" /> : <ChevronDown size={14} className="text-[var(--text-muted)] flex-shrink-0" />}
                  <span className="min-w-0">
                    <span className="text-sm font-medium text-[var(--text-main)] truncate block">{summary.title || 'Untitled'}</span>
                    {summary.subtitle && <span className="text-[12px] text-[var(--text-muted)] truncate block">{summary.subtitle}</span>}
                  </span>
                </button>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button type="button" onClick={() => setExpandedId(isOpen ? null : item.id)} className="p-2 text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button type="button" onClick={() => handleDelete(item.id)} className="p-2 text-[var(--text-muted)] hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-[var(--border-light)] grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fields.map((f) => (
                    <div key={String(f.key)} className={f.type === 'textarea' || !f.half ? 'md:col-span-2' : ''}>
                      {f.type === 'checkbox' ? (
                        <label className="flex items-center gap-2 cursor-pointer mt-2">
                          <input
                            type="checkbox"
                            checked={Boolean(item[f.key])}
                            onChange={(e) => handleFieldChange(item.id, f.key, e.target.checked)}
                            className="w-4 h-4 accent-[var(--color-primary)]"
                          />
                          <span className="text-sm text-[var(--text-secondary)]">{f.label}</span>
                        </label>
                      ) : f.type === 'textarea' ? (
                        <>
                          <label className={labelClass}>{f.label}</label>
                          <textarea
                            value={String(item[f.key] ?? '')}
                            onChange={(e) => handleFieldChange(item.id, f.key, e.target.value)}
                            placeholder={f.placeholder}
                            rows={3}
                            className="w-full bg-[var(--bg-body)] border border-[var(--border-light)] rounded-[8px] p-3 text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-shadow resize-none"
                          />
                        </>
                      ) : (
                        <>
                          <label className={labelClass}>{f.label}</label>
                          <input
                            type="text"
                            value={String(item[f.key] ?? '')}
                            onChange={(e) => handleFieldChange(item.id, f.key, e.target.value)}
                            placeholder={f.placeholder}
                            className={inputClass}
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ExperienceEditor({ items, onChange }: { items: ExperienceEntry[]; onChange: (items: ExperienceEntry[]) => void }) {
  return (
    <ListEditor<ExperienceEntry>
      title="Work Experience"
      description="Roles you've held — shown on narrative-style templates."
      items={items}
      onChange={onChange}
      addLabel="Add role"
      emptyItem={{ role: '', company: '', startDate: '', endDate: '', current: false, description: '' }}
      renderSummary={(i) => ({ title: [i.role, i.company].filter(Boolean).join(' at '), subtitle: [i.startDate, i.current ? 'Present' : i.endDate].filter(Boolean).join(' – ') })}
      fields={[
        { key: 'role', label: 'Role', type: 'text', placeholder: 'Software Engineer Intern', half: true },
        { key: 'company', label: 'Company', type: 'text', placeholder: 'Acme Inc.', half: true },
        { key: 'startDate', label: 'Start Date', type: 'text', placeholder: 'Jan 2025', half: true },
        { key: 'endDate', label: 'End Date', type: 'text', placeholder: 'Jun 2025', half: true },
        { key: 'current', label: 'I currently work here', type: 'checkbox' },
        { key: 'description', label: 'Description', type: 'textarea', placeholder: 'What you worked on...' },
      ]}
    />
  );
}

export function EducationEditor({ items, onChange }: { items: EducationEntry[]; onChange: (items: EducationEntry[]) => void }) {
  return (
    <ListEditor<EducationEntry>
      title="Education"
      description="Degrees and programs — shown on narrative-style templates."
      items={items}
      onChange={onChange}
      addLabel="Add education"
      emptyItem={{ institution: '', degree: '', field: '', startDate: '', endDate: '', description: '' }}
      renderSummary={(i) => ({ title: i.institution, subtitle: [i.degree, i.field].filter(Boolean).join(', ') })}
      fields={[
        { key: 'institution', label: 'Institution', type: 'text', placeholder: 'State University', half: true },
        { key: 'degree', label: 'Degree', type: 'text', placeholder: 'B.S.', half: true },
        { key: 'field', label: 'Field of Study', type: 'text', placeholder: 'Computer Science', half: true },
        { key: 'startDate', label: 'Start Date', type: 'text', placeholder: '2022', half: true },
        { key: 'endDate', label: 'End Date', type: 'text', placeholder: '2026', half: true },
        { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Honors, activities, coursework...' },
      ]}
    />
  );
}

export function ServicesEditor({ items, onChange }: { items: ServiceEntry[]; onChange: (items: ServiceEntry[]) => void }) {
  return (
    <ListEditor<ServiceEntry>
      title="Services"
      description="What you offer — shown as capability cards on narrative-style templates."
      items={items}
      onChange={onChange}
      addLabel="Add service"
      emptyItem={{ title: '', description: '' }}
      renderSummary={(i) => ({ title: i.title, subtitle: i.description })}
      fields={[
        { key: 'title', label: 'Title', type: 'text', placeholder: 'Web Development' },
        { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Building responsive, accessible web apps...' },
      ]}
    />
  );
}

export function TestimonialsEditor({ items, onChange }: { items: TestimonialEntry[]; onChange: (items: TestimonialEntry[]) => void }) {
  return (
    <ListEditor<TestimonialEntry>
      title="Testimonials"
      description="Quotes from mentors, teammates, or clients."
      items={items}
      onChange={onChange}
      addLabel="Add testimonial"
      emptyItem={{ quote: '', author: '', role: '', company: '', avatarUrl: '' }}
      renderSummary={(i) => ({ title: i.author || 'Untitled', subtitle: [i.role, i.company].filter(Boolean).join(', ') })}
      fields={[
        { key: 'quote', label: 'Quote', type: 'textarea', placeholder: '"Working with them was..."' },
        { key: 'author', label: 'Author Name', type: 'text', placeholder: 'Jane Doe', half: true },
        { key: 'role', label: 'Author Role', type: 'text', placeholder: 'Engineering Manager', half: true },
        { key: 'company', label: 'Company', type: 'text', placeholder: 'Acme Inc.', half: true },
        { key: 'avatarUrl', label: 'Avatar URL', type: 'text', placeholder: 'https://...', half: true },
      ]}
    />
  );
}
