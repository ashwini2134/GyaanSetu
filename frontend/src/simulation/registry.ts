import type { SimulationDefinition } from './types';
import { storyGeneratorSim } from './projects/story_generator';

const registry = new Map<string, SimulationDefinition>([
  ['story_generator', storyGeneratorSim],
]);

export function registerSimulation(id: string, sim: SimulationDefinition): void {
  registry.set(id, sim);
}

export function getSimulation(id: string): SimulationDefinition | undefined {
  return registry.get(id);
}

export function hasSimulation(id: string): boolean {
  return registry.has(id);
}
