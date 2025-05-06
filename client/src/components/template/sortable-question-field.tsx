import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DragHandleDots2Icon } from '@radix-ui/react-icons';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

interface QuestionFieldProps {
  id: string;
  label: string;
  enabled: boolean;
  question: string;
  onToggle: (enabled: boolean) => void;
  onQuestionChange: (question: string) => void;
  onDelete: () => void;
  maxFields?: number;
  currentFieldCount?: number;
}

export function SortableQuestionField({
  id,
  label,
  enabled,
  question,
  onToggle,
  onQuestionChange,
  onDelete,
  maxFields = 4,
  currentFieldCount = 0,
}: QuestionFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: enabled ? 1 : 0.5,
  };

  const canDelete = currentFieldCount && currentFieldCount > 1;

  return (
    <div ref={setNodeRef} style={style} className="mb-4 border rounded-md p-4 bg-background">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab p-1">
            <DragHandleDots2Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <h4 className="font-medium">{label}</h4>
        </div>
        <div className="flex items-center gap-2">
          {canDelete && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDelete} 
              className="h-8 w-8 p-0"
              title="Remove question"
            >
              <Trash className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
          <Checkbox 
            id={`toggle-${id}`}
            checked={enabled} 
            onCheckedChange={onToggle} 
          />
        </div>
      </div>
      
      <div className={`transition-all ${enabled ? 'opacity-100' : 'opacity-50'}`}>
        <Input 
          value={question} 
          onChange={(e) => onQuestionChange(e.target.value)}
          placeholder="Enter question text"
          disabled={!enabled}
          className="mt-2"
        />
      </div>
    </div>
  );
}
