"use client";

import React from "react";
import dynamic from "next/dynamic";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function ClassDistributionChart({ data = [] }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full min-h-[220px] flex items-center justify-center text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        No Class Distribution Logged
      </div>
    );
  }

  const categories = data.map((d) => d.class);
  const values = data.map((d) => d.count);

  const options: any = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'inherit',
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '55%',
        distributed: true,
      },
    },
    colors: ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
    dataLabels: { enabled: false },
    legend: { show: false },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    grid: {
      borderColor: '#E2E8F0',
      strokeDashArray: 4,
    },
  };

  const series = [{ name: 'Scholars', data: values }];

  return (
    <div className="w-full h-full min-h-[220px]">
      <ReactApexChart options={options} series={series} type="bar" height="100%" />
    </div>
  );
}

export function AttendanceTrendChart({ data = [] }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full min-h-[220px] flex items-center justify-center text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        No Attendance Telemetry Logged
      </div>
    );
  }

  const categories = data.map((d) => d.label || d.date || d.day);
  const values = data.map((d) => d.percentage || d.value || d.count || 0);

  const options: any = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      fontFamily: 'inherit',
      sparkline: { enabled: false },
    },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
      },
    },
    colors: ['#10B981'],
    xaxis: {
      categories,
    },
  };

  const series = [{ name: 'Attendance %', data: values }];

  return (
    <div className="w-full h-full min-h-[220px]">
      <ReactApexChart options={options} series={series} type="area" height="100%" />
    </div>
  );
}

export function AttendanceTrendsChart(props: any) {
  return <AttendanceTrendChart {...props} />;
}