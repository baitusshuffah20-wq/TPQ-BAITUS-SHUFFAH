"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Mail, Plus, X } from "lucide-react";

interface ScheduleReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: string;
  reportName: string;
  onSchedule: (scheduleData: ScheduleData) => void;
}

interface ScheduleData {
  reportType: string;
  reportName: string;
  frequency: string;
  scheduleTime: string;
  recipients: string[];
  filters: Record<string, any>;
}

const reportTypeOptions = [
  { value: "financial-summary", label: "Financial Summary" },
  { value: "spp-reports", label: "SPP Reports" },
  { value: "transaction-reports", label: "Transaction Reports" },
  { value: "outstanding-payments", label: "Outstanding Payments" },
  { value: "collection-rates", label: "Collection Rates" },
  { value: "salary-reports", label: "Salary Reports" },
  { value: "database-audit", label: "Database Audit" },
  { value: "student-progress", label: "Student Progress" },
  { value: "class-summary", label: "Class Summary" },
];

const frequencyOptions = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
];

export default function ScheduleReportDialog({
  isOpen,
  onClose,
  reportType,
  reportName,
  onSchedule,
}: ScheduleReportDialogProps) {
  const [formData, setFormData] = useState({
    reportName: reportName || "",
    frequency: "WEEKLY",
    scheduleTime: "09:00",
    recipients: [""],
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddRecipient = () => {
    setFormData(prev => ({
      ...prev,
      recipients: [...prev.recipients, ""],
    }));
  };

  const handleRemoveRecipient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index),
    }));
  };

  const handleRecipientChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.map((email, i) => 
        i === index ? value : email
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const scheduleData: ScheduleData = {
        reportType,
        reportName: formData.reportName,
        frequency: formData.frequency,
        scheduleTime: formData.scheduleTime,
        recipients: formData.recipients.filter(email => email.trim() !== ""),
        filters: {}, // Can be extended for specific filters
      };

      await onSchedule(scheduleData);
      onClose();
      
      // Reset form
      setFormData({
        reportName: "",
        frequency: "WEEKLY",
        scheduleTime: "09:00",
        recipients: [""],
        notes: "",
      });
    } catch (error) {
      console.error("Error scheduling report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedReportType = reportTypeOptions.find(
    option => option.value === reportType
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Report
          </DialogTitle>
          <DialogDescription>
            Set up automatic report generation and delivery schedule.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-medium text-gray-900">
                {selectedReportType?.label || reportType}
              </p>
              <p className="text-sm text-gray-600">
                {reportType}
              </p>
            </div>
          </div>

          {/* Report Name */}
          <div className="space-y-2">
            <Label htmlFor="reportName">Report Name</Label>
            <Input
              id="reportName"
              value={formData.reportName}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                reportName: e.target.value
              }))}
              placeholder="Enter custom report name"
              required
            />
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                frequency: value
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Schedule Time */}
          <div className="space-y-2">
            <Label htmlFor="scheduleTime" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Schedule Time
            </Label>
            <Input
              id="scheduleTime"
              type="time"
              value={formData.scheduleTime}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                scheduleTime: e.target.value
              }))}
              required
            />
          </div>

          {/* Recipients */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Recipients
            </Label>
            <div className="space-y-2">
              {formData.recipients.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => handleRecipientChange(index, e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1"
                  />
                  {formData.recipients.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveRecipient(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRecipient}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Recipient
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              placeholder="Add any additional notes or instructions"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling..." : "Schedule Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
