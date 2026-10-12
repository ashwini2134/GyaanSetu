import { useEffect, useRef, useState } from 'react';
import type { TemplateComponentId } from './registry';
import { TEMPLATE_COMPONENTS } from './registry';
import type { TemplateProps } from './types';

// Renders an actual template component at full size, then scales it down to
// fit its container — a genuine live preview (the student's real data, the
// template's real layout) rather than a static mockup screenshot.
const SOURCE_WIDTH = 1280;
const SOURCE_HEIGHT = 900;

export default function LiveTemplatePreview({ templateId, previewProps }: { templateId: TemplateComponentId; previewProps: TemplateProps }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  const Template = TEMPLATE_COMPONENTS[templateId];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / SOURCE_WIDTH);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden bg-[var(--bg-body)]" style={{ height: SOURCE_HEIGHT * scale }}>
      <div
        style={{ width: SOURCE_WIDTH, height: SOURCE_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}
      >
        <Template {...previewProps} />
      </div>
    </div>
  );
}
