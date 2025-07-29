"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComponentData, Template } from "./types";
import {
  Save,
  FolderOpen,
  Search,
  Filter,
  Download,
  Share2,
  Heart,
  Eye,
  Trash2,
  Edit,
  Plus,
  Grid,
  List,
  Star,
  Clock,
  User,
  Tag,
} from "lucide-react";

interface TemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate: (components: ComponentData[]) => void;
  currentComponents: ComponentData[];
  mode: "save" | "load";
}

interface TemplateCardProps {
  template: Template;
  onLoad: () => void;
  onDelete: () => void;
  onShare: () => void;
  viewMode: "grid" | "list";
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onLoad,
  onDelete,
  onShare,
  viewMode,
}) => {
  const [isLiked, setIsLiked] = useState(false);

  if (viewMode === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
      >
        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
          {template.thumbnail ? (
            <img
              src={template.thumbnail}
              alt={template.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Grid size={24} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{template.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {template.description}
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <User size={12} />
              {template.metadata.author}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {new Date(template.metadata.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={12} />
              {Math.floor(Math.random() * 100)} views
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onLoad}>
            <FolderOpen size={14} className="mr-1" />
            Load
          </Button>
          <Button size="sm" variant="outline" onClick={onShare}>
            <Share2 size={14} />
          </Button>
          <Button size="sm" variant="outline" onClick={onDelete}>
            <Trash2 size={14} />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-video bg-gray-200 relative">
          {template.thumbnail ? (
            <img
              src={template.thumbnail}
              alt={template.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Grid size={48} />
            </div>
          )}

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button size="sm" onClick={onLoad}>
              <FolderOpen size={14} className="mr-1" />
              Load
            </Button>
            <Button size="sm" variant="outline" onClick={onShare}>
              <Share2 size={14} />
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">
            {template.name}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {template.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {template.metadata.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {template.metadata.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{template.metadata.tags.length - 3}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <User size={12} />
              {template.metadata.author}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center gap-1 ${isLiked ? "text-red-500" : ""}`}
              >
                <Heart size={12} fill={isLiked ? "currentColor" : "none"} />
                {Math.floor(Math.random() * 50)}
              </button>
              <span className="flex items-center gap-1">
                <Download size={12} />
                {Math.floor(Math.random() * 100)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  isOpen,
  onClose,
  onLoadTemplate,
  currentComponents,
  mode,
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "date" | "popularity">("date");

  // Save template form
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateTags, setTemplateTags] = useState("");
  const [templateCategory, setTemplateCategory] = useState("general");

  useEffect(() => {
    if (isOpen && mode === "load") {
      loadTemplates();
    }
  }, [isOpen, mode]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/mobile-templates");
      const result = await response.json();

      if (result.success) {
        // Convert API response to Template format
        const formattedTemplates: Template[] = result.data.templates.map(
          (t: any) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            thumbnail: t.thumbnail,
            components:
              typeof t.components === "string"
                ? JSON.parse(t.components)
                : t.components,
            metadata: {
              createdAt: new Date(t.createdAt),
              updatedAt: new Date(t.updatedAt),
              author: t.author?.name || "Unknown",
              version: t.version || "1.0.0",
              tags: t.tags || [],
            },
          }),
        );
        setTemplates(formattedTemplates);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) return;

    setLoading(true);
    try {
      const templateData = {
        name: templateName,
        description: templateDescription,
        components: currentComponents,
        category: templateCategory,
        tags: templateTags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        isPublic: true,
      };

      const response = await fetch("/api/mobile-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateData),
      });

      const result = await response.json();

      if (result.success) {
        // Reset form
        setTemplateName("");
        setTemplateDescription("");
        setTemplateTags("");
        setTemplateCategory("general");
        onClose();
      }
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      template.metadata.tags.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "date":
        return (
          new Date(b.metadata.createdAt).getTime() -
          new Date(a.metadata.createdAt).getTime()
        );
      case "popularity":
        return Math.random() - 0.5; // Mock popularity sort
      default:
        return 0;
    }
  });

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              {mode === "save" ? "Save Template" : "Template Library"}
            </h2>
            <Button variant="outline" onClick={onClose}>
              ×
            </Button>
          </div>

          {mode === "load" && (
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Categories</option>
                <option value="tpq-specific">TPQ Specific</option>
                <option value="dashboard">Dashboard</option>
                <option value="general">General</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="popularity">Sort by Popularity</option>
              </select>

              <div className="flex border rounded-md">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-blue-500 text-white" : "text-gray-600"}`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-blue-500 text-white" : "text-gray-600"}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {mode === "save" ? (
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name..."
                />
              </div>

              <div>
                <Label htmlFor="templateDescription">Description</Label>
                <textarea
                  id="templateDescription"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Describe your template..."
                  className="w-full p-2 border rounded-md min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="templateCategory">Category</Label>
                <select
                  id="templateCategory"
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="general">General</option>
                  <option value="tpq-specific">TPQ Specific</option>
                  <option value="dashboard">Dashboard</option>
                  <option value="form">Form</option>
                </select>
              </div>

              <div>
                <Label htmlFor="templateTags">Tags (comma separated)</Label>
                <Input
                  id="templateTags"
                  value={templateTags}
                  onChange={(e) => setTemplateTags(e.target.value)}
                  placeholder="tpq, attendance, progress..."
                />
              </div>

              <Button
                onClick={saveTemplate}
                disabled={loading || !templateName.trim()}
                className="w-full"
              >
                {loading ? "Saving..." : "Save Template"}
              </Button>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              <AnimatePresence>
                {loading ? (
                  <div className="col-span-full flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p>Loading templates...</p>
                    </div>
                  </div>
                ) : sortedTemplates.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Grid className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-600">No templates found</p>
                  </div>
                ) : (
                  sortedTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      viewMode={viewMode}
                      onLoad={() => {
                        onLoadTemplate(template.components);
                        onClose();
                      }}
                      onDelete={() => {
                        // Handle delete
                        console.log("Delete template:", template.id);
                      }}
                      onShare={() => {
                        // Handle share
                        console.log("Share template:", template.id);
                      }}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
