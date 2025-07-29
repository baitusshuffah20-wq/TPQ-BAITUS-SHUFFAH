"use client";

import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ...

// Define musyrifs state
const [musyrifs, setMusyrifs] = useState<any[]>([]);

// Define schedules state
const [schedules, setSchedules] = useState<any[]>([]);

// Define attendances state
const [attendances, setAttendances] = useState<any[]>([]);

// Define selectedMonth and selectedYear, you can set default values or use useState if they are dynamic
const [selectedMonth, setSelectedMonth] = useState<number>(
  new Date().getMonth() + 1,
); // Default: current month (1-12)
const [selectedYear, setSelectedYear] = useState<number>(
  new Date().getFullYear(),
); // Default: current year

const [payrollSettings, setPayrollSettings] = useState<any[]>([]);
const [payrolls, setPayrolls] = useState<any[]>([]);
const [loading, setLoading] = useState(false);

const loadData = async () => {
  try {
    setLoading(true);

    // Ganti URL sesuai endpoint backend Anda
    const [musyrifRes, scheduleRes, attendanceRes, settingRes, payrollRes] =
      await Promise.all([
        axios.get("/api/musyrif"),
        axios.get("/api/halaqah-schedule", {
          params: { month: selectedMonth, year: selectedYear },
        }),
        axios.get("/api/attendance", {
          params: { month: selectedMonth, year: selectedYear },
        }),
        axios.get("/api/payroll-setting"),
        axios.get("/api/payroll", {
          params: { month: selectedMonth, year: selectedYear },
        }),
      ]);

    setMusyrifs(musyrifRes.data);
    setSchedules(scheduleRes.data);
    setAttendances(attendanceRes.data);
    setPayrollSettings(settingRes.data);
    setPayrolls(payrollRes.data);
  } catch (error) {
    console.error("Error loading data:", error);
    toast.error("Gagal memuat data penggajian");
  } finally {
    setLoading(false);
  }
};

export default function MusyrifPayrollPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Penggajian Musyrif</h1>
      <p>Halaman penggajian musyrif sedang dalam pengembangan.</p>
    </div>
  );
}
