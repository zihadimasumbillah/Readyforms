import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableQuestionFieldProps {
  id: string;
  question: string;
  onDragEnd?: (event: any) => void;
}

export function SortableQuestionField({ id, question }: SortableQuestionFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const getQuestionTypeLabel = () => {
    if (id.startsWith('customString')) return 'Short Text';
    if (id.startsWith('customText')) return 'Long Text';
    if (id.startsWith('customInt')) return 'Number';
    if (id.startsWith('customCheckbox')) return 'Yes/No';
    return 'Question';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center p-3 rounded-md border ${isDragging ? 'border-primary' : 'border-border'} bg-background`}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing p-1 rounded-sm hover:bg-muted mr-3"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <span className="sr-only">Drag to reorder</span>
      </button>
      <div className="flex-1">
        <div className="flex-1 text-sm truncate">{question}</div>
        <div className="text-xs text-muted-foreground">{getQuestionTypeLabel()}</div>
      </div>
    </div>
  );
}

export default SortableQuestionField;
