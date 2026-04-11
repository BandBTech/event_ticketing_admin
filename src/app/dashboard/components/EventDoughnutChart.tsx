"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(ArcElement, DoughnutController, Tooltip, Legend);

type EventStats = {
  total?: number;
  completed?: number;
  scheduled?: number;
  on_sale?: number;
  upcoming?: number;
  pending?: number;
  cancelled?: number;
  live?: number;
  rejected?: number;
};

const EVENT_SLICES = [
  { key: "completed", label: "Completed", color: "#16a34a" },
  { key: "live", label: "Live", color: "#0d9488" },
  { key: "on_sale", label: "On Sale", color: "#2563eb" },
  { key: "scheduled", label: "Scheduled", color: "#7c3aed" },
  { key: "upcoming", label: "Upcoming", color: "#6366f1" },
  { key: "pending", label: "Pending", color: "#d97706" },
  { key: "cancelled", label: "Cancelled", color: "#dc2626" },
  { key: "rejected", label: "Rejected", color: "#9f1239" },
] as const;

export function EventsDonutChart({ data }: { data?: EventStats }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: EVENT_SLICES.map((s) => s.label),
        datasets: [
          {
            data: EVENT_SLICES.map((s) => data?.[s.key] ?? 0),
            backgroundColor: EVENT_SLICES.map((s) => s.color),
            borderWidth: 2,
            borderColor: "#ffffff",
            hoverBorderWidth: 0,
          },
        ],
      },
      options: {
        cutout: "68%",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed}`,
            },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [data]);

  const total = data?.total ?? 0;

  return (
    <div className="flex items-center gap-6 px-5 py-4">
      {/* Donut */}
      <div className="relative flex-shrink-0 w-36 h-36">
        <canvas ref={canvasRef} />
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-semibold text-black leading-none">
            {total}
          </span>
          <span className="text-[11px] text-black mt-1">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 flex-1">
        {EVENT_SLICES.map((s) => {
          const value = data?.[s.key] ?? 0;
          const pct = total > 0 ? Math.round((value / total) * 100) : 0;
          return (
            <div key={s.key} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-sm flex-shrink-0"
                style={{ background: s.color }}
              />
              <span className="text-xs text-black flex-1 truncate">
                {s.label}
              </span>
              <span className="text-xs font-medium text-black tabular-nums">
                {value}
              </span>
              <span className="text-[11px] text-black tabular-nums w-7 text-right">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
