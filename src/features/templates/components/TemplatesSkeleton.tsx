import { memo } from "react";

const TemplatesSkeleton = memo(() => (
  <div className="flex-1">
    <div className="mb-6">
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <div className="h-4 w-4 bg-muted rounded" />
        </div>
        <div className="bg-white border border-border rounded-md pl-10 pr-4 py-2 w-full h-9 animate-pulse" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-white rounded-xl border border-border p-5 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-6 w-20 bg-muted rounded-full" />
          </div>
          
          <div className="h-4 w-full bg-muted rounded mb-4" />
          
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
        </div>
      ))}
    </div>
  </div>
));

export default TemplatesSkeleton; 