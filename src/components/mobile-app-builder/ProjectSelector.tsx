"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Folder,
  Calendar,
  Users,
  GraduationCap,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface Project {
  id: string;
  name: string;
  appType: "wali" | "musyrif";
  description: string;
  createdAt: Date;
  updatedAt: Date;
  components: any[];
}

interface ProjectSelectorProps {
  onProjectSelect: (project: Project) => void;
  onProjectCreate: (project: Project) => void;
}

interface CreateProjectFormData {
  name: string;
  appType: "wali" | "musyrif";
  description: string;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  onProjectSelect,
  onProjectCreate,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "wali" | "musyrif">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<CreateProjectFormData>({
    name: "",
    appType: "wali",
    description: "",
  });

  // Load projects from localStorage (in real app, this would be from API)
  useEffect(() => {
    const loadProjects = () => {
      try {
        const savedProjects = localStorage.getItem("mobile-builder-projects");
        if (savedProjects) {
          const parsedProjects = JSON.parse(savedProjects).map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          }));
          setProjects(parsedProjects);
        }
      } catch (error) {
        console.error("Error loading projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Save projects to localStorage
  const saveProjects = (updatedProjects: Project[]) => {
    try {
      localStorage.setItem("mobile-builder-projects", JSON.stringify(updatedProjects));
      setProjects(updatedProjects);
    } catch (error) {
      console.error("Error saving projects:", error);
      toast.error("Gagal menyimpan project");
    }
  };

  // Filter projects based on search and type
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || project.appType === filterType;
    return matchesSearch && matchesType;
  });

  // Handle create project
  const handleCreateProject = () => {
    if (!formData.name.trim()) {
      toast.error("Nama project harus diisi");
      return;
    }

    const newProject: Project = {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name.trim(),
      appType: formData.appType,
      description: formData.description.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      components: [],
    };

    const updatedProjects = [...projects, newProject];
    saveProjects(updatedProjects);
    onProjectCreate(newProject);
    setIsCreateDialogOpen(false);
    setFormData({ name: "", appType: "wali", description: "" });
  };

  // Handle delete project
  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    saveProjects(updatedProjects);
    toast.success("Project berhasil dihapus");
  };

  // Handle duplicate project
  const handleDuplicateProject = (project: Project) => {
    const duplicatedProject: Project = {
      ...project,
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${project.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedProjects = [...projects, duplicatedProject];
    saveProjects(updatedProjects);
    toast.success("Project berhasil diduplikasi");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Mobile App Projects
        </h2>
        <p className="text-gray-600">
          Kelola project aplikasi mobile untuk TPQ Baitus Shuffah
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Cari project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
          <SelectTrigger className="w-[180px]">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Filter tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="wali">Aplikasi Wali</SelectItem>
            <SelectItem value="musyrif">Aplikasi Musyrif</SelectItem>
          </SelectContent>
        </Select>
        <Button
          className="flex items-center gap-2"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus size={16} />
          Buat Project Baru
        </Button>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Project Baru</DialogTitle>
              <DialogDescription>
                Buat project baru untuk aplikasi mobile TPQ
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Project</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama project"
                />
              </div>
              <div>
                <Label htmlFor="appType">Tipe Aplikasi</Label>
                <Select
                  value={formData.appType}
                  onValueChange={(value: "wali" | "musyrif") =>
                    setFormData({ ...formData, appType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wali">
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        Aplikasi Wali Santri
                      </div>
                    </SelectItem>
                    <SelectItem value="musyrif">
                      <div className="flex items-center gap-2">
                        <GraduationCap size={16} />
                        Aplikasi Musyrif
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi project (opsional)"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleCreateProject}>
                Buat Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterType !== "all" ? "Tidak ada project yang ditemukan" : "Belum ada project"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== "all" 
              ? "Coba ubah filter atau kata kunci pencarian"
              : "Mulai dengan membuat project baru untuk aplikasi mobile TPQ"
            }
          </p>
          {!searchTerm && filterType === "all" && (
            <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
              <Plus size={16} />
              Buat Project Pertama
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                        {project.name}
                      </CardTitle>
                      <Badge variant={project.appType === "wali" ? "default" : "secondary"}>
                        {project.appType === "wali" ? (
                          <><Users size={12} className="mr-1" /> Wali Santri</>
                        ) : (
                          <><GraduationCap size={12} className="mr-1" /> Musyrif</>
                        )}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onProjectSelect(project)}>
                          <Edit size={16} className="mr-2" />
                          Buka Project
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateProject(project)}>
                          <Copy size={16} className="mr-2" />
                          Duplikasi
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-600"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent onClick={() => onProjectSelect(project)}>
                  {project.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {project.updatedAt.toLocaleDateString('id-ID')}
                    </div>
                    <div>
                      {project.components.length} komponen
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
