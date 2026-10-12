// Fraylon Admin - Phase 2
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Minus, ImageIcon, Code } from 'lucide-react';

const lowlight = createLowlight(common);

export function RichTextEditor({ content, onChange }: { content: string, onChange: (content: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[400px]',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="border border-[var(--border-light)] rounded-lg overflow-hidden bg-[var(--bg-body)]">
      <div className="bg-[var(--bg-surface)] border-b border-[var(--border-light)] p-2 flex flex-wrap gap-1 items-center">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-[var(--bg-dark-surface)] hover:text-[var(--color-primary)] ${editor.isActive('bold') ? 'bg-[var(--bg-dark-surface)] text-[var(--color-primary)]' : 'text-[var(--text-secondary)]'}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-[var(--bg-dark-surface)] hover:text-[var(--color-primary)] ${editor.isActive('italic') ? 'bg-[var(--bg-dark-surface)] text-[var(--color-primary)]' : 'text-[var(--text-secondary)]'}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-[var(--border-light)] mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-[var(--bg-dark-surface)] hover:text-[var(--color-primary)] ${editor.isActive('heading', { level: 1 }) ? 'bg-[var(--bg-dark-surface)] text-[var(--color-primary)]' : 'text-[var(--text-secondary)]'}`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-[var(--bg-dark-surface)] hover:text-[var(--color-primary)] ${editor.isActive('heading', { level: 2 }) ? 'bg-[var(--bg-dark-surface)] text-[var(--color-primary)]' : 'text-[var(--text-secondary)]'}`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-[var(--border-light)] mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-[var(--bg-dark-surface)] hover:text-[var(--color-primary)] ${editor.isActive('bulletList') ? 'bg-[var(--bg-dark-surface)] text-[var(--color-primary)]' : 'text-[var(--text-secondary)]'}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-[var(--bg-dark-surface)] hover:text-[var(--color-primary)] ${editor.isActive('orderedList') ? 'bg-[var(--bg-dark-surface)] text-[var(--color-primary)]' : 'text-[var(--text-secondary)]'}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-[var(--bg-dark-surface)] hover:text-[var(--color-primary)] ${editor.isActive('blockquote') ? 'bg-[var(--bg-dark-surface)] text-[var(--color-primary)]' : 'text-[var(--text-secondary)]'}`}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={`p-2 rounded hover:bg-[var(--bg-dark-surface)] hover:text-[var(--color-primary)] text-[var(--text-secondary)]`}
          title="Divider"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-[var(--border-light)] mx-1" />
        <button
          onClick={addImage}
          className={`p-2 rounded hover:bg-[var(--bg-dark-surface)] hover:text-[var(--color-primary)] text-[var(--text-secondary)]`}
          title="Add Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-[var(--bg-dark-surface)] hover:text-[var(--color-primary)] ${editor.isActive('codeBlock') ? 'bg-[var(--bg-dark-surface)] text-[var(--color-primary)]' : 'text-[var(--text-secondary)]'}`}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 cursor-text" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
