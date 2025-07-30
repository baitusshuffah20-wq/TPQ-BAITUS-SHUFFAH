"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DragDropBuilder } from "@/components/mobile-app-builder/DragDropBuilder";
import { ProjectSelector } from "@/components/mobile-app-builder/ProjectSelector";
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

export default function MobileAppBuilderPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Check authentication and role
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user.role !== "ADMIN") {
    return null;
  }

  // Show project selector if no project is selected
  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Mobile App Builder
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Select or create a project to start building
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/admin")}
                className="flex items-center gap-2"
              >
                <Home size={16} />
                Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push("/dashboard/admin/mobile-app-generator")
                }
                className="flex items-center gap-2"
              >
                App Generator
              </Button>
            </div>
          </div>
        </div>

        {/* Project Selector */}
        <div className="flex-1">
          <ProjectSelector
            onProjectSelect={setCurrentProject}
            onProjectCreate={(project) => {
              setCurrentProject(project);
              toast.success("Project berhasil dibuat!");
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentProject(null)}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to Projects</span>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                {currentProject.name}
              </h1>
              <p className="text-xs text-gray-600 mt-1 truncate">
                {currentProject.appType === "wali" ? "Aplikasi Wali Santri" : "Aplikasi Musyrif"} -
                Drag and drop components to build your mobile app interface
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/admin")}
              className="flex items-center gap-2"
            >
              <Home size={16} />
              <span className="hidden md:inline">Dashboard</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push("/dashboard/admin/mobile-app-generator")
              }
              className="flex items-center gap-2"
            >
              <span className="hidden md:inline">App Generator</span>
              <span className="md:hidden">Generator</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Builder Content */}
      <div className="flex-1 overflow-hidden">
        <DragDropBuilder
          appType={currentProject.appType}
          initialComponents={currentProject.components}
          onSave={(design) => {
            console.log("Template saved:", design);
            toast.success("Template berhasil disimpan!");
          }}
          onPreview={(design) => {
            console.log("Preview template:", design);
            toast.success("Preview template dibuka!");
          }}
          onExport={(design) => {
            console.log("Export template:", design);
            toast.success("Template berhasil di-export!");
          }}
        />
      </div>
    </div>
  );
}
