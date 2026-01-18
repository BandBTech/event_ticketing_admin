"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 glass-card-lower border border-gray-100/50">
      <div className="flex items-start space-x-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white shadow-sm border border-gray-100/50 rounded-lg">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="p-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Organizers Section Skeleton */}
        <div className="glass-card-lower mt-10">
          <div className="p-6 border-b border-gray-100">
            <Skeleton className="h-6 w-64" />
          </div>
          <div className="p-6 space-y-4"> 
            <ListItemSkeleton />
            <ListItemSkeleton />
          </div>
        </div>

        {/* Events Section Skeleton */}
        <div className="glass-card-lower mt-10">
          <div className="p-6 border-b border-gray-100">
            <Skeleton className="h-6 w-56" />
          </div>
          <div className="p-6 space-y-4">
            <ListItemSkeleton />
            <ListItemSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
