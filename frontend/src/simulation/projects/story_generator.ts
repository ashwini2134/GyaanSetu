import type { DebugStep } from '../../interpreter';
import type { SimulationDefinition, StructuredData, Scene, SceneElement, Entity } from '../types';

const COLOR_MAP: Record<string, string> = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308',
  purple: '#a855f7', pink: '#ec4899', orange: '#f97316', teal: '#14b8a6',
  cyan: '#06b6d4', indigo: '#6366f1', violet: '#8b5cf6', fuchsia: '#d946ef',
  rose: '#f43f5e', amber: '#f59e0b', lime: '#84cc16', emerald: '#10b981',
  sky: '#0ea5e9', grey: '#6b7280', gray: '#6b7280', white: '#f1f5f9',
  black: '#1e293b', brown: '#92400e',
};

function getColor(color: string | undefined): string {
  if (!color) return '#6366f1';
  return COLOR_MAP[color.toLowerCase()] || '#6366f1';
}

function parseVariables(steps: DebugStep[]): Record<string, string> {
  const lastStep = steps[steps.length - 1];
  if (!lastStep) return {};
  return lastStep.variables || {};
}

function getHobbySceneElements(hobby: string, hex: string): SceneElement[] {
  const normalized = (hobby || '').toLowerCase().trim();
  const char: SceneElement = {
    id: 'char-3', type: 'character', x: 20, y: 55,
    motion: 'fadeIn', delay: 1000,
    data: { skinTone: '#f5d0b8', hairColor: '#6b4226', shirtColor: hex, size: 0.8, waving: false },
  };

  if (normalized.includes('football') || normalized.includes('soccer') || normalized.includes('sport')) {
    return [
      { id: 'stadium', type: 'object', x: 60, y: 48, motion: 'slideInUp', delay: 100, data: { objectType: 'stadium', size: 0.9 } },
      { id: 'football-1', type: 'object', x: 50, y: 68, motion: 'slideInLeft', delay: 400, data: { objectType: 'football', size: 1.2 } },
      { id: 'football-2', type: 'object', x: 35, y: 52, motion: 'slideInRight', delay: 700, data: { objectType: 'football', size: 0.8 } },
      { ...char, x: 20, y: 55 },
    ];
  }

  if (normalized.includes('read') || normalized.includes('book') || normalized.includes('library')) {
    return [
      { id: 'book-1', type: 'object', x: 48, y: 50, motion: 'slideInUp', delay: 200, data: { objectType: 'book', size: 1.3 } },
      { id: 'book-2', type: 'object', x: 62, y: 44, motion: 'slideInLeft', delay: 600, data: { objectType: 'book', size: 0.9 } },
      { id: 'book-3', type: 'object', x: 36, y: 42, motion: 'slideInRight', delay: 800, data: { objectType: 'book', size: 0.7 } },
      { id: 'pencil-book', type: 'object', x: 50, y: 26, motion: 'fadeIn', delay: 1100, data: { objectType: 'pencil', size: 0.6 } },
      { ...char, x: 20, y: 55 },
    ];
  }

  if (normalized.includes('game') || normalized.includes('gaming') || normalized.includes('play')) {
    return [
      { id: 'controller', type: 'object', x: 50, y: 55, motion: 'slideInUp', delay: 200, data: { objectType: 'gameController', size: 1.4 } },
      { ...char, x: 20, y: 55 },
    ];
  }

  if (normalized.includes('music') || normalized.includes('sing') || normalized.includes('dance')) {
    return [
      { id: 'instrument', type: 'object', x: 38, y: 48, motion: 'slideInLeft', delay: 200, data: { objectType: 'musicInstrument', size: 0.9 } },
      { id: 'note-1', type: 'object', x: 58, y: 30, motion: 'slideInRight', delay: 500, data: { objectType: 'musicNote', size: 1 } },
      { id: 'note-2', type: 'object', x: 70, y: 42, motion: 'bounce', delay: 800, data: { objectType: 'musicNote', size: 0.8 } },
      { id: 'note-3', type: 'object', x: 45, y: 22, motion: 'scaleIn', delay: 1100, data: { objectType: 'musicNote', size: 0.7 } },
      { ...char, x: 20, y: 55 },
    ];
  }

  if (normalized.includes('draw') || normalized.includes('paint') || normalized.includes('art')) {
    return [
      { id: 'easel', type: 'object', x: 30, y: 48, motion: 'slideInLeft', delay: 200, data: { objectType: 'easel', size: 0.8 } },
      { id: 'brush', type: 'object', x: 55, y: 40, motion: 'fadeIn', delay: 600, data: { objectType: 'paintBrush', size: 0.6 } },
      { id: 'palette', type: 'object', x: 72, y: 62, motion: 'slideInRight', delay: 800, data: { objectType: 'palette', size: 0.6, colors: ['#ef4444', '#3b82f6', '#fbbf24', '#22c55e'] } },
      { id: 'sketchbook', type: 'object', x: 50, y: 26, motion: 'fadeIn', delay: 1100, data: { objectType: 'sketchBook', size: 0.8 } },
      { ...char, x: 20, y: 55 },
    ];
  }

  if (normalized.includes('code') || normalized.includes('program') || normalized.includes('computer') || normalized.includes('tech')) {
    return [
      { id: 'computer', type: 'object', x: 48, y: 48, motion: 'slideInUp', delay: 200, data: { objectType: 'computer', size: 0.9 } },
      { id: 'pencil-code', type: 'object', x: 65, y: 30, motion: 'fadeIn', delay: 600, data: { objectType: 'pencil', size: 0.7 } },
      { id: 'book-code', type: 'object', x: 35, y: 30, motion: 'fadeIn', delay: 900, data: { objectType: 'book', size: 0.7 } },
      { ...char, x: 20, y: 55 },
    ];
  }

  // Generic fallback for unsupported hobbies
  return [
    { id: 'pencil-1', type: 'object', x: 40, y: 45, motion: 'slideInUp', delay: 200, data: { objectType: 'pencil', size: 1 } },
    { id: 'book-gen', type: 'object', x: 60, y: 48, motion: 'slideInUp', delay: 600, data: { objectType: 'book', size: 0.9 } },
    { ...char, x: 20, y: 55 },
  ];
}

function scenesFromDetails(details: {
  name?: string;
  age?: string;
  color?: string;
  hobby?: string;
}): Scene[] {
  const hex = getColor(details.color);
  const name = details.name || 'Your character';
  const hobby = (details.hobby || '').trim() || 'creating';
  const scenes: Scene[] = [];

  const scene1Elements: SceneElement[] = [
    {
      id: 'char-1', type: 'character', x: 50, y: 55,
      motion: 'slideInUp', delay: 300,
      data: { skinTone: '#f5d0b8', hairColor: '#6b4226', shirtColor: hex, size: 1, waving: true },
    },
    {
      id: 'name-badge', type: 'object', x: 50, y: 20,
      motion: 'scaleIn', delay: 800,
      data: { objectType: 'nameBadge', label: name, size: 0.9 },
    },
  ];

  if (details.age) {
    scene1Elements.push({
      id: 'age-badge', type: 'object', x: 50, y: 88,
      motion: 'bounce', delay: 1200,
      data: { objectType: 'ageBadge', label: `${details.age} years old`, size: 0.7 },
    });
  }

  scenes.push({
    id: 'intro',
    background: 'linear-gradient(135deg, #0f172a, #1e293b, #334155)',
    duration: 4000,
    elements: scene1Elements,
    narration: `Meet ${name}`,
  });

  scenes.push({
    id: 'color',
    background: `linear-gradient(135deg, #0f172a, ${hex}33, ${hex}66)`,
    duration: 4000,
    elements: [
      {
        id: 'char-2', type: 'character', x: 50, y: 55,
        motion: 'slideInLeft', delay: 200,
        data: { skinTone: '#f5d0b8', hairColor: '#6b4226', shirtColor: hex, size: 1, waving: false },
      },
      {
        id: 'color-swatch', type: 'object', x: 50, y: 22,
        motion: 'bounce', delay: 700,
        data: { objectType: 'colorSwatch', color: hex, label: details.color || '', size: 1 },
      },
    ],
    narration: `${name} loves ${details.color?.toLowerCase() || 'color'}!`,
  });

  scenes.push({
    id: 'hobby',
    background: `linear-gradient(135deg, #1c1917, #292524, ${hex}22)`,
    duration: 5000,
    elements: getHobbySceneElements(hobby, hex),
    narration: `${name} loves ${hobby.toLowerCase()}!`,
  });

  scenes.push({
    id: 'end',
    background: `linear-gradient(135deg, ${hex}33, #0f172a, ${hex}22)`,
    duration: 4000,
    elements: [
      {
        id: 'char-4', type: 'character', x: 50, y: 50,
        motion: 'scaleIn', delay: 200,
        data: { skinTone: '#f5d0b8', hairColor: '#6b4226', shirtColor: hex, size: 1.1, waving: true },
      },
      {
        id: 'sparkles', type: 'particles', x: 50, y: 50,
        motion: 'fadeIn', delay: 400,
        data: { count: 16, color: '#fbbf24' },
      },
      {
        id: 'the-end', type: 'text', x: 50, y: 88,
        motion: 'fadeIn', delay: 1200,
        data: { text: '~ The End ~' },
      },
    ],
    narration: 'The End',
  });

  return scenes;
}

function parse(steps: DebugStep[]): StructuredData {
  const vars = parseVariables(steps);
  const entity: Entity = {
    id: 'character',
    type: 'character',
    name: vars.name || 'Your character',
    attributes: {
      age: vars.age || '',
      color: vars.color || '',
      hobby: vars.hobby || '',
    },
  };
  return {
    type: 'story_generator',
    entities: [entity],
    events: [],
    metadata: vars as unknown as Record<string, unknown>,
  };
}

function build(data: StructuredData): Scene[] {
  const entity = data.entities[0];
  const attrs = entity?.attributes || {};
  return scenesFromDetails({
    name: entity?.name,
    age: attrs.age,
    color: attrs.color,
    hobby: attrs.hobby,
  });
}

function preview(): Scene[] {
  return scenesFromDetails({
    name: 'Maya',
    age: '22',
    color: 'Blue',
    hobby: 'Painting',
  });
}

export const storyGeneratorSim: SimulationDefinition = {
  id: 'story_generator',
  parse,
  build,
  preview,
};
