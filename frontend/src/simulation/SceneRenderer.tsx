import { useMemo } from 'react';
import type { DebugStep } from '../interpreter';
import { hasSimulation, getSimulation } from './registry';
import ScenePlayer from './ScenePlayer';

interface SceneRendererProps {
  projectId: string;
  steps?: DebugStep[];
  onFinish?: () => void;
}

export default function SceneRenderer({ projectId, steps, onFinish }: SceneRendererProps) {
  const scenes = useMemo(() => {
    if (!hasSimulation(projectId)) return null;
    const sim = getSimulation(projectId)!;
    if (steps && steps.length > 0) {
      const data = sim.parse(steps);
      return sim.build(data);
    }
    return sim.preview();
  }, [projectId, steps]);

  if (!scenes || scenes.length === 0) return null;

  return <ScenePlayer scenes={scenes} onFinish={onFinish} />;
}

export function useProjectPreview(projectId: string) {
  return useMemo(() => {
    if (!hasSimulation(projectId)) return null;
    return getSimulation(projectId)!.preview();
  }, [projectId]);
}
