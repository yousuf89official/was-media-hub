import React, { createContext, useContext, useState, useCallback } from 'react';
import { WidgetConfig, WidgetLayout } from './types';

interface WidgetContextType {
  widgets: WidgetConfig[];
  addWidget: (widget: Omit<WidgetConfig, 'id' | 'position'>) => void;
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => void;
  updateWidgetLayout: (id: string, layout: WidgetLayout) => void;
  removeWidget: (id: string) => void;
  reorderWidgets: (activeId: string, overId: string) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: 'widget-1',
    type: 'metric-card',
    title: 'Total Impressions',
    size: 'small',
    position: 0,
    layout: { x: 0, y: 0, w: 3, h: 2 },
    config: { metric: 'impressions', format: 'number', icon: 'Eye' },
  },
  {
    id: 'widget-2',
    type: 'metric-card',
    title: 'Total Reach',
    size: 'small',
    position: 1,
    layout: { x: 3, y: 0, w: 3, h: 2 },
    config: { metric: 'reach', format: 'number', icon: 'Users' },
  },
  {
    id: 'widget-3',
    type: 'metric-card',
    title: 'Total Spend',
    size: 'small',
    position: 2,
    layout: { x: 6, y: 0, w: 3, h: 2 },
    config: { metric: 'spend', format: 'currency', currencyCode: 'IDR', icon: 'DollarSign' },
  },
  {
    id: 'widget-4',
    type: 'metric-card',
    title: 'Engagement Rate',
    size: 'small',
    position: 3,
    layout: { x: 9, y: 0, w: 3, h: 2 },
    config: { metric: 'engagements', format: 'percentage', icon: 'Zap' },
  },
  {
    id: 'widget-5',
    type: 'line-chart',
    title: 'Performance Trend',
    size: 'large',
    position: 4,
    layout: { x: 0, y: 2, w: 8, h: 3 },
    config: { metric: 'impressions' },
  },
  {
    id: 'widget-6',
    type: 'progress-bar',
    title: 'Campaign Progress',
    size: 'small',
    position: 5,
    layout: { x: 8, y: 2, w: 4, h: 3 },
    config: { metric: 'impressions', target: 1000000 },
  },
];

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [isEditing, setIsEditing] = useState(false);

  const addWidget = useCallback((widget: Omit<WidgetConfig, 'id' | 'position'>) => {
    const newWidget: WidgetConfig = {
      ...widget,
      id: `widget-${Date.now()}`,
      position: widgets.length,
      layout: widget.layout || { x: 0, y: Infinity, w: 3, h: 2 },
    };
    setWidgets(prev => [...prev, newWidget]);
  }, [widgets.length]);

  const updateWidget = useCallback((id: string, updates: Partial<WidgetConfig>) => {
    setWidgets(prev => 
      prev.map(w => w.id === id ? { ...w, ...updates } : w)
    );
  }, []);

  const updateWidgetLayout = useCallback((id: string, layout: WidgetLayout) => {
    setWidgets(prev => 
      prev.map(w => w.id === id ? { ...w, layout } : w)
    );
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  }, []);

  const reorderWidgets = useCallback((activeId: string, overId: string) => {
    setWidgets(prev => {
      const oldIndex = prev.findIndex(w => w.id === activeId);
      const newIndex = prev.findIndex(w => w.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return prev;
      
      const newWidgets = [...prev];
      const [removed] = newWidgets.splice(oldIndex, 1);
      newWidgets.splice(newIndex, 0, removed);
      
      return newWidgets.map((w, i) => ({ ...w, position: i }));
    });
  }, []);

  return (
    <WidgetContext.Provider value={{
      widgets,
      addWidget,
      updateWidget,
      updateWidgetLayout,
      removeWidget,
      reorderWidgets,
      isEditing,
      setIsEditing,
    }}>
      {children}
    </WidgetContext.Provider>
  );
}

export function useWidgets() {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidgets must be used within a WidgetProvider');
  }
  return context;
}