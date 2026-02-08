import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-3xl space-y-4">

        {/* Full lines */}
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-36 w-full" />

        {/* Split line */}
        <div className="flex gap-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-1/4" />
        </div>

        {/* Another split line */}
        <div className="flex gap-6">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-10 w-1/3" />
        </div>

      </div>
    </div>
  );
}
