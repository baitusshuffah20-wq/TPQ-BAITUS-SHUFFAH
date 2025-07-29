"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Download, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface BuildProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildId: string | null;
  platform: "android" | "ios";
  appType: "wali" | "musyrif";
}

interface BuildStatus {
  progress: number;
  status: "building" | "completed" | "failed";
  message: string;
  downloadUrl?: string;
  logs: string[];
}

export default function BuildProgressModal({
  isOpen,
  onClose,
  buildId,
  platform,
  appType,
}: BuildProgressModalProps) {
  const [buildStatus, setBuildStatus] = useState<BuildStatus>({
    progress: 0,
    status: "building",
    message: "Initializing build...",
    logs: [],
  });

  useEffect(() => {
    if (!buildId || !isOpen) return;

    // Simulate build progress for demo
    const simulateBuild = () => {
      const steps = [
        { progress: 10, message: "Preparing build environment..." },
        { progress: 25, message: "Generating app configuration..." },
        { progress: 40, message: "Installing dependencies..." },
        { progress: 60, message: "Building application..." },
        { progress: 80, message: "Optimizing assets..." },
        { progress: 95, message: "Finalizing build..." },
        {
          progress: 100,
          message: "Build completed successfully!",
          status: "completed" as const,
        },
      ];

      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < steps.length) {
          const step = steps[currentStep];
          setBuildStatus((prev) => ({
            ...prev,
            progress: step.progress,
            message: step.message,
            status: step.status || "building",
            downloadUrl:
              step.status === "completed"
                ? `/api/mobile-builds/download/${buildId}`
                : undefined,
            logs: [
              ...prev.logs,
              `[${new Date().toLocaleTimeString()}] ${step.message}`,
            ],
          }));
          currentStep++;
        } else {
          clearInterval(interval);
        }
      }, 2000);

      return () => clearInterval(interval);
    };

    const cleanup = simulateBuild();
    return cleanup;
  }, [buildId, isOpen]);

  const handleDownload = async () => {
    if (buildStatus.downloadUrl) {
      try {
        toast.loading("Preparing download...");

        // Create a temporary link to trigger download
        const link = document.createElement("a");
        link.href = buildStatus.downloadUrl;
        link.download = `tpq-${appType}-${platform}-app.${platform === "android" ? "apk" : "ipa"}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.dismiss();
        toast.success(`${platform.toUpperCase()} app download started!`);
      } catch (error) {
        console.error("Download failed:", error);
        toast.dismiss();
        toast.error("Download failed. Opening in new tab...");
        // Fallback to opening in new tab
        window.open(buildStatus.downloadUrl, "_blank");
      }
    }
  };

  const getStatusIcon = () => {
    switch (buildStatus.status) {
      case "completed":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "failed":
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (buildStatus.status) {
      case "completed":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Building {platform.toUpperCase()} App for {appType}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{buildStatus.message}</span>
              <span>{buildStatus.progress}%</span>
            </div>
            <Progress
              value={buildStatus.progress}
              className="h-2"
              indicatorClassName={getStatusColor()}
            />
          </div>

          {buildStatus.status === "completed" && buildStatus.downloadUrl && (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm font-medium">
                  🎉 Build completed successfully!
                </p>
                <p className="text-green-600 text-xs mt-1">
                  Your {platform.toUpperCase()} app is ready for download.
                </p>
              </div>
              <Button
                onClick={handleDownload}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download {platform.toUpperCase()} App
              </Button>
            </div>
          )}

          {buildStatus.status === "failed" && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                Build failed. Please check the logs and try again.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Build Logs</h4>
            <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
              {buildStatus.logs.map((log, index) => (
                <div key={index} className="text-xs text-gray-600 font-mono">
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={buildStatus.status === "building"}
            >
              {buildStatus.status === "building" ? "Building..." : "Close"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
