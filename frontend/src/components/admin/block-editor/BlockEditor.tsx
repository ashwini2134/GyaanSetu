// Fraylon Admin - Block Editor
import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import BlockCard from './BlockCard';
import BlockPicker from './BlockPicker';

interface Block {
  id: string;
  type: string;
  data: any;
}

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [showPicker, setShowPicker] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over.id);
      onChange(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  const addBlock = (type: string) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      data: {}
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, data: any) => {
    onChange(blocks.map(b => b.id === id ? { ...b, data } : b));
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl w-full">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-4">
            {blocks.map(block => (
              <BlockCard
                key={block.id}
                id={block.id}
                type={block.type}
                data={block.data}
                onChange={(data) => updateBlock(block.id, data)}
                onDelete={() => deleteBlock(block.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={() => setShowPicker(true)}
        className="w-full border-2 border-dashed border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors text-slate-400 hover:text-blue-400 group"
      >
        <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-blue-500/10 flex items-center justify-center">
          <span className="text-2xl font-light leading-none">+</span>
        </div>
        <span className="font-medium">Add Block</span>
      </button>

      {showPicker && <BlockPicker onSelect={addBlock} onClose={() => setShowPicker(false)} />}
    </div>
  );
}
