import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Edit2, Lock } from 'lucide-react';
import { useWidgets } from './WidgetContext';
import { SortableWidget } from './SortableWidget';
import { WidgetRenderer } from './WidgetRenderer';
import { AddWidgetDialog } from './AddWidgetDialog';
import { WidgetConfig } from './types';

export function WidgetGrid() {
  const { widgets, reorderWidgets, isEditing, setIsEditing } = useWidgets();
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderWidgets(active.id as string, over.id as string);
    }
  };

  const handleEditWidget = (widget: WidgetConfig) => {
    setEditingWidget(widget);
  };

  const sortedWidgets = [...widgets].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Dashboard Widgets</h3>
        <div className="flex gap-2">
          {isEditing && <AddWidgetDialog />}
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="gap-2"
          >
            {isEditing ? (
              <>
                <Lock className="h-4 w-4" />
                Lock Layout
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4" />
                Edit Layout
              </>
            )}
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedWidgets.map(w => w.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedWidgets.map((widget) => (
              <SortableWidget
                key={widget.id}
                widget={widget}
                onEdit={handleEditWidget}
              >
                <WidgetRenderer widget={widget} />
              </SortableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {editingWidget && (
        <AddWidgetDialog
          editWidget={editingWidget}
          onClose={() => setEditingWidget(null)}
        />
      )}
    </div>
  );
}
