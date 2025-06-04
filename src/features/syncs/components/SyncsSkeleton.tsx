import { memo } from "react";

const SyncsSkeleton = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(6)].map((_, index) => (
      <div key={index} className="bg-white rounded-xl border border-border p-5 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="h-6 w-20 bg-muted rounded-full" />
        </div>
        
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded bg-muted" />
            <div className="ml-2">
              <div className="h-3 w-12 bg-muted rounded mb-1" />
              <div className="h-4 w-16 bg-muted rounded" />
            </div>
          </div>
          
          <div className="mx-2 text-muted-foreground">→</div>
          
          <div className="flex items-center">
            <div className="h-8 w-8 rounded bg-muted" />
            <div className="ml-2">
              <div className="h-3 w-12 bg-muted rounded mb-1" />
              <div className="h-4 w-16 bg-muted rounded" />
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
      </div>
    ))}
  </div>
));

export default SyncsSkeleton; 