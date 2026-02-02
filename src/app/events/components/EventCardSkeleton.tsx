import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton Card
export function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <Skeleton className="h-44 w-full rounded-none" />
      <CardContent className="p-4 space-y-3 flex-1">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
      <div className="pt-0 border-t mx-4 my-4 border-border/50">
        <div className="flex justify-between w-full pt-4 gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-10" />
        </div>
      </div>
    </Card>
  );
} 