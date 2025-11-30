import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WidgetConfig, WIDGET_SIZES } from './types';
import { useWidgets } from './WidgetContext';
import { cn } from '@/lib/utils';

interface SortableWidgetProps {
  widget: WidgetConfig;
  children: React.ReactNode;
  onEdit: (widget: WidgetConfig) => void;
}

export function SortableWidget({ widget, children, onEdit }: SortableWidgetProps) {
  const { isEditing, removeWidget } = useWidgets();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sizeConfig = WIDGET_SIZES.find(s => s.size === widget.size);
  const colSpan = sizeConfig?.cols || 1;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        isDragging && 'z-50 opacity-80',
        colSpan === 1 && 'col-span-1',
        colSpan === 2 && 'col-span-2',
        colSpan === 3 && 'col-span-3',
        colSpan === 4 && 'col-span-4'
      )}
    >
      {isEditing && (
        <div className="absolute -top-2 -right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            className="h-6 w-6 rounded-full shadow-md"
            onClick={() => onEdit(widget)}
          >
            <Settings className="h-3 w-3" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-6 w-6 rounded-full shadow-md"
            onClick={() => removeWidget(widget.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      {isEditing && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      
      <div className={cn(
        'h-full transition-all',
        isEditing && 'ring-2 ring-dashed ring-muted-foreground/30 rounded-lg'
      )}>
        {children}
      </div>
    </div>
  );
}
