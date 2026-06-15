import type { DebugStep } from '../interpreter';

export type EnterMotion = 'fadeIn' | 'slideInUp' | 'slideInLeft' | 'slideInRight' | 'scaleIn' | 'bounce';

export type IdleMotion = 'float' | 'pulse' | 'wiggle' | 'none';

export type ElementType = 'character' | 'object' | 'text' | 'particles';

export interface SceneElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  motion: EnterMotion;
  idle?: IdleMotion;
  delay?: number;
  data: Record<string, any>;
}

export interface Scene {
  id: string;
  background: string;
  duration: number;
  elements: SceneElement[];
  narration?: string;
}

export interface Entity {
  id: string;
  type: string;
  name: string;
  attributes: Record<string, any>;
}

export interface Event {
  type: string;
  entityIds: string[];
  data: Record<string, any>;
}

export interface StructuredData {
  type: string;
  entities: Entity[];
  events: Event[];
  metadata: Record<string, unknown>;
}

export interface SimulationDefinition {
  id: string;
  parse(steps: DebugStep[]): StructuredData;
  build(data: StructuredData): Scene[];
  preview(): Scene[];
}
