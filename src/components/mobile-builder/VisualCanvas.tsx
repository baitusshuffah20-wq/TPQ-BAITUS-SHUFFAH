"use client";

import React from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  Trash2,
  Copy,
  Move,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  MoreVertical,
} from "lucide-react";
import { CanvasElement } from "./types";
import ComponentRenderer from "./ComponentRenderer";

interface VisualCanvasProps {
  elements: CanvasElement[];
  selectedElement: CanvasElement | null;
  onSelectElement: (element: CanvasElement | null) => void;
  onDeleteElement: (elementId: string) => void;
  onDuplicateElement: (elementId: string) => void;
}

interface SortableElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const SortableElement: React.FC<SortableElementProps> = ({
  element,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: element.id,
    data: {
      type: "canvas-element",
      elementId: element.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Element Content */}
      <div className="relative">
        <ComponentRenderer element={element} />

        {/* Selection Overlay */}
        {isSelected && (
          <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none rounded" />
        )}

        {/* Hover Controls */}
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center space-x-1 bg-white shadow-lg rounded-bl-lg p-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              {...listeners}
              {...attributes}
            >
              <Move className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const VisualCanvas: React.FC<VisualCanvasProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onDeleteElement,
  onDuplicateElement,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas",
    data: {
      type: "canvas",
    },
  });

  return (
    <div className="flex-1 bg-gray-100 p-6 overflow-auto">
      <div className="max-w-sm mx-auto">
        {/* Device Frame */}
        <div className="bg-gray-800 rounded-3xl p-4 shadow-2xl">
          {/* Status Bar */}
          <div className="bg-black rounded-t-2xl px-4 py-2 flex justify-between items-center text-white text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <span className="ml-2">Carrier</span>
            </div>
            <div>9:41 AM</div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-2 border border-white rounded-sm">
                <div className="w-3 h-1 bg-white rounded-sm"></div>
              </div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Screen Content */}
          <div
            ref={setNodeRef}
            className={`bg-white min-h-[600px] rounded-b-2xl overflow-hidden relative ${
              isOver ? "bg-blue-50 border-2 border-dashed border-blue-300" : ""
            }`}
            onClick={() => onSelectElement(null)}
          >
            {elements.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Smartphone className="h-16 w-16 mb-4" />
                <div className="text-lg font-medium">Empty Screen</div>
                <div className="text-sm text-center px-8">
                  Drag components from the library to start building your mobile
                  app
                </div>
              </div>
            ) : (
              <SortableContext
                items={elements.map((el) => el.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-0">
                  {elements.map((element) => (
                    <SortableElement
                      key={element.id}
                      element={element}
                      isSelected={selectedElement?.id === element.id}
                      onSelect={() => onSelectElement(element)}
                      onDelete={() => onDeleteElement(element.id)}
                      onDuplicate={() => onDuplicateElement(element.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            )}

            {/* Drop Zone Indicator */}
            {isOver && elements.length === 0 && (
              <div className="absolute inset-4 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center">
                <div className="text-blue-600 text-center">
                  <div className="text-lg font-medium">Drop component here</div>
                  <div className="text-sm">Release to add to your app</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Device Info */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-4">
            <span>iPhone 14 Pro</span>
            <span>•</span>
            <span>393 × 852</span>
            <span>•</span>
            <span>Portrait</span>
          </div>
        </div>
      </div>

      {/* Canvas Controls */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <Card className="p-2">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="flex items-center space-x-1"
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </Button>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="text-xs text-gray-500">
              {elements.length} component{elements.length !== 1 ? "s" : ""}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VisualCanvas;
