"use client";

import React from "react";
import { Calendar } from "lucide-react";

interface EmptyStateProps {
  title: string;
  message: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Icon */}
      <div className="relative mb-5">
        <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center shadow-sm">
          <Calendar className="h-7 w-7 text-gray-400" />
        </div>
        {/* Subtle decorative ring */}
        <div className="absolute -inset-1.5 rounded-2xl border border-gray-100 -z-10" />
      </div>

      {/* Text */}
      <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 max-w-[220px] leading-relaxed">{message}</p>
    </div>
  );
}
