"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Smartphone,
  Eye,
  Code,
  Download,
  Plus,
  Settings,
  Palette,
  Layout,
  Type,
  Image as ImageIcon,
  List,
  Grid3X3,
  Square,
  Circle,
} from "lucide-react";
import ComponentLibrary from "./ComponentLibrary";
import VisualCanvas from "./VisualCanvas";
import PropertyPanel from "./PropertyPanel";
import PreviewModal from "./PreviewModal";
import { MobileComponent, CanvasElement } from "./types";
import { TemplateGenerator } from "./TemplateGenerator";

interface DragDropBuilderProps {
  onSave?: (design: CanvasElement[]) => void;
  onPreview?: (design: CanvasElement[]) => void;
  onExport?: (design: CanvasElement[]) => void;
  initialDesign?: CanvasElement[];
}

const DragDropBuilder: React.FC<DragDropBuilderProps> = ({
  onSave,
  onPreview,
  onExport,
  initialDesign = [],
}) => {
  const [canvasElements, setCanvasElements] =
    useState<CanvasElement[]>(initialDesign);
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(
    null,
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("design");
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    // If dropping from component library to canvas
    if (active.data.current?.type === "component" && over.id === "canvas") {
      const newElement: CanvasElement = {
        id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: active.data.current.componentType,
        props: active.data.current.defaultProps || {},
        children: [],
        position: { x: 0, y: canvasElements.length * 80 },
        size: { width: "100%", height: "auto" },
      };

      setCanvasElements((prev) => [...prev, newElement]);
    }

    // If reordering elements in canvas
    if (
      active.data.current?.type === "canvas-element" &&
      over.data.current?.type === "canvas-element"
    ) {
      const activeIndex = canvasElements.findIndex((el) => el.id === active.id);
      const overIndex = canvasElements.findIndex((el) => el.id === over.id);

      if (activeIndex !== overIndex) {
        const newElements = [...canvasElements];
        const [removed] = newElements.splice(activeIndex, 1);
        newElements.splice(overIndex, 0, removed);
        setCanvasElements(newElements);
      }
    }

    setActiveId(null);
  };

  const updateElementProps = (elementId: string, newProps: any) => {
    setCanvasElements((prev) =>
      prev.map((el) =>
        el.id === elementId
          ? { ...el, props: { ...el.props, ...newProps } }
          : el,
      ),
    );
  };

  const deleteElement = (elementId: string) => {
    setCanvasElements((prev) => prev.filter((el) => el.id !== elementId));
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  };

  const duplicateElement = (elementId: string) => {
    const element = canvasElements.find((el) => el.id === elementId);
    if (element) {
      const newElement: CanvasElement = {
        ...element,
        id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        position: { ...element.position, y: element.position.y + 80 },
      };
      setCanvasElements((prev) => [...prev, newElement]);
    }
  };

  const handleSave = async () => {
    try {
      const templateName = prompt("Enter template name:");
      if (!templateName) return;

      const response = await fetch("/api/mobile-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: templateName,
          description: `Custom template created with ${canvasElements.length} components`,
          category: "custom",
          elements: canvasElements,
          settings: {},
          tags: ["custom", "drag-drop"],
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Template saved successfully!");
      } else {
        alert("Failed to save template: " + data.error);
      }
    } catch (error) {
      alert("Error saving template: " + error);
    }

    if (onSave) {
      onSave(canvasElements);
    }
  };

  const handlePreview = () => {
    setShowPreviewModal(true);
    if (onPreview) {
      onPreview(canvasElements);
    }
  };

  const handleExport = () => {
    const generatedCode =
      TemplateGenerator.generateReactNativeCode(canvasElements);

    // Create and download zip file with generated code
    const blob = new Blob([JSON.stringify(generatedCode, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated-mobile-app.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (onExport) {
      onExport(canvasElements);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Mobile App Builder
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              {canvasElements.length} komponen
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              className="flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center space-x-2"
            >
              <Code className="h-4 w-4" />
              <span>Export Code</span>
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              <span>Save Template</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Left Sidebar - Component Library */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
                <TabsTrigger
                  value="design"
                  className="flex items-center space-x-1"
                >
                  <Layout className="h-4 w-4" />
                  <span>Design</span>
                </TabsTrigger>
                <TabsTrigger
                  value="style"
                  className="flex items-center space-x-1"
                >
                  <Palette className="h-4 w-4" />
                  <span>Style</span>
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center space-x-1"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="design" className="flex-1 m-4 mt-2">
                <ComponentLibrary />
              </TabsContent>

              <TabsContent value="style" className="flex-1 m-4 mt-2">
                <PropertyPanel
                  selectedElement={selectedElement}
                  onUpdateProps={updateElementProps}
                />
              </TabsContent>

              <TabsContent value="settings" className="flex-1 m-4 mt-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">App Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600">
                      Global app configuration will be available here.
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Center - Visual Canvas */}
          <div className="flex-1 flex flex-col">
            <VisualCanvas
              elements={canvasElements}
              selectedElement={selectedElement}
              onSelectElement={setSelectedElement}
              onDeleteElement={deleteElement}
              onDuplicateElement={duplicateElement}
            />
          </div>

          {/* Right Sidebar - Properties */}
          <div className="w-80 bg-white border-l border-gray-200">
            <PropertyPanel
              selectedElement={selectedElement}
              onUpdateProps={updateElementProps}
            />
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeId ? (
              <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 shadow-lg">
                <div className="text-sm font-medium text-blue-800">
                  Dragging component...
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        elements={canvasElements}
        title="Mobile App Preview"
      />
    </div>
  );
};

export default DragDropBuilder;
