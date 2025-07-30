"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import { ComponentLibrary, COMPONENT_DEFINITIONS } from "./ComponentLibrary";
import { PropertyPanel } from "./PropertyPanel";
import { CanvasToolbar } from "./CanvasToolbar";
import { TemplateManager } from "./TemplateManager";
import { PreviewModal } from "./PreviewModal";
import { ExportModal } from "./ExportModal";
import {
  ComponentData,
  ComponentDefinition,
  BuilderState,
  ExportOptions,
} from "./types";
import {
  Eye,
  Code,
  Save,
  Smartphone,
  Tablet,
  Monitor,
  ZoomIn,
  ZoomOut,
  Grid,
  Layers,
  Undo,
  Redo,
  Trash2,
} from "lucide-react";

interface DragDropBuilderProps {
  appType: "wali" | "musyrif";
  onSave: (components: ComponentData[]) => void;
  onPreview: (components: ComponentData[]) => void;
  onExport: (components: ComponentData[]) => void;
  initialComponents?: ComponentData[];
}

interface SortableComponentProps {
  component: ComponentData;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

// Container Component that can accept nested components
interface ContainerComponentProps {
  component: ComponentData;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAddChild?: (parentId: string, childComponent: ComponentData) => void;
}

const ContainerComponent: React.FC<ContainerComponentProps> = ({
  component,
  isSelected,
  onSelect,
  onDelete,
  onAddChild,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `container-${component.id}`,
    data: {
      type: "container",
      parentId: component.id,
    },
  });

  const definition = COMPONENT_DEFINITIONS.find(
    (def) => def.type === component.type,
  );
  if (!definition) return null;

  const PreviewComponent = definition.previewComponent;
  const children = component.children || [];

  return (
    <div
      ref={setNodeRef}
      className={`relative ${
        isOver ? "bg-blue-50 border-2 border-dashed border-blue-300" : ""
      }`}
    >
      <PreviewComponent props={component.props} />

      {/* Drop zone for nested components */}
      <div className="min-h-[40px] p-2">
        {children.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-4 border-2 border-dashed border-gray-200 rounded">
            Drop components here
          </div>
        ) : (
          <SortableContext
            items={children.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {children.map((child) => (
              <SortableComponent
                key={child.id}
                component={child}
                isSelected={isSelected}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
};

const SortableComponent: React.FC<SortableComponentProps> = ({
  component,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const definition = COMPONENT_DEFINITIONS.find(
    (def) => def.type === component.type,
  );
  if (!definition) return null;

  const PreviewComponent = definition.previewComponent;
  const isContainer = definition.defaultProps?.isContainer || false;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative group cursor-pointer transition-all duration-200 ${
        isSelected
          ? "ring-2 ring-blue-500 ring-offset-2 bg-blue-50"
          : "hover:ring-1 hover:ring-gray-300"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(component.id);
      }}
    >
      <div className="p-2">
        {isContainer ? (
          <ContainerComponent
            component={component}
            isSelected={isSelected}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ) : (
          <PreviewComponent props={component.props} />
        )}
      </div>

      {/* Component Controls */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(component.id);
          }}
          className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none border-2 border-blue-500 rounded" />
      )}
    </motion.div>
  );
};

interface DroppableCanvasProps {
  components: ComponentData[];
  selectedComponentId: string | null;
  onComponentSelect: (id: string) => void;
  onComponentDelete: (id: string) => void;
  canvasSize: { width: number; height: number };
  zoom: number;
}

const DroppableCanvas: React.FC<DroppableCanvasProps> = ({
  components,
  selectedComponentId,
  onComponentSelect,
  onComponentDelete,
  canvasSize,
  zoom,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas",
    data: {
      type: "canvas",
    },
  });

  return (
    <div className="h-full bg-gray-100 p-4 overflow-auto">
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <motion.div
          className="bg-white shadow-2xl rounded-3xl overflow-hidden"
          style={{
            width: canvasSize.width * zoom,
            height: canvasSize.height * zoom,
            transform: `scale(${zoom})`,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: zoom, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Mobile Status Bar */}
          <div className="bg-black text-white text-xs px-4 py-2 flex justify-between items-center">
            <span>9:41</span>
            <span>Carrier</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 border border-white rounded-sm">
                <div className="w-3 h-1 bg-white rounded-sm" />
              </div>
              <span>100%</span>
            </div>
          </div>

          {/* Canvas Content */}
          <div
            ref={setNodeRef}
            className={`p-4 min-h-[500px] relative transition-colors ${
              isOver ? "bg-blue-50 border-2 border-dashed border-blue-300" : ""
            }`}
            onClick={() => onComponentSelect("")}
          >
            {components.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Smartphone className="mx-auto mb-4" size={48} />
                  <p className="text-lg font-medium mb-2">
                    Start Building Your App
                  </p>
                  <p className="text-sm">
                    Drag components from the library to begin
                  </p>
                </div>
              </div>
            ) : (
              <SortableContext
                items={components.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <AnimatePresence>
                  {components.map((component) => (
                    <SortableComponent
                      key={component.id}
                      component={component}
                      isSelected={selectedComponentId === component.id}
                      onSelect={onComponentSelect}
                      onDelete={onComponentDelete}
                    />
                  ))}
                </AnimatePresence>
              </SortableContext>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const DragDropBuilder: React.FC<DragDropBuilderProps> = ({
  appType,
  onSave,
  onPreview,
  onExport,
  initialComponents = [],
}) => {
  const [builderState, setBuilderState] = useState<BuilderState>({
    components: initialComponents,
    selectedComponentId: null,
    draggedComponent: null,
    canvasSize: { width: 375, height: 667 }, // iPhone SE size
    zoom: 1,
    gridEnabled: false,
    snapToGrid: false,
  });

  const [history, setHistory] = useState<ComponentData[][]>([
    initialComponents,
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Modal states
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [templateManagerMode, setTemplateManagerMode] = useState<
    "save" | "load"
  >("load");
  const [showPreview, setShowPreview] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const addToHistory = useCallback(
    (components: ComponentData[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push([...components]);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex],
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setBuilderState((prev) => ({
        ...prev,
        components: [...history[newIndex]],
        selectedComponentId: null,
      }));
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setBuilderState((prev) => ({
        ...prev,
        components: [...history[newIndex]],
        selectedComponentId: null,
      }));
    }
  }, [history, historyIndex]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;

      if (active.data.current?.definition) {
        // Dragging from component library
        setBuilderState((prev) => ({
          ...prev,
          draggedComponent: null,
        }));
      } else {
        // Dragging existing component
        const component = builderState.components.find(
          (c) => c.id === active.id,
        );
        if (component) {
          setBuilderState((prev) => ({
            ...prev,
            draggedComponent: component,
          }));
        }
      }
    },
    [builderState.components],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) {
        setBuilderState((prev) => ({
          ...prev,
          draggedComponent: null,
        }));
        return;
      }

      // Handle dropping from component library to canvas
      if (active.data.current?.definition && over.id === "canvas") {
        const definition = active.data.current
          .definition as ComponentDefinition;
        const newComponent: ComponentData = {
          id: `${definition.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: definition.type,
          props: { ...definition.defaultProps },
          children: [],
        };

        const newComponents = [...builderState.components, newComponent];
        setBuilderState((prev) => ({
          ...prev,
          components: newComponents,
          selectedComponentId: newComponent.id,
        }));
        addToHistory(newComponents);
      }

      // Handle dropping from component library to container
      if (active.data.current?.definition && over.data?.current?.type === "container") {
        const definition = active.data.current.definition as ComponentDefinition;
        const parentId = over.data.current.parentId;

        const newComponent: ComponentData = {
          id: `${definition.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: definition.type,
          props: { ...definition.defaultProps },
          children: [],
          parentId: parentId,
        };

        const newComponents = builderState.components.map(component => {
          if (component.id === parentId) {
            return {
              ...component,
              children: [...(component.children || []), newComponent]
            };
          }
          return component;
        });

        setBuilderState((prev) => ({
          ...prev,
          components: newComponents,
          selectedComponentId: newComponent.id,
        }));
        addToHistory(newComponents);
      }

      setBuilderState((prev) => ({
        ...prev,
        draggedComponent: null,
      }));
    },
    [builderState.components, addToHistory],
  );

  const handleComponentSelect = useCallback((id: string) => {
    setBuilderState((prev) => ({
      ...prev,
      selectedComponentId: id || null,
    }));
  }, []);

  const handleComponentUpdate = useCallback(
    (updatedComponent: ComponentData) => {
      const newComponents = builderState.components.map((comp) =>
        comp.id === updatedComponent.id ? updatedComponent : comp,
      );
      setBuilderState((prev) => ({
        ...prev,
        components: newComponents,
      }));
      addToHistory(newComponents);
    },
    [builderState.components, addToHistory],
  );

  const handleComponentDelete = useCallback(
    (id: string) => {
      const newComponents = builderState.components.filter(
        (comp) => comp.id !== id,
      );
      setBuilderState((prev) => ({
        ...prev,
        components: newComponents,
        selectedComponentId:
          prev.selectedComponentId === id ? null : prev.selectedComponentId,
      }));
      addToHistory(newComponents);
    },
    [builderState.components, addToHistory],
  );

  const selectedComponent = useMemo(() => {
    return (
      builderState.components.find(
        (c) => c.id === builderState.selectedComponentId,
      ) || null
    );
  }, [builderState.components, builderState.selectedComponentId]);

  const handleSave = useCallback(() => {
    setTemplateManagerMode("save");
    setShowTemplateManager(true);
  }, []);

  const handleLoad = useCallback(() => {
    setTemplateManagerMode("load");
    setShowTemplateManager(true);
  }, []);

  const handlePreview = useCallback(() => {
    setShowPreview(true);
  }, []);

  const handleExport = useCallback(() => {
    setShowExportModal(true);
  }, []);

  const handleLoadTemplate = useCallback(
    (components: ComponentData[]) => {
      setBuilderState((prev) => ({
        ...prev,
        components,
        selectedComponentId: null,
      }));
      addToHistory(components);
    },
    [addToHistory],
  );

  const handleExportCode = useCallback(
    async (options: ExportOptions) => {
      try {
        const response = await fetch("/api/mobile-templates/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            components: builderState.components,
            options,
            templateName: "MyApp",
          }),
        });

        const result = await response.json();

        if (result.success) {
          // Create download
          const blob = new Blob([result.data.code], {
            type: result.data.mimeType,
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = result.data.fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          onExport(builderState.components);
        }
      } catch (error) {
        console.error("Export failed:", error);
      }
    },
    [builderState.components, onExport],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full bg-gray-50 min-h-[600px] overflow-hidden">
        {/* Main Layout Grid */}
        <div className="grid grid-cols-12 h-full gap-0">
          {/* Component Library - Collapsible */}
          <div className="col-span-2 bg-white border-r border-gray-200 min-w-0 overflow-hidden">
            <ComponentLibrary appType={appType} />
          </div>

          {/* Main Canvas Area */}
          <div className="col-span-7 flex flex-col bg-white min-w-0">
            {/* Toolbar */}
            <div className="border-b border-gray-200 bg-white flex-shrink-0">
              <CanvasToolbar
                onPreview={handlePreview}
                onExport={handleExport}
                onSave={handleSave}
                onLoad={handleLoad}
                onUndo={undo}
                onRedo={redo}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                zoom={builderState.zoom}
                onZoomChange={(zoom) =>
                  setBuilderState((prev) => ({ ...prev, zoom }))
                }
                canvasSize={builderState.canvasSize}
                onCanvasSizeChange={(size) =>
                  setBuilderState((prev) => ({ ...prev, canvasSize: size }))
                }
              />
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-gray-100 overflow-auto">
              <DroppableCanvas
                components={builderState.components}
                selectedComponentId={builderState.selectedComponentId}
                onComponentSelect={handleComponentSelect}
                onComponentDelete={handleComponentDelete}
                canvasSize={builderState.canvasSize}
                zoom={builderState.zoom}
              />
            </div>
          </div>

          {/* Property Panel */}
          <div className="col-span-3 bg-white border-l border-gray-200 min-w-0 overflow-hidden">
            <PropertyPanel
              component={selectedComponent}
              onUpdate={handleComponentUpdate}
            />
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {builderState.draggedComponent && (
          <div className="bg-white p-2 rounded shadow-lg border">
            Dragging component...
          </div>
        )}
      </DragOverlay>

      {/* Modals */}
      <TemplateManager
        isOpen={showTemplateManager}
        onClose={() => setShowTemplateManager(false)}
        onLoadTemplate={handleLoadTemplate}
        currentComponents={builderState.components}
        mode={templateManagerMode}
      />

      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        components={builderState.components}
        canvasSize={builderState.canvasSize}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportCode}
      />
    </DndContext>
  );
};
