// Fraylon Admin - Block Editor
import React from 'react';

export default function VideoBlock({ data, onChange }: { data: any, onChange: (data: any) => void }) {
  // Simple check for iframe extraction or basic youtube/vimeo embed parsing could go here
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    if (url.includes('vimeo.com/')) return url.replace('vimeo.com/', 'player.vimeo.com/video/');
    return url;
  };

  const embedUrl = getEmbedUrl(data.url || '');

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Video Title</label>
        <input 
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="e.g. Introduction to Java"
          className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 text-sm font-semibold"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Video URL (YouTube / Vimeo)</label>
        <input 
          type="text"
          value={data.url || ''}
          onChange={(e) => onChange({ ...data, url: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 text-sm"
        />
      </div>

      {embedUrl && (
        <div className="mt-2 aspect-video bg-black rounded-lg overflow-hidden border border-white/10">
          <iframe 
            src={embedUrl} 
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
