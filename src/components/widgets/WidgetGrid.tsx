import { useState, useCallback } from 'react';
import GridLayout from 'react-grid-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit2, Lock, X, GripVertical } from 'lucide-react';
import { useWidgets } from './WidgetContext';
import { WidgetRenderer } from './WidgetRenderer';
import { AddWidgetDialog } from './AddWidgetDialog';
import { WidgetConfig } from './types';
import { cn } from '@/lib/utils';
import 'react-grid-layout/css/styles.css';

export function WidgetGrid() {
  const { widgets, removeWidget, isEditing, setIsEditing, updateWidgetLayout } = useWidgets();
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const observer = new ResizeObserver((entries) => {
        setContainerWidth(entries[0].contentRect.width);
      });
      observer.observe(node);
      return () => observer.disconnect();
    }
  }, []);

  const getLayoutFromWidgets = () => {
    return widgets.map((widget, index) => ({
      i: widget.id,
      x: widget.layout?.x ?? (index % 4) * 3,
      y: widget.layout?.y ?? Math.floor(index / 4) * 2,
      w: widget.layout?.w ?? (widget.size === 'large' ? 6 : widget.size === 'medium' ? 4 : 3),
      h: widget.layout?.h ?? 2,
      minW: 2,
      minH: 1,
      maxW: 12,
      maxH: 6,
    }));
  };

  const handleLayoutChange = (layout: GridLayout.Layout[]) => {
    if (isEditing && updateWidgetLayout) {
      layout.forEach((item) => {
        updateWidgetLayout(item.i, { x: item.x, y: item.y, w: item.w, h: item.h });
      });
    }
  };

  const handleEditWidget = (widget: WidgetConfig) => {
    setEditingWidget(widget);
  };

  const cols = containerWidth < 640 ? 4 : containerWidth < 1024 ? 8 : 12;
  const rowHeight = 80;

  return (
    <div className="space-y-3" ref={containerRef}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Dashboard Widgets</h3>
        <div className="flex gap-1.5">
          {isEditing && <AddWidgetDialog />}
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="gap-1.5 h-7 text-xs"
          >
            {isEditing ? (
              <>
                <Lock className="h-3 w-3" />
                Lock
              </>
            ) : (
              <>
                <Edit2 className="h-3 w-3" />
                Edit
              </>
            )}
          </Button>
        </div>
      </div>

      <GridLayout
        className="layout"
        layout={getLayoutFromWidgets()}
        cols={cols}
        rowHeight={rowHeight}
        width={containerWidth}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditing}
        isResizable={isEditing}
        draggableHandle=".drag-handle"
        margin={[8, 8]}
        containerPadding={[0, 0]}
        useCSSTransforms
      >
        {widgets.map((widget) => (
          <div key={widget.id}>
            <Card className={cn(
              "h-full overflow-hidden transition-all relative group",
              isEditing && "ring-1 ring-dashed ring-border hover:ring-primary/50"
            )}>
              {isEditing && (
                <>
                  <div className="absolute top-1 left-1 z-10 drag-handle cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="absolute top-1 right-1 z-10 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5"
                      onClick={() => handleEditWidget(widget)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 text-destructive"
                      onClick={() => removeWidget(widget.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              )}
              <div className={cn("h-full", isEditing && "pt-5")}>
                <WidgetRenderer widget={widget} />
              </div>
            </Card>
          </div>
        ))}
      </GridLayout>

      {editingWidget && (
        <AddWidgetDialog
          editWidget={editingWidget}
          onClose={() => setEditingWidget(null)}
        />
      )}
    </div>
  );
}