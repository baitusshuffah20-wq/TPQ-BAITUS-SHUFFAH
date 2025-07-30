"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Clock,
  Mail,
  MoreHorizontal,
  Play,
  Pause,
  Trash2,
  Edit,
} from "lucide-react";

interface ScheduledReport {
  id: string;
  reportType: string;
  reportName: string;
  frequency: string;
  scheduleTime: string;
  recipients: string[];
  isActive: boolean;
  lastRunDate?: string;
  nextRunDate: string;
  createdAt: string;
}

interface ScheduledReportsListProps {
  onEdit?: (report: ScheduledReport) => void;
  onDelete?: (reportId: string) => void;
  onToggleActive?: (reportId: string, isActive: boolean) => void;
}

export default function ScheduledReportsList({
  onEdit,
  onDelete,
  onToggleActive,
}: ScheduledReportsListProps) {
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchScheduledReports();
  }, []);

  const fetchScheduledReports = async () => {
    try {
      const response = await fetch("/api/admin/scheduled-reports");
      const data = await response.json();

      if (data.success) {
        setReports(data.data || []);
      } else {
        console.error("Error fetching scheduled reports:", data.error);
        setReports([]);
      }
    } catch (error) {
      console.error("Error fetching scheduled reports:", error);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (reportId: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/admin/scheduled-reports", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: reportId,
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        setReports(prev => 
          prev.map(report => 
            report.id === reportId 
              ? { ...report, isActive: !currentStatus }
              : report
          )
        );
        onToggleActive?.(reportId, !currentStatus);
      }
    } catch (error) {
      console.error("Error toggling report status:", error);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this scheduled report?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/scheduled-reports?id=${reportId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setReports(prev => prev.filter(report => report.id !== reportId));
        onDelete?.(reportId);
      }
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      DAILY: "bg-green-100 text-green-800",
      WEEKLY: "bg-blue-100 text-blue-800",
      MONTHLY: "bg-purple-100 text-purple-800",
    };
    
    return (
      <Badge className={colors[frequency as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {frequency}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading scheduled reports...</p>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center p-8">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Scheduled Reports
        </h3>
        <p className="text-gray-600">
          You haven't scheduled any reports yet. Create your first scheduled report to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Next Run</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">
                  {report.reportName}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {report.reportType}
                  </span>
                </TableCell>
                <TableCell>
                  {getFrequencyBadge(report.frequency)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {report.scheduleTime}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {report.recipients.length} recipient(s)
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {formatDate(report.nextRunDate)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={report.isActive ? "default" : "secondary"}
                    className={report.isActive ? "bg-green-100 text-green-800" : ""}
                  >
                    {report.isActive ? "Active" : "Paused"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onEdit?.(report)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleActive(report.id, report.isActive)}
                      >
                        {report.isActive ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(report.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
