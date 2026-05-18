"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
} from "chart.js";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";

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
  { key: "completed", label: "COMPLETED", color: "#16a34a" },
  { key: "live", label: "LIVE", color: "#0d9488" },
  { key: "on_sale", label: "ON SALE", color: "#2563eb" },
  { key: "scheduled", label: "SCHEDULED", color: "#7c3aed" },
  { key: "upcoming", label: "UPCOMING", color: "#6366f1" },
  { key: "pending", label: "PENDING", color: "#d97706" },
  { key: "cancel_pending", label: "CANCELLATION PENDING", color: "#f59e0b" },
  { key: "cancelled", label: "CANCELLED", color: "#dc2626" },
  { key: "rejected", label: "REJECTED", color: "#9f1239" },
] as const;

export function EventsDonutChart({ data }: { data?: EventStats }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  useEffect(() => {
    if (!canvasRef.current) return;

    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: EVENT_SLICES.map((s) => t(s.label)),
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
    <div className="w-full flex items-center gap-12 px-5 py-4">
      {/* Donut */}
      <div className="relative flex-shrink-0 w-42 h-42">
        <canvas ref={canvasRef} />
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-semibold text-black leading-none">
            {total}
          </span>
          <span className="text-[11px] text-black mt-1">
            {t("dashboard.dataDisplay.total")}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-4 gap-2 border border-gray-200 rounded-lg overflow-hidden bg-white flex-1">
        {EVENT_SLICES.map((s, i) => {
          const value = data?.[s.key] ?? 0;

          return (
            <div
              key={s.key}
              className={`px-5 py-4 ${
                i < EVENT_SLICES.length - 1 ? "border border-gray-200" : ""
              }`}
              style={{ backgroundColor: s.color + "4D" }}
            >
              <p className="text-xs font-medium text-black uppercase tracking-wide">
                {t(`status.${s.key}`)}
              </p>
              <p className="text-2xl font-semibold text-black mt-1">
                {value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
